import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";

const P2WPKH = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
const MINT_URL = "https://mint.example";

const h = vi.hoisted(() => {
  const freshPayInvoiceData = () => ({
    blocking: false,
    paying: false,
    show: false,
    fee_paid: 0,
    meltQuote: {
      payload: { unit: "", request: "" },
      response: { quote: "", amount: 0, fee_reserve: 0 },
      error: "",
    },
    invoice: null as any,
    lnurlpay: null as any,
    lnurlauth: {} as any,
    domain: "",
    paymentMethod: null as any,
    input: {
      request: "",
      amount: undefined as number | undefined,
      comment: "",
      externalAmount: false,
      quote: "",
    },
  });

  const wallet: any = {
    payInvoiceData: freshPayInvoiceData(),
    fetchLnurlPayData: vi.fn(),
    applyLnurlPayData: vi.fn((address: string, host: string, data: any) => {
      if (data?.tag !== "payRequest") return false;
      wallet.payInvoiceData.lnurlpay = { ...data, lightningAddress: address };
      wallet.payInvoiceData.invoice = null;
      wallet.payInvoiceData.show = true;
      return true;
    }),
    applyOnchainAddress: vi.fn((address: string) => {
      wallet.payInvoiceData.show = true;
      wallet.payInvoiceData.invoice = { onchain: address, request: address };
    }),
    // Spending entry points - must never be called by the shortcut.
    meltInvoiceData: vi.fn(),
    meltQuoteInvoiceData: vi.fn(),
    send: vi.fn(),
    lnurlPaySecond: vi.fn(),
  };

  const mints: any = {
    activeMintUrl: "https://mint.example",
    activeUnit: "sat",
    mints: [] as any[],
    activeUnitCurrencyMultiplyer: 1,
    selectMintUrl: vi.fn((url: string, unit?: string) => {
      mints.activeMintUrl = url;
      if (unit) mints.activeUnit = unit;
      return true;
    }),
  };

  class MintClass {
    mint: any;
    constructor(mint: any) {
      this.mint = mint;
    }
    get units(): string[] {
      return (this.mint.keysets ?? [])
        .map((k: any) => k.unit)
        .filter((u: string, i: number, all: string[]) => all.indexOf(u) === i);
    }
  }

  const sendTokens: any = {
    showSendTokens: false,
    showLockInput: false,
    sendData: {
      amount: null as number | null,
      tokensBase64: "",
      paymentRequest: undefined as any,
    },
    clearSendData: vi.fn(() => {
      sendTokens.sendData.amount = null;
      sendTokens.sendData.tokensBase64 = "";
      sendTokens.sendData.paymentRequest = undefined;
    }),
  };

  const pr: any = {
    // Mirrors the relevant part of the real store: sets the preview state.
    decodePaymentRequest: vi.fn(async (encoded: string, options: any = {}) => {
      pr.lastOptions = options;
      sendTokens.sendData.paymentRequest = { encoded };
      sendTokens.sendData.amount = 21;
      sendTokens.showSendTokens = true;
    }),
    lastOptions: undefined as any,
  };

  const ui: any = { globalMutexLock: false, tab: "history" };

  return {
    freshPayInvoiceData,
    wallet,
    mints,
    MintClass,
    sendTokens,
    pr,
    ui,
    platform: "android",
    clipboardRead: vi.fn(),
    quasarIs: {} as Record<string, boolean>,
  };
});

vi.mock("src/stores/wallet", () => ({ useWalletStore: () => h.wallet }));
vi.mock("src/stores/mints", () => ({
  useMintsStore: () => h.mints,
  MintClass: h.MintClass,
}));
vi.mock("src/stores/sendTokensStore", () => ({
  useSendTokensStore: () => h.sendTokens,
}));
vi.mock("src/stores/payment-request", () => ({ usePRStore: () => h.pr }));
vi.mock("src/stores/ui", () => ({ useUiStore: () => h.ui }));
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: () => h.platform,
    isNativePlatform: () => h.platform !== "web",
  },
}));
vi.mock("@capacitor/clipboard", () => ({
  Clipboard: { read: (...args: any[]) => h.clipboardRead(...args) },
}));
vi.mock("quasar", () => ({ Platform: { is: h.quasarIs } }));

import { useSendClipboardStore } from "src/stores/sendClipboard";

const mintWith = (methods: { method: string; unit?: string }[]) => ({
  url: MINT_URL,
  keys: [],
  keysets: [{ id: "00", unit: "sat", active: true }],
  info: { nuts: { 5: { methods } } },
});

