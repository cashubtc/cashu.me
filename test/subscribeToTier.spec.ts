import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNutzapStore } from "../src/stores/nutzap";
import { cashuDb } from "../src/stores/dexie";
import { subscriptionPayload } from "../src/utils/receipt-utils";

let sendDm: any;
let createHTLC: any;

vi.mock("../src/stores/messenger", () => ({
  useMessengerStore: () => ({
    sendDm: (...args: any[]) => sendDm(...args),
    pushOwnMessage: vi.fn(),
  }),
}));

vi.mock("../src/js/token", () => ({
  default: {
    decode: vi.fn(() => ({ proofs: [{ amount: 1 }] })),
    getProofs: vi.fn(() => [{ amount: 1 }]),
  },
  createP2PKHTLC: (...args: any[]) => createHTLC(...args),
}));

vi.mock("../src/stores/wallet", () => ({
  useWalletStore: () => ({
    findSpendableMint: () => ({ url: "mint" }),
    sendToLock: vi.fn(async () => ({
      sendProofs: [],
      locked: { id: "1", tokenString: "t" },
    })),
  }),
}));

vi.mock("../src/stores/mints", () => ({
  useMintsStore: () => ({
    activeUnit: "sat",
    mintUnitProofs: () => [],
    activeMintUrl: "mint",
  }),
}));

vi.mock("../src/stores/proofs", () => ({
  useProofsStore: () => ({
    serializeProofs: vi.fn(() => "token"),
    updateActiveProofs: vi.fn(),
  }),
}));

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close();
  await cashuDb.delete();
  await cashuDb.open();
  sendDm = vi.fn(async () => ({
    success: true,
    event: { id: "1", content: "{}" },
  }));
  createHTLC = vi.fn(() => ({
    token: JSON.stringify({ lockSecret: "pre" }),
    hash: "h",
  }));
});

describe("subscribeToTier", () => {
  it("sends minimal DM payload", async () => {
    const store = useNutzapStore();
    await store.subscribeToTier({
      creator: { nostrPubkey: "c", cashuP2pk: "pk" },
      tierId: "tier",
      months: 1,
      price: 1,
      startDate: 0,
      relayList: [],
    });
    expect(sendDm).toHaveBeenCalled();
    const payload = JSON.parse(sendDm.mock.calls[0][1]);
    const expected = subscriptionPayload("token", expect.any(Number), {
      subscription_id: expect.any(String),
      tier_id: "tier",
      month_index: 1,
      total_months: 1,
    });
    expect(payload).toMatchObject(expected);
  });
});
