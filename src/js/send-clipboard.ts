/**
 * Helpers for the Android "tap Send -> use clipboard" shortcut.
 *
 * Two independent concerns live here:
 *
 * 1. `classifySendClipboard()` is a *pure* send-only classifier. It only
 *    recognises the three destinations the shortcut supports (Lightning
 *    address, Bitcoin address / simple BIP-21 URI, NUT-18 `creq` payment
 *    request) and rejects everything else (invoices, LNURL, ecash tokens,
 *    mint URLs, pubkeys, random text). Anything it rejects makes the caller
 *    fall back to the regular Send chooser. It never reaches out to the
 *    network and never triggers a payment.
 * 2. `startSendClipboardRead()` performs the platform gating and the actual
 *    (Android-only) clipboard read. It must be called synchronously from the
 *    tap handler, before any `await`, so the browser still considers the read
 *    to happen inside a user gesture.
 */
import { Capacitor } from "@capacitor/core";
import { Clipboard } from "@capacitor/clipboard";
import { Platform } from "quasar";
import {
  Amount,
  decodePaymentRequest,
  PaymentRequest,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { bech32, bech32m } from "bech32";

export type SendClipboardCandidate =
  | { kind: "lightningAddress"; address: string }
  | { kind: "bitcoinAddress"; address: string; amountSat?: number }
  | {
      kind: "paymentRequest";
      encoded: string;
      request: PaymentRequest;
      amount?: number;
      unit?: string;
    };

export type SendClipboardKind = SendClipboardCandidate["kind"];

export type SendClipboardMode = "android-native" | "android-web";

export const SEND_CLIPBOARD_READ_TIMEOUT_MS = 10_000;

// Long enough for NUT-18 requests with a nostr transport, short enough to
// never spend time classifying a pasted essay.
const MAX_SEND_CLIPBOARD_LENGTH = 4096;
const LIGHTNING_SCHEME = "lightning:";
const BITCOIN_SCHEME = "bitcoin:";

// user@host.tld, whole-string. Deliberately stricter than the loose
// `[\w.+-~_]+@[\w.+-~_]` match `wallet.decodeRequest()` uses for manual input:
// the clipboard is not an explicit user choice, so shape must be unambiguous.
const LIGHTNING_ADDRESS_RE =
  /^[a-z0-9._+-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

// P2PKH / P2SH (mainnet 1, 3 / testnet m, n, 2). Shape-only: no base58check
// verification, because the wallet has no base58 dependency. A typo'd base58
// address therefore still reaches the existing on-chain preview, where the
// mint's melt quote rejects it - same boundary as today's
// `wallet.isBitcoinAddress()`.
const BASE58_ADDRESS_RE = /^[13mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
// Segwit/taproot shape; the checksum is verified below via bech32/bech32m.
const BECH32_ADDRESS_RE = /^(?:bc1|tb1|bcrt1)[a-z0-9]{20,87}$/i;
const SEGWIT_PREFIXES = ["bc", "tb", "bcrt"];

// BIP-21 keys we understand. Anything else (including `req-*` required
// parameters, `lightning=`, `creq=`, payjoin `pj=`) is treated as "not a
// plain on-chain send" and rejected.
const BITCOIN_URI_ALLOWED_PARAMS = new Set(["amount", "label", "message"]);
const BTC_AMOUNT_RE = /^\d{1,8}(?:\.(\d{1,8}))?$/;
const SATS_PER_BTC = 100_000_000;
const MAX_BTC_SATS = 21_000_000 * SATS_PER_BTC;

function decodeSegwitAddress(address: string): boolean {
  const codecs = [
    { codec: bech32, bech32m: false },
    { codec: bech32m, bech32m: true },
  ];
  for (const { codec, bech32m: isBech32m } of codecs) {
    let decoded;
    try {
      decoded = codec.decode(address as `${string}1${string}`, 100);
    } catch {
      continue;
    }
    if (!SEGWIT_PREFIXES.includes(decoded.prefix)) {
      return false;
    }
    if (!decoded.words.length) {
      continue;
    }
    const version = decoded.words[0];
    if (version > 16) {
      continue;
    }
    // v0 uses bech32, v1+ uses bech32m - a mismatch means a bad address.
    if (version === 0 ? isBech32m : !isBech32m) {
      continue;
    }
    let program: number[];
    try {
      program = bech32.fromWords(decoded.words.slice(1));
    } catch {
      continue;
    }
    if (program.length < 2 || program.length > 40) {
      continue;
    }
    if (version === 0 && program.length !== 20 && program.length !== 32) {
      continue;
    }
    return true;
  }
  return false;
}

/**
 * Whole-string Bitcoin address validation used by the clipboard shortcut.
 * Segwit addresses are checksum-verified, base58 addresses shape-verified.
 */
export function isSendableBitcoinAddress(address: string): boolean {
  if (BECH32_ADDRESS_RE.test(address)) {
    const lower = address.toLowerCase();
    // Mixed case is invalid for bech32.
    if (address !== lower && address !== address.toUpperCase()) return false;
    return decodeSegwitAddress(lower);
  }
  return BASE58_ADDRESS_RE.test(address);
}

function normalizeBitcoinAddressCase(address: string): string {
  return BECH32_ADDRESS_RE.test(address) ? address.toLowerCase() : address;
}

/**
 * Parses a BIP-21 `amount=` value (BTC) into whole satoshis without going
 * through floating point. Returns null for anything unsafe: non-numeric,
 * zero, negative, exponent notation, sub-satoshi precision or above the
 * 21M BTC supply cap.
 */
export function parseBip21AmountToSats(value: string): number | null {
  const match = BTC_AMOUNT_RE.exec(value.trim());
  if (!match) return null;
  const [whole, fraction = ""] = value.trim().split(".");
  const paddedFraction = (fraction + "00000000").slice(0, 8);
  const sats = Number(whole) * SATS_PER_BTC + Number(paddedFraction);
  if (!Number.isSafeInteger(sats) || sats <= 0 || sats > MAX_BTC_SATS) {
    return null;
  }
  return sats;
}

function classifyBitcoinUri(raw: string): SendClipboardCandidate | null {
  const body = raw.slice(BITCOIN_SCHEME.length);
  // A fragment or a second `?` makes the URI ambiguous - bail out.
  if (body.includes("#") || body.split("?").length > 2) return null;
  const [addressPart, query = ""] = body.split("?");
  const rawAddress = addressPart.trim();
  if (!rawAddress || !isSendableBitcoinAddress(rawAddress)) return null;
  const address = normalizeBitcoinAddressCase(rawAddress);
  if (!query) return { kind: "bitcoinAddress", address };

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(query);
  } catch {
    return null;
  }
  const seen = new Set<string>();
  let amountValue: string | null = null;
  for (const [rawKey, value] of params) {
    const key = rawKey.toLowerCase();
    if (!BITCOIN_URI_ALLOWED_PARAMS.has(key)) return null;
    if (seen.has(key)) return null; // duplicate parameter -> ambiguous
    seen.add(key);
    if (key === "amount") amountValue = value;
  }
  if (amountValue === null) return { kind: "bitcoinAddress", address };
  const amountSat = parseBip21AmountToSats(amountValue);
  if (amountSat === null) return null;
  return { kind: "bitcoinAddress", address, amountSat };
}

function classifyLightningAddress(raw: string): SendClipboardCandidate | null {
  const value = raw.toLowerCase().startsWith(LIGHTNING_SCHEME)
    ? raw.slice(LIGHTNING_SCHEME.length)
    : raw;
  if (value.split("@").length !== 2) return null;
  if (!LIGHTNING_ADDRESS_RE.test(value)) return null;
  return { kind: "lightningAddress", address: value };
}

function paymentRequestAmount(request: PaymentRequest): number | null {
  const raw = (request as any).amount;
  if (raw === undefined || raw === null) return null;
  let amount: number;
  try {
    amount = Amount.from(raw).toNumber();
  } catch {
    return Number.NaN;
  }
  if (!Number.isSafeInteger(amount) || amount <= 0) return Number.NaN;
  return amount;
}

function hasSupportedTransport(request: PaymentRequest): boolean {
  const transports = request.transport ?? [];
  return transports.some(
    (transport) =>
      Boolean(transport?.target) &&
      (transport.type === PaymentRequestTransportType.NOSTR ||
        transport.type === PaymentRequestTransportType.POST)
  );
}

function classifyPaymentRequest(raw: string): SendClipboardCandidate | null {
  let request: PaymentRequest;
  try {
    // Only ever called for an explicit creqA/creqB prefix - we never run the
    // generic decoder over arbitrary clipboard content.
    request = decodePaymentRequest(raw);
  } catch {
    return null;
  }
  if (!request) return null;
  // A request we cannot deliver would dead-end the user in the send sheet.
  if (!hasSupportedTransport(request)) return null;
  const amount = paymentRequestAmount(request);
  if (amount !== null && Number.isNaN(amount)) return null;
  return {
    kind: "paymentRequest",
    encoded: raw,
    request,
    amount: amount ?? undefined,
    unit: request.unit || undefined,
  };
}

/**
 * Pure classifier: returns the send destination the clipboard contains, or
 * null when the clipboard is not a supported send destination.
 */
export function classifySendClipboard(
  text: string | null | undefined
): SendClipboardCandidate | null {
  if (typeof text !== "string") return null;
  const raw = text.trim();
  if (!raw || raw.length > MAX_SEND_CLIPBOARD_LENGTH) return null;
  // Whole-string only: no extracting a destination out of prose.
  if (/\s/.test(raw)) return null;
  const lower = raw.toLowerCase();
  if (lower.startsWith("creqa") || lower.startsWith("creqb")) {
    return classifyPaymentRequest(raw);
  }
  if (lower.startsWith(LIGHTNING_SCHEME) || raw.includes("@")) {
    return classifyLightningAddress(raw);
  }
  if (lower.startsWith(BITCOIN_SCHEME)) {
    return classifyBitcoinUri(raw);
  }
  if (isSendableBitcoinAddress(raw)) {
    return {
      kind: "bitcoinAddress",
      address: normalizeBitcoinAddressCase(raw),
    };
  }
  return null;
}

/**
 * Which clipboard API (if any) the Send shortcut may use.
 *
 * Android native (Capacitor) takes precedence, Android browser/PWA uses the
 * async clipboard API. iOS and desktop return null: the async clipboard read
 * there either requires an extra "Paste" confirmation (WebKit) or has no
 * product need, so those platforms keep the explicit paste flow.
 */
export function sendClipboardMode(): SendClipboardMode | null {
  let platform = "";
  try {
    platform = Capacitor?.getPlatform?.() ?? "";
  } catch {
    platform = "";
  }
  if (platform && platform !== "web") {
    return platform === "android" ? "android-native" : null;
  }
  const is = (Platform as any)?.is ?? {};
  if (is.android && !is.ios) return "android-web";
  return null;
}

function canReadWebClipboard(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
      window.isSecureContext &&
      typeof (navigator as any)?.clipboard?.readText === "function"
  );
}

function isTextClipboardType(type?: string | null): boolean {
  if (!type) return true;
  return type.toLowerCase().startsWith("text");
}

function withTimeout(
  promise: Promise<string | null>,
  timeoutMs: number
): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(null);
    }, timeoutMs);
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    promise.then(finish, () => finish(null));
  });
}

/**
 * Starts a single clipboard read for the Send shortcut, or returns null when
 * the platform is not eligible (so the caller can open the chooser without
 * any delay). Must be called before the first `await` of the tap handler.
 *
 * Failures (permission denied, missing/non-text content, timeout) resolve to
 * null instead of throwing: the shortcut then silently falls back.
 */
export function startSendClipboardRead(
  timeoutMs: number = SEND_CLIPBOARD_READ_TIMEOUT_MS
): Promise<string | null> | null {
  const mode = sendClipboardMode();
  if (!mode) return null;
  let read: Promise<string | null>;
  try {
    if (mode === "android-native") {
      read = Clipboard.read().then((result: any) => {
        if (!result || typeof result.value !== "string") return null;
        return isTextClipboardType(result.type) ? result.value : null;
      });
    } else {
      if (!canReadWebClipboard()) return null;
      read = navigator.clipboard
        .readText()
        .then((value) => (typeof value === "string" ? value : null));
    }
  } catch {
    return null;
  }
  return withTimeout(read, timeoutMs);
}
