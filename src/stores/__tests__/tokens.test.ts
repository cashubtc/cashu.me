import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { reactive } from "vue";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";
import { cashuDb } from "src/stores/dexie";
import { HistoryToken, useTokensStore } from "src/stores/tokens";

async function readEcashHistory() {
  return (await cashuDb.ecashHistory.toArray()) as HistoryToken[];
}

describe("tokens store", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.ecashHistory.clear();
  });

  it("persists reactive payment requests and restores their methods after reload", async () => {
    const store = useTokensStore();
    const paymentRequest = reactive(
      new PaymentRequest(
        [
          {
            type: PaymentRequestTransportType.POST,
            target: "https://pay.example",
          },
        ],
        "request-id",
        21,
        "sat"
      )
    );
    const id = store.addPendingToken({
      amount: -21,
      token: "cashuA",
      mint: "https://mint.example",
      unit: "sat",
      paymentRequest,
    });
    await expect.poll(async () => (await readEcashHistory()).length).toBe(1);
    await store.refreshEcashHistory();
    const restored = store.historyTokens.find((row) => row.id === id)!;
    expect(restored.paymentRequest?.toEncodedCreqA()).toBe(
      paymentRequest.toEncodedCreqA()
    );
    store.setTokenPaid("cashuA");
    await expect
      .poll(async () => (await readEcashHistory())[0]?.status)
      .toBe("paid");
    await store.refreshEcashHistory();
    expect(store.historyTokens[0].paymentRequest?.toEncodedCreqA()).toBe(
      paymentRequest.toEncodedCreqA()
    );
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
        paymentRequest: new PaymentRequest(
          [
            {
              type: PaymentRequestTransportType.POST,
              target: "https://pay.example",
            },
          ],
          "request-id",
          7,
          "sat"
        ),
      },
    ];

    localStorage.setItem("cashu.historyTokens", JSON.stringify(legacyHistory));

    const store = useTokensStore();
    await store.migrateHistoryTokensFromLocalStorage();

    expect(localStorage.getItem("cashu.historyTokens")).toBeNull();

    const ecashHistory = await readEcashHistory();
    expect(ecashHistory).toHaveLength(2);
    expect(ecashHistory.find((row) => row.id === "paid-token")).toEqual(
      expect.objectContaining({
        id: "paid-token",
        status: "paid",
        token: "cashuA",
        fee: 1,
      })
    );
    const pendingToken = ecashHistory.find((row) => row.status === "pending");
    expect(pendingToken).toEqual(
      expect.objectContaining({
        status: "pending",
        token: "cashuB",
        paymentRequestId: "request-id",
      })
    );
    expect(pendingToken?.id).toEqual(expect.any(String));
    const restoredRequest = store.historyTokens.find(
      (row) => row.status === "pending"
    )?.paymentRequest;
    expect(restoredRequest?.amount?.toNumber()).toBe(7);
    expect(restoredRequest?.toEncodedCreqA()).toMatch(/^creqA/);

    await store.migrateHistoryTokensFromLocalStorage();
    expect(await readEcashHistory()).toHaveLength(2);
  });

  it("keeps recovery tokens visible when stored request metadata is damaged", async () => {
    await cashuDb.ecashHistory.put({
      id: "damaged-request",
      status: "pending",
      amount: -21,
      date: "2026-03-10T12:00:00.000Z",
      token: "cashuA",
      mint: "https://mint.example",
      unit: "sat",
      paymentRequest: "invalid-request",
    });
    const store = useTokensStore();
    await store.refreshEcashHistory();
    expect(store.historyTokens).toHaveLength(1);
    expect(store.historyTokens[0]).toMatchObject({
      token: "cashuA",
      amount: -21,
      status: "pending",
    });
    expect(store.historyTokens[0].paymentRequest).toBeUndefined();
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

    const ecashHistory = await readEcashHistory();
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
