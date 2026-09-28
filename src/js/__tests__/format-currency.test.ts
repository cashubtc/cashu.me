import { describe, expect, it } from "vitest";
import { formatBigIntCurrency } from "src/js/format-currency";

describe("exact integer currency formatting", () => {
  it.each([
    [1000n, "usd", "$10.00"],
    [113n, "eur", "€1.13"],
    [18446744073709551615n, "usd", "$184,467,440,737,095,516.15"],
    [18446744073709551615n, "sat", "18,446,744,073,709,551,615 sat"],
    [18446744073709551615n, "msat", "18,446,744,073,709,551,615 msat"],
    [42n, "unit", "42 unit"],
    [-1n, "usd", "-$0.01"],
    [-113n, "eur", "-€1.13"],
  ] as const)(
    "formats %s %s without losing precision",
    (amount, unit, expected) => {
      expect(formatBigIntCurrency(amount, unit)).toBe(expected);
    }
  );

  it("preserves the locale's separators and currency placement", () => {
    expect(formatBigIntCurrency(18446744073709551615n, "eur", "de-DE")).toBe(
      "184.467.440.737.095.516,15\u00a0€"
    );
  });

  it("preserves the Bitcoin symbol preference", () => {
    expect(formatBigIntCurrency(18446744073709551615n, "sat", "en", true)).toBe(
      "₿18,446,744,073,709,551,615"
    );
  });
});
