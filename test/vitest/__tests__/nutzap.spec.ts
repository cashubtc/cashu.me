import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNutzapStore, calcUnlock } from "../../../src/stores/nutzap";
import { cashuDb } from "../../../src/stores/dexie";

let fetchNutzapProfile: any;
let publishNutzap: any;
let sendToLock: any;
let findSpendableMint: any;
let addMany: any;
let getTokenLocktime: any;
let tokenDecode: any;
let tokenGetProofs: any;
let createHTLC: any;
let sendDm: any;
let ndkSendFn: any;
let filterHealthyRelaysFn: any;
let isValidPubkey: any;

vi.mock("../../../src/stores/nostr", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchNutzapProfile: (...args: any[]) => fetchNutzapProfile(...args),
    publishNutzap: (...args: any[]) => publishNutzap(...args),
    subscribeToNutzaps: vi.fn(),
    useNostrStore: () => ({ pubkey: "myhex", connected: true, lastError: null }),
  };
});

vi.mock("../../../src/stores/p2pk", () => ({
  useP2PKStore: () => ({
    getTokenLocktime: (...args: any[]) => getTokenLocktime(...args),
    isValidPubkey: (...args: any[]) => isValidPubkey(...args),
  }),
}));

vi.mock("../../../src/stores/wallet", () => ({
  useWalletStore: () => ({
    findSpendableMint: (...args: any[]) => findSpendableMint(...args),
    sendToLock: (...args: any[]) => sendToLock(...args),
  }),
}));

vi.mock("../../../src/stores/lockedTokens", () => ({
  useLockedTokensStore: () => ({
    addMany: (...args: any[]) => addMany(...args),
  }),
}));

vi.mock("../../../src/stores/messenger", () => ({
  useMessengerStore: () => ({ sendDm: (...args: any[]) => sendDm(...args) }),
}));

vi.mock("../../../src/js/token", () => ({
  default: {
    decode: (...args: any[]) => tokenDecode(...args),
    getProofs: (...args: any[]) => tokenGetProofs(...args),
  },
  createP2PKHTLC: (...args: any[]) => createHTLC(...args),
}));

vi.mock("../../../src/boot/ndk", () => ({
  ndkSend: (...args: any[]) => ndkSendFn(...args),
}));

vi.mock("../../../src/utils/relayHealth", () => ({
  filterHealthyRelays: (...args: any[]) => filterHealthyRelaysFn(...args),
}));

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close(); // close() is safe under fake-indexeddb
  await cashuDb.open();

  fetchNutzapProfile = vi.fn(async () => ({
    p2pkPubkey: "pk",
    trustedMints: ["mint"],
    hexPub: "hex",
    relays: [],
  }));
  publishNutzap = vi.fn();
  createHTLC = vi.fn(() => ({ token: "htlc-token", hash: "htlc-hash" }));
  sendToLock = vi.fn(async (_amt, _pk, timelock) => ({
    sendProofs: [`tok-${timelock}`],
    locked: { id: `lock-${timelock}` },
  }));
  findSpendableMint = vi.fn(() => ({ url: "mint" }));
  addMany = vi.fn();
  getTokenLocktime = vi.fn(() => 0);
  tokenDecode = vi.fn(() => ({ proofs: [{ amount: 1 }] }));
  tokenGetProofs = vi.fn(() => [{ amount: 1 }]);
  sendDm = vi.fn(async () => ({ success: true }));
  ndkSendFn = vi.fn();
  filterHealthyRelaysFn = vi.fn(async (r: string[]) => r);
  isValidPubkey = vi.fn(() => true);
});

describe("Nutzap store", () => {
  it("send() calculates unlockDate from startDate", async () => {
    const store = useNutzapStore();
    const start = 1000;
    await store.send({
      npub: "receiver",
      amount: 1,
      months: 3,
      startDate: start,
    });

    expect(sendToLock).toHaveBeenCalledTimes(3);
    const times = sendToLock.mock.calls.map((c: any[]) => c[2]);
    const expected = [0, 1, 2].map((i) => calcUnlock(start, i));
    expect(times).toEqual(expected);
  });

  it("_onZap inserts row only once for duplicate event", async () => {
    const store = useNutzapStore();
    const ev = {
      id: "1",
      pubkey: "sender",
      content: "TOKEN",
      created_at: 0,
      tags: [],
    } as any;

    await store._onZap(ev as any);
    await store._onZap(ev as any);

    const count = await cashuDb.lockedTokens.count();
    expect(count).toBe(1);
    expect(store.incoming.length).toBe(1);
  });

  it("subscribeToTier stores locked tokens", async () => {
    const store = useNutzapStore();
    const start = 1000;
    const ok = await store.subscribeToTier({
      creator: { nostrPubkey: "creator", cashuP2pk: "pk" },
      tierId: "tier",
      months: 2,
      price: 1,
      startDate: start,
      relayList: [],
    });

    expect(ok).toBe(true);
    expect(filterHealthyRelaysFn).toHaveBeenCalled();
    expect(ndkSendFn).toHaveBeenCalled();
    expect(sendToLock).toHaveBeenCalledTimes(2);
    const tokens = await cashuDb.lockedTokens.toArray();
    expect(tokens.length).toBe(2);
    const sub = await cashuDb.subscriptions.toArray();
    expect(sub.length).toBe(1);
    expect(sub[0].intervals[0].lockedTokenId).toBe(tokens[0].id);
  });

  it("subscribeToTier throws when creator key invalid", async () => {
    const store = useNutzapStore();
    // override isValidPubkey to return false for this test
    isValidPubkey = vi.fn(() => false);
    await expect(
      store.subscribeToTier({
        creator: { nostrPubkey: "creator", cashuP2pk: "bad" },
        tierId: "tier",
        months: 1,
        price: 1,
        startDate: 0,
        relayList: [],
      }),
    ).rejects.toThrow("Creator profile missing Cashu P2PK key");
  });

  it("queues token when DM send fails", async () => {
    sendDm = vi.fn(async () => ({ success: false }));
    const store = useNutzapStore();
    await store.send({ npub: "receiver", amount: 1, months: 1, startDate: 0 });
    expect(store.sendQueue.length).toBe(1);
    expect(store.sendQueue[0].npub).toBe("hex");
  });
});
