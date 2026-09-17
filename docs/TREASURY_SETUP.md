# VENSA Treasury workspace

Initial implementation on `andy-branch`. Route: `/admin/finance` (Treasury in staff navigation).
Uses the existing React/Vite application, Supabase Auth and PostgreSQL. No replacement of the existing site or newsletter system.

## Included

- E-Board/president/technology route access and independent database RLS and server checks.
- Sourced events, attendance, SG requests/approvals, transactions, end-of-day combined cash snapshots, and verified rule records.
- Audit records on every financial insert/update; no client deletion permissions.
- Deterministic integer-cent cash reconciliation, commitments, per-event cash and economic net, cost per attendee, and SG utilization checks.
- Scenario planning for fixed costs, variable costs, ticket pricing, attendance, sponsorship, and break-even.
- Server-side, read-only Drive browsing inside one configured root (subfolders and pagination supported).
- Google Sheets transaction preview, validation, source-row citations, change detection, atomic import, and duplicate skipping.
- Read-only OpenAI Responses API assistant, source links, explicit missing-data handling, server-side key, 20 requests per user per hour, timeout, and bounded evidence.

This is a source-grounded assistant with deterministic analytics, not a newly trained model. No historical financial amounts are seeded or invented.

## Deploy to your Supabase project

1. Use the existing project's Supabase CLI workflow. Apply all prior migrations, then `20260917000000_finance_workspace.sql` using `supabase db push` (inspect the target project first).
2. Set Edge Function secrets via the Supabase dashboard or local secret file, never in client/Vite variables:
   - Existing `SUPABASE_URL` and `SUPABASE_ANON_KEY` are supplied by Supabase.
   - `SITE_URL`: exact frontend origin for CORS.
   - `FINANCE_OPENAI_API_KEY`: project API key.
   - `FINANCE_OPENAI_MODEL`: explicit API model ID your project can access. No model name is assumed from the chat subscription.
   - `FINANCE_GOOGLE_CLIENT_EMAIL`, `FINANCE_GOOGLE_PRIVATE_KEY`: a Google service account with Drive API and Sheets API enabled. Multiline PEM and escaped newlines are supported.
   - `FINANCE_DRIVE_ROOT_ID`: the treasury folder ID. Share that folder with the service account as Viewer. Do not share unrelated folders.
3. Deploy `supabase functions deploy finance-api`. Platform JWT verification is disabled to match the existing project's verification approach; every non-OPTIONS request explicitly calls `auth.getUser()` and `is_finance_staff()` before data/provider access. The function uses the user's JWT and anon key, never a service-role database client.
4. Deploy the frontend from Andy's branch to its intended preview environment. Existing Vite Supabase variables remain required.
5. Sign in as a staff user and open `/admin/finance`. A trusted database administrator assigns `profiles.role` using the existing role system. No client self-assignment is introduced.

No live migration, Edge deployment, secret configuration, or real Drive/AI request was performed during implementation. GitHub push alone does not apply Supabase migrations or deploy Edge Functions.

## Enter initial evidence

1. Register source links in Records → Sources, or browse Drive and register a file. Mark a source reviewed after checking it. Review status is metadata, not an assertion of SG approval.
2. Enter event metadata, fiscal year (`2026-27`), actual attendance when known, and source. Keep `records_complete` off until both revenue and all costs have been reconciled.
3. Enter each SG allocation separately, keeping base/SAR/other distinct. Requested amount and approved amount are different fields; blank approved means unknown/pending, zero means verified zero.
4. Enter actual cash inflows/outflows as cash. Enter costs paid directly from SG as SG expenses tied to an allocation. Committed expenses reserve funds but do not reduce the recorded balance until marked paid. Update the same commitment when paid; don't add a second copy.
5. Enter a dated, **combined end-of-day** balance across all VENSA cash accounts, including Student Association Venmo. The latest snapshot replaces earlier snapshots; only paid movements strictly after that date are added/subtracted. A single-account balance is not a combined snapshot. No snapshot means unknown cash, not zero.
6. Register current SG rules and enter verified utilization thresholds by fiscal year and funding type. No 75% or other threshold is hard-coded. Checks flag utilization and overspend only; they do not certify eligibility, allowable purchases, deadlines, line-item transfers, or Docutraq approval.

### Reimbursements and transfers

Cash income categorized exactly `sg_reimbursement` affects cash and event net cash but is excluded from outside revenue and economic net. Record the original expense once. Do not also enter a second SG expense for the same reimbursed cost; SG ledger costs represent direct SG-paid costs. This version does not model a linked reimbursement lifecycle (requested/approved/received) or automatically net duplicated costs. Use the authoritative final expense record and reconcile before marking an event complete.

Do not enter transfers between your own cash accounts as outside revenue/expense: the snapshot and ledger represent combined cash. Use a current snapshot and reconciliation if historical completeness is uncertain.

## Import format

Create a dedicated Google Sheet worksheet named `Transactions` (or a name using letters, numbers, spaces, underscores, hyphens). Preserve historical originals. Register its Drive file ID in Sources. First row, exact order:

