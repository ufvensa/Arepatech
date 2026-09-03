# VENSA Newsletter Setup

The newsletter workspace is part of the existing React site at `/admin/newsletters`. It uses the existing Supabase login and profile records, Supabase Edge Functions for privileged work, and Resend for delivery.

## 1. Apply the database migration

Run [`supabase/migrations/20260903000000_newsletter_management.sql`](../supabase/migrations/20260903000000_newsletter_management.sql) in **Supabase Dashboard → SQL Editor**, or use the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migration adds newsletter roles to profiles; creates private members, newsletters, sections, and send-log tables; imports existing profiles into members; enables RLS; and adds approval, duplication, scheduling, recipient-count, and atomic-send functions. The recipient table deliberately has no browser-readable policy.

## 2. Assign newsletter roles

Existing E-Board/admin profiles are mapped to `eboard`. Assign approval roles manually:

```sql
update public.profiles set role = 'president' where email = 'PRESIDENT_EMAIL';
update public.profiles set role = 'technology' where email = 'TECHNOLOGY_EMAIL';
```

Supported roles are `member`, `eboard`, `president`, and `technology`. Only president and technology can approve, schedule, or send. Never expose role assignment through a member-editable form.

## 3. Configure Supabase secrets

Generate `NEWSLETTER_CRON_SECRET` with a secure password generator. Add these under **Supabase Dashboard → Edge Functions → Secrets**:

```text
RESEND_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEWSLETTER_FROM_EMAIL
NEWSLETTER_REPLY_TO_EMAIL
RESEND_WEBHOOK_SECRET
NEWSLETTER_CRON_SECRET
NEWSLETTER_BATCH_SIZE=50
NEWSLETTER_BATCH_DELAY_MS=600
SITE_URL=https://YOUR_PUBLIC_SITE
```

Supabase normally provides its URL and keys to hosted functions automatically, but confirm they are available. Never add `RESEND_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to Vercel or a `VITE_` variable.

## 4. Configure Resend

1. Add a domain VENSA controls under **Resend → Domains**.
2. Add all DNS records Resend provides and wait for **Verified** status.
3. Create an API key with sending access and save it as `RESEND_API_KEY` in Supabase.
4. Set `NEWSLETTER_FROM_EMAIL`, for example `UF VENSA <newsletter@ufvensa.org>`.
5. Set `NEWSLETTER_REPLY_TO_EMAIL` to a monitored inbox.

Resend test-domain senders are restricted and should not be used for a production member list.

## 5. Deploy the Edge Functions

```bash
supabase functions deploy send-newsletter
supabase functions deploy process-scheduled-newsletters
supabase functions deploy newsletter-unsubscribe
supabase functions deploy resend-webhook
```

`supabase/config.toml` disables gateway JWT verification because the endpoints accept different credential types: user JWTs, a cron secret, a public random unsubscribe token, or signed Resend webhooks. Each function performs its own authorization.

For local function testing, copy `supabase/functions/.env.example` to `.env.local`, fill it with development values, and run:

```bash
supabase functions serve --env-file supabase/functions/.env.local
```

## 6. Configure scheduled sending

Enable `pg_cron` and `pg_net` under **Database → Extensions**. Create a job that runs every minute after replacing the placeholders:

```sql
select cron.schedule(
  'process-scheduled-vensa-newsletters',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-newsletters',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY',
      'apikey', 'YOUR_SUPABASE_ANON_KEY',
      'x-cron-secret', 'YOUR_NEWSLETTER_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Prefer storing the URL, anon key, and cron secret in Supabase Vault and referencing decrypted secrets from the job. The worker finds due scheduled newsletters; the send function atomically changes each to `sending`, preventing concurrent duplicate claims.

## 7. Configure the Resend webhook

1. Deploy `resend-webhook`.
2. Add `https://YOUR_PROJECT_REF.supabase.co/functions/v1/resend-webhook` under **Resend → Webhooks**.
3. Subscribe to `email.delivered`, `email.bounced`, `email.complained`, and `email.failed`.
4. Copy the signing secret to the Supabase `RESEND_WEBHOOK_SECRET` secret.

Webhook signatures and a five-minute timestamp tolerance are verified. Each `svix-id` is stored for idempotency, and out-of-order events cannot downgrade bounced, complained, or delivered states. Bounced or complained recipients are automatically unsubscribed.

## 8. Unsubscribe and preferences

Every message contains preference and unsubscribe links using a random 256-bit token—not a member UUID or raw email. `SITE_URL` must point to the deployed site so links reach `/unsubscribe`. Unsubscribing sets `email_subscribed = false`; it never deletes the member.

## 9. Test the system

1. Apply the migration and assign your test accounts `eboard` and `technology`.
2. Deploy the functions and configure secrets.
3. Log in and open `/admin/newsletters`.
4. Create a newsletter and fill in subject, preview text, heading, and intro.
5. Add multiple section types. For an event section, select an existing Supabase event and verify its details populate without changing the source event.
6. Test Move Up, Move Down, Duplicate, Visible, and Remove.
7. Compare desktop/mobile live previews and the full-page preview.
8. Save and send a test. Confirm its subject starts with `[TEST]` and the newsletter remains a draft.
9. Submit as E-Board, then approve as president/technology.
10. Schedule it a few minutes ahead. Confirm Cron moves it from `scheduled` to `sending`, then `sent`.
11. With a small opted-in list, test **Send now** and verify the confirmation shows the count and subject.
12. Confirm Sent analytics update when Resend webhooks arrive.
13. Click an unsubscribe link and verify `members.email_subscribed = false`.
14. Try invoking the send again and verify the atomic claim/unique send constraint prevents duplicates.

## 10. First production send

Verify the opted-in audience before sending:

```sql
select count(*) from public.members
where email_subscribed = true and membership_status = 'active';
```

Send tests to president and technology, proofread every link, confirm the Resend domain is verified, and begin with a small consented list. The final Send Now dialog states the recipient count, subject, and that sending cannot be undone.

## 11. Troubleshooting

- **Admin link missing:** set the profile role to `eboard`, `president`, or `technology`, then refresh or sign in again.
- **Relation/function not found:** apply the migration and refresh Supabase's schema cache.
- **401/403 from send:** confirm the session and role. Only president/technology can send production email.
- **Sender rejected:** verify the Resend domain and sender address.
- **Scheduled email remains scheduled:** inspect Cron history, Edge Function logs, endpoint URL, and `NEWSLETTER_CRON_SECRET`.
- **Newsletter failed:** inspect `newsletter_sends.error_message`. A retry skips sent/delivered recipients and retries nonterminal failures.
- **No recipients:** verify imported members are active and subscribed.
- **Delivery metrics do not update:** verify the webhook secret and that Resend IDs exist in `newsletter_sends`.

## 12. Security recommendations

- Use separate Resend keys for test and production and rotate them periodically.
- Keep the service-role key only in Supabase secrets; it bypasses RLS.
- Restrict profile-role assignment to trusted administrators.
- Confirm consent before emailing imported profile addresses.
- Configure SPF, DKIM, and DMARC for the sender domain.
- Monitor bounces and complaints and keep those recipients suppressed.
- The existing project has a broad public profile SELECT policy. Replace it with a safe directory view that excludes email in a separate, carefully tested migration because it affects current directory behavior.
