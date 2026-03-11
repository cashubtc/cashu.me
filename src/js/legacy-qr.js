// Converts South African retail EMV QR codes to Lightning Address format via cryptoqr.net

const MERCHANT_PATTERNS = [
  /(?<identifier>.*za\.co\.electrum\.picknpay.*)/iu,
  /(?<identifier>.*za\.co\.ecentric.*)/iu,
];

export function isLegacyRetailQR(code) {
  return typeof code === "string" && code.trim().startsWith("000201");
}

export function translateLegacyQRToLightningAddress(qrCode) {
  if (!isLegacyRetailQR(qrCode)) return null;

  const trimmed = qrCode.trim();
  for (const pattern of MERCHANT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.groups?.identifier) {
      return `${encodeURIComponent(match.groups.identifier)}@cryptoqr.net`;
    }
  }
  return null;
}