```text
transaction_id,occurred_on,ledger,kind,category,amount_usd,status,event_id,funding_id
```

- `transaction_id`: permanent unique ID, letters/numbers/underscore/hyphen, up to 100 chars. Never change IDs to import a correction.
- Date: YYYY-MM-DD. Amount: plain positive USD decimal, e.g. `12.50`, not `$12.50` or locale-formatted commas. Configure sheet number formats accordingly.
- Ledger: `cash` or `sg`; kind: `income` or `expense`; status: `paid` or `committed` (income cannot be committed).
- Optional event ID and required SG allocation ID are finance record UUIDs displayed in Records, not existing public-site event IDs. Cash rows must leave funding ID blank.
- Up to 200 data rows per worksheet. Larger input is rejected, not silently truncated. Split larger imports into stable worksheets.
- Preview displays the normalized rows. Import rereads the source and compares a SHA-256 digest; changed sheets require a new preview.
- Import is one database statement: any invalid row rejects the entire batch. Repeated external IDs are skipped. Correct imported records through Records (audited), not by renaming worksheet/IDs or copying the same rows into another file.
- Duplicate identity is file ID + worksheet name + transaction ID. Cross-file duplicates require human reconciliation.

PDF, XLSX, and other documents can be registered and cited but are not parsed or OCR'd. Historical files from 2013 onward require explicit mapping into the normalized format. No automatic arbitrary spreadsheet interpretation is claimed. Attendance can be entered from Forms/event records with source citations; direct Forms ingestion is not yet implemented.

## Calculation boundaries

- Cash estimate = latest combined snapshot + recorded later paid cash income − recorded later paid cash expenses.
- Available after commitments = cash estimate − current outstanding cash commitments.
- SG remaining = approved allocation − recorded paid SG expenses − outstanding SG commitments. Requested funding is never counted as approved.
- Outside event revenue excludes SG reimbursements. Net cash = outside revenue + received SG reimbursements − cash expense. Economic net = outside revenue − cash expense − direct SG expense.
- Net/profit requires complete event records. Missing attendance remains null, not zero. Zero attendance cannot yield a per-attendee cost.
- Scenario net = ticket price × paying attendees + sponsorship − fixed costs − variable cost × attendees. Break-even rounds up the uncovered fixed cost divided by contribution margin. Nonpositive margin cannot cover positive uncovered fixed costs.
- Overview filters event and allocation reports by fiscal year. Cash balances and record-completeness warnings remain global; filtering a report never recalculates the current cash balance from one fiscal year. Future transactions are excluded. No statistical historical forecast or automatic vendor-price comparison is included yet.
- At more than 10,000 transactions the dataset endpoint rejects rather than silently paginating away records. Add SQL period aggregation before exceeding this limit. AI evidence has a separate 100,000-character bound.
- The AI receives computed summary and source metadata, not raw Drive file text. Natural-language output is not a verified financial calculation. UI presents it as interpretation, renders plain text, and only links sources from the server's allowlisted evidence list. The source prompt requests fact/calculation/forecast/assumption/missing-data labels; it cannot guarantee every model statement is correct.

## Verification

```sh
npm ci --prefix tests/finance
npm test --prefix tests/finance
npm ci --prefix client
npm run build --prefix client
cd client && npx eslint src/pages/admin/FinanceDashboard.jsx src/lib/finance.js src/components/Navbar.jsx src/App.jsx
```

Tests execute the actual migration in isolated PGlite PostgreSQL with minimal existing profiles/auth fixtures; they verify RLS, anonymous/member rejection, ledger constraints, immutable audit access, rate limiting, atomic batches, and duplicate handling. Pure tests cover missing data, snapshot cutoffs, SG separation, reimbursements, break-even and sheet validation. These do not replace staging verification against your full existing schema or live provider credentials.

Before live use: verify a non-staff user cannot read treasury records, enter a sourced test snapshot/event/allocation, import a small worksheet twice, exercise a changed-sheet preview, compare results with a hand calculation, and ask the assistant a question with known missing data. Do not mark real financial history complete until reconciled.

Implementation verification: 17 automated tests and the production frontend build passed. Changed frontend files passed ESLint. Edge TypeScript checked successfully against the installed Supabase declarations using a temporary local import map; the normal Deno dependency fetch was blocked by a registry connection refusal. Automated visual verification remains outstanding: the cloud browser blocked the local sample preview URL under its URL policy. Live authenticated provider verification also remains outstanding.

## Interactive sample preview

Open `/treasury-preview.html` on the branch deployment, or run the Vite development server and open that path. This entry uses the same treasury workspace components with an isolated in-memory service. It includes fictional records, report filters, editable records, audit history, a sample worksheet import, scenario calculations, and explicitly labeled sample assistant responses. It makes no backend or AI requests. Reloading resets all changes. No real account or credentials are required.

The authenticated workspace also exposes audit history with cursor pagination and before/after record details. Database access remains restricted by existing finance RLS policies.
