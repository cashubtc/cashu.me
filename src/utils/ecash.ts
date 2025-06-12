import { secp256k1 } from '@noble/curves/secp256k1';
const Point = secp256k1.ProjectivePoint;

/**
 * Ensure a hex pubkey is 33-byte SEC-compressed (66 hex chars 02/03…).
 * Accepts raw 32-byte hex, 65-byte uncompressed hex (prefix 04), or
 * already-compressed hex. Always run user-provided keys through this
 * helper before they are stored or used in P2PK operations.
*/
export function ensureCompressed(hex: string): string {
  hex = hex.toLowerCase().replace(/^0x/, '');
  if (/^(02|03)[0-9a-f]{64}$/.test(hex)) return hex;      // already good
  if (/^[0-9a-f]{64}$/.test(hex)) {
    try { return Point.fromHex('02' + hex).toRawBytes(true).toString('hex'); }
    catch { return Point.fromHex('03' + hex).toRawBytes(true).toString('hex'); }
  }
  if (/^04[0-9a-f]{128}$/.test(hex)) {
    return Point.fromHex(hex).toRawBytes(true).toString('hex');
  }
  throw new Error(`invalid pubkey format: ${hex}`);
}
