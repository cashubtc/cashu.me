import { describe, expect, it } from "vitest";
import {
  MAX_INTEGER_DIGITS,
  canonicalAmountBuffer,
  displayAmountToBaseUnits,
  parseAmountBuffer,
  sanitizeAmountBuffer,
} from "src/js/amount-entry";

describe("amount entry grammar (cashubtc/wallet#307 parity)", () => {
  describe("sanitizeAmountBuffer", () => {
    it("keeps whole numbers as typed left to right", () => {
      expect(sanitizeAmountBuffer("21", 2)).toBe("21");
      expect(sanitizeAmountBuffer("0", 2)).toBe("0");
      expect(sanitizeAmountBuffer("00", 2)).toBe("0");
    });

    it("strips leading zeros but keeps the fraction armed state", () => {
      expect(sanitizeAmountBuffer("012", 2)).toBe("12");
      expect(sanitizeAmountBuffer("0.", 2)).toBe("0.");
      expect(sanitizeAmountBuffer(".", 2)).toBe("0.");
      expect(sanitizeAmountBuffer("", 2)).toBe("0");
    });

    it("caps fraction digits at the unit's decimals", () => {
      expect(sanitizeAmountBuffer("12.345", 2)).toBe("12.34");
      expect(sanitizeAmountBuffer("4.1", 2)).toBe("4.1");
      // sat/msat: indivisible, separators are dropped entirely
      expect(sanitizeAmountBuffer("4.1", 0)).toBe("41");
      expect(sanitizeAmountBuffer("21.", 0)).toBe("21");
    });

    it("canonicalizes commas and collapses extra separators", () => {
      expect(sanitizeAmountBuffer("4,1", 2)).toBe("4.1");
      expect(sanitizeAmountBuffer("1.2.3", 2)).toBe("1.23");
    });

    it("caps the integer part at 12 digits", () => {
      const twelveNines = "9".repeat(MAX_INTEGER_DIGITS);
      expect(sanitizeAmountBuffer(twelveNines + "9", 2)).toBe(twelveNines);
    });
  });

  describe("canonicalAmountBuffer", () => {
    it("seeds buffers without forced or trailing fraction zeros", () => {
      expect(canonicalAmountBuffer(0)).toBe("0");
      expect(canonicalAmountBuffer(21)).toBe("21");
      expect(canonicalAmountBuffer(21.5)).toBe("21.5");
      expect(canonicalAmountBuffer(21.05, 2)).toBe("21.05");
      expect(canonicalAmountBuffer(0.29, 2)).toBe("0.29");
      expect(canonicalAmountBuffer(1234, 0)).toBe("1234");
    });

    it("tolerates non-number values passed before user input", () => {
      // dialogs mount with v-model bound to an empty string
      expect(canonicalAmountBuffer("" as unknown as number)).toBe("0");
      expect(canonicalAmountBuffer(null as unknown as number)).toBe("0");
      expect(canonicalAmountBuffer(undefined as unknown as number)).toBe("0");
      // numeric strings still seed correctly
      expect(canonicalAmountBuffer("21.50" as unknown as number)).toBe("21.5");
    });
  });

  describe("parseAmountBuffer", () => {
    it("parses grammar states, treating armed-only fractions as zero", () => {
      expect(parseAmountBuffer("21")).toBe(21);
      expect(parseAmountBuffer("21.")).toBe(21);
      expect(parseAmountBuffer("0.05")).toBe(0.05);
      expect(parseAmountBuffer(".")).toBe(0);
      expect(parseAmountBuffer("")).toBe(0);
    });
  });

  describe("displayAmountToBaseUnits", () => {
    it("rounds instead of flooring so float dust cannot drop a base unit", () => {
      // Math.floor(4.1 * 100) === 409
      expect(displayAmountToBaseUnits(4.1, 100)).toBe(410);
      expect(displayAmountToBaseUnits(0.29, 100)).toBe(29);
      expect(displayAmountToBaseUnits(21, 100)).toBe(2100);
      expect(displayAmountToBaseUnits(21, 1)).toBe(21);
    });
  });
});
