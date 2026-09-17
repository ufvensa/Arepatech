import { useEffect, useState } from "react";
import {
  cents,
  scenario,
  summarize,
  filterReport,
} from "../../../../shared/finance/analytics.mjs";
import "../../finance.css";

const money = (value) =>
  value === null || value === undefined
    ? "Unknown"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value / 100);
const TYPES = {
  documents: "Sources",
  events: "Events",
  funding: "SG allocations",
  transactions: "Transactions",
  cash_snapshots: "Cash snapshots",
  rules: "Verified SG rules",
};
const fields = {
  documents: [
    ["title", "Title"],
    ["source_url", "Source link", "url"],
    ["external_id", "Google Drive file ID (optional)", "optional"],
    ["review_status", "Source review status", "pending|reviewed"],
  ],
  events: [
    ["title", "Event name"],
    ["occurred_on", "Event date", "date"],
    ["fiscal_year", "Fiscal year (2026-27)"],
    ["attendance", "Actual attendance (optional)", "optional-number"],
    ["records_complete", "All event revenue and costs verified", "checkbox"],
  ],
  funding: [
    ["title", "Allocation name"],
    ["fiscal_year", "Fiscal year (2026-27)"],
    ["funding_type", "Funding type", "base|sar|other"],
    ["requested_cents", "Requested ($)", "money"],
    [
      "approved_cents",
      "Approved ($), leave blank if pending",
      "optional-money",
    ],
  ],
  transactions: [
    ["occurred_on", "Transaction date", "date"],
    ["ledger", "Ledger", "cash|sg"],
    ["kind", "Direction", "income|expense"],
    ["category", "Category (use sg_reimbursement for SG receipts)"],
    ["amount_cents", "Amount ($)", "money"],
    ["status", "Status", "paid|committed|void"],
    ["event_id", "Event (optional)", "events"],
    ["funding_id", "SG allocation (required for SG expenses)", "funding"],
  ],
  cash_snapshots: [
    ["as_of", "End-of-day date", "date"],
    ["balance_cents", "Combined VENSA cash balance ($)", "money"],
  ],
  rules: [
    ["fiscal_year", "Fiscal year (2026-27)"],
    ["funding_type", "Funding type", "base|sar|other"],
    ["min_utilization_percent", "Verified minimum utilization (%)", "number"],
    ["effective_from", "Effective from", "date"],
    ["effective_to", "Effective through", "date"],
  ],
};
function SourceLink({ source }) {
  let safe = false;
  try {
    safe =
      !source.is_sample && new URL(source.source_url).protocol === "https:";
  } catch {
    /* Invalid source remains plain text. */
  }
  return safe ? (
    <a href={source.source_url} target="_blank" rel="noreferrer">
      {source.title}
    </a>
  ) : (
    <span>{source.title}</span>
  );
}
export default function FinanceWorkspace({ service, preview = false }) {
  const { financeDataset } = service;
  const [fiscalYear, setFiscalYear] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Overview");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    financeDataset()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [refresh, financeDataset]);
  const reload = () => setRefresh((value) => value + 1);
  const summary = data ? filterReport(summarize(data), fiscalYear) : null;
  const years = data
    ? [
        ...new Set(
          [...data.events, ...data.funding].map((row) => row.fiscal_year),
        ),
      ]
        .sort()
        .reverse()
    : [];
  return (
    <main className="finance">
      {preview && (
        <aside className="finance-notice" role="status">
          <strong>Interactive preview · fictional sample data</strong>
          <p>
            Explore every section. Changes stay in this preview and reset when
            you reload. No live accounts or AI service are connected.
          </p>
        </aside>
      )}
      <header className="finance-header">
        <div>
          <p className="finance-eyebrow">VENSA / TREASURY</p>
          <h1>Every dollar, with a source.</h1>
          <p>
            Plan events, review funding, and understand the records behind the
            numbers.
          </p>
        </div>
        <button onClick={reload}>Refresh records</button>
      </header>
      <nav className="finance-tabs" aria-label="Treasury sections">
        {[
          "Overview",
          "Records",
          "Drive imports",
          "Scenario planner",
          "Assistant",
          "Audit history",
        ].map((name) => (
          <button
            key={name}
            aria-current={tab === name ? "page" : undefined}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </nav>
      {error && (
        <p className="finance-error" role="alert">
          {error}
        </p>
      )}
      {!data && !error && <p role="status">Loading treasury records…</p>}
      {data && (
        <>
          {tab === "Overview" && (
            <>
              <label className="finance-report-filter">
                Event and allocation year
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                >
                  <option value="">All years</option>
                  {years.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </select>
              </label>
              <Overview summary={summary} data={data} />
            </>
          )}
          {tab === "Records" && (
            <Records data={data} reload={reload} service={service} />
          )}
          {tab === "Drive imports" && (
            <DriveImports data={data} reload={reload} service={service} />
          )}
          {tab === "Scenario planner" && <ScenarioPlanner />}
          {tab === "Assistant" && <Assistant service={service} />}
          {tab === "Audit history" && (
            <AuditHistory service={service} refresh={refresh} />
          )}
        </>
      )}
    </main>
  );
}
function Overview({ summary, data }) {
  return (
    <>
      <div className="finance-metrics">
        {[
          ["Estimated VENSA cash", summary.cash_cents],
          ["Cash committed", summary.cash_committed_cents],
          ["Cash after commitments", summary.cash_after_commitments_cents],
        ].map(([label, value]) => (
          <section className="finance-card" key={label}>
            <p>{label}</p>
            <strong>{money(value)}</strong>
          </section>
        ))}
      </div>
      <p className="finance-note">
        {summary.fiscal_year
          ? `Event and allocation report: ${summary.fiscal_year}. `
          : ""}
        As of {summary.as_of}. Cash uses the latest combined balance snapshot
        {summary.cash_snapshot
          ? ` (${summary.cash_snapshot.as_of})`
          : " (not yet recorded)"}{" "}
        plus recorded movements after that day. Cash always includes all years.
        SG allocations are tracked separately.
      </p>
      {summary.missing_data.length > 0 && (
        <section className="finance-notice">
          <h2>Records to complete</h2>
          <ul>
            {summary.missing_data.slice(0, 20).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="finance-card">
        <h2>SG funding</h2>
        <p>
          Requested, approved, paid, and committed amounts are distinct. A
          funding request is not an approval.
        </p>
        <div className="finance-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Allocation",
                  "Requested",
                  "Approved",
                  "Spent",
                  "Committed",
                  "Remaining",
                  "Review",
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.funding.map((f) => (
                <tr key={f.id}>
                  <td>
                    {f.title}
                    <small>
                      {f.fiscal_year} · {f.funding_type}
                    </small>
                  </td>
                  <td>{money(f.requested_cents)}</td>
                  <td>{money(f.approved_cents)}</td>
                  <td>{money(f.spent_cents)}</td>
                  <td>{money(f.committed_cents)}</td>
                  <td>{money(f.remaining_cents)}</td>
                  <td>{f.compliance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!summary.funding.length && (
          <p>
            No allocations recorded. Add a source and your first SG allocation
            in Records.
          </p>
        )}
      </section>
      <section className="finance-card">
        <h2>Event history</h2>
        <p>
          Profit stays unknown until the event’s records are marked complete.
          Economic net includes SG-paid costs.
        </p>
        <div className="finance-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Event",
                  "Attendance",
                  "Outside revenue",
                  "Cash cost",
                  "SG cost",
                  "Net cash",
                  "Economic net",
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.events.map((e) => (
                <tr key={e.id}>
                  <td>
                    {e.title}
                    <small>{e.occurred_on}</small>
                  </td>
                  <td>{e.attendance ?? "Unknown"}</td>
                  <td>{money(e.revenue_cents)}</td>
                  <td>{money(e.cash_expense_cents)}</td>
                  <td>{money(e.sg_expense_cents)}</td>
                  <td>{money(e.net_cash_cents)}</td>
                  <td>{money(e.economic_net_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!summary.events.length && <p>No event records yet.</p>}
      </section>
      <section className="finance-card">
        <h2>Evidence library</h2>
        {data.documents.length ? (
          <ul>
            {data.documents.map((s) => (
              <li key={s.id}>
                <SourceLink source={s} /> <small>{s.review_status}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Register source spreadsheets, receipts, balance records, and current
            SG rules in Records.
          </p>
        )}
      </section>
    </>
  );
}
function Records({ data, reload, service }) {
  const { saveFinanceRecord } = service;
  const [type, setType] = useState("documents");
  const [draft, setDraft] = useState({});
  const [id, setId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const entries = data[type === "cash_snapshots" ? "snapshots" : type] || [];
  const definitions = [
    ...fields[type],
    ...(type === "documents"
      ? []
      : [["source_id", "Supporting source", "documents"]]),
  ];
  function edit(record) {
    const copy = { ...record };
    for (const [key, , kind] of definitions)
      if (kind?.includes("money"))
        copy[key] =
          record[key] === null ? "" : (Number(record[key]) / 100).toFixed(2);
    setDraft(copy);
    setId(record.id);
    setMessage("");
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const values = {};
      for (const [key, , kind] of definitions) {
        const value = draft[key];
        if (kind === "checkbox") values[key] = !!value;
        else if (kind?.includes("money"))
          values[key] =
            (value === undefined || value === "") && kind === "optional-money"
              ? null
              : cents(value);
        else if (kind === "number" || kind === "optional-number")
          values[key] =
            (value === undefined || value === "") && kind === "optional-number"
              ? null
              : Number(value);
        else values[key] = value || null;
      }
      if (type === "documents") {
        if (new URL(values.source_url).protocol !== "https:")
          throw new Error("Use an HTTPS source link.");
      }
      if (type === "transactions") {
        if (values.amount_cents === 0)
          throw new Error("Transaction amount must be positive.");
        if (values.ledger === "cash" && values.funding_id)
          throw new Error("Cash transactions cannot use SG allocations.");
        if (
          values.ledger === "sg" &&
          (values.kind !== "expense" || !values.funding_id)
        )
          throw new Error("SG expenses need an allocation.");
      }
      await saveFinanceRecord(type, values, id);
      setDraft({});
      setId(null);
      setMessage("Record saved.");
      reload();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="finance-columns">
      <section className="finance-card">
        <h2>{id ? "Edit record" : "Add a record"}</h2>
        <label>
          Record type
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setDraft({});
              setId(null);
              setMessage("");
            }}
          >
            {Object.entries(TYPES).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {type === "cash_snapshots" && (
          <p>
            Enter the combined end-of-day cash balance across VENSA accounts,
            including association Venmo. Exclude SG allocations.
          </p>
        )}
        {type === "rules" && (
          <p>
            Enter only a rule verified against a current SG source. Leave
            unverified rules absent; the dashboard will flag missing
            verification.
          </p>
        )}
        <form onSubmit={save} className="finance-form">
          {definitions.map(([key, label, kind]) => (
            <label key={key}>
              {label}
              {["documents", "events", "funding"].includes(kind) ? (
                <select
                  value={draft[key] || ""}
                  required={kind === "documents"}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                >
                  <option value="">Select…</option>
                  {data[kind].map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.title}
                    </option>
                  ))}
                </select>
              ) : kind?.includes("|") ? (
                <select
                  required
                  value={draft[key] || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                >
                  <option value="">Select…</option>
                  {kind.split("|").map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={
                    kind === "checkbox"
                      ? "checkbox"
                      : kind === "date"
                        ? "date"
                        : kind === "url"
                          ? "url"
                          : kind?.includes("money") || kind?.includes("number")
                            ? "number"
                            : "text"
                  }
                  step={
                    kind?.includes("money") || key === "min_utilization_percent"
                      ? "0.01"
                      : "1"
                  }
                  min="0"
                  required={
                    kind !== "checkbox" && !kind?.startsWith("optional")
                  }
                  checked={kind === "checkbox" ? !!draft[key] : undefined}
                  value={kind === "checkbox" ? undefined : (draft[key] ?? "")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [key]:
                        kind === "checkbox" ? e.target.checked : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}
          <button disabled={busy}>
            {busy ? "Saving…" : id ? "Save changes" : "Add record"}
          </button>
          {id && (
            <button
              type="button"
              onClick={() => {
                setId(null);
                setDraft({});
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
        <p role="status">{message}</p>
      </section>
      <section className="finance-card">
        <h2>{TYPES[type]}</h2>
        <p>
          Edits are audited. Void incorrect transactions instead of deleting
          their history.
        </p>
        {!entries.length && <p>No records yet.</p>}
        <ul className="finance-records">
          {entries.map((row) => (
            <li key={row.id}>
              <div>
                <strong>
                  {row.title ||
                    row.category ||
                    row.as_of ||
                    `${row.fiscal_year} ${row.funding_type}`}
                </strong>
                <small>{row.id}</small>
                {row.amount_cents !== undefined && (
                  <span>
                    {money(row.amount_cents)} · {row.status} · {row.ledger}
                  </span>
                )}
              </div>
              <button onClick={() => edit(row)}>Edit</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
function ScenarioPlanner() {
  const [values, setValues] = useState({
    fixed: "",
    variable: "",
    ticket: "",
    attendees: "",
    sponsor: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  function calculate(e) {
    e.preventDefault();
    try {
      setResult(
        scenario({
          fixed_cents: cents(values.fixed),
          variable_cents: cents(values.variable),
          ticket_cents: cents(values.ticket),
          attendees: Number(values.attendees),
          sponsorship_cents: cents(values.sponsor || "0"),
        }),
      );
      setError("");
    } catch (err) {
      setResult(null);
      setError(err.message);
    }
  }
  return (
    <section className="finance-card">
      <h2>Plan an event</h2>
      <p>
        These are scenarios based on your assumptions, not predictions from
        historical data.
      </p>
      <form className="finance-form finance-grid" onSubmit={calculate}>
        {[
          ["fixed", "Fixed costs ($)"],
          ["variable", "Cost per attendee ($)"],
          ["ticket", "Ticket price ($)"],
          ["attendees", "Paying attendees"],
          ["sponsor", "Expected sponsorship ($)"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min="0"
              step={key === "attendees" ? "1" : "0.01"}
              required={key !== "sponsor"}
              value={values[key]}
              onChange={(e) => {
                setValues({ ...values, [key]: e.target.value });
                setResult(null);
              }}
            />
          </label>
        ))}
        <button>Calculate scenario</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && (
        <div className="finance-notice">
          <h3>Forecast · entered assumptions</h3>
          <p>
            Revenue: {money(result.revenue_cents)} · Costs:{" "}
            {money(result.expense_cents)} · Net: {money(result.net_cents)}
          </p>
          <p>
            Break-even attendance:{" "}
            {result.break_even_attendees ??
              "Not achievable with these prices and costs"}
          </p>
          <p>{result.assumptions}</p>
        </div>
      )}
    </section>
  );
}
function Assistant({ service }) {
  const { financeCall } = service;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function ask(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setAnswer(null);
    try {
      setAnswer(await financeCall("ask", { question }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="finance-card">
      <h2>Ask the treasury assistant</h2>
      <p>
        Ask about recorded cash, SG allocations, or event results. Answers use
        the financial calculations and cite supporting sources. Check the cited
        records before making spending decisions.
      </p>
      <form className="finance-form" onSubmit={ask}>
        <label>
          Your question
          <textarea
            required
            maxLength={2000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Which allocations need review, and what information is missing?"
          />
        </label>
        <button disabled={busy}>
          {busy ? "Reviewing records…" : "Ask assistant"}
        </button>
      </form>
      {error && (
        <p role="alert" className="finance-error">
          {error}
        </p>
      )}
      {answer && (
        <article aria-live="polite">
          <p className="finance-answer">{answer.answer}</p>
          <h3>Referenced sources</h3>
          <ul>
            {answer.sources.map((s) => (
              <li key={s.id}>
                <SourceLink source={{ title: s.title, source_url: s.url }} />
              </li>
            ))}
          </ul>
          <small>
            Records as of {answer.as_of}. AI interpretation; verify against the
            Overview calculations.
          </small>
        </article>
      )}
    </section>
  );
}
function DriveImports({ data, reload, service }) {
  const { financeCall, saveFinanceRecord } = service;
  const [folder, setFolder] = useState("");
  const [files, setFiles] = useState([]);
  const [next, setNext] = useState(null);
  const [fileId, setFileId] = useState("");
  const [worksheet, setWorksheet] = useState("Transactions");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run(fn) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  function list(page) {
    run(async () => {
      const result = await financeCall("drive_list", {
        folder_id: folder || undefined,
        page_token: page,
      });
      setFiles((previous) =>
        page ? [...previous, ...result.files] : result.files,
      );
      setNext(result.nextPageToken || null);
    });
  }
  function register(file) {
    run(async () => {
      await saveFinanceRecord("documents", {
        title: file.name,
        external_id: file.id,
        source_url: `https://drive.google.com/file/d/${file.id}/view`,
      });
      reload();
      setMessage("Source registered. Select it below for spreadsheet import.");
    });
  }
  return (
    <>
      <section className="finance-card">
        <h2>Browse treasury Drive</h2>
        <p>
          Browse the configured treasury folder or enter a subfolder ID. Files
          remain in Drive; registering a file preserves its source link. PDFs
          and Excel files can be registered as evidence; convert financial rows
          to the Google Sheets template for import.
        </p>
        <div className="finance-form">
          <label>
            Subfolder ID (optional)
            <input
              value={folder}
              onChange={(e) => {
                setFolder(e.target.value);
                setFiles([]);
                setNext(null);
              }}
            />
          </label>
          <button disabled={busy} onClick={() => list(null)}>
            List files
          </button>
        </div>
        <ul className="finance-records">
          {files.map((f) => (
            <li key={f.id}>
              <span>{f.name}</span>
              {f.mimeType === "application/vnd.google-apps.folder" ? (
                <button
                  onClick={() => {
                    setFolder(f.id);
                    setFiles([]);
                    setNext(null);
                  }}
                >
                  Select folder
                </button>
              ) : (
                <button
                  disabled={
                    busy || data.documents.some((d) => d.external_id === f.id)
                  }
                  onClick={() => register(f)}
                >
                  Register source
                </button>
              )}
            </li>
          ))}
        </ul>
        {next && (
          <button disabled={busy} onClick={() => list(next)}>
            More files
          </button>
        )}
      </section>
      <section className="finance-card">
        <h2>Review and import transactions</h2>
        <p>Use up to 200 rows with these exact headers, in order:</p>
        <code className="finance-template">
          transaction_id, occurred_on, ledger, kind, category, amount_usd,
          status, event_id, funding_id
        </code>
        <p>
          Dates use YYYY-MM-DD; amounts use plain dollars (12.50). Ledger: cash
          or sg. Kind: income or expense. Status: paid or committed. Copy event
          and allocation IDs from Records. Keep transaction IDs stable to
          prevent duplicate imports.
        </p>
        <div className="finance-form">
          <label>
            Registered Drive source
            <select
              value={fileId}
              onChange={(e) => {
                setFileId(e.target.value);
                setPreview(null);
              }}
            >
              <option value="">Select…</option>
              {data.documents
                .filter((d) => d.external_id)
                .map((d) => (
                  <option key={d.id} value={d.external_id}>
                    {d.title}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Worksheet name
            <input
              value={worksheet}
              onChange={(e) => {
                setWorksheet(e.target.value);
                setPreview(null);
              }}
            />
          </label>
          <button
            disabled={busy || !fileId}
            onClick={() =>
              run(async () =>
                setPreview(
                  await financeCall("sheet_preview", {
                    file_id: fileId,
                    tab: worksheet,
                  }),
                ),
              )
            }
          >
            Preview rows
          </button>
        </div>
        {preview && (
          <>
            <div className="finance-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Source row</th>
                    <th>Date</th>
                    <th>Ledger</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r) => (
                    <tr key={r.external_key}>
                      <td>{r.source_row}</td>
                      <td>{r.occurred_on}</td>
                      <td>
                        {r.ledger} / {r.kind}
                      </td>
                      <td>{r.category}</td>
                      <td>{money(r.amount_cents)}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              disabled={busy || !preview.rows.length}
              onClick={() =>
                run(async () => {
                  const result = await financeCall("sheet_import", {
                    file_id: fileId,
                    tab: worksheet,
                    digest: preview.digest,
                  });
                  setMessage(
                    `${result.inserted} imported; ${result.skipped} existing rows skipped.`,
                  );
                  setPreview(null);
                  reload();
                })
              }
            >
              Import reviewed rows
            </button>
            <p>
              Existing transaction IDs are skipped. Correct an imported
              transaction in Records; importing again will not overwrite it.
            </p>
          </>
        )}
      </section>
      <p role="status">{busy ? "Working…" : message}</p>
    </>
  );
}

function AuditHistory({ service, refresh }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [more, setMore] = useState(false);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");
    service
      .financeAudit()
      .then((result) => {
        if (active) {
          setRows(result);
          setMore(result.length === 50);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [service, refresh]);
  async function loadMore() {
    setBusy(true);
    setError("");
    try {
      const result = await service.financeAudit(rows.at(-1).id);
      setRows((current) => [...current, ...result]);
      setMore(result.length === 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="finance-card">
      <h2>Audit history</h2>
      <p>
        Financial changes are recorded automatically. Each entry includes the
        actor, time, and values before and after the change.
      </p>
      {error && (
        <p role="alert" className="finance-error">
          {error}
        </p>
      )}
      <div className="finance-scroll">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Record</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {new Date(row.occurred_at).toLocaleString()}
                  <small>Actor: {row.actor_id || "System"}</small>
                </td>
                <td>{row.operation}</td>
                <td>
                  {row.entity.replace("finance_", "")}
                  <small>{row.record_id}</small>
                </td>
                <td>
                  <details>
                    <summary>View changes</summary>
                    <h3>Before</h3>
                    <pre>
                      {JSON.stringify(row.before_record, null, 2) ||
                        "New record"}
                    </pre>
                    <h3>After</h3>
                    <pre>
                      {JSON.stringify(row.after_record, null, 2) || "Removed"}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && !busy && !error && <p>No recorded changes yet.</p>}
      {busy && <p role="status">Loading changes…</p>}
      {more && (
        <button disabled={busy} onClick={loadMore}>
          Load older changes
        </button>
      )}
    </section>
  );
}
