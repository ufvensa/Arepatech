import { supabase } from "./supabase";
export const canAccessFinance = (profile) =>
  ["eboard", "president", "technology"].includes(profile?.role);
export async function financeCall(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke("finance-api", {
    body: { action, ...payload },
  });
  if (error) {
    let message = error.message;
    try {
      message = (await error.context.json()).error || message;
    } catch {
      /* Network errors have no response body. */
    }
    throw new Error(message);
  }
  return data;
}
export async function financeDataset() {
  const { data, error } = await supabase.rpc("finance_dataset");
  if (error)
    throw new Error(
      "Treasury data is unavailable. Check finance access and apply the treasury migration.",
    );
  return data;
}
export async function saveFinanceRecord(table, values, id) {
  const tables = [
    "documents",
    "events",
    "funding",
    "transactions",
    "cash_snapshots",
    "rules",
  ];
  if (!tables.includes(table)) throw new Error("Unknown finance record.");
  const query = supabase.from(`finance_${table}`);
  const { error } = id
    ? await query.update(values).eq("id", id)
    : await query.insert(values);
  if (error)
    throw new Error(
      "Record was not saved. Check required fields, dates, source, and funding selection.",
    );
}
