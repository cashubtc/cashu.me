import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";

const mocks = vi.hoisted(() => ({
  platform: "web",
  clipboardRead: vi.fn(),
  quasarIs: {} as Record<string, boolean>,
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: () => mocks.platform,
    isNativePlatform: () => mocks.platform !== "web",
  },
}));

vi.mock("@capacitor/clipboard", () => ({
  Clipboard: { read: (...args: any[]) => mocks.clipboardRead(...args) },
}));

vi.mock("quasar", () => ({ Platform: { is: mocks.quasarIs } }));

import {
  classifySendClipboard,
  isSendableBitcoinAddress,
  parseBip21AmountToSats,
  sendClipboardMode,
  startSendClipboardRead,
} from "src/js/send-clipboard";

// BIP-173 / BIP-350 test vectors
const P2WPKH = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
const TAPROOT =
  "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0";
const P2PKH = "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2";

type RequestOptions = {
  amount?: number;
  unit?: string;
  mints?: string[];
  transport?: any[];
};

function encodedRequest(options: RequestOptions = {}) {
  const transport =
    options.transport === undefined
      ? [
          {
            type: PaymentRequestTransportType.POST,
            target: "https://pay.example/req",
            tags: [],
          },
        ]
      : options.transport;
  return new PaymentRequest(
    transport as any,
    "abc123",
    options.amount,
    options.unit,
    options.mints,
    "memo"
  ).toEncodedRequest();
}

beforeEach(() => {
  mocks.platform = "web";
  mocks.clipboardRead.mockReset();
  for (const key of Object.keys(mocks.quasarIs)) delete mocks.quasarIs[key];
});

describe("classifySendClipboard - Lightning addresses", () => {
  it("accepts a whole-string Lightning address", () => {
    expect(classifySendClipboard("  satoshi@example.com ")).toEqual({
      kind: "lightningAddress",
      address: "satoshi@example.com",
    });
  });

  it("accepts a lightning: wrapped Lightning address", () => {
    expect(classifySendClipboard("LIGHTNING:satoshi@example.com")).toEqual({
      kind: "lightningAddress",
      address: "satoshi@example.com",
    });
  });

  it("accepts LUD16 username punctuation", () => {
    expect(classifySendClipboard("first.last+tip-name_1@example.com")).toEqual({
      kind: "lightningAddress",
      address: "first.last+tip-name_1@example.com",
    });
  });

  it.each([
    "lnbc1pexampleinvoice",
    "lightning:lnbc1pexampleinvoice",
    "lnurl1dp68gurn8ghj7",
    "lnurl:lnurl1dp68gurn8ghj7",
    "satoshi@example",
    "satoshi@@example.com",
    "pay to satoshi@example.com",
    "@example.com",
    "sat#oshi@example.com",
    "sat/oshi@example.com",
    "sat?oshi@example.com",
  ])("rejects %s", (input) => {
    expect(classifySendClipboard(input)).toBeNull();
  });
});

describe("classifySendClipboard - Bitcoin addresses", () => {
  it("accepts a checksum-valid segwit address", () => {
    expect(classifySendClipboard(P2WPKH)).toEqual({
      kind: "bitcoinAddress",
      address: P2WPKH,
    });
  });

  it("accepts a taproot (bech32m) address", () => {
    expect(classifySendClipboard(TAPROOT)).toEqual({
      kind: "bitcoinAddress",
      address: TAPROOT,
    });
  });

  it("accepts a base58 address (shape only)", () => {
    expect(classifySendClipboard(P2PKH)).toEqual({
      kind: "bitcoinAddress",
      address: P2PKH,
    });
  });

  it("normalizes an uppercase (QR) segwit address", () => {
    expect(classifySendClipboard(P2WPKH.toUpperCase())).toEqual({
      kind: "bitcoinAddress",
      address: P2WPKH,
    });
  });

  it("rejects a segwit address with a broken checksum", () => {
    expect(isSendableBitcoinAddress(P2WPKH.slice(0, -1) + "5")).toBe(false);
    expect(classifySendClipboard(P2WPKH.slice(0, -1) + "5")).toBeNull();
  });

  it("rejects a mixed-case segwit address", () => {
    const mixed = "bc1QW508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
    expect(classifySendClipboard(mixed)).toBeNull();
  });

  it("rejects other pasted strings that are not send destinations", () => {
    for (const input of [
      "cashuAeyJ0b2tlbiI6W119",
      "https://mint.example",
      "02".padEnd(66, "a"),
      "npub1abcdef",
      "hello world",
      "",
      null,
      undefined,
      "a".repeat(5000),
    ]) {
      expect(classifySendClipboard(input as any)).toBeNull();
    }
  });
});

