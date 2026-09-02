import { describe, expect, it } from "vitest";
import {
  advertisedDisplayName,
  advertisedPaymentMethod,
  customPaymentMethods,
  customPaymentMethodsForMints,
  mintSupportsPaymentMethod,
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

describe("custom payment method identity", () => {
  it("treats non-built-in method strings as custom", () => {
    expect(isCustomPaymentMethod("custom_method")).toBe(true);
    expect(isCustomPaymentMethod("bolt11")).toBe(false);
    expect(isCustomPaymentMethod("bolt12")).toBe(false);
    expect(isCustomPaymentMethod("onchain")).toBe(false);
    expect(isCustomPaymentMethod("bolt12-subpayment")).toBe(false);
    expect(isCustomPaymentMethod("")).toBe(false);
    expect(isCustomPaymentMethod(undefined)).toBe(false);
    expect(isCustomPaymentMethod(null)).toBe(false);
  });

  it("validates method names conservatively", () => {
    expect(isValidCustomMethodName("custom_method")).toBe(true);
    expect(isValidCustomMethodName("bank_transfer-2")).toBe(true);
    expect(isValidCustomMethodName("has space")).toBe(false);
    expect(isValidCustomMethodName("UPPER")).toBe(false);
    expect(isValidCustomMethodName("../evil")).toBe(false);
    expect(isValidCustomMethodName("")).toBe(false);
    expect(isValidCustomMethodName("x".repeat(33))).toBe(false);
    expect(isValidCustomMethodName(42)).toBe(false);
    // "-subpayment" is reserved for internal history entry types
    expect(isValidCustomMethodName("custom_method-subpayment")).toBe(false);
  });

  it("round-trips subpayment types", () => {
    expect(subpaymentMethod("custom_method")).toBe("custom_method-subpayment");
    expect(basePaymentMethod("custom_method-subpayment")).toBe("custom_method");
    expect(basePaymentMethod("custom_method")).toBe("custom_method");
    expect(basePaymentMethod(PaymentMethod.Bolt12Subpayment)).toBe(
      PaymentMethod.Bolt12
    );
  });

  it("derives labels the way cdk does", () => {
    expect(paymentMethodLabel("custom_method")).toBe("Custom Method");
    expect(paymentMethodLabel("custom_method-subpayment")).toBe(
      "Custom Method"
    );
    expect(paymentMethodLabel("bank_transfer")).toBe("Bank Transfer");
    expect(paymentMethodLabel("in-person")).toBe("In Person");
  });
});

describe("method display names (NUT-06 method_name)", () => {
  it("prefers a sane advertised method_name", () => {
    expect(
      advertisedDisplayName({
        method: "custom_method",
        method_name: "Custom Payment",
      })
    ).toBe("Custom Payment");
    expect(advertisedDisplayName({ method: "custom_method" })).toBe(
      "Custom Method"
    );
    expect(
      advertisedDisplayName({ method: "custom_method", method_name: "  " })
    ).toBe("Custom Method");
    expect(
      advertisedDisplayName({
        method: "custom_method",
        method_name: "x".repeat(31),
      })
    ).toBe("Custom Method");
    expect(
      advertisedDisplayName({ method: "custom_method", method_name: "a\tb" })
    ).toBe("Custom Method");
    expect(advertisedDisplayName(null)).toBe("");
  });

  it("resolves display names from a mint advertisement", () => {
    const mint = {
      url: "https://named.example",
      keys: [],
      keysets: [],
      info: {
        nuts: {
          4: {
            methods: [
              {
                method: "custom_method",
                method_name: "Custom Payment",
                unit: "tst",
              },
            ],
            disabled: false,
          },
        },
      },
    };
    expect(paymentMethodDisplayName(mint, "custom_method", "mint", "tst")).toBe(
      "Custom Payment"
    );
    // subpayment types resolve through their base method
    expect(
      paymentMethodDisplayName(mint, "custom_method-subpayment", "mint", "tst")
    ).toBe("Custom Payment");
    // unknown mint or missing advertisement falls back to derivation
    expect(paymentMethodDisplayName(undefined, "custom_method")).toBe(
      "Custom Method"
    );
    expect(paymentMethodDisplayName(mint, "custom_method", "melt", "tst")).toBe(
      "Custom Method"
    );
  });
});

describe("custom payment method discovery", () => {
  const customMint = {
    url: "https://custom.example",
    keys: [],
    keysets: [{ id: "00aa", unit: "tst", active: true }],
    info: {
      nuts: {
        4: {
          methods: [
            {
              method: "custom_method",
              unit: "tst",
              min_amount: 1,
              max_amount: 500,
            },
            { method: "bolt11", unit: "sat" },
          ],
          disabled: false,
        },
        5: {
          methods: [{ method: "custom_method", unit: "tst" }],
          disabled: false,
        },
      },
    },
  };

  it("discovers custom mint methods and skips built-ins", () => {
    const methods = customPaymentMethods(customMint, "mint", "tst");
    expect(methods.map((m) => m.method)).toEqual(["custom_method"]);
    expect(methods[0].min_amount).toBe(1);
    expect(methods[0].max_amount).toBe(500);
  });

  it("filters custom methods by unit", () => {
    expect(customPaymentMethods(customMint, "mint", "sat")).toEqual([]);
    expect(customPaymentMethods(customMint, "melt", "tst")).toHaveLength(1);
  });

  it("supports the generic mint support check for custom methods", () => {
    expect(
      mintSupportsPaymentMethod(customMint, "custom_method", "mint", "tst")
    ).toBe(true);
    expect(
      mintSupportsPaymentMethod(customMint, "custom_method", "mint", "sat")
    ).toBe(false);
    expect(
      mintSupportsPaymentMethod(customMint, "custom_method", "melt", "tst")
    ).toBe(true);
  });

  it("ignores malformed and disabled advertisements", () => {
    const messyMint = {
      ...customMint,
      url: "https://messy.example",
      info: {
        nuts: {
          4: {
            methods: [
              { method: "OK NOT", unit: "tst" },
              { method: "../path", unit: "tst" },
              { method: "disabled-one", unit: "tst", disabled: true },
              { method: "custom_method", unit: "tst" },
              { method: "custom_method", unit: "tst" }, // duplicate
              null,
              {},
            ],
            disabled: false,
          },
        },
      },
    };
    const methods = customPaymentMethods(messyMint, "mint", "tst");
    expect(methods.map((m) => m.method)).toEqual(["custom_method"]);
  });

  it("returns nothing when the nut is disabled", () => {
    const disabledMint = {
      ...customMint,
      url: "https://disabled.example",
      info: {
        nuts: {
          4: {
            methods: [{ method: "custom_method", unit: "tst" }],
            disabled: true,
          },
        },
      },
    };
    expect(customPaymentMethods(disabledMint, "mint", "tst")).toEqual([]);
  });

  it("deduplicates across mints", () => {
    const otherMint = {
      ...customMint,
      url: "https://other.example",
    };
    const methods = customPaymentMethodsForMints(
      [customMint, otherMint],
      "mint",
      "tst"
    );
    expect(methods.map((m) => m.method)).toEqual(["custom_method"]);
  });

  it("looks up the advertised entry for a mint+method+unit", () => {
    const advertised = advertisedPaymentMethod(
      customMint,
      "custom_method",
      "mint",
      "tst"
    );
    expect(advertised?.max_amount).toBe(500);
    expect(
      advertisedPaymentMethod(customMint, "custom_method", "mint", "sat")
    ).toBeNull();
    expect(advertisedPaymentMethod(undefined, "custom_method")).toBeNull();
  });
});
