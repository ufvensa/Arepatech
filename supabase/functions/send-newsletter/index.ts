import { createClient } from "@supabase/supabase-js";
import { renderNewsletterHtml, renderNewsletterText } from "../../../shared/newsletter-template.js";
import { corsHeaders, isValidEmail, json, sleep } from "../_shared/http.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("NEWSLETTER_FROM_EMAIL") || "";
const REPLY_TO = Deno.env.get("NEWSLETTER_REPLY_TO_EMAIL") || undefined;
const SITE_URL = Deno.env.get("SITE_URL") || "https://ufvensa.org";
const CRON_SECRET = Deno.env.get("NEWSLETTER_CRON_SECRET") || "";
const requestedBatchSize = Number(Deno.env.get("NEWSLETTER_BATCH_SIZE") || 50);
const BATCH_SIZE = Math.max(1, Math.min(100, requestedBatchSize));
const BATCH_DELAY_MS = Math.max(0, Number(Deno.env.get("NEWSLETTER_BATCH_DELAY_MS") || 600));

type Profile = { id: string; role: string | null; status: string | null; is_admin: boolean | null };
type Member = { id: string; email: string; first_name: string | null; unsubscribe_token: string };

function serviceClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Supabase server secrets are missing");
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

async function authorize(request: Request) {
  const cronAuthorized = Boolean(CRON_SECRET) && request.headers.get("x-cron-secret") === CRON_SECRET;
  if (cronAuthorized) return { kind: "cron" as const, profile: null };

  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) throw new Error("Missing authorization token");
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error("Invalid session");
  const admin = serviceClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles").select("id,role,status,is_admin").eq("id", user.id).single<Profile>();
  if (profileError || !profile) throw new Error("Profile not found");
  const staff = ["eboard", "president", "technology"].includes(profile.role || "") ||
    profile.status === "eboard" || profile.is_admin === true;
  if (!staff) throw new Error("Newsletter staff access required");
  return { kind: "user" as const, profile };
}

