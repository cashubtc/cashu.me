import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import {
  parseBackupTable,
  stringifyBackupTable,
  snapshotWalletDatabase,
  PAYMENT_BACKUP_TABLES,
} from "src/stores/storage";
import { cashuDb } from "src/stores/dexie";

describe("wallet backup table serialization", () => {
  it("serializes bigint-bearing legacy rows without throwing", () => {
    const serialized = stringifyBackupTable([
      { quote: "legacy-quote", amount: { value: 21n } },
    ]);

    expect(serialized).toBe('[{"quote":"legacy-quote","amount":{"value":21}}]');
    expect(parseBackupTable(serialized)).toEqual([
      { quote: "legacy-quote", amount: { value: 21 } },
    ]);
  });

  it("rejects a malformed backup table", () => {
    expect(() => parseBackupTable('{"not":"a table"}')).toThrow(
      "Invalid wallet backup table"
    );
  });
  it("backs up durable payment data and counters but never live tab locks", async () => {
    await cashuDb.paymentCounters.put({
      id: "synthetic-seed:keyset",
      next: 123,
    });
    await cashuDb.paymentLocks.put({
      id: "synthetic-seed",
      owner: "test-tab",
      expires: Date.now(),
    });
    const snapshot = await snapshotWalletDatabase();
    for (const table of PAYMENT_BACKUP_TABLES)
      expect(snapshot[`cashu.dexie.db.${table}`]).toBeDefined();
    expect(
      parseBackupTable(snapshot["cashu.dexie.db.paymentCounters"])
    ).toContainEqual({ id: "synthetic-seed:keyset", next: 123 });
    expect(snapshot["cashu.dexie.db.paymentLocks"]).toBeUndefined();
    expect(snapshot["cashu.dexie.db.proofs"]).toBeDefined();
  });
});
