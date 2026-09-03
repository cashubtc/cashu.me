import type { GetInfoResponse } from "@cashu/cashu-ts";
import type { StoredMint } from "src/stores/mints";
import {
  PaymentMethod,
  type PaymentMethodId,
  basePaymentMethod,
  isCustomPaymentMethod,
  isValidCustomMethodName,
  paymentMethodLabel,
} from "src/stores/walletTypes";

function nut4Config(info?: GetInfoResponse) {
  return info?.nuts?.[4] || info?.nuts?.["4"] || ({} as any);
}

type MintOperation = "mint" | "melt";

export function mintSupportsPaymentMethod(
  mint: StoredMint,
  method: PaymentMethodId,
  operation: MintOperation = "mint",
  unit?: string
): boolean {
  const nut =
    operation === "melt"
      ? mint.info?.nuts?.[5] || mint.info?.nuts?.["5"] || ({} as any)
      : nut4Config(mint.info);
  if (nut.disabled === true) return false;
  if (nut.supported === false) return false;
  if (!Array.isArray(nut.methods)) return false;
  return nut.methods.some(
    (m: { method: string; unit?: string; disabled?: boolean }) =>
      m.disabled !== true &&
      m.method === method &&
      (!unit || !m.unit || m.unit === unit)
  );
}

export function mintsSupportingPaymentMethod(
  mints: StoredMint[],
  method: PaymentMethodId,
  operation: MintOperation = "mint",
  unit?: string
): StoredMint[] {
  return mints.filter((mint) =>
    mintSupportsPaymentMethod(mint, method, operation, unit)
  );
}

export function mintSupportsAnyPaymentMethod(
  mint: StoredMint,
  methods: PaymentMethodId[],
  operation: MintOperation = "mint",
  unit?: string
): boolean {
  return methods.some((method) =>
    mintSupportsPaymentMethod(mint, method, operation, unit)
  );
}

export function firstSupportedPaymentMethod(
  mint: StoredMint,
  methods: PaymentMethodId[],
  operation: MintOperation = "mint",
  unit?: string
): PaymentMethodId | null {
  return (
    methods.find((method) =>
      mintSupportsPaymentMethod(mint, method, operation, unit)
    ) || null
  );
}

export function firstMintSupportingPaymentMethods(
  mints: StoredMint[],
  activeMintUrl: string,
  methods: PaymentMethodId[],
  operation: MintOperation = "mint",
  unit?: string
): StoredMint | null {
  const activeMint = mints.find((mint) => mint.url === activeMintUrl);
  if (
    activeMint &&
    mintSupportsAnyPaymentMethod(activeMint, methods, operation, unit)
  ) {
    return activeMint;
  }
  return (
    mints.find((mint) =>
      mintSupportsAnyPaymentMethod(mint, methods, operation, unit)
    ) || null
  );
}

export async function ensurePaymentMintActive(
  mints: StoredMint[],
  activeMintUrl: string,
  selectMintUrl: (url: string) => void | Promise<void>,
  methods: PaymentMethodId[],
  operation: MintOperation = "mint",
  unit?: string
): Promise<
  | { ok: true; mint: StoredMint; method: PaymentMethodId }
  | { ok: false; errorKey: string }
> {
  const mint = firstMintSupportingPaymentMethods(
    mints,
    activeMintUrl,
    methods,
    operation,
    unit
  );
  if (!mint) {
    return { ok: false, errorKey: paymentMethodNoMintErrorKey(methods[0]) };
  }
  if (mint.url !== activeMintUrl) {
    await selectMintUrl(mint.url);
  }
  const method = firstSupportedPaymentMethod(mint, methods, operation, unit);
  if (!method) {
    return { ok: false, errorKey: paymentMethodNoMintErrorKey(methods[0]) };
  }
  return { ok: true, mint, method };
}

export function paymentMethodNoMintErrorKey(method: PaymentMethodId): string {
  return method === PaymentMethod.Bolt12
    ? "wallet.notifications.no_bolt12_mint"
    : "wallet.notifications.no_bolt11_mint";
}

