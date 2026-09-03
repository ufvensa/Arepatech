import { createClient } from "npm:@supabase/supabase-js@2";
import { renderNewsletterHtml, renderNewsletterText } from "../../../shared/newsletter-template.js";
import { corsHeaders, isValidEmail, json, sleep } from "../_shared/http.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("NEWSLETTER_FROM_EMAIL") || "";
const REPLY_TO = Deno.env.get("NEWSLETTER_REPLY_TO_EMAIL") || "";
const CONFIGURED_SITE_URL = Deno.env.get("SITE_URL") || "";
const SITE_URL = CONFIGURED_SITE_URL || "https://ufvensa.org";
const CRON_SECRET = Deno.env.get("NEWSLETTER_CRON_SECRET") || "";
const requestedBatchSize = Number(Deno.env.get("NEWSLETTER_BATCH_SIZE") || 50);
const BATCH_SIZE = Math.max(1, Math.min(100, requestedBatchSize));
const BATCH_DELAY_MS = Math.max(0, Number(Deno.env.get("NEWSLETTER_BATCH_DELAY_MS") || 600));

type Profile = { id: string; role: string | null; status: string | null; is_admin: boolean | null };
type Member = { id: string; email: string; first_name: string | null; unsubscribe_token: string };
type Operation = "send_test" | "send_newsletter" | "unknown";
type LogContext = {
  request_id: string;
  operation: Operation;
  newsletter_id: string | null;
  user_id: string | null;
  profile_role: string | null;
};

class FunctionError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) {
    super(message);
    this.name = "FunctionError";
  }
}

const SECRET_VALUES = [RESEND_API_KEY, SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, CRON_SECRET]
  .filter((value) => value.length >= 8);

function redact(value: string) {
  let safe = value;
  for (const secret of SECRET_VALUES) safe = safe.replaceAll(secret, "[REDACTED]");
  return safe
    .replace(/Bearer\s+[^\s"']+/gi, "Bearer [REDACTED]")
    .replace(/\b(?:re|whsec)_[A-Za-z0-9_-]+\b/g, "[REDACTED]")
    .slice(0, 2_000);
}

function safeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: redact(error.name || "Error"),
      message: redact(error.message || "Unknown error"),
      ...(error.stack ? { stack: redact(error.stack) } : {}),
    };
  }
  if (error && typeof error === "object") {
    const value = error as Record<string, unknown>;
    return {
      name: "NonErrorException",
      message: redact(typeof value.message === "string" ? value.message : "Unknown error"),
      ...(typeof value.code === "string" ? { code: redact(value.code) } : {}),
      ...(typeof value.details === "string" ? { details: redact(value.details) } : {}),
      ...(typeof value.hint === "string" ? { hint: redact(value.hint) } : {}),
    };
  }
  return { name: "NonErrorException", message: redact(String(error || "Unknown error")) };
}

function logEvent(
  level: "info" | "warn" | "error",
  event: string,
  context: LogContext,
  details: Record<string, unknown> = {},
) {
  console[level](JSON.stringify({ event, ...context, ...details }));
}