describe("classifySendClipboard - bitcoin: URIs", () => {
  it("keeps the amount unset for a bare address URI", () => {
    expect(classifySendClipboard(`bitcoin:${P2WPKH}`)).toEqual({
      kind: "bitcoinAddress",
      address: P2WPKH,
    });
  });

  it("converts an exact BIP-21 amount to satoshis", () => {
    expect(
      classifySendClipboard(`bitcoin:${P2WPKH}?amount=0.0001&label=Coffee`)
    ).toEqual({
      kind: "bitcoinAddress",
      address: P2WPKH,
      amountSat: 10_000,
    });
  });

  it("accepts an uppercase URI with uppercase parameter keys", () => {
    const uri = `BITCOIN:${P2WPKH.toUpperCase()}?AMOUNT=0.00000001`;
    expect(classifySendClipboard(uri)).toEqual({
      kind: "bitcoinAddress",
      address: P2WPKH,
      amountSat: 1,
    });
  });

  it.each([
    `bitcoin:${P2WPKH}?amount=0`,
    `bitcoin:${P2WPKH}?amount=-1`,
    `bitcoin:${P2WPKH}?amount=0.000000001`,
    `bitcoin:${P2WPKH}?amount=1e3`,
    `bitcoin:${P2WPKH}?amount=abc`,
    `bitcoin:${P2WPKH}?amount=0.1&amount=0.2`,
    `bitcoin:${P2WPKH}?amount=0.1&req-foo=bar`,
    `bitcoin:${P2WPKH}?pj=https://payjoin.example`,
    `bitcoin:${P2WPKH}?lightning=lnbc1pexample`,
    `bitcoin:${P2WPKH}?creq=creqApayment`,
    `bitcoin:?amount=0.1`,
    `bitcoin:${P2WPKH}?amount=0.1?amount=0.2`,
    `bitcoin:${P2WPKH}#fragment`,
    "bitcoin:notanaddress",
  ])("rejects %s", (input) => {
    expect(classifySendClipboard(input)).toBeNull();
  });
});

describe("parseBip21AmountToSats", () => {
  it("parses without floating point drift", () => {
    expect(parseBip21AmountToSats("0.1")).toBe(10_000_000);
    expect(parseBip21AmountToSats("1")).toBe(100_000_000);
    expect(parseBip21AmountToSats("0.00000001")).toBe(1);
  });

  it("rejects unsafe amounts", () => {
    expect(parseBip21AmountToSats("0")).toBeNull();
    expect(parseBip21AmountToSats("-0.1")).toBeNull();
    expect(parseBip21AmountToSats("0.000000001")).toBeNull();
    expect(parseBip21AmountToSats("999999999")).toBeNull();
    expect(parseBip21AmountToSats("")).toBeNull();
  });
});

