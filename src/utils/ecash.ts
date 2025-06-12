import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToHex } from '@noble/hashes/utils';
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
    try { return bytesToHex(Point.fromHex('02' + hex).toRawBytes(true)); }
    catch { return bytesToHex(Point.fromHex('03' + hex).toRawBytes(true)); }
  }
  if (/^04[0-9a-f]{128}$/.test(hex)) {
    return bytesToHex(Point.fromHex(hex).toRawBytes(true));
  }
  throw new Error(`invalid pubkey format: ${hex}`);
}
