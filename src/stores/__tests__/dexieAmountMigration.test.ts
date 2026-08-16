import "fake-indexeddb/auto";
import { Amount } from "@cashu/cashu-ts";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import { CashuDexie } from "src/stores/dexie";

const databaseNames: string[] = [];

function versionThreeSchema(db: Dexie) {
  db.version(3).stores({
    proofs: "secret, id, C, amount, reserved, quote",
    paymentHistory:
      "id, direction, quote, parentQuote, method, status, mint, unit, date, paidDate, [direction+quote], [direction+status], [method+status]",
    mintQuotes: "quote, method, request, unit, state, expiry, pubkey",
    meltQuotes: "quote, method, request, unit, state, expiry",
    ecashHistory:
      "id, status, token, mint, unit, date, paidDate, paymentRequestId, [status+date], [mint+unit]",
  });
}

afterEach(async () => {
  await Promise.all(databaseNames.splice(0).map((name) => Dexie.delete(name)));
});

describe("CashuDexie amount migration", () => {
  it("repairs structured-cloned Amount values from version 3", async () => {
    const databaseName = `cashu-amount-migration-${crypto.randomUUID()}`;
    databaseNames.push(databaseName);
    const legacyDb = new Dexie(databaseName);
    versionThreeSchema(legacyDb);

    await legacyDb.open();
    await legacyDb.table("proofs").put({
      secret: "proof-secret",
      id: "keyset-id",
      C: "proof-signature",
      amount: structuredClone(Amount.from(8)),
      reserved: false,
    });
    await legacyDb.table("meltQuotes").put({
      quote: "melt-quote",
      method: "bolt11",
      amount: structuredClone(Amount.from(100)),
      fee_reserve: structuredClone(Amount.from(5)),
      change: [
        {
          id: "keyset-id",
          amount: structuredClone(Amount.from(2)),
          C_: "change-signature",
        },
      ],
    });
    legacyDb.close();

    const migratedDb = new CashuDexie(databaseName);
    await migratedDb.open();

    expect((await migratedDb.proofs.get("proof-secret"))?.amount).toBe(8);
    expect(await migratedDb.meltQuotes.get("melt-quote")).toEqual(
      expect.objectContaining({
        amount: 100,
        fee_reserve: 5,
        change: [
          {
            id: "keyset-id",
            amount: 2,
            C_: "change-signature",
          },
        ],
      })
    );
    const migratedQuotes = await migratedDb.meltQuotes.toArray();
    expect(() => JSON.stringify(migratedQuotes)).not.toThrow();

    migratedDb.close();
  });
});
