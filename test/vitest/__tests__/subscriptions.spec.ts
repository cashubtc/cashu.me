import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNutzapStore, calcUnlock } from "../../../src/stores/nutzap";
import { useCreatorSubscriptionsStore } from "../../../src/stores/creatorSubscriptions";
import { useLockedTokensRedeemWorker } from "../../../src/stores/lockedTokensRedeemWorker";
import { cashuDb } from "../../../src/stores/dexie";

let sendDm: any;
let fetchNutzapProfile: any;
let lockToPubKey: any;
let findSpendableMint: any;
let serializeProofs: any;
let updateActiveProofs: any;
let addMany: any;
let sendToLock: any;
let redeem: any;
let mintWallet: any;
let checkSpendable: any;
let setBootError: any;
let isValidPubkey: any;

vi.mock("../../../src/stores/nostr", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchNutzapProfile: (...args: any[]) => fetchNutzapProfile(...args),
    publishNutzap: vi.fn(),
    subscribeToNutzaps: vi.fn(),
    useNostrStore: () => ({ pubkey: "myhex" }),
  };
});

vi.mock("../../../src/stores/p2pk", () => ({
  useP2PKStore: () => ({
    lockToPubKey: (...args: any[]) => lockToPubKey(...args),
    getTokenLocktime: vi.fn(() => 0),
    generateRefundSecret: () => ({ preimage: "pre", hash: "hash" }),
    generateKeypair: vi.fn(),
    firstKey: { publicKey: "refund" },
    isValidPubkey: (...args: any[]) => isValidPubkey(...args),
  }),
}));

vi.mock("../../../src/stores/wallet", () => ({
  useWalletStore: () => ({
    findSpendableMint: (...args: any[]) => findSpendableMint(...args),
    sendToLock: (...args: any[]) => sendToLock(...args),
    mintWallet: (...args: any[]) => mintWallet(...args),
    redeem: (...args: any[]) => redeem(...args),
    checkProofsSpendable: (...args: any[]) => checkSpendable(...args),
  }),
}));

vi.mock("../../../src/stores/lockedTokens", () => ({
  useLockedTokensStore: () => ({ addMany: (...args: any[]) => addMany(...args) }),
}));

vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({
    activeUnit: "sat",
    mintUnitProofs: () => [{ id: "kid", amount: 1, secret: "s" }],
    mints: [{ url: "mint", keysets: [{ id: "kid", unit: "sat", active: true }] }],
  }),
}));

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({
    serializeProofs: (...args: any[]) => serializeProofs(...args),
    updateActiveProofs: (...args: any[]) => updateActiveProofs(...args),
  }),
}));

vi.mock("../../../src/stores/messenger", () => ({
  useMessengerStore: () => ({ sendDm: (...args: any[]) => sendDm(...args) }),
}));

vi.mock("../../../src/stores/bootError", () => ({
  useBootErrorStore: () => ({
    set: (...args: any[]) => setBootError(...args),
    clear: vi.fn(),
    error: null,
  }),
}));

vi.mock("../../../src/stores/settings", () => ({
  useSettingsStore: () => ({ autoRedeemLockedTokens: true }),
}));

vi.mock("../../../src/stores/receiveTokensStore", () => ({
  useReceiveTokensStore: () => ({
    receiveData: { tokensBase64: "", bucketId: "" },
    enqueue: (fn: any) => fn(),
  }),
}));

vi.mock("../../../src/js/token", () => ({
  default: {
    decode: () => ({ proofs: [{ id: "kid", amount: 1, secret: "s" }], mint: "mint", unit: "sat" }),
    getMint: () => "mint",
    getUnit: () => "sat",
    getProofs: (d: any) => d.proofs,
  },
  createP2PKHTLC: vi.fn(() => ({ token: "tok", hash: "hash" })),
}));

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close();
  await cashuDb.delete();
  await cashuDb.open();
  useNutzapStore().$reset();
  sendDm = vi.fn(async () => ({}));
  setBootError = vi.fn();
  fetchNutzapProfile = vi.fn(async () => ({
    p2pkPubkey: "pk",
    trustedMints: ["mint"],
    hexPub: "hex",
    relays: [],
  }));
  lockToPubKey = vi.fn(async ({ timelock }: any) => ({ token: `t-${timelock}` }));
  findSpendableMint = vi.fn(() => ({ url: "mint" }));
  serializeProofs = vi.fn((p: any) => `tok-${p[0]}`);
  updateActiveProofs = vi.fn();
  addMany = vi.fn();
  sendToLock = vi.fn(async (_p, _w, _a, _pk, _b, u) => ({
    sendProofs: [u],
    locked: { id: `id-${u}`, tokenString: `lock-${u}` },
  }));
  redeem = vi.fn();
  mintWallet = vi.fn(() => ({}));
  checkSpendable = vi.fn(async () => null);
  isValidPubkey = vi.fn(() => true);
});

