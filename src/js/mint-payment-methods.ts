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
  operation: MintOperation = "mint"
): boolean {
  const nut =
    operation === "melt"
      ? mint.info?.nuts?.[5] || mint.info?.nuts?.["5"] || ({} as any)
      : nut4Config(mint.info);
  if (nut.supported === false) return false;
  if (nut.methods) {
    return nut.methods.some((m: { method: string }) => m.method === method);
  }
  // Old mints without method declarations predate explicit method lists.
  // Keep legacy Lightning behavior, but require explicit support for on-chain.
  return method !== PaymentMethod.Onchain;
}

export function mintsSupportingPaymentMethod(
  mints: StoredMint[],
  method: PaymentMethod,
  operation: MintOperation = "mint"
): StoredMint[] {
  return mints.filter((mint) =>
    mintSupportsPaymentMethod(mint, method, operation)
  );
}

export function mintSupportsAnyPaymentMethod(
  mint: StoredMint,
  methods: PaymentMethod[],
  operation: MintOperation = "mint"
): boolean {
  return methods.some((method) =>
    mintSupportsPaymentMethod(mint, method, operation)
  );
}

export function firstSupportedPaymentMethod(
  mint: StoredMint,
  methods: PaymentMethod[],
  operation: MintOperation = "mint"
): PaymentMethod | null {
  return (
    methods.find((method) =>
      mintSupportsPaymentMethod(mint, method, operation)
    ) || null
  );
}

export function firstMintSupportingPaymentMethods(
  mints: StoredMint[],
  activeMintUrl: string,
  methods: PaymentMethod[],
  operation: MintOperation = "mint"
): StoredMint | null {
  const activeMint = mints.find((mint) => mint.url === activeMintUrl);
  if (
    activeMint &&
    mintSupportsAnyPaymentMethod(activeMint, methods, operation)
  ) {
    return activeMint;
  }
  return (
    mints.find((mint) =>
      mintSupportsAnyPaymentMethod(mint, methods, operation)
    ) || null
  );
}

export async function ensurePaymentMintActive(
  mints: StoredMint[],
  activeMintUrl: string,
  selectMintUrl: (url: string) => void | Promise<void>,
  methods: PaymentMethod[],
  operation: MintOperation = "mint"
): Promise<
  | { ok: true; mint: StoredMint; method: PaymentMethod }
  | { ok: false; errorKey: string }
> {
  const mint = firstMintSupportingPaymentMethods(
    mints,
    activeMintUrl,
    methods,
    operation
  );
  if (!mint) {
    return { ok: false, errorKey: paymentMethodNoMintErrorKey(methods[0]) };
  }
  if (mint.url !== activeMintUrl) {
    await selectMintUrl(mint.url);
  }
  const method = firstSupportedPaymentMethod(mint, methods, operation);
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
  operation: MintOperation = "mint"
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const supportingMints = mintsSupportingPaymentMethod(
    mints,
    method,
    operation
  );
  if (supportingMints.length === 0) {
    return { ok: false, errorKey: paymentMethodNoMintErrorKey(method) };
  }

  const activeMint = mints.find((mint) => mint.url === activeMintUrl);
  if (
    !activeMint ||
    !mintSupportsPaymentMethod(activeMint, method, operation)
  ) {
    await selectMintUrl(supportingMints[0].url);
  }

  return { ok: true };
}