async function resend(payload: unknown, batch = false, idempotencyKey = "") {
  const response = await fetch(`https://api.resend.com/emails${batch ? "/batch" : ""}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || `Resend returned ${response.status}`);
  return result;
}

async function loadMembers(admin: ReturnType<typeof serviceClient>) {
  const members: Member[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin.from("members")
      .select("id,email,first_name,unsubscribe_token")
      .eq("email_subscribed", true).eq("membership_status", "active")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    members.push(...((data || []) as Member[]));
    if (!data || data.length < pageSize) break;
  }
  return members;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);

  let newsletterId = "";
  let claimed = false;
  try {
    if (!RESEND_API_KEY || !FROM_EMAIL) throw new Error("Resend secrets are not configured");
    const actor = await authorize(request);
    const body = await request.json();
    newsletterId = String(body.newsletter_id || "");
    const testEmail = body.test_email ? String(body.test_email).trim().toLowerCase() : "";
    if (!newsletterId) return json(request, { error: "newsletter_id is required" }, 400);

    const admin = serviceClient();
    const { data: newsletter, error: newsletterError } = await admin
      .from("newsletters").select("*").eq("id", newsletterId).single();
    if (newsletterError || !newsletter) return json(request, { error: "Newsletter not found" }, 404);
    const { data: sections, error: sectionsError } = await admin
      .from("newsletter_sections").select("*").eq("newsletter_id", newsletterId)
      .eq("is_visible", true).order("display_order");
    if (sectionsError) throw sectionsError;

    if (testEmail) {
      if (actor.kind !== "user") return json(request, { error: "Tests require a signed-in staff member" }, 403);
      if (!isValidEmail(testEmail)) return json(request, { error: "Enter a valid test email" }, 400);
      const result = await resend({
        from: FROM_EMAIL,
        to: [testEmail],
        reply_to: REPLY_TO,
        subject: `[TEST] ${newsletter.subject}`,
        html: renderNewsletterHtml({ newsletter, sections, siteUrl: SITE_URL, recipientToken: "test-preview" }),
        text: renderNewsletterText({ newsletter, sections, siteUrl: SITE_URL, recipientToken: "test-preview" }),
      });
      return json(request, { test: true, id: result.id, recipient: testEmail });
    }

    const canSend = actor.kind === "cron" || ["president", "technology"].includes(actor.profile?.role || "");
    if (!canSend) return json(request, { error: "Only president or technology can send newsletters" }, 403);

    const { data: claim, error: claimError } = await admin.rpc("claim_newsletter_for_sending", { p_newsletter_id: newsletterId });
    if (claimError) throw claimError;
    if (!claim) return json(request, { error: "Newsletter is not approved, due, or available to retry" }, 409);
    claimed = true;

    const members = await loadMembers(admin);
    const { data: priorRows, error: priorError } = await admin.from("newsletter_sends")
      .select("recipient_email,status").eq("newsletter_id", newsletterId);
    if (priorError) throw priorError;
    const prior = new Map((priorRows || []).map((row) => [row.recipient_email.toLowerCase(), row.status]));
    const terminal = new Set(["sent", "delivered", "bounced", "complained"]);
    const valid = members.filter((member) => isValidEmail(member.email));
    const invalid = members.filter((member) => !isValidEmail(member.email));
    const recipients = valid.filter((member) => !terminal.has(prior.get(member.email.toLowerCase())));

    if (invalid.length) {
      await admin.from("newsletter_sends").upsert(invalid.map((member) => ({
        newsletter_id: newsletterId, member_id: member.id, recipient_email: member.email,
        status: "skipped", error_message: "Invalid email address",
      })), { onConflict: "newsletter_id,recipient_email" });
    }

    let sent = 0;
    let failed = 0;
    for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
      const batch = recipients.slice(index, index + BATCH_SIZE);
      await admin.from("newsletter_sends").upsert(batch.map((member) => ({
        newsletter_id: newsletterId, member_id: member.id,
        recipient_email: member.email.toLowerCase(), status: "pending", error_message: null,
      })), { onConflict: "newsletter_id,recipient_email" });

      const payload = batch.map((member) => ({
        from: FROM_EMAIL,
        to: [member.email],
        reply_to: REPLY_TO,
        subject: newsletter.subject,
        html: renderNewsletterHtml({ newsletter, sections, siteUrl: SITE_URL, recipientToken: member.unsubscribe_token }),
        text: renderNewsletterText({ newsletter, sections, siteUrl: SITE_URL, recipientToken: member.unsubscribe_token }),
        headers: { "List-Unsubscribe": `<${SITE_URL.replace(/\/$/, "")}/unsubscribe?token=${member.unsubscribe_token}>` },
      }));

      try {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(batch.map((member) => member.id).sort().join(",")));
        const batchKey = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
        const result = await resend(payload, true, `newsletter-${newsletterId}-${batchKey}`);
        const ids = Array.isArray(result?.data) ? result.data : [];
        await Promise.all(batch.map((member, offset) => admin.from("newsletter_sends").update({
          status: "sent", resend_email_id: ids[offset]?.id || null, sent_at: new Date().toISOString(), error_message: null,
        }).eq("newsletter_id", newsletterId).eq("recipient_email", member.email.toLowerCase())));
        sent += batch.length;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Resend error";
        await admin.from("newsletter_sends").update({ status: "failed", error_message: message })
          .eq("newsletter_id", newsletterId).in("recipient_email", batch.map((member) => member.email.toLowerCase()));
        failed += batch.length;
      }
      if (index + BATCH_SIZE < recipients.length) await sleep(BATCH_DELAY_MS);
    }

    const finalStatus = failed > 0 ? "failed" : "sent";
    const { error: finalError } = await admin.from("newsletters").update({
      status: finalStatus,
      sent_at: finalStatus === "sent" ? new Date().toISOString() : null,
    }).eq("id", newsletterId).eq("status", "sending");
    if (finalError) throw finalError;
    return json(request, { newsletter_id: newsletterId, recipients: members.length, sent, failed, skipped: invalid.length + (valid.length - recipients.length), status: finalStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown send error";
    if (claimed && newsletterId) {
      try {
        await serviceClient().from("newsletters").update({ status: "failed" }).eq("id", newsletterId).eq("status", "sending");
      } catch { /* The original error is more useful. */ }
    }
    const status = /authorization|session|access|required/i.test(message) ? 401 : 500;
    return json(request, { error: message }, status);
  }
});
