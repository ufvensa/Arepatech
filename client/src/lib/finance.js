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
  if (error) {
    console.error('[treasury] dataset failed', { code: error.code });
    if (error.code === 'PGRST202' || error.code === '42P01')
      throw new Error('Treasury setup is incomplete. Please contact the website administrator.');
    if (error.code === '42501' || error.message?.includes('Finance access required'))
      throw new Error('Your account does not have treasury access. Sign in with an authorized E-Board account.');
    if (error.message?.includes('10000 transactions'))
      throw new Error('Treasury has reached its reporting capacity. Contact the website administrator.');
    throw new Error('Unable to load treasury records. Check your connection and try Refresh records.');
  }
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
  const { data, error } = id
    ? await query.update(values).eq("id", id).select('id').single()
    : await query.insert(values).select('id').single();
  if (error)
    throw new Error(
      "Record was not saved. Check required fields, dates, source, and funding selection.",
    );
  return data;
}

export async function financeAudit(beforeId = null) {
  let query = supabase
    .from("finance_audit")
    .select(
      "id,actor_id,occurred_at,entity,operation,record_id,before_record,after_record",
    )
    .order("id", { ascending: false })
    .limit(50);
  if (beforeId !== null) query = query.lt("id", beforeId);
  const { data, error } = await query;
  if (error)
    throw new Error("Could not load audit history. Check treasury access.");
  return data;
}