describe("classifySendClipboard - ecash payment requests", () => {
  it("accepts a decodable creq with amount and unit", () => {
    const encoded = encodedRequest({
      amount: 21,
      unit: "sat",
      mints: ["https://mint.example"],
    });
    const result = classifySendClipboard(encoded) as any;
    expect(result.kind).toBe("paymentRequest");
    expect(result.encoded).toBe(encoded);
    expect(result.amount).toBe(21);
    expect(result.unit).toBe("sat");
    expect(result.request.mints).toEqual(["https://mint.example"]);
  });

  it("accepts a creq without an amount (user enters it)", () => {
    const result = classifySendClipboard(encodedRequest()) as any;
    expect(result.kind).toBe("paymentRequest");
    expect(result.amount).toBeUndefined();
  });

  it("rejects a creq without a usable transport", () => {
    expect(classifySendClipboard(encodedRequest({ transport: [] }))).toBeNull();
  });

  it("rejects a malformed creq", () => {
    expect(classifySendClipboard("creqAnotarealrequest")).toBeNull();
    expect(classifySendClipboard("creqB")).toBeNull();
  });
});

describe("sendClipboardMode", () => {
  it("prefers native Android", () => {
    mocks.platform = "android";
    mocks.quasarIs.android = true;
    expect(sendClipboardMode()).toBe("android-native");
  });

  it("uses the web clipboard on Android browser/PWA", () => {
    mocks.platform = "web";
    mocks.quasarIs.android = true;
    expect(sendClipboardMode()).toBe("android-web");
  });

  it("is disabled on iOS (native and web) and on desktop", () => {
    mocks.platform = "ios";
    expect(sendClipboardMode()).toBeNull();
    mocks.platform = "web";
    mocks.quasarIs.ios = true;
    expect(sendClipboardMode()).toBeNull();
    delete mocks.quasarIs.ios;
    expect(sendClipboardMode()).toBeNull();
  });
});

describe("startSendClipboardRead", () => {
  const originalClipboard = (navigator as any).clipboard;

  const setWebClipboard = (readText: any, secure = true) => {
    Object.defineProperty(window, "isSecureContext", {
      value: secure,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: readText ? { readText } : undefined,
      configurable: true,
    });
  };

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
    vi.useRealTimers();
  });

  it("returns null without touching the clipboard on iOS", () => {
    mocks.platform = "ios";
    expect(startSendClipboardRead()).toBeNull();
    expect(mocks.clipboardRead).not.toHaveBeenCalled();
  });

  it("reads the native clipboard once on Android", async () => {
    mocks.platform = "android";
    mocks.clipboardRead.mockResolvedValue({
      value: P2WPKH,
      type: "text/plain",
    });
    const read = startSendClipboardRead();
    expect(mocks.clipboardRead).toHaveBeenCalledTimes(1);
    await expect(read).resolves.toBe(P2WPKH);
  });

  it("ignores non-text native clipboard content", async () => {
    mocks.platform = "android";
    mocks.clipboardRead.mockResolvedValue({
      value: "data:image/png;base64,AAA",
      type: "image/png",
    });
    await expect(startSendClipboardRead()).resolves.toBeNull();
  });

  it("resolves null when the read is denied", async () => {
    mocks.platform = "android";
    mocks.clipboardRead.mockRejectedValue(new Error("denied"));
    await expect(startSendClipboardRead()).resolves.toBeNull();
  });

  it("resolves null when the read times out", async () => {
    vi.useFakeTimers();
    mocks.platform = "android";
    mocks.clipboardRead.mockReturnValue(new Promise(() => undefined));
    const read = startSendClipboardRead(10_000) as Promise<string | null>;
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(read).resolves.toBeNull();
  });

  it("uses navigator.clipboard on Android web only in a secure context", async () => {
    mocks.platform = "web";
    mocks.quasarIs.android = true;
    const readText = vi.fn().mockResolvedValue(`bitcoin:${P2WPKH}`);
    setWebClipboard(readText);
    await expect(startSendClipboardRead()).resolves.toBe(`bitcoin:${P2WPKH}`);
    expect(readText).toHaveBeenCalledTimes(1);

    setWebClipboard(readText, false);
    expect(startSendClipboardRead()).toBeNull();

    setWebClipboard(undefined);
    expect(startSendClipboardRead()).toBeNull();
  });
});
