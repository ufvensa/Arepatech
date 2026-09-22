import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const staff = "10000000-0000-4000-8000-000000000001";
const member = "10000000-0000-4000-8000-000000000002";
let db;
test.before(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth, public to anon,authenticated;
 grant execute on function auth.uid() to anon,authenticated;
 create table public.profiles(id uuid primary key,role text);
 insert into profiles values('${staff}','technology'),('${member}','member');`);
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/20260917000000_finance_workspace.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
});
test.after(async () => {
  await db.close();
});
async function actor(id, role = "authenticated") {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${id}',false);set role ${role};`,
  );
}
test("staff can write and read sourced records with an immutable audit trail", async () => {
  await actor(staff);
  const source = await db.query(
    "insert into finance_documents(title,source_url) values('Receipt','https://example.com/receipt') returning id",
  );
  const id = source.rows[0].id;
  await db.query(
    "insert into finance_transactions(occurred_on,ledger,kind,category,amount_cents,status,source_id) values('2026-09-16','cash','expense','venue',12300,'paid',$1)",
    [id],
  );
  const result = await db.query("select finance_dataset() as dataset");
  assert.equal(result.rows[0].dataset.transactions.length, 1);
  assert.equal(
    (await db.query("select count(*)::int as n from finance_audit")).rows[0].n,
    2,
  );
  await assert.rejects(db.query("delete from finance_audit"));
  await assert.rejects(db.query("delete from finance_transactions"));
});
test("ordinary members cannot read records, call dataset, or write financial data", async () => {
  await actor(member);
  assert.equal(
    (await db.query("select * from finance_transactions")).rows.length,
    0,
  );
  await assert.rejects(db.query("select finance_dataset()"));
  await assert.rejects(
    db.query(
      "insert into finance_documents(title,source_url) values('Bad','https://example.com')",
    ),
  );
});
test("anonymous callers cannot read records or execute privileged functions", async () => {
  await actor("", "anon");
  await assert.rejects(db.query("select * from finance_transactions"));
  await assert.rejects(db.query("select finance_dataset()"));
});
test("database rejects SG income and cash incorrectly linked to an SG allocation", async () => {
  await actor(staff);
  const source = (await db.query("select id from finance_documents limit 1"))
    .rows[0].id;
  const funding = (
    await db.query(
      "insert into finance_funding(title,fiscal_year,funding_type,requested_cents,source_id) values('Fall','2026-27','base',10000,$1) returning id",
      [source],
    )
  ).rows[0].id;
  for (const ledger of ["cash", "sg"])
    await assert.rejects(
      db.query(
        "insert into finance_transactions(occurred_on,ledger,kind,category,amount_cents,status,source_id,funding_id) values('2026-09-16',$1,'income','funding',100,'paid',$2,$3)",
        [ledger, source, funding],
      ),
    );
  await assert.rejects(
    db.query(
      "insert into finance_cash_snapshots(as_of,balance_cents,source_id) values(current_date+1,100,$1)",
      [source],
    ),
  );
});
test("assistant rate limit is persisted and enforced after 20 requests", async () => {
  await actor(staff);
  for (let i = 0; i < 20; i++)
    assert.equal(
      (await db.query("select finance_take_request() as allowed")).rows[0]
        .allowed,
      true,
    );
  assert.equal(
    (await db.query("select finance_take_request() as allowed")).rows[0]
      .allowed,
    false,
  );
});
test("duplicate imports do not double-count and a failing batch is atomic", async () => {
  await actor(staff);
  const source = (await db.query("select id from finance_documents limit 1"))
    .rows[0].id;
  const sql =
    "insert into finance_transactions(external_key,occurred_on,ledger,kind,category,amount_cents,status,source_id) values('stable-id','2026-09-16','cash','income','tickets',1000,'paid',$1) on conflict(external_key) do nothing";
  await db.query(sql, [source]);
  await db.query(sql, [source]);
  assert.equal(
    (
      await db.query(
        "select count(*)::int as n from finance_transactions where external_key='stable-id'",
      )
    ).rows[0].n,
    1,
  );
  await assert.rejects(
    db.query(
      "insert into finance_transactions(external_key,occurred_on,ledger,kind,category,amount_cents,status,source_id) values ('batch-good','2026-09-16','cash','income','tickets',1000,'paid',$1),('batch-bad','2026-09-16','sg','income','tickets',1000,'paid',$1)",
      [source],
    ),
  );
  assert.equal(
    (
      await db.query(
        "select count(*)::int as n from finance_transactions where external_key='batch-good'",
      )
    ).rows[0].n,
    0,
  );
});