const lnurlResponse = {
  tag: "payRequest",
  callback: "https://example.com/lnurlp/callback",
  minSendable: 1000,
  maxSendable: 1000,
  metadata: "[]",
};

function expectNoSpending() {
  expect(h.wallet.meltInvoiceData).not.toHaveBeenCalled();
  expect(h.wallet.meltQuoteInvoiceData).not.toHaveBeenCalled();
  expect(h.wallet.send).not.toHaveBeenCalled();
  expect(h.wallet.lnurlPaySecond).not.toHaveBeenCalled();
}

beforeEach(() => {
  h.platform = "android";
  h.clipboardRead.mockReset();
  for (const key of Object.keys(h.quasarIs)) delete h.quasarIs[key];
  h.wallet.payInvoiceData = h.freshPayInvoiceData();
  h.wallet.fetchLnurlPayData.mockReset();
  h.wallet.applyLnurlPayData.mockClear();
  h.wallet.applyOnchainAddress.mockClear();
  h.mints.selectMintUrl.mockClear();
  h.wallet.meltInvoiceData.mockClear();
  h.wallet.meltQuoteInvoiceData.mockClear();
  h.wallet.send.mockClear();
  h.wallet.lnurlPaySecond.mockClear();
  h.mints.activeMintUrl = MINT_URL;
  h.mints.activeUnit = "sat";
  h.mints.mints = [
    mintWith([
      { method: "bolt11", unit: "sat" },
      { method: "onchain", unit: "sat" },
    ]),
  ];
  h.sendTokens.showSendTokens = false;
  h.sendTokens.showLockInput = false;
  h.sendTokens.sendData = {
    amount: null,
    tokensBase64: "",
    paymentRequest: undefined,
  };
  h.sendTokens.clearSendData.mockClear();
  h.pr.decodePaymentRequest.mockClear();
  h.pr.lastOptions = undefined;
  h.ui.globalMutexLock = false;
});

const setClipboard = (text: string) =>
  h.clipboardRead.mockResolvedValue({ value: text, type: "text/plain" });

describe("sendClipboard store - Lightning address", () => {
  it("opens the LNURL pay preview with the destination visible", async () => {
    setClipboard("satoshi@example.com");
    h.wallet.fetchLnurlPayData.mockResolvedValue({
      host: "https://example.com/.well-known/lnurlp/satoshi",
      data: lnurlResponse,
    });
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBe(
      "lightningAddress"
    );

    expect(h.wallet.fetchLnurlPayData).toHaveBeenCalledWith(
      "satoshi@example.com"
    );
    expect(h.wallet.payInvoiceData.show).toBe(true);
    expect(h.wallet.payInvoiceData.lnurlpay.lightningAddress).toBe(
      "satoshi@example.com"
    );
    // Fixed amount from the LNURL response is retained for confirmation.
    expect(h.wallet.payInvoiceData.lnurlpay.minSendable).toBe(1000);
    expectNoSpending();
  });

  it("falls back when no mint can melt lightning", async () => {
    setClipboard("satoshi@example.com");
    h.mints.mints = [mintWith([{ method: "onchain", unit: "sat" }])];
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.fetchLnurlPayData).not.toHaveBeenCalled();
    expect(h.wallet.payInvoiceData.show).toBe(false);
  });

  it("does not use a Bolt12-only mint for LNURL pay", async () => {
    setClipboard("satoshi@example.com");
    h.mints.mints = [mintWith([{ method: "bolt12", unit: "sat" }])];
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.fetchLnurlPayData).not.toHaveBeenCalled();
  });

  it("falls back and leaves no preview when the LNURL fetch fails", async () => {
    setClipboard("satoshi@example.com");
    h.wallet.fetchLnurlPayData.mockRejectedValue(new Error("offline"));
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.payInvoiceData.show).toBe(false);
    expect(h.wallet.payInvoiceData.lnurlpay).toBeNull();
  });

  it("does not commit a late LNURL result after cancellation", async () => {
    setClipboard("satoshi@example.com");
    let resolveFetch!: (value: any) => void;
    h.wallet.fetchLnurlPayData.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    const store = useSendClipboardStore();
    const attempt = store.trySendFromClipboard();
    await vi.waitFor(() =>
      expect(h.wallet.fetchLnurlPayData).toHaveBeenCalled()
    );

    store.cancel();
    resolveFetch({ host: "https://example.com/x", data: lnurlResponse });

    await expect(attempt).resolves.toBe("cancelled");
    expect(h.wallet.applyLnurlPayData).not.toHaveBeenCalled();
    expect(h.wallet.payInvoiceData.show).toBe(false);
  });
});

