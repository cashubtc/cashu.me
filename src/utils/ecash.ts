import * as nobleSecp256k1 from "@noble/secp256k1";

/**
 * Ensure a public key hex string is compressed.
 * Returns the compressed representation or throws
 * if the input is invalid.
 */
export function ensureCompressed(pubkey: string): string {
  if (!pubkey) throw new Error("invalid pubkey");
  if (
    pubkey.length === 66 &&
    (pubkey.startsWith("02") || pubkey.startsWith("03"))
  ) {
    return pubkey;
  }
  const point = nobleSecp256k1.Point.fromHex(pubkey);
  return point.toHex(true);
}