function environmentStatus() {
  return {
    RESEND_API_KEY: Boolean(RESEND_API_KEY),
    NEWSLETTER_FROM_EMAIL: Boolean(FROM_EMAIL),
    NEWSLETTER_REPLY_TO_EMAIL: Boolean(REPLY_TO),
    SUPABASE_URL: Boolean(SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(SERVICE_ROLE_KEY),
    SITE_URL: Boolean(CONFIGURED_SITE_URL),
  };
}

function mailboxAddress(value: string) {
  const namedAddress = value.match(/<([^<>]+)>\s*$/);
  return (namedAddress?.[1] || value).trim().toLowerCase();
}

function isValidHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validateConfiguration(context: LogContext) {
  const availability = environmentStatus();
  logEvent("info", "environment_checked", context, { environment: availability });
  const missing = Object.entries(availability).filter(([, exists]) => !exists).map(([name]) => name);
  if (missing.length) {
    logEvent("error", "configuration_missing", context, { missing });
    throw new FunctionError("Newsletter service configuration is incomplete", "SERVER_CONFIG_MISSING", 500);
  }

  const fromAddress = mailboxAddress(FROM_EMAIL);
  const fromDomain = fromAddress.split("@")[1] || "";
  const fromAddressValid = isValidEmail(fromAddress);
  const fromDomainValid = fromDomain === "ufvensa.com" || fromDomain.endsWith(".ufvensa.com");
  const replyToValid = isValidEmail(REPLY_TO);
  const siteUrlValid = isValidHttpUrl(SITE_URL);
  logEvent("info", "email_configuration_validated", context, {
    from_address_valid: fromAddressValid,
    from_domain_valid: fromDomainValid,
    reply_to_valid: replyToValid,
    site_url_valid: siteUrlValid,
  });
  if (!fromAddressValid || !fromDomainValid) {
    throw new FunctionError(
      "NEWSLETTER_FROM_EMAIL must use a valid address on the verified ufvensa.com domain",
      "INVALID_SENDER_CONFIGURATION",
      500,
    );
  }
  if (!replyToValid) {
    throw new FunctionError("NEWSLETTER_REPLY_TO_EMAIL is invalid", "INVALID_REPLY_TO_CONFIGURATION", 500);
  }
  if (!siteUrlValid) throw new FunctionError("SITE_URL is invalid", "INVALID_SITE_URL_CONFIGURATION", 500);
}

function serviceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

function databaseFailure(context: LogContext, operation: string, error: unknown) {
  logEvent("error", "database_operation_failed", context, { database_operation: operation, error: safeError(error) });
  return new FunctionError("A newsletter database operation failed", "DATABASE_OPERATION_FAILED", 500);
}

function isNoRowsError(error: unknown) {
  return Boolean(error && typeof error === "object" && (error as Record<string, unknown>).code === "PGRST116");
}

async function authorize(request: Request, context: LogContext) {
  const cronAuthorized = Boolean(CRON_SECRET) && request.headers.get("x-cron-secret") === CRON_SECRET;
  if (cronAuthorized) {
    logEvent("info", "request_authorized", context, { actor_kind: "cron" });
    return { kind: "cron" as const, profile: null };
  }

  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    logEvent("warn", "authentication_failed", context, { reason: "missing_bearer_token" });
    throw new FunctionError("Sign in before sending a newsletter", "AUTH_REQUIRED", 401);
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    logEvent("warn", "authentication_failed", context, {
      reason: "invalid_session",
      ...(error ? { error: safeError(error) } : {}),
    });
    throw new FunctionError("Your session is invalid or expired", "INVALID_SESSION", 401);
  }

  context.user_id = user.id;
  const admin = serviceClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles").select("id,role,status,is_admin").eq("id", user.id).single<Profile>();
  if (profileError) {
    logEvent("error", "profile_lookup_failed", context, {
      error: safeError(profileError),
    });
    if (isNoRowsError(profileError)) {
      throw new FunctionError("No staff profile was found for this account", "PROFILE_NOT_FOUND", 403);
    }
    throw new FunctionError("Unable to verify newsletter permissions", "PROFILE_LOOKUP_FAILED", 500);
  }
  if (!profile) {
    logEvent("error", "profile_lookup_failed", context, { error: safeError(new Error("Profile not found")) });
    throw new FunctionError("No staff profile was found for this account", "PROFILE_NOT_FOUND", 403);
  }

  context.profile_role = profile.role;
  const staff = ["eboard", "president", "technology"].includes(profile.role || "") ||
    profile.status === "eboard" || profile.is_admin === true;
  logEvent("info", "profile_authorization_checked", context, {
    profile_status: profile.status,
    is_admin: profile.is_admin === true,
    authorized: staff,
  });
  if (!staff) throw new FunctionError("Newsletter staff access required", "NEWSLETTER_ACCESS_DENIED", 403);
  return { kind: "user" as const, profile };
}

