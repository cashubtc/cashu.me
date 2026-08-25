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
    expect(isCustomPaymentMethod("branch")).toBe(true);
    expect(isCustomPaymentMethod("bolt11")).toBe(false);
    expect(isCustomPaymentMethod("bolt12")).toBe(false);
    expect(isCustomPaymentMethod("onchain")).toBe(false);
    expect(isCustomPaymentMethod("bolt12-subpayment")).toBe(false);
    expect(isCustomPaymentMethod("")).toBe(false);
    expect(isCustomPaymentMethod(undefined)).toBe(false);
    expect(isCustomPaymentMethod(null)).toBe(false);
  });

  it("validates method names conservatively", () => {
    expect(isValidCustomMethodName("branch")).toBe(true);
    expect(isValidCustomMethodName("bank_transfer-2")).toBe(true);
    expect(isValidCustomMethodName("has space")).toBe(false);
    expect(isValidCustomMethodName("UPPER")).toBe(false);
    expect(isValidCustomMethodName("../evil")).toBe(false);
    expect(isValidCustomMethodName("")).toBe(false);
    expect(isValidCustomMethodName("x".repeat(33))).toBe(false);
    expect(isValidCustomMethodName(42)).toBe(false);
    // "-subpayment" is reserved for internal history entry types
    expect(isValidCustomMethodName("branch-subpayment")).toBe(false);
  });

  it("round-trips subpayment types", () => {
    expect(subpaymentMethod("branch")).toBe("branch-subpayment");
    expect(basePaymentMethod("branch-subpayment")).toBe("branch");
    expect(basePaymentMethod("branch")).toBe("branch");
    expect(basePaymentMethod(PaymentMethod.Bolt12Subpayment)).toBe(
      PaymentMethod.Bolt12
    );
  });

  it("derives labels the way cdk does", () => {
    expect(paymentMethodLabel("branch")).toBe("Branch");
    expect(paymentMethodLabel("branch-subpayment")).toBe("Branch");
    expect(paymentMethodLabel("bank_transfer")).toBe("Bank Transfer");
    expect(paymentMethodLabel("in-person")).toBe("In Person");
  });
});

describe("method display names (NUT-06 method_name)", () => {
  it("prefers a sane advertised method_name", () => {
    expect(
      advertisedDisplayName({ method: "branch", method_name: "Bux Counter" })
    ).toBe("Bux Counter");
    expect(advertisedDisplayName({ method: "branch" })).toBe("Branch");
    expect(advertisedDisplayName({ method: "branch", method_name: "  " })).toBe(
      "Branch"
    );
    expect(
      advertisedDisplayName({ method: "branch", method_name: "x".repeat(31) })
    ).toBe("Branch");
    expect(
      advertisedDisplayName({ method: "branch", method_name: "a\tb" })
    ).toBe("Branch");
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
                method: "branch",
                method_name: "Bux Counter",
                unit: "ora",
              },
            ],
            disabled: false,
          },
        },
      },
    };
    expect(paymentMethodDisplayName(mint, "branch", "mint", "ora")).toBe(
      "Bux Counter"
    );
    // subpayment types resolve through their base method
    expect(
      paymentMethodDisplayName(mint, "branch-subpayment", "mint", "ora")
    ).toBe("Bux Counter");
    // unknown mint or missing advertisement falls back to derivation
    expect(paymentMethodDisplayName(undefined, "branch")).toBe("Branch");
    expect(paymentMethodDisplayName(mint, "branch", "melt", "ora")).toBe(
      "Branch"
    );
  });
});

describe("custom payment method discovery", () => {
  const branchMint = {
    url: "https://branch.example",
    keys: [],
    keysets: [{ id: "00aa", unit: "ora", active: true }],
    info: {
      nuts: {
        4: {
          methods: [
            { method: "branch", unit: "ora", min_amount: 1, max_amount: 500 },
            { method: "bolt11", unit: "sat" },
          ],
          disabled: false,
        },
        5: {
          methods: [{ method: "branch", unit: "ora" }],
          disabled: false,
        },
      },
    },
  };

  it("discovers custom mint methods and skips built-ins", () => {
    const methods = customPaymentMethods(branchMint, "mint", "ora");
    expect(methods.map((m) => m.method)).toEqual(["branch"]);
    expect(methods[0].min_amount).toBe(1);
    expect(methods[0].max_amount).toBe(500);
  });

  it("filters custom methods by unit", () => {
    expect(customPaymentMethods(branchMint, "mint", "sat")).toEqual([]);
    expect(customPaymentMethods(branchMint, "melt", "ora")).toHaveLength(1);
  });

  it("supports the generic mint support check for custom methods", () => {
    expect(mintSupportsPaymentMethod(branchMint, "branch", "mint", "ora")).toBe(
      true
    );
    expect(mintSupportsPaymentMethod(branchMint, "branch", "mint", "sat")).toBe(
      false
    );
    expect(mintSupportsPaymentMethod(branchMint, "branch", "melt", "ora")).toBe(
      true
    );
  });

  it("ignores malformed and disabled advertisements", () => {
    const messyMint = {
      ...branchMint,
      url: "https://messy.example",
      info: {
        nuts: {
          4: {
            methods: [
              { method: "OK NOT", unit: "ora" },
              { method: "../path", unit: "ora" },
              { method: "disabled-one", unit: "ora", disabled: true },
              { method: "branch", unit: "ora" },
              { method: "branch", unit: "ora" }, // duplicate
              null,
              {},
            ],
            disabled: false,
          },
        },
      },
    };
    const methods = customPaymentMethods(messyMint, "mint", "ora");
    expect(methods.map((m) => m.method)).toEqual(["branch"]);
  });

  it("returns nothing when the nut is disabled", () => {
    const disabledMint = {
      ...branchMint,
      url: "https://disabled.example",
      info: {
        nuts: {
          4: {
            methods: [{ method: "branch", unit: "ora" }],
            disabled: true,
          },
        },
      },
    };
    expect(customPaymentMethods(disabledMint, "mint", "ora")).toEqual([]);
  });

  it("deduplicates across mints", () => {
    const otherMint = {
      ...branchMint,
      url: "https://other.example",
    };
    const methods = customPaymentMethodsForMints(
      [branchMint, otherMint],
      "mint",
      "ora"
    );
    expect(methods.map((m) => m.method)).toEqual(["branch"]);
  });

  it("looks up the advertised entry for a mint+method+unit", () => {
    const advertised = advertisedPaymentMethod(
      branchMint,
      "branch",
      "mint",
      "ora"
    );
    expect(advertised?.max_amount).toBe(500);
    expect(
      advertisedPaymentMethod(branchMint, "branch", "mint", "sat")
    ).toBeNull();
    expect(advertisedPaymentMethod(undefined, "branch")).toBeNull();
  });
});
