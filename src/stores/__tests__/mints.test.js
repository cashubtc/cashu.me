import { describe, expect, it } from "vitest";
import { useMintsStore } from "src/stores/mints";

describe("mints store unit precision", () => {
  it("treats custom units as having no minor unit", () => {
    const mints = useMintsStore();
    // NUT-01 only defines a minor unit for bitcoin and ISO 4217 currencies.
    // Units outside that (e.g. from mints with custom payment methods) carry
    // no precision metadata, so amounts are whole units.
    mints.activeUnit = "tst";
    expect(mints.activeUnitCurrencyMultiplyer).toBe(1);
    mints.activeUnit = "sat";
    expect(mints.activeUnitCurrencyMultiplyer).toBe(1);
  });

  it("keeps cent-based multipliers for usd and eur", () => {
    const mints = useMintsStore();
    mints.activeUnit = "usd";
    expect(mints.activeUnitCurrencyMultiplyer).toBe(100);
    mints.activeUnit = "eur";
    expect(mints.activeUnitCurrencyMultiplyer).toBe(100);
  });
});
