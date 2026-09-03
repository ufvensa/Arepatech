import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/http.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);

  try {
    const { token, action = "unsubscribe" } = await request.json();
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return json(request, { error: "This preferences link is invalid." }, 400);
    }
    if (!['unsubscribe', 'resubscribe'].includes(action)) return json(request, { error: "Invalid action" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } },
    );
    const subscribed = action === "resubscribe";
    const { data, error } = await admin.from("members")
      .update({ email_subscribed: subscribed })
      .eq("unsubscribe_token", token)
      .select("id,email_subscribed")
      .maybeSingle();
    if (error) throw error;
    if (!data) return json(request, { error: "This preferences link is invalid or expired." }, 404);
    return json(request, {
      success: true,
      email_subscribed: data.email_subscribed,
      message: subscribed ? "You are subscribed to VENSA newsletters." : "You have been unsubscribed from VENSA newsletters.",
    });
  } catch (error) {
    return json(request, { error: error instanceof Error ? error.message : "Unable to update preferences" }, 500);
  }
});
