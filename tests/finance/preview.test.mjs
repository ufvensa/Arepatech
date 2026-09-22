import test from "node:test";
import assert from "node:assert/strict";
import { createPreviewService } from "../../client/src/preview/finance-preview.mjs";
test("preview edits are isolated and audited; repeated imports are skipped", async () => {
  const service = createPreviewService();
  const second = createPreviewService();
  const rows = await service.financeCall("sheet_preview", {
    file_id: "demo-ledger",
    tab: "Transactions",
  });
  assert.equal(
    (await service.financeCall("sheet_import", { digest: rows.digest }))
      .inserted,
    1,
  );
  assert.equal(
    (await service.financeCall("sheet_import", { digest: rows.digest }))
      .inserted,
    0,
  );
  assert.equal((await service.financeDataset()).transactions.length, 7);
  assert.equal((await second.financeDataset()).transactions.length, 6);
  assert.equal((await service.financeAudit()).length, 2);
  const event = (await service.financeDataset()).events[0];
  await service.saveFinanceRecord(
    "events",
    { title: "Edited example" },
    event.id,
  );
  assert.equal(
    (await service.financeAudit())[0].before_record.title,
    "Sample cultural night",
  );
  assert.equal(
    (await second.financeDataset()).events[0].title,
    "Sample cultural night",
  );
});
