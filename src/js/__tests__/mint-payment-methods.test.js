import { describe, expect, it } from "vitest";
import {
  firstMintSupportingPaymentMethods,
  mintPaymentMethodLimits,
  mintSupportsPaymentMethod,
} from "src/js/mint-payment-methods";
import { PaymentMethod } from "src/stores/walletTypes";

describe("mint payment method helpers", () => {
  const onchainOnlyMint = {
    url: "https://tee.ucash.space",
    keys: [],
    keysets: [{ id: "00aa", unit: "sat", active: true }],
    info: {
      nuts: {
        4: {
          methods: [{ method: "onchain", unit: "sat" }],
          disabled: false,
        },
      },
    },
  };

  it("does not treat an on-chain-only mint as Lightning-capable", () => {
    expect(
      mintSupportsPaymentMethod(
        onchainOnlyMint,
        PaymentMethod.Bolt11,
        "mint",
        "sat"
      )
    ).toBe(false);
    expect(
      firstMintSupportingPaymentMethods(
        [onchainOnlyMint],
        onchainOnlyMint.url,
        [PaymentMethod.Bolt11, PaymentMethod.Bolt12],
        "mint",
        "sat"
      )
    ).toBeNull();
  });

  it("requires explicit method declarations", () => {
    const legacyMint = {
      ...onchainOnlyMint,
      url: "https://legacy.example",
      info: {
        nuts: {
          4: {
            disabled: false,
          },
        },
      },
    };

    expect(
      mintSupportsPaymentMethod(legacyMint, PaymentMethod.Bolt11, "mint", "sat")
    ).toBe(false);
  });

  it("matches payment methods by unit when methods advertise units", () => {
    const usdLightningMint = {
      ...onchainOnlyMint,
      url: "https://usd.example",
      info: {
        nuts: {
          4: {
            methods: [{ method: "bolt11", unit: "usd" }],
            disabled: false,
          },
        },
      },
    };

    expect(
      mintSupportsPaymentMethod(
        usdLightningMint,
        PaymentMethod.Bolt11,
        "mint",
        "sat"
      )
    ).toBe(false);
    expect(
      mintSupportsPaymentMethod(
        usdLightningMint,
        PaymentMethod.Bolt11,
        "mint",
        "usd"
      )
    ).toBe(true);
  });

  it("returns limits for the matching payment method and unit", () => {
    const mint = {
      ...onchainOnlyMint,
      info: {
        nuts: {
          4: {
            methods: [
              {
                method: "onchain",
                unit: "sat",
                min_amount: 10_000,
                max_amount: 1_000_000,
              },
              {
                method: "onchain",
                unit: "usd",
                min_amount: 1,
                max_amount: 100,
              },
            ],
          },
        },
      },
    };

    expect(
      mintPaymentMethodLimits(mint, PaymentMethod.Onchain, "mint", "sat")
    ).toEqual({ minAmount: 10_000, maxAmount: 1_000_000 });
  });

  it("returns null when a mint does not advertise deposit limits", () => {
    expect(
      mintPaymentMethodLimits(
        onchainOnlyMint,
        PaymentMethod.Onchain,
        "mint",
        "sat"
      )
    ).toBeNull();
  });
});
