import { describe, expect, it } from "vitest";
import { useMintsStore } from "src/stores/mints";

describe("mints store unit precision", () => {
  it("treats a custom unit as whole units", () => {
    const mints = useMintsStore();
    mints.activeUnit = "tst";
    expect(mints.activeUnitCurrencyMultiplyer).toBe(1);
  });
});