it("times out preparation and ignores the eventual response", async () => {
  vi.useFakeTimers();
  try {
    setClipboard("satoshi@example.com");
    let resolveFetch!: (value: any) => void;
    h.wallet.fetchLnurlPayData.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    const store = useSendClipboardStore();
    const attempt = store.trySendFromClipboard();
    await Promise.resolve();
    await Promise.resolve();

    expect(store.reading).toBe(true);
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(attempt).resolves.toBeNull();
    expect(store.reading).toBe(false);

    resolveFetch({ host: "https://example.com/x", data: lnurlResponse });
    await Promise.resolve();
    expect(h.wallet.applyLnurlPayData).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

describe("sendClipboard store - Bitcoin address", () => {
  it("opens the on-chain preview with an editable amount for a bare address", async () => {
    setClipboard(P2WPKH);
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBe("bitcoinAddress");

    expect(h.wallet.applyOnchainAddress).toHaveBeenCalledWith(P2WPKH);
    expect(h.wallet.payInvoiceData.invoice.onchain).toBe(P2WPKH);
    expect(h.wallet.payInvoiceData.input.amount).toBeUndefined();
    expect(h.wallet.payInvoiceData.paymentMethod).toBe("onchain");
    expectNoSpending();
  });

  it("keeps an embedded BIP-21 amount for the existing quote step", async () => {
    setClipboard(`bitcoin:${P2WPKH}?amount=0.0001`);
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBe("bitcoinAddress");
    expect(h.wallet.payInvoiceData.input.amount).toBe(10_000);
    // No quote is requested automatically - the user presses Quote, then Pay.
    expect(h.wallet.payInvoiceData.input.externalAmount).toBe(true);
    expectNoSpending();
  });

  it("falls back for an amount-bearing URI while a non-sat unit is active", async () => {
    setClipboard(`bitcoin:${P2WPKH}?amount=0.0001`);
    h.mints.activeUnit = "usd";
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.applyOnchainAddress).not.toHaveBeenCalled();
  });

  it("falls back when no mint supports on-chain melts", async () => {
    setClipboard(P2WPKH);
    h.mints.mints = [mintWith([{ method: "bolt11", unit: "sat" }])];
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.applyOnchainAddress).not.toHaveBeenCalled();
  });

  it("resets stale invoice/lnurl/quote/amount state before previewing", async () => {
    setClipboard(P2WPKH);
    Object.assign(h.wallet.payInvoiceData, {
      invoice: { sat: 5, request: "lnbc1stale" },
      lnurlpay: { domain: "stale.example" },
      lnurlauth: { k1: "stale" },
      fee_paid: 42,
    });
    h.wallet.payInvoiceData.meltQuote.error = "stale error";
    h.wallet.payInvoiceData.meltQuote.response = {
      quote: "stale-quote",
      amount: 1234,
      fee_reserve: 7,
    };
    h.wallet.payInvoiceData.input = {
      request: "lnbc1stale",
      amount: 99,
      comment: "stale comment",
      quote: "stale-quote",
    };
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBe("bitcoinAddress");

    const data = h.wallet.payInvoiceData;
    expect(data.lnurlpay).toBeNull();
    expect(data.lnurlauth).toBeNull();
    expect(data.fee_paid).toBe(0);
    expect(data.meltQuote.error).toBe("");
    expect(data.meltQuote.response).toEqual({
      quote: "",
      amount: 0,
      fee_reserve: 0,
    });
    expect(data.input.comment).toBe("");
    expect(data.input.quote).toBe("");
    expect(data.input.amount).toBeUndefined();
    expect(data.invoice.onchain).toBe(P2WPKH);
  });
});

describe("sendClipboard store - ecash payment request", () => {
  const encodedRequest = (options: {
    amount?: number;
    unit?: string;
    mints?: string[];
  }) =>
    new PaymentRequest(
      [
        {
          type: PaymentRequestTransportType.POST,
          target: "https://pay.example/req",
          tags: [],
        },
      ] as any,
      "abc123",
      options.amount,
      options.unit,
      options.mints,
      "memo"
    ).toEncodedRequest();

  it("opens the ecash send sheet without persisting the clipboard request", async () => {
    setClipboard(
      encodedRequest({ amount: 21, unit: "sat", mints: [MINT_URL] })
    );
    const store = useSendClipboardStore();
    h.sendTokens.showLockInput = true;

    await expect(store.trySendFromClipboard()).resolves.toBe("paymentRequest");

    expect(h.sendTokens.clearSendData).toHaveBeenCalled();
    expect(h.pr.lastOptions).toEqual({ remember: false });
    expect(h.sendTokens.showSendTokens).toBe(true);
    expect(h.sendTokens.sendData.amount).toBe(21);
    expect(h.sendTokens.showLockInput).toBe(false);
    expectNoSpending();
  });

  it("falls back for a request bound to an unknown mint", async () => {
    setClipboard(
      encodedRequest({
        amount: 21,
        unit: "sat",
        mints: ["https://other.example"],
      })
    );
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.pr.decodePaymentRequest).not.toHaveBeenCalled();
    expect(h.sendTokens.showSendTokens).toBe(false);
  });

  it("falls back for a unit the target mint does not support", async () => {
    setClipboard(
      encodedRequest({ amount: 21, unit: "eur", mints: [MINT_URL] })
    );
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.pr.decodePaymentRequest).not.toHaveBeenCalled();
  });

  it("checks the active unit when the request omits one", async () => {
    setClipboard(encodedRequest({ amount: 21, mints: [MINT_URL] }));
    h.mints.activeUnit = "eur";
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.pr.decodePaymentRequest).not.toHaveBeenCalled();
  });
});
describe("sendClipboard store - platform and guards", () => {
  it("never reads the clipboard on iOS", async () => {
    h.platform = "ios";
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.clipboardRead).not.toHaveBeenCalled();
  });

  it("never reads the clipboard on desktop web", async () => {
    h.platform = "web";
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.clipboardRead).not.toHaveBeenCalled();
  });

  it("works on Android web via navigator.clipboard", async () => {
    h.platform = "web";
    h.quasarIs.android = true;
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      configurable: true,
    });
    const readText = vi.fn().mockResolvedValue(P2WPKH);
    Object.defineProperty(navigator, "clipboard", {
      value: { readText },
      configurable: true,
    });
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBe("bitcoinAddress");
    expect(readText).toHaveBeenCalledTimes(1);
    expect(h.clipboardRead).not.toHaveBeenCalled();
  });

  it("falls back when the clipboard read is denied", async () => {
    h.clipboardRead.mockRejectedValue(new Error("denied"));
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.payInvoiceData.show).toBe(false);
  });

  it("falls back for empty and unsupported clipboard content", async () => {
    setClipboard("   ");
    const store = useSendClipboardStore();
    await expect(store.trySendFromClipboard()).resolves.toBeNull();

    setClipboard("lnbc1pexampleinvoice");
    await expect(store.trySendFromClipboard()).resolves.toBeNull();
    expect(h.wallet.payInvoiceData.show).toBe(false);
  });

  it("reads the clipboard once for a double tap", async () => {
    let resolveRead!: (value: any) => void;
    h.clipboardRead.mockReturnValue(
      new Promise((resolve) => {
        resolveRead = resolve;
      })
    );
    const store = useSendClipboardStore();

    const first = store.trySendFromClipboard();
    const second = store.trySendFromClipboard();

    expect(store.reading).toBe(true);
    expect(h.clipboardRead).toHaveBeenCalledTimes(1);
    await expect(second).resolves.toBe("cancelled");

    resolveRead({ value: P2WPKH, type: "text/plain" });
    await expect(first).resolves.toBe("bitcoinAddress");
    expect(store.reading).toBe(false);
  });

  it("does not overwrite an open payment preview", async () => {
    setClipboard(P2WPKH);
    h.wallet.payInvoiceData.show = true;
    const store = useSendClipboardStore();

    await expect(store.trySendFromClipboard()).resolves.toBe("cancelled");
    expect(h.clipboardRead).not.toHaveBeenCalled();
  });

  it("does not overwrite a prepared ecash transfer or a locked wallet", async () => {
    setClipboard(P2WPKH);
    h.sendTokens.sendData.tokensBase64 = "cashuBprepared";
    const store = useSendClipboardStore();
    await expect(store.trySendFromClipboard()).resolves.toBe("cancelled");

    h.sendTokens.sendData.tokensBase64 = "";
    h.ui.globalMutexLock = true;
    await expect(store.trySendFromClipboard()).resolves.toBe("cancelled");
    expect(h.clipboardRead).not.toHaveBeenCalled();
  });

  it("ignores a clipboard result that arrives after cancellation", async () => {
    let resolveRead!: (value: any) => void;
    h.clipboardRead.mockReturnValue(
      new Promise((resolve) => {
        resolveRead = resolve;
      })
    );
    const store = useSendClipboardStore();
    const attempt = store.trySendFromClipboard();

    store.cancel();
    resolveRead({ value: P2WPKH, type: "text/plain" });

    await expect(attempt).resolves.toBe("cancelled");
    expect(h.wallet.applyOnchainAddress).not.toHaveBeenCalled();
    expect(h.wallet.payInvoiceData.show).toBe(false);
  });
});
