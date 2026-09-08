import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";

const MINT_URL = "https://mint.example";

const h = vi.hoisted(() => {
  const sendTokens: any = {
    showSendTokens: false,
    sendData: {
      amount: null as number | null,
      paymentRequest: undefined as any,
    },
    clearSendData: vi.fn(() => {
      sendTokens.sendData.amount = null;
      sendTokens.sendData.paymentRequest = undefined;
    }),
  };
  const mints: any = {
    mints: [{ url: "https://mint.example" }],
    activeMintUrl: "https://mint.example",
    activeUnit: "sat",
    activeUnitCurrencyMultiplyer: 1,
    activeMint: () => ({ units: ["sat"] }),
  };
  return { sendTokens, mints };
});

vi.mock("src/stores/sendTokensStore", () => ({
  useSendTokensStore: () => h.sendTokens,
}));
vi.mock("src/stores/mints", () => ({ useMintsStore: () => h.mints }));
vi.mock("src/stores/nostr", () => ({
  useNostrStore: () => ({ seedSignerNprofile: "nprofile1test" }),
}));
vi.mock("src/stores/tokens", () => ({
  useTokensStore: () => ({ historyTokens: [] }),
}));

import { usePRStore } from "src/stores/payment-request";

const encoded = () =>
  new PaymentRequest(
    [
      {
        type: PaymentRequestTransportType.POST,
        target: "https://pay.example/req",
        tags: [],
      },
    ] as any,
    "abc123",
    21,
    "sat",
    [MINT_URL],
    "memo"
  ).toEncodedRequest();

beforeEach(() => {
  localStorage.clear();
  h.sendTokens.showSendTokens = false;
  h.sendTokens.sendData = { amount: null, paymentRequest: undefined };
  h.sendTokens.clearSendData.mockClear();
});

describe("usePRStore().decodePaymentRequest", () => {
  it("previews without logging or persisting when remember is false", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const store = usePRStore();
    const request = encoded();

    await store.decodePaymentRequest(request, { remember: false });

    expect(h.sendTokens.sendData.paymentRequest).toBeTruthy();
    expect(h.sendTokens.sendData.amount).toBe(21);
    expect(h.sendTokens.showSendTokens).toBe(true);
    expect(store.ourPaymentRequests).toHaveLength(0);
    expect(store.showPRKData).toBe("");
    expect(log).not.toHaveBeenCalled();

    log.mockRestore();
  });

  it("still remembers explicitly pasted requests by default", async () => {
    const store = usePRStore();
    const request = encoded();

    await store.decodePaymentRequest(request);

    expect(store.ourPaymentRequests).toHaveLength(1);
    expect(store.showPRKData).toBe(request);
  });
});
