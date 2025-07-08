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

vi.mock("../../../src/stores/nostr", () => ({
  fetchNutzapProfile: (...args: any[]) => fetchNutzapProfile(...args),
  publishNutzap: (...args: any[]) => publishNutzap(...args),
  subscribeToNutzaps: vi.fn(),
  useNostrStore: () => ({ pubkey: "myhex" }),
}));

vi.mock("../../../src/stores/p2pk", () => ({
  useP2PKStore: () => ({
    getTokenLocktime: (...args: any[]) => getTokenLocktime(...args),
    generateRefundSecret: () => ({ preimage: 'pre', hash: 'hash' }),
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

vi.mock("../../../src/js/token", () => ({
  default: {
    decode: (...args: any[]) => tokenDecode(...args),
    getProofs: (...args: any[]) => tokenGetProofs(...args),
  },
}));

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close();   // close() is safe under fake-indexeddb
  await cashuDb.open();

  fetchNutzapProfile = vi.fn(async () => ({
    p2pkPubkey: "pk",
    trustedMints: ["mint"],
    hexPub: "hex",
    relays: [],
  }));
  publishNutzap = vi.fn();
  sendToLock = vi.fn(async (_p, _w, _a, _pk, _b, timelock) => ({
    sendProofs: [`tok-${timelock}`],
    locked: { id: `lock-${timelock}` },
  }));
  findSpendableMint = vi.fn(() => ({ url: "mint" }));
  addMany = vi.fn();
  getTokenLocktime = vi.fn(() => 0);
  tokenDecode = vi.fn(() => ({ proofs: [{ amount: 1 }] }));
  tokenGetProofs = vi.fn(() => [{ amount: 1 }]);
});

describe("Nutzap store", () => {
  it("send() calculates unlockDate from startDate", async () => {
    const store = useNutzapStore();
    const start = 1000;
    await store.send({ npub: "receiver", amount: 1, months: 3, startDate: start });

    expect(sendToLock).toHaveBeenCalledTimes(3);
    const times = sendToLock.mock.calls.map((c: any[]) => c[5]);
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
      creator: { npub: "creator", p2pk: "pk" },
      tierId: "tier",
      months: 2,
      price: 1,
      startDate: start,
      relayList: [],
    });

    expect(ok).toBe(true);
    expect(sendToLock).toHaveBeenCalledTimes(2);
    const tokens = await cashuDb.lockedTokens.toArray();
    expect(tokens.length).toBe(2);
    const sub = await cashuDb.subscriptions.toArray();
    expect(sub.length).toBe(1);
    expect(sub[0].intervals[0].lockedTokenId).toBe(tokens[0].id);
  });
});

