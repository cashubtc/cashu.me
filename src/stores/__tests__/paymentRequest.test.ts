import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  decodePaymentRequest,
  PaymentRequest,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";

const h = vi.hoisted(() => ({
  mints: {
    activeUnit: "sat",
    activeMintUrl: "https://a.example",
    activeUnitCurrencyMultiplyer: 1,
    mints: [{ url: "https://a.example" }, { url: "https://b.example" }],
    activeMint: () => ({ units: ["sat", "usd"] }),
  },
  sendTokens: {
    sendData: {} as Record<string, unknown>,
    showSendTokens: false,
    clearSendData() {
      this.sendData = {};
    },
  },
}));

vi.mock("src/stores/mints", () => ({ useMintsStore: () => h.mints }));
vi.mock("src/stores/sendTokensStore", () => ({
  useSendTokensStore: () => h.sendTokens,
}));
vi.mock("src/stores/nostr", () => ({
  useNostrStore: () => ({ seedSignerNprofile: "nprofile1ours" }),
}));
vi.mock("src/stores/tokens", () => ({
  useTokensStore: () => ({ historyTokens: [] }),
}));
vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyWarning: vi.fn(),
}));

import { usePRStore } from "src/stores/payment-request";

function foreignRequest(id: string) {
  return new PaymentRequest(
    [{ type: PaymentRequestTransportType.POST, target: "https://pay.example" }],
    id,
    21,
    "sat",
    ["https://a.example"]
  ).toEncodedRequest();
}

describe("payment request store", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    h.mints.activeUnit = "sat";
    h.mints.activeMintUrl = "https://a.example";
  });

  it("encodes the mint and unit it is given, not the wallet's active ones", () => {
    const store = usePRStore();
    const encoded = store.createPaymentRequest(
      500,
      undefined,
      "https://b.example",
      "usd"
    );
    const decoded = decodePaymentRequest(encoded);
    expect(decoded.mints).toEqual(["https://b.example"]);
    expect(decoded.unit).toBe("usd");
    expect(Number(decoded.amount)).toBe(500);
  });

  it("leaves the mint open when none is given", () => {
    const store = usePRStore();
    const decoded = decodePaymentRequest(store.createPaymentRequest());
    expect(decoded.mints).toBeUndefined();
    expect(decoded.unit).toBe("sat");
  });

  it("never adds a request being paid to the wallet's own requests", async () => {
    const store = usePRStore();
    const ours = store.createPaymentRequest();
    await store.decodePaymentRequest(foreignRequest("theirs"));
    expect(store.ourPaymentRequests.map((r) => r.encoded)).toEqual([ours]);
    expect(store.showPRKData).toBe(ours);
  });

  it("keeps a request's received payments when it is stored again", () => {
    const store = usePRStore();
    const encoded = store.createPaymentRequest();
    const id = store.ourPaymentRequests[0].id;
    const createdAt = store.ourPaymentRequests[0].createdAt;
    store.registerIncomingPaymentForRequest(id, "history-1");

    store.ensureStoredRequest(decodePaymentRequest(encoded), encoded);

    expect(store.ourPaymentRequests).toHaveLength(1);
    expect(store.ourPaymentRequests[0].receivedPaymentIds).toEqual([
      "history-1",
    ]);
    expect(store.ourPaymentRequests[0].createdAt).toBe(createdAt);
  });
});
