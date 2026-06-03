import type { GetInfoResponse } from "@cashu/cashu-ts";
import type { StoredMint } from "src/stores/mints";
import { LightningMethod } from "src/stores/walletTypes";

function nut4Config(info?: GetInfoResponse) {
  return info?.nuts?.[4] || info?.nuts?.["4"] || ({} as any);
}

type MintOperation = "mint" | "melt";

export function mintSupportsLightningMethod(
  mint: StoredMint,
  method: LightningMethod,
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
  return method !== LightningMethod.Onchain;
}

export function mintsSupportingLightningMethod(
  mints: StoredMint[],
  method: LightningMethod,
  operation: MintOperation = "mint"
): StoredMint[] {
  return mints.filter((mint) =>
    mintSupportsLightningMethod(mint, method, operation)
  );
}

export function mintSupportsAnyPaymentMethod(
  mint: StoredMint,
  methods: LightningMethod[],
  operation: MintOperation = "mint"
): boolean {
  return methods.some((method) =>
    mintSupportsLightningMethod(mint, method, operation)
  );
}

export function firstSupportedPaymentMethod(
  mint: StoredMint,
  methods: LightningMethod[],
  operation: MintOperation = "mint"
): LightningMethod | null {
  return (
    methods.find((method) =>
      mintSupportsLightningMethod(mint, method, operation)
    ) || null
  );
}

export function firstMintSupportingPaymentMethods(
  mints: StoredMint[],
  activeMintUrl: string,
  methods: LightningMethod[],
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
  activateMintUrl: (
    url: string,
    verbose?: boolean,
    force?: boolean
  ) => Promise<void>,
  methods: LightningMethod[],
  operation: MintOperation = "mint"
): Promise<
  | { ok: true; mint: StoredMint; method: LightningMethod }
  | { ok: false; errorKey: string }
> {
  const mint = firstMintSupportingPaymentMethods(
    mints,
    activeMintUrl,
    methods,
    operation
  );
  if (!mint) {
    return { ok: false, errorKey: lightningMethodNoMintErrorKey(methods[0]) };
  }
  if (mint.url !== activeMintUrl) {
    await activateMintUrl(mint.url, false, true);
  }
  const method = firstSupportedPaymentMethod(mint, methods, operation);
  if (!method) {
    return { ok: false, errorKey: lightningMethodNoMintErrorKey(methods[0]) };
  }
  return { ok: true, mint, method };
}

export function lightningMethodNoMintErrorKey(method: LightningMethod): string {
  return method === LightningMethod.Bolt12
    ? "wallet.notifications.no_bolt12_mint"
    : "wallet.notifications.no_bolt11_mint";
}

export async function ensureLightningMintActive(
  mints: StoredMint[],
  activeMintUrl: string,
  activateMintUrl: (
    url: string,
    verbose?: boolean,
    force?: boolean
  ) => Promise<void>,
  method: LightningMethod,
  operation: MintOperation = "mint"
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const supportingMints = mintsSupportingLightningMethod(
    mints,
    method,
    operation
  );
  if (supportingMints.length === 0) {
    return { ok: false, errorKey: lightningMethodNoMintErrorKey(method) };
  }

  const activeMint = mints.find((mint) => mint.url === activeMintUrl);
  if (
    !activeMint ||
    !mintSupportsLightningMethod(activeMint, method, operation)
  ) {
    await activateMintUrl(supportingMints[0].url, false, true);
  }

  return { ok: true };
}
