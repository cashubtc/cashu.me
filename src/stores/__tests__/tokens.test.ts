import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";
import Dexie from "dexie";
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists payment request fields as plain data across pending and paid reloads", async () => {
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
        "sat",
        ["https://mint.example"],
        "Payment memo",
        true,
        { kind: "P2PK", data: "pubkey", tags: [["locktime", "1750000000"]] }
      )
    );
    const id = await store.addPendingToken({
      amount: -21,
      token: "cashuA",
      mint: "https://mint.example",
      unit: "sat",
      paymentRequest,
    });
    expect(await readEcashHistory()).toHaveLength(1);
    await store.refreshEcashHistory();
    const restored = store.historyTokens.find((row) => row.id === id)!;
    const expectedRequest = {
      transport: [{ type: "post", target: "https://pay.example" }],
      id: "request-id",
      amount: 21,
      unit: "sat",
      mints: ["https://mint.example"],
      description: "Payment memo",
      singleUse: true,
      nut10: {
        kind: "P2PK",
        data: "pubkey",
        tags: [["locktime", "1750000000"]],
      },
    };
    expect((await readEcashHistory())[0].paymentRequest).toEqual(
      expectedRequest
    );
    expect(restored.paymentRequest).toEqual(expectedRequest);
    expect(paymentRequest.amount?.toNumber()).toBe(21);
    await store.setTokenPaid("cashuA");
    expect((await readEcashHistory())[0]?.status).toBe("paid");
    await store.refreshEcashHistory();
    expect(store.historyTokens[0].paymentRequest).toEqual(expectedRequest);
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
    expect(restoredRequest).toEqual(
      JSON.parse(JSON.stringify(legacyHistory[1].paymentRequest))
    );

    await store.migrateHistoryTokensFromLocalStorage();
    expect(await readEcashHistory()).toHaveLength(2);
  });

  it("keeps existing token history actions compatible with the cache", async () => {
    const store = useTokensStore();

    const id = await store.addPendingToken({
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

    await store.editHistoryToken("cashuA", {
      newToken: "cashuB",
      addAmount: 3,
      newFee: 2,
    });
    await store.setTokenPaid("cashuB");

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
    expect(await readEcashHistory()).toEqual([
      expect.objectContaining({
        id,
        status: "paid",
        amount: 15,
        token: "cashuB",
        fee: 2,
      }),
    ]);

    await store.deleteToken("cashuB");
    expect(store.historyTokens).toEqual([]);
  });

  it("commits history writes before the add actions resolve", async () => {
    const store = useTokensStore();

    const pendingId = await store.addPendingToken({
      amount: -5,
      token: "cashuPending",
      mint: "https://mint.example",
      unit: "sat",
    });
    expect(await cashuDb.ecashHistory.get(pendingId)).toEqual(
      expect.objectContaining({ id: pendingId, status: "pending" })
    );

    const paidId = await store.addPaidToken({
      amount: 8,
      token: "cashuPaid",
      mint: "https://mint.example",
      unit: "sat",
      label: "coffee",
    });
    expect(await cashuDb.ecashHistory.get(paidId)).toEqual(
      expect.objectContaining({ id: paidId, status: "paid", label: "coffee" })
    );
  });

  it("rejects when the history write fails and drops the unsaved entry", async () => {
    const store = useTokensStore();
    const writeError = new Error("quota exceeded");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(cashuDb.ecashHistory, "put").mockRejectedValueOnce(writeError);

    await expect(
      store.addPendingToken({
        amount: -3,
        token: "cashuFails",
        mint: "https://mint.example",
        unit: "sat",
      })
    ).rejects.toBe(writeError);

    expect(store.tokenAlreadyInHistory("cashuFails")).toBeUndefined();
    expect(await readEcashHistory()).toEqual([]);
  });

  it("restores the cached entry when a status or edit write fails", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -4,
      token: "cashuPending",
      mint: "https://mint.example",
      unit: "sat",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const put = vi.spyOn(cashuDb.ecashHistory, "put");

    put.mockRejectedValueOnce(new Error("write failed"));
    await expect(store.setTokenPaid("cashuPending")).rejects.toThrow(
      "write failed"
    );
    expect(store.tokenAlreadyInHistory("cashuPending")).toEqual(
      expect.objectContaining({ id, status: "pending" })
    );
    expect(
      store.tokenAlreadyInHistory("cashuPending")?.paidDate
    ).toBeUndefined();

    put.mockRejectedValueOnce(new Error("write failed"));
    await expect(
      store.editHistoryToken("cashuPending", { newToken: "cashuEdited" })
    ).rejects.toThrow("write failed");
    expect(store.tokenAlreadyInHistory("cashuEdited")).toBeUndefined();
    expect(store.tokenAlreadyInHistory("cashuPending")).toEqual(
      expect.objectContaining({ id, status: "pending" })
    );

    // A retry after the failure still works.
    await store.setTokenPaid("cashuPending");
    expect(await cashuDb.ecashHistory.get(id)).toEqual(
      expect.objectContaining({ status: "paid" })
    );
  });

  it("keeps a status change out of the cache until it is committed", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -4,
      token: "cashuPending",
      mint: "https://mint.example",
      unit: "sat",
    });
    const table = cashuDb.ecashHistory;
    const put = table.put;
    let releaseWrite!: () => void;
    const writeReleased = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    vi.spyOn(table, "put").mockImplementationOnce(async function (
      this: any,
      ...args: any[]
    ) {
      await writeReleased;
      return put.apply(this, args as any);
    } as any);

    const settingPaid = store.setTokenPaid("cashuPending");
    await Promise.resolve();
    // The transaction worker reads this cache; it must not see "paid" yet.
    expect(store.tokenAlreadyInHistory("cashuPending")?.status).toBe("pending");

    releaseWrite();
    await settingPaid;
    expect(store.tokenAlreadyInHistory("cashuPending")).toEqual(
      expect.objectContaining({ id, status: "paid" })
    );
  });

  it("splits a partially spent token only once when checks overlap", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -10,
      token: "cashuAll",
      mint: "https://mint.example",
      unit: "sat",
    });

    const [first, second] = await Promise.all([
      store.splitHistoryToken(
        "cashuAll",
        { amount: 6, token: "cashuSpent" },
        { amount: 4, token: "cashuUnspent" }
      ),
      store.splitHistoryToken(
        "cashuAll",
        { amount: 6, token: "cashuSpent" },
        { amount: 4, token: "cashuUnspent" }
      ),
    ]);

    expect([first, second].filter(Boolean)).toHaveLength(1);
    const rows = await readEcashHistory();
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.id === id)?.token).toBe("cashuSpent");
    expect(
      store.historyTokens.filter((t) => t.token === "cashuUnspent")
    ).toHaveLength(1);
  });

  it("splits a partially spent token into paid and pending rows", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -10,
      token: "cashuAll",
      mint: "https://mint.example",
      unit: "sat",
    });

    const remainder = await store.splitHistoryToken(
      "cashuAll",
      { amount: 6, token: "cashuSpent" },
      { amount: 4, token: "cashuUnspent" }
    );

    expect(remainder).toEqual(
      expect.objectContaining({
        status: "pending",
        amount: -4,
        token: "cashuUnspent",
        mint: "https://mint.example",
        unit: "sat",
      })
    );
    expect(await cashuDb.ecashHistory.get(id)).toEqual(
      expect.objectContaining({
        status: "paid",
        amount: -6,
        token: "cashuSpent",
      })
    );
    expect(await cashuDb.ecashHistory.get(remainder!.id)).toEqual(
      expect.objectContaining({ status: "pending", token: "cashuUnspent" })
    );
    expect(store.tokenAlreadyInHistory("cashuSpent")).toEqual(
      expect.objectContaining({ id, status: "paid", amount: -6 })
    );
    expect(store.tokenAlreadyInHistory("cashuUnspent")?.id).toBe(remainder!.id);
    expect(store.historyTokens).toHaveLength(2);
  });

  it("leaves history unchanged when part of a split fails", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -10,
      token: "cashuAll",
      mint: "https://mint.example",
      unit: "sat",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const table = cashuDb.ecashHistory;
    const put = table.put;
    let calls = 0;
    vi.spyOn(table, "put").mockImplementation(function (this: any, ...args) {
      calls++;
      if (calls === 2) return Promise.reject(new Error("write failed")) as any;
      return put.apply(this, args as any);
    });

    await expect(
      store.splitHistoryToken(
        "cashuAll",
        { amount: 6, token: "cashuSpent" },
        { amount: 4, token: "cashuUnspent" }
      )
    ).rejects.toThrow("write failed");

    expect(await readEcashHistory()).toEqual([
      expect.objectContaining({
        id,
        status: "pending",
        amount: -10,
        token: "cashuAll",
      }),
    ]);
    expect(store.historyTokens).toEqual([
      expect.objectContaining({ id, status: "pending", token: "cashuAll" }),
    ]);
  });

  it("does not overwrite a committed split with a full-spend status change", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -10,
      token: "cashuAll",
      mint: "https://mint.example",
      unit: "sat",
    });
    // A full-spend check reads the unsplit cache while the split's transaction
    // is open, so its write runs after the split commits.
    const transaction = cashuDb.transaction;
    let settingPaid!: Promise<unknown>;
    vi.spyOn(cashuDb, "transaction").mockImplementationOnce(function (
      this: any,
      mode: any,
      table: any,
      scope: () => Promise<unknown>
    ) {
      return (transaction as any).call(this, mode, table, async () => {
        settingPaid = Dexie.ignoreTransaction(() =>
          store.setTokenPaid("cashuAll")
        );
        return scope();
      });
    } as any);

    const remainder = await store.splitHistoryToken(
      "cashuAll",
      { amount: 6, token: "cashuSpent" },
      { amount: 4, token: "cashuUnspent" }
    );
    await settingPaid;

    expect(await cashuDb.ecashHistory.get(id)).toEqual(
      expect.objectContaining({
        status: "paid",
        amount: -6,
        token: "cashuSpent",
      })
    );
    expect(await cashuDb.ecashHistory.get(remainder!.id)).toEqual(
      expect.objectContaining({ status: "pending", amount: -4 })
    );
  });

  it("keeps an entry in the cache until its delete commits", async () => {
    const store = useTokensStore();
    await store.addPendingToken({
      amount: -2,
      token: "cashuDelete",
      mint: "https://mint.example",
      unit: "sat",
    });
    const table = cashuDb.ecashHistory;
    const remove = table.delete;
    let releaseDelete!: () => void;
    const deleteReleased = new Promise<void>((resolve) => {
      releaseDelete = resolve;
    });
    vi.spyOn(table, "delete").mockImplementationOnce(async function (
      this: any,
      ...args: any[]
    ) {
      await deleteReleased;
      return remove.apply(this, args as any);
    } as any);

    const deleting = store.deleteToken("cashuDelete");
    await Promise.resolve();
    // The transaction worker drops tokens missing from this cache.
    expect(store.tokenAlreadyInHistory("cashuDelete")).toBeDefined();

    releaseDelete();
    await deleting;
    expect(store.tokenAlreadyInHistory("cashuDelete")).toBeUndefined();
  });

  it("waits for deletes and restores the entry when one fails", async () => {
    const store = useTokensStore();
    const id = await store.addPendingToken({
      amount: -2,
      token: "cashuDelete",
      mint: "https://mint.example",
      unit: "sat",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(cashuDb.ecashHistory, "delete").mockRejectedValueOnce(
      new Error("delete failed")
    );

    await expect(store.deleteToken("cashuDelete")).rejects.toThrow(
      "delete failed"
    );
    expect(store.tokenAlreadyInHistory("cashuDelete")?.id).toBe(id);
    expect(await cashuDb.ecashHistory.get(id)).toBeDefined();

    await store.deleteToken("cashuDelete");
    expect(store.tokenAlreadyInHistory("cashuDelete")).toBeUndefined();
    expect(await cashuDb.ecashHistory.get(id)).toBeUndefined();
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
