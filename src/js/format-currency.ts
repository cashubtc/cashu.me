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

let activeNumberLocale = "en-US";

/** Numbers follow the app's language (grouping and decimal marks: 1,000 in English, 1.000 in
 * German) but always in Latin digits, so amounts read the same in every locale and stay
 * left-to-right runs in Arabic. Set from src/boot/i18n.js whenever the language changes. */
export function setNumberLocale(locale: string): void {
  try {
    activeNumberLocale = new Intl.Locale(locale || "en-US", {
      numberingSystem: "latn",
    }).toString();
  } catch {
    activeNumberLocale = "en-US";
  }
}

/** The locale tag for Intl number formatting (see setNumberLocale). */
function numberLocale(): string {
  return activeNumberLocale;
}

/** A star rating to one decimal, with the locale's decimal mark (4.5, 4,5). */
export function formatRating(value: number): string {
  return new Intl.NumberFormat(activeNumberLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/** An amount of a Cashu unit as text: sat as "2,100 sat" (or "₿2,100" with the BIP-177
 * symbol), msat as "2,100 msat", usd and eur from cents ("$12.34"), any other ISO code as that
 * currency, and an unknown unit as "12 unit". Bigints keep every digit. Hiding the balance and
 * right-to-left isolation are the callers' (stores/ui.ts formatCurrency, boot/base.js). */
export function formatUnitAmount(
  value: number | bigint,
  currency: string | undefined,
  bitcoinSymbol: boolean
): string {
  if (currency == undefined) {
    currency = "sat";
  }
  if (typeof value === "bigint") {
    return formatBigIntCurrency(value, currency, numberLocale(), bitcoinSymbol);
  }
  const numberFormat = new Intl.NumberFormat(numberLocale());
  if (currency == "sat") {
    if (!bitcoinSymbol) return numberFormat.format(value) + " sat";
    return value >= 0
      ? "₿" + numberFormat.format(value)
      : "-₿" + numberFormat.format(Math.abs(value));
  }
  if (currency == "msat") return numberFormat.format(value) + " msat";
  if (currency == "usd") value = value / 100;
  if (currency == "eur") value = value / 100;
  try {
    return new Intl.NumberFormat(numberLocale(), {
      style: "currency",
      currency: currency,
    }).format(value);
  } catch {
    return numberFormat.format(value) + " " + String(currency);
  }
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