export async function ensurePaymentMethodMintActive(
  mints: StoredMint[],
  activeMintUrl: string,
  selectMintUrl: (url: string) => void | Promise<void>,
  method: PaymentMethodId,
  operation: MintOperation = "mint",
  unit?: string
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const supportingMints = mintsSupportingPaymentMethod(
    mints,
    method,
    operation,
    unit
  );
  if (supportingMints.length === 0) {
    return { ok: false, errorKey: paymentMethodNoMintErrorKey(method) };
  }

  const activeMint = mints.find((mint) => mint.url === activeMintUrl);
  if (
    !activeMint ||
    !mintSupportsPaymentMethod(activeMint, method, operation, unit)
  ) {
    await selectMintUrl(supportingMints[0].url);
  }

  return { ok: true };
}

// Generic methods are well-formed, non-built-in NUT-04/05 advertisements
// driven through cashu-ts' method-parametrized quote endpoints.

export type AdvertisedPaymentMethod = {
  method: string;
  method_name?: string;
  unit?: string;
  min_amount?: number;
  max_amount?: number;
  description?: boolean;
  [key: string]: any;
};

function advertisedMethods(
  mint: StoredMint,
  operation: MintOperation
): AdvertisedPaymentMethod[] {
  const nut =
    operation === "melt"
      ? mint.info?.nuts?.[5] || mint.info?.nuts?.["5"] || ({} as any)
      : nut4Config(mint.info);
  if (nut.disabled === true || nut.supported === false) return [];
  if (!Array.isArray(nut.methods)) return [];
  return nut.methods.filter(
    (m: any) => m && m.disabled !== true && isValidCustomMethodName(m.method)
  );
}

export function customPaymentMethods(
  mint: StoredMint,
  operation: MintOperation = "mint",
  unit?: string
): AdvertisedPaymentMethod[] {
  const seen = new Set<string>();
  return advertisedMethods(mint, operation).filter((m) => {
    if (!isCustomPaymentMethod(m.method)) return false;
    if (unit && m.unit && m.unit !== unit) return false;
    if (seen.has(m.method)) return false;
    seen.add(m.method);
    return true;
  });
}

export function customPaymentMethodsForMints(
  mints: StoredMint[],
  operation: MintOperation = "mint",
  unit?: string
): AdvertisedPaymentMethod[] {
  const seen = new Set<string>();
  const result: AdvertisedPaymentMethod[] = [];
  for (const mint of mints) {
    for (const m of customPaymentMethods(mint, operation, unit)) {
      if (seen.has(m.method)) continue;
      seen.add(m.method);
      result.push(m);
    }
  }
  return result;
}

export function advertisedPaymentMethod(
  mint: StoredMint | undefined,
  method: string,
  operation: MintOperation = "mint",
  unit?: string
): AdvertisedPaymentMethod | null {
  if (!mint) return null;
  return (
    advertisedMethods(mint, operation).find(
      (m) => m.method === method && (!unit || !m.unit || m.unit === unit)
    ) ?? null
  );
}

// Prefer NUT-06's method_name, with cdk-compatible derivation as fallback.
const MAX_METHOD_NAME_LENGTH = 30;

function containsControlChars(value: string): boolean {
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 32 || code === 127) return true;
  }
  return false;
}

export function advertisedDisplayName(
  entry: AdvertisedPaymentMethod | null | undefined
): string {
  const name =
    typeof entry?.method_name === "string" ? entry.method_name.trim() : "";
  if (
    name.length > 0 &&
    name.length <= MAX_METHOD_NAME_LENGTH &&
    !containsControlChars(name)
  ) {
    return name;
  }
  return entry?.method ? paymentMethodLabel(entry.method) : "";
}

export function paymentMethodDisplayName(
  mint: StoredMint | undefined,
  method: string,
  operation: MintOperation = "mint",
  unit?: string
): string {
  const entry = advertisedPaymentMethod(
    mint,
    basePaymentMethod(method),
    operation,
    unit
  );
  if (entry) return advertisedDisplayName(entry);
  return paymentMethodLabel(method);
}
