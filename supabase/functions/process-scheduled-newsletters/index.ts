import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/http.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);

  const cronSecret = Deno.env.get("NEWSLETTER_CRON_SECRET") || "";
  if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
    return json(request, { error: "Invalid cron secret" }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: due, error } = await admin.from("newsletters").select("id")
      .eq("status", "scheduled").lte("scheduled_for", new Date().toISOString()).limit(25);
    if (error) throw error;

    const results = [];
    for (const newsletter of due || []) {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-newsletter`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": "application/json",
          "x-cron-secret": cronSecret,
        },
        body: JSON.stringify({ newsletter_id: newsletter.id }),
      });
      results.push({ newsletter_id: newsletter.id, ok: response.ok, result: await response.json().catch(() => ({})) });
    }
    return json(request, { checked_at: new Date().toISOString(), processed: results.length, results });
  } catch (error) {
    return json(request, { error: error instanceof Error ? error.message : "Cron processing failed" }, 500);
  }
});
