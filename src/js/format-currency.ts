/** In a right-to-left page, wrap a left-to-right run such as "₿500" or "-$1.00" in Unicode
 * isolates (LRI…PDI), so Arabic shows ₿500 and -₿101, never 500₿ or ₿101-. Left-to-right
 * pages get the text unchanged. */
export function isolateLtr(text: string): string {
  if (typeof document === "undefined" || document.documentElement.dir !== "rtl")
    return text;
  return `\u2066${text}\u2069`;
}

/** The one name for a unit wherever the app says *which* unit it is (the header's unit switch,
 * Unit rows, the payment request's unit sheet, history captions, the balance's unit dots):
 * BTC for sats, MSAT for millisats, otherwise the ISO code upper-cased (USD, EUR). A label only;
 * amounts stay with formatCurrency (₿2,100 or 2,100 sat), wire values stay lower-case. */
export function unitCode(unit: string): string {
  const normalized = unit.toLowerCase();
  if (normalized === "sat") return "BTC";
  return normalized.toUpperCase();
}

/** The unit a typed number counts, for entry labels and "whole amount in …" errors: sat and
 * msat by name (the field takes whole sats, not BTC), otherwise the unit's code (USD). */
export function unitQuantityWord(unit: string): string {
  const normalized = unit.toLowerCase();
  if (normalized === "sat" || normalized === "msat") return normalized;
  return unitCode(normalized);
}

/** Format integer Cashu amounts without converting large values to numbers. */
export function formatBigIntCurrency(
  value: bigint,
  currency: string,
  locale = "en",
  bitcoinSymbol = false
): string {
  const numberFormat = new Intl.NumberFormat(locale);
  if (currency === "sat") {
    if (bitcoinSymbol) {
      return value < 0n
        ? `-₿${numberFormat.format(-value)}`
        : `₿${numberFormat.format(value)}`;
    }
    return `${numberFormat.format(value)} sat`;
  }
  if (currency === "msat") return `${numberFormat.format(value)} msat`;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    });
    if (currency !== "usd" && currency !== "eur") {
      return formatter.format(value);
    }
    // Format the whole units and cents separately to preserve every digit.
    const whole = value / 100n;
    const cents = value < 0n ? -(value % 100n) : value % 100n;
    const fraction = new Intl.NumberFormat(locale, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    }).format(cents);
    return formatter
      .formatToParts(value < 0n && whole === 0n ? -0 : whole)
      .map((part) => (part.type === "fraction" ? fraction : part.value))
      .join("");
  } catch {
    return `${numberFormat.format(value)} ${currency}`;
  }
}
