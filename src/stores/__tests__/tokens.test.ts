import { beforeEach, describe, expect, it } from "vitest";
import { cashuDb } from "src/stores/dexie";
import { HistoryToken, useTokensStore } from "src/stores/tokens";

async function readEcashHistory(store: ReturnType<typeof useTokensStore>) {
  if (typeof indexedDB !== "undefined") {
    return (await cashuDb.ecashHistory.toArray()) as HistoryToken[];
  }
  return store.historyTokens;
}

describe("tokens store", () => {
  beforeEach(async () => {
    localStorage.clear();
    if (typeof indexedDB !== "undefined") {
      await cashuDb.ecashHistory.clear();
    }
  });

  it("migrates legacy historyTokens into ecashHistory", async () => {
    const legacyHistory: Partial<HistoryToken>[] = [
      {
        id: "paid-token",
        status: "paid",
        amount: 21,
        date: "2026-03-10T12:00:00.000Z",
        paidDate: "2026-03-10T12:01:00.000Z",
        token: "cashuA",
        mint: "https://mint.example",
        unit: "sat",
        fee: 1,
      },
      {
        status: "pending",
        amount: -7,
        date: "2026-03-10T12:02:00.000Z",
        token: "cashuB",
        mint: "https://mint.example",
        unit: "sat",
        paymentRequestId: "request-id",
      },
    ];

    localStorage.setItem("cashu.historyTokens", JSON.stringify(legacyHistory));

    const store = useTokensStore();
    await store.migrateHistoryTokensFromLocalStorage();

    expect(localStorage.getItem("cashu.historyTokens")).toBeNull();

    const ecashHistory = await readEcashHistory(store);
    expect(ecashHistory).toHaveLength(2);
    expect(ecashHistory[0]).toEqual(
      expect.objectContaining({
        id: "paid-token",
        status: "paid",
        token: "cashuA",
        fee: 1,
      })
    );
    expect(ecashHistory[1]).toEqual(
      expect.objectContaining({
        status: "pending",
        token: "cashuB",
        paymentRequestId: "request-id",
      })
    );
    expect(ecashHistory[1].id).toEqual(expect.any(String));

    await store.migrateHistoryTokensFromLocalStorage();
    expect(await readEcashHistory(store)).toHaveLength(2);
  });

  it("keeps existing token history actions compatible with the cache", () => {
    const store = useTokensStore();

    const id = store.addPendingToken({
      amount: 12,
      token: "cashuA",
      mint: "https://mint.example",
      unit: "sat",
    });

    expect(store.historyTokens[0]).toEqual(
      expect.objectContaining({
        id,
        status: "pending",
        amount: 12,
        token: "cashuA",
      })
    );

    store.editHistoryToken("cashuA", {
      newToken: "cashuB",
      addAmount: 3,
      newFee: 2,
    });
    store.setTokenPaid("cashuB");

    expect(store.historyTokens[0]).toEqual(
      expect.objectContaining({
        id,
        status: "paid",
        amount: 15,
        token: "cashuB",
        fee: 2,
      })
    );
    expect(store.historyTokens[0].paidDate).toEqual(expect.any(String));

    store.deleteToken("cashuB");
    expect(store.historyTokens).toEqual([]);
  });

  it("redacts old paid token payloads from ecashHistory", async () => {
    const legacyHistory: HistoryToken[] = [
      {
        id: "old-paid",
        status: "paid",
        amount: 1,
        date: "2026-03-10T12:00:00.000Z",
        token: "old-token",
        mint: "https://mint.example",
        unit: "sat",
      },
      {
        id: "new-paid",
        status: "paid",
        amount: 2,
        date: "2026-03-10T12:01:00.000Z",
        token: "new-token",
        mint: "https://mint.example",
        unit: "sat",
      },
      {
        id: "pending-token",
        status: "pending",
        amount: 3,
        date: "2026-03-10T12:02:00.000Z",
        token: "pending-token",
        mint: "https://mint.example",
        unit: "sat",
      },
    ];

    localStorage.setItem("cashu.historyTokens", JSON.stringify(legacyHistory));

    const store = useTokensStore();
    await store.migrateHistoryTokensFromLocalStorage();
    await store.redactOldPaidTokens(1);

    const ecashHistory = await readEcashHistory(store);
    expect(ecashHistory.find((token) => token.id === "old-paid")?.token).toBe(
      undefined
    );
    expect(ecashHistory.find((token) => token.id === "new-paid")?.token).toBe(
      "new-token"
    );
    expect(
      ecashHistory.find((token) => token.id === "pending-token")?.token
    ).toBe("pending-token");
  });
});
