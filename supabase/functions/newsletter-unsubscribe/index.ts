import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/http.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

type PreferenceAction = "unsubscribe" | "resubscribe";
type LogContext = {
  request_id: string;
  operation: string;
  token_provided: boolean;
  token_fingerprint: string | null;
};

class FunctionError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) {
    super(message);
    this.name = "FunctionError";
  }
}

const SECRET_VALUES = [SERVICE_ROLE_KEY].filter((value) => value.length >= 8);

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

async function tokenFingerprint(token: string) {
  if (!token) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest).slice(0, 6))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") {
    return json(request, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  }

  const context: LogContext = {
    request_id: crypto.randomUUID(),
    operation: "unknown",
    token_provided: false,
    token_fingerprint: null,
  };

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch (error) {
      logEvent("warn", "request_body_invalid", context, { error: safeError(error) });
      throw new FunctionError("Request body must be valid JSON", "INVALID_JSON", 400);
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";
    const action = typeof body.action === "string" ? body.action : "unsubscribe";
    context.operation = action;
    context.token_provided = Boolean(token);
    context.token_fingerprint = await tokenFingerprint(token);
    const tokenValid = TOKEN_PATTERN.test(token);
    logEvent("info", "unsubscribe_request_received", context, { token_valid: tokenValid });

    if (!tokenValid) {
      throw new FunctionError(
        "This unsubscribe link is invalid or expired.",
        "INVALID_UNSUBSCRIBE_TOKEN",
        400,
      );
    }
    if (!["unsubscribe", "resubscribe"].includes(action)) {
      throw new FunctionError("Invalid email preference action", "INVALID_PREFERENCE_ACTION", 400);
    }
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      logEvent("error", "configuration_missing", context, {
        environment: {
          SUPABASE_URL: Boolean(SUPABASE_URL),
          SUPABASE_SERVICE_ROLE_KEY: Boolean(SERVICE_ROLE_KEY),
        },
      });
      throw new FunctionError("Email preferences are temporarily unavailable", "SERVER_CONFIG_MISSING", 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: member, error: lookupError } = await admin.from("members")
      .select("id,email_subscribed,membership_status")
      .eq("unsubscribe_token", token)
      .maybeSingle();
    if (lookupError) {
      logEvent("error", "member_lookup_failed", context, { error: safeError(lookupError) });
      throw new FunctionError("Unable to update email preferences", "MEMBER_LOOKUP_FAILED", 500);
    }
    if (!member) {
      logEvent("warn", "member_lookup_completed", context, { member_found: false });
      throw new FunctionError(
        "This unsubscribe link is invalid or expired.",
        "INVALID_UNSUBSCRIBE_TOKEN",
        404,
      );
    }

    logEvent("info", "member_lookup_completed", context, {
      member_found: true,
      member_id: member.id,
      current_email_subscribed: member.email_subscribed,
      membership_status: member.membership_status,
    });

    const subscribed = action === "resubscribe";
    const { data: updatedMember, error: updateError } = await admin.from("members")
      .update({ email_subscribed: subscribed })
      .eq("id", member.id)
      .eq("unsubscribe_token", token)
      .select("id,email_subscribed,membership_status")
      .maybeSingle();
    if (updateError) {
      logEvent("error", "member_preference_update_failed", context, {
        member_id: member.id,
        requested_email_subscribed: subscribed,
        error: safeError(updateError),
      });
      throw new FunctionError("Unable to update email preferences", "PREFERENCE_UPDATE_FAILED", 500);
    }
    if (!updatedMember) {
      logEvent("warn", "member_preference_update_failed", context, {
        member_id: member.id,
        reason: "member_no_longer_matched_token",
      });
      throw new FunctionError(
        "This unsubscribe link is invalid or expired.",
        "INVALID_UNSUBSCRIBE_TOKEN",
        404,
      );
    }

    logEvent("info", "member_preference_update_completed", context, {
      member_id: updatedMember.id,
      previous_email_subscribed: member.email_subscribed,
      resulting_email_subscribed: updatedMember.email_subscribed,
      membership_status: updatedMember.membership_status,
    });
    return json(request, {
      success: true,
      email_subscribed: updatedMember.email_subscribed,
      message: subscribed
        ? "You are subscribed to VENSA newsletters."
        : "You have been unsubscribed from VENSA newsletters.",
    });
  } catch (error) {
    logEvent("error", "unsubscribe_request_failed", context, { error: safeError(error) });
    if (error instanceof FunctionError) {
      return json(request, { error: error.message, code: error.code }, error.status);
    }
    return json(request, { error: "Unable to update email preferences", code: "INTERNAL_ERROR" }, 500);
  }
});
