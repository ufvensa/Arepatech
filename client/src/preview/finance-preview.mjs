import { summarize } from "../../../shared/finance/analytics.mjs";
import { HEADERS, parseSheet } from "../../../shared/finance/import.mjs";
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const sources = [
  {
    id: id(1),
    title: "Sample: treasury ledger",
    external_id: "demo-ledger",
    source_url: "",
    review_status: "reviewed",
    is_sample: true,
  },
  {
    id: id(2),
    title: "Sample: cash balance record",
    external_id: null,
    source_url: "",
    review_status: "reviewed",
    is_sample: true,
  },
  {
    id: id(3),
    title: "Sample: funding approval",
    external_id: null,
    source_url: "",
    review_status: "reviewed",
    is_sample: true,
  },
];
const event = (n, title, date, year, attendance, complete) => ({
  id: id(n),
  title,
  occurred_on: date,
  fiscal_year: year,
  attendance,
  records_complete: complete,
  source_id: id(1),
});
const transaction = (n, kind, amount, overrides = {}) => ({
  id: id(n),
  occurred_on: "2026-09-10",
  ledger: "cash",
  kind,
  category: kind === "income" ? "tickets" : "venue",
  amount_cents: amount,
  status: "paid",
  event_id: id(10),
  funding_id: null,
  source_id: id(1),
  ...overrides,
});
export function createPreviewService() {
  const data = {
    documents: structuredClone(sources),
    events: [
      event(10, "Sample cultural night", "2026-09-10", "2026-27", 80, true),
      event(11, "Sample welcome social", "2026-09-12", "2026-27", null, false),
      event(12, "Sample spring gathering", "2026-03-20", "2025-26", 60, true),
    ],
    snapshots: [
      {
        id: id(30),
        as_of: "2026-09-01",
        balance_cents: 250000,
        source_id: id(2),
      },
    ],
    funding: [
      {
        id: id(20),
        title: "Sample fall event allocation",
        fiscal_year: "2026-27",
        funding_type: "sar",
        requested_cents: 120000,
        approved_cents: 100000,
        source_id: id(3),
      },
      {
        id: id(21),
        title: "Sample pending base request",
        fiscal_year: "2026-27",
        funding_type: "base",
        requested_cents: 50000,
        approved_cents: null,
        source_id: id(3),
      },
    ],
    rules: [],
    transactions: [
      transaction(40, "income", 120000),
      transaction(41, "expense", 45000),
      transaction(42, "expense", 30000, { ledger: "sg", funding_id: id(20) }),
      transaction(43, "expense", 20000, {
        event_id: id(11),
        status: "committed",
      }),
      transaction(44, "income", 60000, {
        occurred_on: "2026-03-20",
        event_id: id(12),
      }),
      transaction(45, "expense", 35000, {
        occurred_on: "2026-03-20",
        event_id: id(12),
      }),
    ],
  };
  const audit = [
    {
      id: 1,
      actor_id: id(90),
      occurred_at: "2026-09-10T15:00:00Z",
      entity: "finance_transactions",
      operation: "INSERT",
      record_id: id(40),
      before_record: null,
      after_record: structuredClone(data.transactions[0]),
    },
  ];
  const previewRows = () =>
    parseSheet(
      [
        HEADERS,
        [
          "sample-ticket-2",
          "2026-09-12",
          "cash",
          "income",
          "tickets",
          "25.00",
          "paid",
          id(11),
          "",
        ],
      ],
      id(1),
      "demo-ledger",
      "Transactions",
    );
  return {
    financeDataset: async () => structuredClone(data),
    financeAudit: async (before) =>
      structuredClone(
        audit
          .filter((row) => before == null || row.id < before)
          .sort((a, b) => b.id - a.id)
          .slice(0, 50),
      ),
    saveFinanceRecord: async (table, values, recordId) => {
      const key = table === "cash_snapshots" ? "snapshots" : table;
      if (!data[key]) throw new Error("Unknown sample record.");
      const old = recordId
        ? data[key].find((row) => row.id === recordId)
        : null;
      if (recordId && !old) throw new Error("Sample record not found.");
      const row = {
        ...old,
        ...values,
        id: recordId || crypto.randomUUID(),
        ...(table === "documents" ? { is_sample: true } : {}),
      };
      if (recordId)
        data[key] = data[key].map((r) => (r.id === recordId ? row : r));
      else data[key].push(row);
      audit.push({
        id: audit.length + 1,
        actor_id: id(90),
        occurred_at: new Date().toISOString(),
        entity: `finance_${table}`,
        operation: old ? "UPDATE" : "INSERT",
        record_id: row.id,
        before_record: old ? structuredClone(old) : null,
        after_record: structuredClone(row),
      });
    },
    financeCall: async (action, payload = {}) => {
      if (action === "drive_list")
        return {
          files: [
            {
              id: "demo-ledger",
              name: "Sample: treasury ledger",
              mimeType: "application/vnd.google-apps.spreadsheet",
            },
          ],
        };
      if (action === "sheet_preview") {
        if (payload.file_id !== "demo-ledger" || payload.tab !== "Transactions")
          throw new Error(
            "In the preview, select the sample treasury ledger and the Transactions worksheet.",
          );
        return { rows: previewRows(), digest: "sample-preview-v1" };
      }
      if (action === "sheet_import") {
        if (payload.digest !== "sample-preview-v1")
          throw new Error("Preview the sample rows first.");
        const rows = previewRows();
        let inserted = 0;
        for (const row of rows)
          if (
            !data.transactions.some((t) => t.external_key === row.external_key)
          ) {
            const record = { ...row, id: crypto.randomUUID() };
            data.transactions.push(record);
            inserted++;
            audit.push({
              id: audit.length + 1,
              actor_id: id(90),
              occurred_at: new Date().toISOString(),
              entity: "finance_transactions",
              operation: "INSERT",
              record_id: record.id,
              before_record: null,
              after_record: structuredClone(record),
            });
          }
        return { inserted, skipped: rows.length - inserted };
      }
      if (action === "ask") {
        const summary = summarize(data);
        const dollars = (n) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(n / 100);
        return {
          answer: `Sample response — not live AI.\n\nCalculation: The fictional ledger estimates ${dollars(summary.cash_cents)} in cash, with ${dollars(summary.cash_committed_cents)} committed. Cash after commitments is ${dollars(summary.cash_after_commitments_cents)}. [${id(2)}]\n\nMissing data: The sample welcome social has incomplete records, so its profit is unknown. No current SG rule has been verified.\n\nAssumption: Every post-snapshot cash movement has been entered.\n\nLive mode answers your question using the configured AI service and your authorized records.`,
          sources: [
            { id: id(2), title: "Sample: cash balance record", url: "" },
          ],
          as_of: summary.as_of,
        };
      }
      throw new Error("This action is not available in the sample preview.");
    },
  };
}
