// All monetary values are integer USD cents. Missing evidence stays null.
export function cents(value) {
  const text = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text))
    throw new Error(
      "Use a non-negative dollar amount with at most two decimals.",
    );
  const [whole, fraction = ""] = text.split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(result) || result > 10000000000)
    throw new Error("Amount is out of range.");
  return result;
}
export function scenario({
  fixed_cents,
  variable_cents,
  ticket_cents,
  attendees,
  sponsorship_cents = 0,
}) {
  for (const value of [
    fixed_cents,
    variable_cents,
    ticket_cents,
    attendees,
    sponsorship_cents,
  ]) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 10000000000)
      throw new Error("Scenario values must be non-negative integers.");
  }
  const revenue = ticket_cents * attendees + sponsorship_cents;
  const cost = fixed_cents + variable_cents * attendees;
  if (!Number.isSafeInteger(revenue) || !Number.isSafeInteger(cost))
    throw new Error("Scenario exceeds safe calculation limits.");
  const margin = ticket_cents - variable_cents;
  return {
    classification: "forecast",
    revenue_cents: revenue,
    expense_cents: cost,
    net_cents: revenue - cost,
    break_even_attendees:
      fixed_cents <= sponsorship_cents
        ? 0
        : margin > 0
          ? Math.ceil((fixed_cents - sponsorship_cents) / margin)
          : null,
    assumptions:
      "All attendees buy one ticket; stated sponsorship is received; costs follow the entered fixed and per-attendee amounts. SG funding is excluded.",
  };
}
export function summarize(data, asOf = new Date().toISOString().slice(0, 10)) {
  const {
    transactions = [],
    snapshots = [],
    funding = [],
    events = [],
    rules = [],
  } = data;
  const active = transactions.filter(
    (t) => t.status !== "void" && t.occurred_on <= asOf,
  );
  const paid = active.filter((t) => t.status === "paid");
  const sum = (rows) => rows.reduce((n, t) => n + Number(t.amount_cents), 0);
  const cashRows = paid.filter((t) => t.ledger === "cash");
  const availableSnapshots = snapshots
    .filter((s) => s.as_of <= asOf)
    .sort((a, b) => b.as_of.localeCompare(a.as_of));
  const latest = availableSnapshots[0] || null;
  // Snapshot is the combined VENSA cash balance at end of day. Never add earlier transactions twice.
  const since = latest
    ? cashRows.filter((t) => t.occurred_on > latest.as_of)
    : [];
  const cash = latest
    ? Number(latest.balance_cents) +
      sum(since.filter((t) => t.kind === "income")) -
      sum(since.filter((t) => t.kind === "expense"))
    : null;
  const committed = sum(
    active.filter(
      (t) =>
        t.ledger === "cash" && t.kind === "expense" && t.status === "committed",
    ),
  );
  const allocations = funding.map((f) => {
    const rows = active.filter(
      (t) => t.funding_id === f.id && t.ledger === "sg" && t.kind === "expense",
    );
    const spent = sum(rows.filter((t) => t.status === "paid"));
    const reserved = sum(rows.filter((t) => t.status === "committed"));
    const approved =
      f.approved_cents === null ? null : Number(f.approved_cents);
    const rule = rules.find(
      (r) =>
        r.fiscal_year === f.fiscal_year &&
        r.funding_type === f.funding_type &&
        r.effective_from <= asOf &&
        r.effective_to >= asOf,
    );
    const utilization = approved > 0 ? spent / approved : null;
    return {
      ...f,
      spent_cents: spent,
      committed_cents: reserved,
      remaining_cents: approved === null ? null : approved - spent - reserved,
      utilization,
      rule_source_id: rule?.source_id || null,
      compliance:
        approved === null
          ? "Approval amount missing"
          : spent + reserved > approved
            ? "Over allocation: review required"
            : !rule
              ? "Current SG rule not verified"
              : utilization !== null &&
                  utilization * 100 < Number(rule.min_utilization_percent)
                ? "Below configured utilization threshold: review timing and eligibility"
                : "No utilization flag; this is not SG approval",
    };
  });
  const eventResults = events.map((e) => {
    const rows = paid.filter((t) => t.event_id === e.id);
    const revenue = sum(
      rows.filter(
        (t) =>
          t.kind === "income" &&
          t.ledger === "cash" &&
          t.category !== "sg_reimbursement",
      ),
    );
    const reimbursements = sum(
      rows.filter(
        (t) =>
          t.kind === "income" &&
          t.ledger === "cash" &&
          t.category === "sg_reimbursement",
      ),
    );
    const cashExpense = sum(
      rows.filter((t) => t.kind === "expense" && t.ledger === "cash"),
    );
    const sgExpense = sum(
      rows.filter((t) => t.kind === "expense" && t.ledger === "sg"),
    );
    const complete = e.records_complete === true;
    return {
      ...e,
      revenue_cents: revenue,
      reimbursement_cents: reimbursements,
      cash_expense_cents: cashExpense,
      sg_expense_cents: sgExpense,
      net_cash_cents: complete ? revenue + reimbursements - cashExpense : null,
      economic_net_cents: complete ? revenue - cashExpense - sgExpense : null,
      cost_per_attendee_cents:
        complete && e.attendance > 0
          ? Math.round((cashExpense + sgExpense) / e.attendance)
          : null,
      source_ids: [
        ...new Set(
          [e.source_id, ...rows.map((t) => t.source_id)].filter(Boolean),
        ),
      ],
    };
  });
  return {
    as_of: asOf,
    classification: "calculation",
    cash_cents: cash,
    cash_snapshot: latest,
    cash_committed_cents: committed,
    cash_after_commitments_cents: cash === null ? null : cash - committed,
    recorded_cash_income_cents: sum(
      cashRows.filter((t) => t.kind === "income"),
    ),
    recorded_cash_expense_cents: sum(
      cashRows.filter((t) => t.kind === "expense"),
    ),
    funding: allocations,
    events: eventResults,
    missing_data: [
      ...(!latest
        ? ["No verified cash snapshot; current cash is unknown."]
        : []),
      ...events
        .filter((e) => !e.records_complete)
        .map((e) => `Event ${e.id}: incomplete records; profit is unknown.`),
    ],
    limitations:
      "Balances assume all post-snapshot cash movements are recorded. Recorded totals are not proof of complete history. SG reimbursements enter cash only when actually received and entered as cash income; exclude them from event sales revenue.",
  };
}