describe("Nutzap subscriptions", () => {
  it("send() sends DM per month with payload", async () => {
    const store = useNutzapStore();
    const start = 1000;
    await store.send({ npub: "npub", amount: 1, months: 2, startDate: start });

    expect(sendDm).toHaveBeenCalledTimes(2);
    const p1 = JSON.parse(sendDm.mock.calls[0][1]);
    const p2 = JSON.parse(sendDm.mock.calls[1][1]);
    expect(p1.subscription_id).toBe(p2.subscription_id);
    expect(p1.month_index).toBe(1);
    expect(p2.month_index).toBe(2);
    expect(p1.total_months).toBe(2);
    expect(p1.token).toBe(`tok-${calcUnlock(start, 0)}`);
    expect(p2.token).toBe(`tok-${calcUnlock(start, 1)}`);
  });

  it("queues message and sets boot error when sendDm throws", async () => {
    sendDm = vi.fn(async () => {
      throw new (await import("../../../src/boot/ndk")).NdkBootError(
        "no-signer"
      );
    });
    cashuDb.lockedTokens.bulkAdd = vi.fn();
    const store = useNutzapStore();
    await store.send({ npub: "npub", amount: 1, months: 1, startDate: 0 });
    expect(setBootError).toHaveBeenCalled();
    expect(store.sendQueue.length).toBe(1);
  });

  it("aggregates incoming DMs by subscription_id", async () => {
    const subStore = useCreatorSubscriptionsStore();
    await cashuDb.lockedTokens.bulkAdd([
      {
        id: "a",
        tokenString: "x",
        amount: 1,
        owner: "creator",
        subscriberNpub: "s",
        tierId: "t",
        intervalKey: "i1",
        unlockTs: 0,
        refundUnlockTs: 0,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "sub1",
        monthIndex: 1,
        totalMonths: 2,
        label: "Subscription payment",
      },
      {
        id: "b",
        tokenString: "y",
        amount: 1,
        owner: "creator",
        subscriberNpub: "s",
        tierId: "t",
        intervalKey: "i2",
        unlockTs: 0,
        refundUnlockTs: 0,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "sub1",
        monthIndex: 2,
        totalMonths: 2,
        label: "Subscription payment",
      },
      {
        id: "c",
        tokenString: "z",
        amount: 1,
        owner: "creator",
        subscriberNpub: "s",
        tierId: "t2",
        intervalKey: "j1",
        unlockTs: 0,
        refundUnlockTs: 0,
        status: "unlockable",
        subscriptionEventId: null,
        subscriptionId: "sub2",
        monthIndex: 1,
        totalMonths: 3,
        label: "Subscription payment",
      },
    ] as any);
    await new Promise((r) => setTimeout(r, 10));
    const sub1 = subStore.subscriptions.find((s) => s.subscriptionId === "sub1");
    const sub2 = subStore.subscriptions.find((s) => s.subscriptionId === "sub2");
    expect(subStore.subscriptions.length).toBe(2);
    expect(sub1?.receivedMonths).toBe(2);
    expect(sub1?.status).toBe("active");
    expect(sub2?.receivedMonths).toBe(1);
    expect(sub2?.status).toBe("pending");
  });

  it("redeems tokens when unlock time passed", async () => {
    const worker = useLockedTokensRedeemWorker();
    await cashuDb.lockedTokens.put({
      id: "r1",
      tokenString: "tok",
      amount: 1,
      owner: "subscriber",
      tierId: "tier1",
      intervalKey: "k",
      unlockTs: 0,
      refundUnlockTs: 0,
      status: "pending",
      subscriptionEventId: null,
    } as any);
    await worker.processTokens();
    expect(redeem).toHaveBeenCalledWith("tier1");
    expect(await cashuDb.lockedTokens.count()).toBe(0);
  });

  it("defers redemption until unlock time", async () => {
    const worker = useLockedTokensRedeemWorker();
    const future = Math.floor(Date.now() / 1000) + 1000;
    await cashuDb.lockedTokens.put({
      id: "r2",
      tokenString: "tok2",
      amount: 1,
      owner: "subscriber",
      tierId: "tier2",
      intervalKey: "k2",
      unlockTs: future,
      refundUnlockTs: 0,
      status: "pending",
      subscriptionEventId: null,
    } as any);

    const spy = vi.spyOn(Date, "now").mockReturnValue((future - 10) * 1000);
    await worker.processTokens();
    expect(redeem).not.toHaveBeenCalled();
    expect(await cashuDb.lockedTokens.count()).toBe(1);

    spy.mockReturnValue((future + 1) * 1000);
    await worker.processTokens();
    expect(redeem).toHaveBeenCalledWith("tier2");
    expect(await cashuDb.lockedTokens.count()).toBe(0);
    spy.mockRestore();
  });

  it("queues message and sets boot error when ndkSend throws", async () => {
    const mod = await import("../../../src/boot/ndk");
    vi.spyOn(mod, "ndkSend").mockRejectedValue(new mod.NdkBootError("no-signer"));
    const subStore = useNutzapStore();
    sendDm = vi.fn(async () => ({ success: true }));
    cashuDb.lockedTokens.bulkAdd = vi.fn();
    await subStore.subscribeToTier({
      creator: { nostrPubkey: "npub", cashuP2pk: "pk" },
      tierId: "tier", months: 1, price: 1, startDate: 0, relayList: []
    });
    expect(setBootError).toHaveBeenCalled();
    expect(subStore.sendQueue.length).toBe(1);
  });
});
