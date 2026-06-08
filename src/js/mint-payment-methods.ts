import type { GetInfoResponse } from "@cashu/cashu-ts";
import type { StoredMint } from "src/stores/mints";
import { PaymentMethod } from "src/stores/walletTypes";

function nut4Config(info?: GetInfoResponse) {
  return info?.nuts?.[4] || info?.nuts?.["4"] || ({} as any);
}

type MintOperation = "mint" | "melt";

export function mintSupportsPaymentMethod(
  mint: StoredMint,
  method: PaymentMethod,
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
  method: PaymentMethod,
  operation: MintOperation = "mint",
  unit?: string
): StoredMint[] {
  return mints.filter((mint) =>
    mintSupportsPaymentMethod(mint, method, operation, unit)
  );
}

export function mintSupportsAnyPaymentMethod(
  mint: StoredMint,
  methods: PaymentMethod[],
  operation: MintOperation = "mint",
  unit?: string
): boolean {
  return methods.some((method) =>
    mintSupportsPaymentMethod(mint, method, operation, unit)
  );
}

export function firstSupportedPaymentMethod(
  mint: StoredMint,
  methods: PaymentMethod[],
  operation: MintOperation = "mint",
  unit?: string
): PaymentMethod | null {
  return (
    methods.find((method) =>
      mintSupportsPaymentMethod(mint, method, operation, unit)
    ) || null
  );
}

export function firstMintSupportingPaymentMethods(
  mints: StoredMint[],
  activeMintUrl: string,
  methods: PaymentMethod[],
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
  methods: PaymentMethod[],
  operation: MintOperation = "mint",
  unit?: string
): Promise<
  | { ok: true; mint: StoredMint; method: PaymentMethod }
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

export function paymentMethodNoMintErrorKey(method: PaymentMethod): string {
  return method === PaymentMethod.Bolt12
    ? "wallet.notifications.no_bolt12_mint"
    : "wallet.notifications.no_bolt11_mint";
}

export async function ensurePaymentMethodMintActive(
  mints: StoredMint[],
  activeMintUrl: string,
  selectMintUrl: (url: string) => void | Promise<void>,
  method: PaymentMethod,
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
