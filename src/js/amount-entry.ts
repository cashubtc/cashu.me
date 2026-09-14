/*
 * Amount entry grammar shared with the native wallets (cashubtc/wallet#307).
 *
 * Digits build the integer part left to right and the decimal key arms the
 * fraction, so "21" means twenty-one, not twenty-one hundredths. The raw
 * buffer keeps a canonical "." separator; locale separators are applied at
 * display time only.
 *
 *   raw  := "" | INT | INT "." | INT "." FRAC
 *   INT  := "0" | [1-9][0-9]{0,11}
 *   FRAC := [0-9]{0,decimals}
 *
 * The trailing "." is the "fraction armed" state.
 */

/** Hard cap for any entered amount (in display units), mirrors native apps. */
export const AMOUNT_ENTRY_MAX = 999_999_999;

/** Maximum digits of the integer part. */
export const MAX_INTEGER_DIGITS = 12;

/**
 * Normalize a raw entry buffer to the grammar above.
 * `fractionDigits` caps the fraction length (0 makes the unit indivisible,
 * e.g. sat/msat: any separator is dropped).
 */
export function sanitizeAmountBuffer(
  rawBuf: string,
  fractionDigits: number
): string {
  const cleaned = String(rawBuf).replace(/,/g, ".");
  const dotIndex = cleaned.indexOf(".");
  let intPart: string;
  let fracPart = "";
  if (dotIndex === -1 || fractionDigits <= 0) {
    intPart = cleaned.replace(/\./g, "");
  } else {
    intPart = cleaned.slice(0, dotIndex);
    fracPart = cleaned
      .slice(dotIndex + 1)
      .replace(/\./g, "")
      .slice(0, fractionDigits);
  }
  intPart = intPart
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, MAX_INTEGER_DIGITS);
  if (intPart === "") intPart = "0";
  return dotIndex !== -1 && fractionDigits > 0
    ? `${intPart}.${fracPart}`
    : intPart;
}

/**
 * Canonical raw buffer for a numeric value (used when seeding the buffer from
 * the current amount): no forced fraction, no trailing fraction zeros.
 */
export function canonicalAmountBuffer(
  value: number,
  fractionDigits = 2
): string {
  // parents may pass ""/null before the user types anything — tolerate it
  const num = Number(value);
  if (!isFinite(num) || num === 0) return "0";
  const fixed = num.toFixed(Math.max(0, Math.min(fractionDigits, 8)));
  const trimmed = fixed.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return sanitizeAmountBuffer(trimmed, fractionDigits);
}

/** Parse an entry buffer to a number (0 when empty or fraction-armed only). */
export function parseAmountBuffer(buf: string): number {
  const num = Number(String(buf).replace(/,/g, "."));
  return isNaN(num) ? 0 : num;
}

/**
 * Convert a display-unit amount (as typed, e.g. dollars or sats) to base
 * units (e.g. cents). Rounded, never floored: buffers carry at most
 * `fractionDigits` decimals, so rounding cancels binary float dust while
 * Math.floor would silently drop a base unit (Math.floor(4.1 * 100) === 409).
 */
export function displayAmountToBaseUnits(
  amount: number,
  multiplyer: number
): number {
  return Math.round(amount * multiplyer);
}
