import { createClient } from "npm:@supabase/supabase-js@2";
import { json } from "../_shared/http.ts";

function decodeSecret(value: string) {
  const encoded = value.startsWith("whsec_") ? value.slice(6) : value;
  return Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
}

function decodeSignature(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

async function verifyWebhook(request: Request, payload: string) {
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";
  const id = request.headers.get("svix-id") || "";
  const timestamp = request.headers.get("svix-timestamp") || "";
  const signatures = (request.headers.get("svix-signature") || "").split(" ");
  if (!secret || !id || !timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey("raw", decodeSecret(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`)));
  return signatures.some((signature) => {
    const encoded = signature.startsWith("v1,") ? signature.slice(3) : "";
    if (!encoded) return false;
    try { return timingSafeEqual(expected, decodeSignature(encoded)); } catch { return false; }
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);
  const payload = await request.text();
  if (!(await verifyWebhook(request, payload))) return json(request, { error: "Invalid webhook signature" }, 401);

  try {
    const event = JSON.parse(payload);
    const svixId = request.headers.get("svix-id") || "";
    const emailId = event?.data?.email_id;
    const statusMap: Record<string, string> = {
      "email.delivered": "delivered",
      "email.bounced": "bounced",
      "email.complained": "complained",
      "email.failed": "failed",
    };
    const status = statusMap[event?.type];
    if (!emailId || !status) return json(request, { received: true, ignored: true });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } },
    );
    const errorMessage = status === "failed" || status === "bounced"
      ? event?.data?.bounce?.message || event?.data?.error || event.type
      : null;
    const { data: processed, error } = await admin.rpc("process_resend_newsletter_webhook", {
      p_svix_id: svixId,
      p_event_type: event.type,
      p_resend_email_id: emailId,
      p_status: status,
      p_error_message: errorMessage,
      p_payload: event,
    });
    if (error) throw error;
    return json(request, { received: true, duplicate: processed === false, status });
  } catch (error) {
    return json(request, { error: error instanceof Error ? error.message : "Webhook processing failed" }, 500);
  }
});
