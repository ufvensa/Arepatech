import test from "node:test";
import assert from "node:assert/strict";
import { cents, scenario, summarize } from "../../shared/finance/analytics.mjs";
import { parseSheet, HEADERS } from "../../shared/finance/import.mjs";
const paid = (overrides = {}) => ({
  id: "t",
  amount_cents: 10000,
  occurred_on: "2026-09-16",
  ledger: "cash",
  kind: "expense",
  status: "paid",
  category: "venue",
  ...overrides,
});
test("USD parsing avoids float rounding and rejects ambiguous formats", () => {
  assert.equal(cents("12.30"), 1230);
  assert.equal(cents("0.01"), 1);
  for (const value of [
    "",
    null,
    "-1",
    "1.005",
    "$12",
    "1,200",
    "1e3",
    "Infinity",
  ])
    assert.throws(() => cents(value));
});
test("cash stays unknown without a snapshot and never includes SG approval", () => {
  const s = summarize(
    {
      transactions: [paid()],
      funding: [{ id: "f", approved_cents: 900000 }],
      snapshots: [],
    },
    "2026-09-17",
  );
  assert.equal(s.cash_cents, null);
  assert.equal(s.funding[0].remaining_cents, 900000);
});
test("end-of-day snapshots exclude earlier and same-day rows, future rows, voids, and SG payments", () => {
  const s = summarize(
    {
      snapshots: [
        { as_of: "2026-09-15", balance_cents: 50000 },
        { as_of: "2026-09-20", balance_cents: 1 },
      ],
      transactions: [
        paid(),
        paid({ occurred_on: "2026-09-15" }),
        paid({ kind: "income", amount_cents: 3000 }),
        paid({ ledger: "sg" }),
        paid({ status: "void" }),
        paid({ occurred_on: "2026-09-19" }),
        paid({ status: "committed", amount_cents: 5000 }),
      ],
    },
    "2026-09-17",
  );
  assert.equal(s.cash_cents, 43000);
  assert.equal(s.cash_after_commitments_cents, 38000);
});
test("pending approval is unknown; over-allocation is flagged", () => {
  const s = summarize(
    {
      funding: [
        { id: "a", approved_cents: null },
        { id: "b", approved_cents: 9000 },
      ],
      transactions: [paid({ ledger: "sg", funding_id: "b" })],
    },
    "2026-09-17",
  );
  assert.equal(s.funding[0].remaining_cents, null);
  assert.match(s.funding[1].compliance, /Over allocation/);
});
test("SG rules require matching year, funding type and effective date", () => {
  const input = {
    funding: [
      {
        id: "f",
        approved_cents: 10000,
        fiscal_year: "2026-27",
        funding_type: "sar",
      },
    ],
    rules: [
      {
        fiscal_year: "2026-27",
        funding_type: "sar",
        effective_from: "2026-07-01",
        effective_to: "2027-06-30",
        min_utilization_percent: 75,
        source_id: "s",
      },
    ],
  };
  assert.match(
    summarize(input, "2026-09-17").funding[0].compliance,
    /Below configured/,
  );
  assert.match(
    summarize(input, "2028-01-01").funding[0].compliance,
    /not verified/,
  );
});
test("incomplete event profits and missing attendance stay unknown", () => {
  const s = summarize({
    events: [{ id: "e", records_complete: false, attendance: null }],
    transactions: [paid({ event_id: "e" })],
  });
  assert.equal(s.events[0].economic_net_cents, null);
  assert.equal(s.events[0].cost_per_attendee_cents, null);
});
test("event economics count cash + SG costs, but reimbursement is not sales revenue", () => {
  const s = summarize({
    events: [{ id: "e", records_complete: true, attendance: 10 }],
    transactions: [
      paid({ event_id: "e", kind: "income", amount_cents: 30000 }),
      paid({ event_id: "e" }),
      paid({ event_id: "e", ledger: "sg", amount_cents: 5000 }),
      paid({
        event_id: "e",
        kind: "income",
        category: "sg_reimbursement",
        amount_cents: 2000,
      }),
    ],
  });
  assert.equal(s.events[0].revenue_cents, 30000);
  assert.equal(s.events[0].net_cash_cents, 22000);
  assert.equal(s.events[0].economic_net_cents, 15000);
});
test("break-even uses contribution margin and rounds up; impossible case is null", () => {
  assert.equal(
    scenario({
      fixed_cents: 10000,
      variable_cents: 100,
      ticket_cents: 400,
      attendees: 34,
    }).break_even_attendees,
    34,
  );
  assert.equal(
    scenario({
      fixed_cents: 10000,
      variable_cents: 400,
      ticket_cents: 400,
      attendees: 34,
    }).break_even_attendees,
    null,
  );
  assert.throws(() =>
    scenario({
      fixed_cents: 1,
      variable_cents: 1,
      ticket_cents: 1,
      attendees: -1,
    }),
  );
});
test("sheet validation retains stable keys and row citations", () => {
  const row = [
    "ticket-1",
    "2026-09-16",
    "cash",
    "income",
    "tickets",
    "12.50",
    "paid",
    "",
    "",
  ];
  const result = parseSheet([HEADERS, row], "source", "file", "Transactions");
  assert.equal(result[0].amount_cents, 1250);
  assert.equal(result[0].external_key, "file:Transactions:ticket-1");
  assert.equal(result[0].source_row, "Transactions!2");
  assert.throws(
    () => parseSheet([HEADERS, row, row], "source", "file", "Transactions"),
    /unique/,
  );
  assert.throws(
    () =>
      parseSheet(
        [HEADERS, [...row.slice(0, 2), "sg", ...row.slice(3)]],
        "s",
        "f",
        "t",
      ),
    /SG/,
  );
  assert.throws(
    () =>
      parseSheet(
        [HEADERS, ["x", "2026-02-30", ...row.slice(2)]],
        "s",
        "f",
        "t",
      ),
    /date/,
  );
  assert.throws(
    () => parseSheet([HEADERS, ...Array(201).fill(row)], "s", "f", "t"),
    /200/,
  );
});

test('report filtering preserves full cash history and filters only event/allocation results',async()=>{
 const {filterReport}=await import('../../shared/finance/analytics.mjs');
 const full=summarize({snapshots:[{as_of:'2025-01-01',balance_cents:100000}],transactions:[paid({amount_cents:10000})],events:[{id:'old',fiscal_year:'2025-26'},{id:'new',fiscal_year:'2026-27'}],funding:[{id:'old',fiscal_year:'2025-26',approved_cents:100},{id:'new',fiscal_year:'2026-27',approved_cents:200}]});
 const filtered=filterReport(full,'2026-27');
 assert.equal(filtered.cash_cents,full.cash_cents);assert.equal(filtered.events.length,1);assert.equal(filtered.events[0].id,'new');assert.equal(filtered.funding[0].id,'new');
});
