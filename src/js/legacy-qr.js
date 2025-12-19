/**
 * Utility functions for handling legacy retail QR codes
 * These are traditional retail QR codes (like those used in South Africa)
 * that need to be converted to Lightning Address format (like cryptoqr.net)
 * 
 * Based on the implementation from Blink wallet
 */

/**
 * Merchant configuration for supported retailers
 */
const merchants = [
  {
    id: "picknpay",
    identifierRegex: /(?<identifier>.*za\.co\.electrum\.picknpay.*)/iu,
    defaultDomain: "cryptoqr.net",
    domains: {
      mainnet: "cryptoqr.net",
      signet: "staging.cryptoqr.net",
      regtest: "staging.cryptoqr.net",
    },
  },
  {
    id: "ecentric",
    identifierRegex: /(?<identifier>.*za\.co\.ecentric.*)/iu,
    defaultDomain: "cryptoqr.net",
    domains: {
      mainnet: "cryptoqr.net",
      signet: "staging.cryptoqr.net",
      regtest: "staging.cryptoqr.net",
    },
  },
];

/**
 * Determines the network type (defaults to mainnet)
 * TODO: This could be made configurable based on wallet settings
 */
function getNetwork() {
  // For now, default to mainnet
  // In the future, this could check wallet settings or mint configuration
  return "mainnet";
}

/**
 * Converts a merchant EMV QR code to Lightning Address format
 * 
 * @param {string} qrContent - The EMV QR code content
 * @param {string} network - Network type: "mainnet", "signet", or "regtest"
 * @returns {string|null} - Lightning Address format (e.g., "encodedQR@cryptoqr.net") or null if not a supported merchant
 */
export function convertMerchantQRToLightningAddress(qrContent, network = null) {
  if (!qrContent) {
    return null;
  }

  const networkType = network || getNetwork();

  for (const merchant of merchants) {
    const match = qrContent.match(merchant.identifierRegex);
    if (match?.groups?.identifier) {
      const domain = merchant.domains[networkType] || merchant.defaultDomain;
      const encodedIdentifier = encodeURIComponent(match.groups.identifier);
      return `${encodedIdentifier}@${domain}`;
    }
  }

  return null;
}

/**
 * Checks if a string looks like a legacy retail QR code
 * Legacy retail QR codes are typically:
 * - EMV QR codes (starting with "000201") - used by South African retailers like PicknPay
 * - Numeric codes (6-20 digits) - simple legacy codes
 * - Alphanumeric codes (8-30 characters) - other legacy formats
 * - Not starting with known Lightning prefixes
 *
 * @param {string} code - The QR code string to check
 * @returns {boolean} - True if it looks like a legacy retail QR code
 */
export function isLegacyRetailQR(code) {
  if (!code || typeof code !== "string") {
    return false;
  }

  const trimmed = code.trim();

  // Skip if it's already a known Lightning format
  if (
    trimmed.toLowerCase().startsWith("lnbc") ||
    trimmed.toLowerCase().startsWith("lightning:") ||
    trimmed.toLowerCase().startsWith("lnurl") ||
    trimmed.toLowerCase().startsWith("lnurl1") ||
    trimmed.startsWith("bitcoin:") ||
    trimmed.startsWith("cashuA") ||
    trimmed.startsWith("cashuB") ||
    trimmed.startsWith("creqA") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return false;
  }

  // EMV QR Code format (used by PicknPay and other South African retailers)
  // These start with "000201" which is the EMV QR Code payload format indicator
  if (trimmed.startsWith("000201")) {
    return true;
  }

  // Legacy retail QR codes can also be:
  // - Pure numeric (6-20 digits) - simple legacy codes
  // - Alphanumeric codes (8-30 characters) without special characters
  // - Not containing @ symbol (which would be a lightning address)
  
  // Check length for non-EMV codes
  if (trimmed.length > 30) {
    return false;
  }

  const numericPattern = /^\d{6,20}$/;
  const alphanumericPattern = /^[A-Za-z0-9]{8,30}$/;

  // Check if it's purely numeric first (6-20 digits)
  if (numericPattern.test(trimmed)) {
    return true;
  }

  // Check if it matches alphanumeric pattern (8-30 chars) and doesn't contain @
  // Note: This won't match pure numeric strings as they're handled above
  if (alphanumericPattern.test(trimmed) && !trimmed.includes("@") && !/^\d+$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Translates a legacy retail QR code to a Lightning Address
 * For EMV QR codes from supported merchants, converts to Lightning Address format
 * 
 * @param {string} qrCode - The legacy retail QR code
 * @param {string} network - Optional network type (defaults to mainnet)
 * @returns {string|null} - Lightning Address format or null if not supported
 */
export function translateLegacyQRToLightningAddress(qrCode, network = null) {
  if (!isLegacyRetailQR(qrCode)) {
    return null;
  }

  const trimmedCode = qrCode.trim();
  
  // For EMV QR codes, try to convert to Lightning Address
  if (trimmedCode.startsWith("000201")) {
    const lightningAddress = convertMerchantQRToLightningAddress(trimmedCode, network);
    if (lightningAddress) {
      console.log("Converted merchant QR code to Lightning Address:", {
        original: trimmedCode.substring(0, 50) + "...",
        lightningAddress,
      });
      return lightningAddress;
    }
  }

  // For other legacy QR codes, we don't have a conversion method yet
  // They would need to be handled differently or via an API
  return null;
}
