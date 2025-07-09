import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNutzapStore } from "../../../src/stores/nutzap";
import { cashuDb } from "../../../src/stores/dexie";

let createHtlc: any;
let sendToLock: any;
let sendDm: any;

vi.mock("../../../src/stores/p2pk", () => ({
  useP2PKStore: () => ({
    isValidPubkey: () => true,
    generateRefundSecret: () => ({ hash: "h" }),
    generateKeypair: vi.fn(),
    firstKey: { publicKey: "refund" },
  }),
}));

vi.mock("../../../src/stores/wallet", () => ({
  useWalletStore: () => ({
    findSpendableMint: () => ({ url: "mint" }),
    sendToLock: (...args: any[]) => sendToLock(...args),
    mintWallet: () => ({}),
  }),
}));

vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({
    activeUnit: "sat",
    mintUnitProofs: () => [{ id: "kid", amount: 1, secret: "s" }],
  }),
}));

vi.mock("../../../src/stores/messenger", () => ({
  useMessengerStore: () => ({ sendDm: (...args: any[]) => sendDm(...args) }),
}));

vi.mock("../../../src/js/token", () => ({
  createP2PKHTLC: (...args: any[]) => createHtlc(...args),
  default: { decode: vi.fn(), getProofs: vi.fn() },
}));

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close();
  await cashuDb.delete();
  await cashuDb.open();
  sendDm = vi.fn(async () => ({ success: true }));
  sendToLock = vi.fn(async () => ({
    sendProofs: ["p"],
    locked: { id: "1", tokenString: "t" },
  }));
  createHtlc = vi.fn((amt: number, receiver: string) => ({
    token: JSON.stringify({ receiver }),
    hash: "h",
  }));
});

describe("subscribeToTier", () => {
  it("uses creator cashuP2pk when building HTLC token", async () => {
    const store = useNutzapStore();
    const pk = "021f77d9dc444b" + "0".repeat(52);
    await store.subscribeToTier({
      creator: { nostrPubkey: "1975".repeat(16), cashuP2pk: pk },
      tierId: "tier",
      months: 1,
      price: 1,
      startDate: 0,
      relayList: [],
    });
    const built = JSON.parse(createHtlc.mock.results[0].value.token);
    expect(built.receiver).toBe(pk);
  });
});
