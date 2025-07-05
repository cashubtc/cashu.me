import { Point } from "@noble/secp256k1";

/**
 * Ensure a hex pubkey is 33-byte SEC-compressed (66 hex chars 02/03…).
 * Accepts raw 32-byte hex, 65-byte uncompressed hex (prefix 04), or
 * already-compressed hex. Always run user-provided keys through this
 * helper before they are stored or used in P2PK operations.
 */
export function ensureCompressed(hex: string): string {
  hex = hex.toLowerCase().replace(/^0x/, "");
  if (hex.length === 64) {
    // This is an x-only pubkey, which is what nostr-tools' getPublicKey returns.
    // We will prepend '02' to treat it as a point on the curve.
    hex = "02" + hex;
  }
  // If it's already compressed, the point library will handle it correctly.
  const point = Point.fromHex(hex);
  return point.toHex(true);
}
