import type { GetInfoResponse } from "@cashu/cashu-ts";
import type { StoredMint } from "src/stores/mints";
import { LightningMethod } from "src/stores/walletTypes";

function nut4Config(info?: GetInfoResponse) {
  return info?.nuts?.[4] || info?.nuts?.["4"] || ({} as any);
}

export function mintSupportsLightningMethod(
  mint: StoredMint,
  method: LightningMethod,
  operation: "mint" | "melt" = "mint"
): boolean {
  const nut =
    operation === "melt"
      ? mint.info?.nuts?.[5] || mint.info?.nuts?.["5"] || ({} as any)
      : nut4Config(mint.info);
  if (nut.supported === false) return false;
  if (nut.methods) {
    return nut.methods.some((m: { method: string }) => m.method === method);
  }
  return true;
}

export function mintsSupportingLightningMethod(
  mints: StoredMint[],
  method: LightningMethod,
  operation: "mint" | "melt" = "mint"
): StoredMint[] {
  return mints.filter((mint) =>
    mintSupportsLightningMethod(mint, method, operation)
  );
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
  operation: "mint" | "melt" = "mint"
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
