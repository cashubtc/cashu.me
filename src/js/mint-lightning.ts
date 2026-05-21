import type { GetInfoResponse } from "@cashu/cashu-ts";
import type { StoredMint } from "src/stores/mints";
import { LightningMethod } from "src/stores/walletTypes";

function nut4Config(info?: GetInfoResponse) {
  return info?.nuts?.[4] || info?.nuts?.["4"] || ({} as any);
}

export function mintSupportsLightningMethod(
  mint: StoredMint,
  method: LightningMethod
): boolean {
  const nut4 = nut4Config(mint.info);
  if (nut4.supported === false) return false;
  if (nut4.methods) {
    return nut4.methods.some((m: { method: string }) => m.method === method);
  }
  return true;
}

export function mintsSupportingLightningMethod(
  mints: StoredMint[],
  method: LightningMethod
): StoredMint[] {
  return mints.filter((mint) => mintSupportsLightningMethod(mint, method));
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
  method: LightningMethod
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const supportingMints = mintsSupportingLightningMethod(mints, method);
  if (supportingMints.length === 0) {
    return { ok: false, errorKey: lightningMethodNoMintErrorKey(method) };
  }

  const activeMint = mints.find((mint) => mint.url === activeMintUrl);
  if (!activeMint || !mintSupportsLightningMethod(activeMint, method)) {
    await activateMintUrl(supportingMints[0].url, false, true);
  }

  return { ok: true };
}
