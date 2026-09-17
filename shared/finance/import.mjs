import { cents } from "./analytics.mjs";
export const HEADERS = [
  "transaction_id",
  "occurred_on",
  "ledger",
  "kind",
  "category",
  "amount_usd",
  "status",
  "event_id",
  "funding_id",
];
export function parseSheet(values, sourceId, fileId, tab) {
  if (!Array.isArray(values) || values.length < 2)
    throw new Error("The worksheet has no transactions.");
  if (values.length > 201)
    throw new Error(
      "Import at most 200 transactions per worksheet. Split larger worksheets.",
    );
  if (HEADERS.some((h, i) => values[0][i] !== h))
    throw new Error(`Expected headers: ${HEADERS.join(", ")}`);
  const seen = new Set();
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return values.slice(1).flatMap((cells, index) => {
    if (cells.every((v) => String(v).trim() === "")) return [];
    const row = Object.fromEntries(
      HEADERS.map((h, i) => [h, String(cells[i] ?? "").trim()]),
    );
    const fail = (msg) => {
      throw new Error(`Row ${index + 2}: ${msg}`);
    };
    if (
      !/^[A-Za-z0-9_-]{1,100}$/.test(row.transaction_id) ||
      seen.has(row.transaction_id)
    )
      fail("A unique stable transaction_id is required.");
    seen.add(row.transaction_id);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(row.occurred_on) ||
      new Date(row.occurred_on).toISOString().slice(0, 10) !== row.occurred_on
    )
      fail("Use a valid YYYY-MM-DD date.");
    if (
      !["cash", "sg"].includes(row.ledger) ||
      !["income", "expense"].includes(row.kind) ||
      !["paid", "committed"].includes(row.status)
    )
      fail("Invalid ledger, kind, or status.");
    if (row.kind === "income" && row.status === "committed")
      fail("Expected income is not received cash.");
    if (!row.category || row.category.length > 100)
      fail("Category is required (max 100 characters).");
    for (const field of ["event_id", "funding_id"])
      if (row[field] && !uuid.test(row[field]))
        fail(`${field} must be an existing finance UUID or empty.`);
    if (row.ledger === "sg" && (row.kind !== "expense" || !row.funding_id))
      fail("SG expenses require a funding_id.");
    if (row.ledger === "cash" && row.funding_id)
      fail("Cash must not be allocated to an SG funding record.");
    const amount = cents(row.amount_usd);
    if (!amount) fail("Amount must be positive.");
    return [
      {
        external_key: `${fileId}:${tab}:${row.transaction_id}`,
        occurred_on: row.occurred_on,
        ledger: row.ledger,
        kind: row.kind,
        category: row.category,
        amount_cents: amount,
        status: row.status,
        event_id: row.event_id || null,
        funding_id: row.funding_id || null,
        source_id: sourceId,
        source_row: `${tab}!${index + 2}`,
      },
    ];
  });
}
