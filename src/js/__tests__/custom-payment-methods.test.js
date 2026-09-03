import { describe, expect, it } from "vitest";
import {
  advertisedDisplayName,
  advertisedPaymentMethod,
  customPaymentMethods,
  customPaymentMethodsForMints,
  paymentMethodDisplayName,
} from "src/js/mint-payment-methods";
import {
  PaymentMethod,
  basePaymentMethod,
  isCustomPaymentMethod,
  isValidCustomMethodName,
  paymentMethodLabel,
  subpaymentMethod,
} from "src/stores/walletTypes";

const METHOD = "custom_method";
const UNIT = "tst";
const METHOD_NAME = "Custom Payment";
const mintWithMethods = (mintMethods = [], meltMethods = []) => ({
  info: {
    nuts: {
      4: { methods: mintMethods, disabled: false },
      5: { methods: meltMethods, disabled: false },
    },
  },
});
const customEntry = {
  method: METHOD,
  method_name: METHOD_NAME,
  unit: UNIT,
  min_amount: 1,
  max_amount: 500,
};
const customMint = mintWithMethods(
  [customEntry, { method: PaymentMethod.Bolt11, unit: "sat" }],
  [{ method: METHOD, unit: UNIT }]
);

describe("custom payment method identity", () => {
  it("recognizes only valid, non-built-in method ids", () => {
    expect(isCustomPaymentMethod(METHOD)).toBe(true);
    expect(isCustomPaymentMethod(`${METHOD}-subpayment`)).toBe(true);
    for (const method of [
      ...Object.values(PaymentMethod),
      "../evil",
      "",
      undefined,
    ]) {
      expect(isCustomPaymentMethod(method), String(method)).toBe(false);
    }
  });

  it("validates advertised method names conservatively", () => {
    for (const method of [METHOD, "bank_transfer-2"]) {
      expect(isValidCustomMethodName(method), String(method)).toBe(true);
    }
    for (const method of [
      "has space",
      "UPPER",
      "../evil",
      "",
      "x".repeat(33),
      42,
      `${METHOD}-subpayment`,
    ]) {
      expect(isValidCustomMethodName(method), String(method)).toBe(false);
    }
  });

  it("normalizes subpayment types and fallback labels", () => {
    expect(subpaymentMethod(METHOD)).toBe(`${METHOD}-subpayment`);
    expect(basePaymentMethod(`${METHOD}-subpayment`)).toBe(METHOD);
    expect(basePaymentMethod(PaymentMethod.Bolt12Subpayment)).toBe(
      PaymentMethod.Bolt12
    );
    expect(paymentMethodLabel(METHOD)).toBe("Custom Method");
    expect(paymentMethodLabel(`${METHOD}-subpayment`)).toBe("Custom Method");
    expect(paymentMethodLabel("in-person")).toBe("In Person");
  });
});

describe("method display names", () => {
  it.each([
    [{ method: METHOD, method_name: METHOD_NAME }, METHOD_NAME],
    [{ method: METHOD }, "Custom Method"],
    [{ method: METHOD, method_name: "  " }, "Custom Method"],
    [{ method: METHOD, method_name: "x".repeat(31) }, "Custom Method"],
    [{ method: METHOD, method_name: "a\tb" }, "Custom Method"],
    [null, ""],
  ])("formats %j as %s", (entry, expected) => {
    expect(advertisedDisplayName(entry)).toBe(expected);
  });

  it("resolves an advertised name and falls back to the method id", () => {
    expect(
      paymentMethodDisplayName(customMint, `${METHOD}-subpayment`, "mint", UNIT)
    ).toBe(METHOD_NAME);
    expect(paymentMethodDisplayName(undefined, METHOD)).toBe("Custom Method");
    expect(paymentMethodDisplayName(customMint, METHOD, "melt", UNIT)).toBe(
      "Custom Method"
    );
  });
});

describe("custom payment method discovery", () => {
  it("discovers metadata while filtering built-ins and units", () => {
    const methods = customPaymentMethods(customMint, "mint", UNIT);
    expect(methods.map(({ method }) => method)).toEqual([METHOD]);
    expect(methods[0]).toMatchObject({ min_amount: 1, max_amount: 500 });
    expect(customPaymentMethods(customMint, "mint", "sat")).toEqual([]);
    expect(customPaymentMethods(customMint, "melt", UNIT)).toHaveLength(1);
  });

  it("ignores malformed, disabled, and duplicate advertisements", () => {
    const methods = customPaymentMethods(
      mintWithMethods([
        { method: "OK NOT", unit: UNIT },
        { method: "../path", unit: UNIT },
        { method: "disabled-one", unit: UNIT, disabled: true },
        { method: METHOD, unit: UNIT },
        { method: METHOD, unit: UNIT },
        null,
        {},
      ]),
      "mint",
      UNIT
    );
    expect(methods.map(({ method }) => method)).toEqual([METHOD]);

    const disabledMint = mintWithMethods([{ method: METHOD, unit: UNIT }]);
    disabledMint.info.nuts[4].disabled = true;
    expect(customPaymentMethods(disabledMint, "mint", UNIT)).toEqual([]);
  });

  it("deduplicates methods across mints", () => {
    const methods = customPaymentMethodsForMints(
      [customMint, { ...customMint }],
      "mint",
      UNIT
    );
    expect(methods.map(({ method }) => method)).toEqual([METHOD]);
  });

  it("looks up metadata by mint, operation, method, and unit", () => {
    expect(
      advertisedPaymentMethod(customMint, METHOD, "mint", UNIT)
    ).toMatchObject({ max_amount: 500 });
    expect(
      advertisedPaymentMethod(customMint, METHOD, "mint", "sat")
    ).toBeNull();
    expect(advertisedPaymentMethod(undefined, METHOD)).toBeNull();
  });
});