function safeResendBody(value: unknown) {
  if (!value || typeof value !== "object") return { message: "No structured response body" };
  const body = value as Record<string, unknown>;
  return {
    ...(typeof body.name === "string" ? { name: redact(body.name) } : {}),
    ...(typeof body.message === "string" ? { message: redact(body.message) } : {}),
    ...(typeof body.code === "string" ? { code: redact(body.code) } : {}),
    ...(typeof body.statusCode === "number" ? { status_code: body.statusCode } : {}),
  };
}

async function resend(payload: unknown, context: LogContext, batch = false, idempotencyKey = "") {
  let response: Response;
  try {
    response = await fetch(`https://api.resend.com/emails${batch ? "/batch" : ""}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logEvent("error", "resend_request_failed", context, { error: safeError(error) });
    throw new FunctionError("The email provider could not be reached", "RESEND_UNAVAILABLE", 502);
  }

  const responseText = await response.text();
  let result: Record<string, unknown> = {};
  if (responseText) {
    try {
      result = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      result = { message: "Resend returned a non-JSON response" };
    }
  }
  logEvent(response.ok ? "info" : "error", "resend_response_received", context, {
    resend_http_status: response.status,
    ok: response.ok,
    ...(response.ok ? {} : { resend_error: safeResendBody(result) }),
  });
  if (!response.ok) {
    const providerMessage = typeof result.message === "string" ? redact(result.message) : "Email provider rejected the request";
    throw new FunctionError(providerMessage, "RESEND_SEND_FAILED", 502);
  }
  return result;
}

async function loadMembers(admin: ReturnType<typeof serviceClient>, context: LogContext) {
  const members: Member[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin.from("members")
      .select("id,email,first_name,unsubscribe_token")
      .eq("email_subscribed", true).eq("membership_status", "active")
      .range(from, from + pageSize - 1);
    if (error) throw databaseFailure(context, "load_subscribed_members", error);
    members.push(...((data || []) as Member[]));
    if (!data || data.length < pageSize) break;
  }
  return members;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);

  const context: LogContext = {
    request_id: crypto.randomUUID(), operation: "unknown", newsletter_id: null, user_id: null, profile_role: null,
  };
  let newsletterId = "";
  let claimed = false;
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch (error) {
      logEvent("warn", "request_body_invalid", context, { error: safeError(error) });
      throw new FunctionError("Request body must be valid JSON", "INVALID_JSON", 400);
    }

    newsletterId = String(body.newsletter_id || "").trim();
    const testEmail = body.test_email ? String(body.test_email).trim().toLowerCase() : "";
    context.operation = testEmail ? "send_test" : "send_newsletter";
    context.newsletter_id = newsletterId || null;
    logEvent("info", "request_received", context, { has_test_recipient: Boolean(testEmail) });
    validateConfiguration(context);

    if (!newsletterId) throw new FunctionError("newsletter_id is required", "NEWSLETTER_ID_REQUIRED", 400);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(newsletterId)) {
      throw new FunctionError("newsletter_id must be a valid UUID", "INVALID_NEWSLETTER_ID", 400);
    }

    const actor = await authorize(request, context);
    const admin = serviceClient();
    const { data: newsletter, error: newsletterError } = await admin
      .from("newsletters").select("*").eq("id", newsletterId).single();
    if (newsletterError) {
      logEvent("error", "newsletter_lookup_failed", context, { error: safeError(newsletterError) });
      if (isNoRowsError(newsletterError)) {
        throw new FunctionError("Newsletter not found", "NEWSLETTER_NOT_FOUND", 404);
      }
      throw new FunctionError("Unable to load the newsletter", "NEWSLETTER_LOOKUP_FAILED", 500);
    }
    if (!newsletter) {
      logEvent("error", "newsletter_lookup_failed", context, { error: safeError(new Error("Newsletter not found")) });
      throw new FunctionError("Newsletter not found", "NEWSLETTER_NOT_FOUND", 404);
    }
    logEvent("info", "newsletter_loaded", context, { newsletter_status: newsletter.status });

    const { data: sections, error: sectionsError } = await admin
      .from("newsletter_sections").select("*").eq("newsletter_id", newsletterId)
      .eq("is_visible", true).order("display_order");
    if (sectionsError) throw databaseFailure(context, "load_visible_newsletter_sections", sectionsError);
    logEvent("info", "newsletter_sections_loaded", context, { visible_section_count: sections?.length || 0 });

    if (testEmail) {
      if (actor.kind !== "user") throw new FunctionError("Tests require a signed-in staff member", "TEST_REQUIRES_USER", 403);
      if (!isValidEmail(testEmail)) throw new FunctionError("Enter a valid test email", "INVALID_TEST_EMAIL", 400);

      const { data: testMember, error: testMemberError } = await admin.from("members")
        .select("id,unsubscribe_token")
        .eq("email", testEmail)
        .maybeSingle();
      if (testMemberError) throw databaseFailure(context, "load_test_recipient_preferences", testMemberError);
      logEvent("info", "test_recipient_preferences_checked", context, {
        member_found: Boolean(testMember),
        member_id: testMember?.id || null,
        unsubscribe_link_included: Boolean(testMember?.unsubscribe_token),
      });

      let html: string;
      let text: string;
      try {
        html = renderNewsletterHtml({ newsletter, sections, siteUrl: SITE_URL, recipientToken: testMember?.unsubscribe_token || "" });
        text = renderNewsletterText({ newsletter, sections, siteUrl: SITE_URL, recipientToken: testMember?.unsubscribe_token || "" });
        logEvent("info", "newsletter_rendered", context, { html_length: html.length, text_length: text.length });
      } catch (error) {
        logEvent("error", "newsletter_render_failed", context, { error: safeError(error) });
        throw new FunctionError("The newsletter could not be rendered", "NEWSLETTER_RENDER_FAILED", 500);
      }

      const result = await resend({
        from: FROM_EMAIL, to: [testEmail], reply_to: REPLY_TO,
        subject: `[TEST] ${newsletter.subject}`, html, text,
      }, context);
      logEvent("info", "test_email_sent", context, { recipient_count: 1 });
      return json(request, { test: true, id: result.id, recipient: testEmail });
    }

    const canSend = actor.kind === "cron" || ["president", "technology"].includes(actor.profile?.role || "");
    if (!canSend) throw new FunctionError("Only president or technology can send newsletters", "SEND_ACCESS_DENIED", 403);

    const { data: claim, error: claimError } = await admin.rpc("claim_newsletter_for_sending", { p_newsletter_id: newsletterId });
    if (claimError) throw databaseFailure(context, "claim_newsletter_for_sending", claimError);
    if (!claim) throw new FunctionError("Newsletter is not approved, due, or available to retry", "NEWSLETTER_NOT_SENDABLE", 409);
    claimed = true;

    const members = await loadMembers(admin, context);
    const { data: priorRows, error: priorError } = await admin.from("newsletter_sends")
      .select("recipient_email,status").eq("newsletter_id", newsletterId);
    if (priorError) throw databaseFailure(context, "load_prior_newsletter_sends", priorError);
    const prior = new Map((priorRows || []).map((row) => [row.recipient_email.toLowerCase(), row.status]));
    const terminal = new Set(["sent", "delivered", "bounced", "complained"]);
    const valid = members.filter((member) => isValidEmail(member.email));
    const invalid = members.filter((member) => !isValidEmail(member.email));
    const recipients = valid.filter((member) => !terminal.has(prior.get(member.email.toLowerCase())));

    if (invalid.length) {
      const { error } = await admin.from("newsletter_sends").upsert(invalid.map((member) => ({
        newsletter_id: newsletterId, member_id: member.id, recipient_email: member.email,
        status: "skipped", error_message: "Invalid email address",
      })), { onConflict: "newsletter_id,recipient_email" });
      if (error) logEvent("error", "database_operation_failed", context, { database_operation: "record_invalid_recipients", error: safeError(error) });
    }

    let sent = 0;
    let failed = 0;
    for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
      const batch = recipients.slice(index, index + BATCH_SIZE);
      const { error: pendingError } = await admin.from("newsletter_sends").upsert(batch.map((member) => ({
        newsletter_id: newsletterId, member_id: member.id,
        recipient_email: member.email.toLowerCase(), status: "pending", error_message: null,
      })), { onConflict: "newsletter_id,recipient_email" });
      if (pendingError) logEvent("error", "database_operation_failed", context, { database_operation: "record_pending_recipients", error: safeError(pendingError) });

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
        const result = await resend(payload, context, true, `newsletter-${newsletterId}-${batchKey}`);
        const ids = Array.isArray(result.data) ? result.data as Array<{ id?: string }> : [];
        const updates = await Promise.all(batch.map((member, offset) => admin.from("newsletter_sends").update({
          status: "sent", resend_email_id: ids[offset]?.id || null, sent_at: new Date().toISOString(), error_message: null,
        }).eq("newsletter_id", newsletterId).eq("recipient_email", member.email.toLowerCase())));
        updates.forEach(({ error }, offset) => {
          if (error) logEvent("error", "database_operation_failed", context, { database_operation: "record_sent_recipient", batch_offset: offset, error: safeError(error) });
        });
        sent += batch.length;
      } catch (error) {
        const message = error instanceof Error ? redact(error.message) : "Unknown Resend error";
        const { error: failureUpdateError } = await admin.from("newsletter_sends").update({ status: "failed", error_message: message })
          .eq("newsletter_id", newsletterId).in("recipient_email", batch.map((member) => member.email.toLowerCase()));
        if (failureUpdateError) logEvent("error", "database_operation_failed", context, { database_operation: "record_failed_recipients", error: safeError(failureUpdateError) });
        failed += batch.length;
      }
      if (index + BATCH_SIZE < recipients.length) await sleep(BATCH_DELAY_MS);
    }

    const finalStatus = failed > 0 ? "failed" : "sent";
    const { error: finalError } = await admin.from("newsletters").update({
      status: finalStatus, sent_at: finalStatus === "sent" ? new Date().toISOString() : null,
    }).eq("id", newsletterId).eq("status", "sending");
    if (finalError) throw databaseFailure(context, "finalize_newsletter_status", finalError);
    logEvent("info", "newsletter_send_completed", context, { sent, failed, final_status: finalStatus });
    return json(request, { newsletter_id: newsletterId, recipients: members.length, sent, failed, skipped: invalid.length + (valid.length - recipients.length), status: finalStatus });
  } catch (error) {
    logEvent("error", "request_failed", context, { error: safeError(error) });
    if (claimed && newsletterId) {
      try {
        const { error: rollbackError } = await serviceClient().from("newsletters").update({ status: "failed" })
          .eq("id", newsletterId).eq("status", "sending");
        if (rollbackError) logEvent("error", "database_operation_failed", context, { database_operation: "mark_newsletter_failed", error: safeError(rollbackError) });
      } catch (rollbackError) {
        logEvent("error", "newsletter_failure_status_update_failed", context, { error: safeError(rollbackError) });
      }
    }
    if (error instanceof FunctionError) return json(request, { error: error.message, code: error.code }, error.status);
    return json(request, { error: "Unable to send the newsletter", code: "INTERNAL_ERROR" }, 500);
  }
});
