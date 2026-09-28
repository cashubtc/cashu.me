import { describe, expect, it } from "vitest";
import {
  bitcoinUriAmount,
  onchainDepositAmountError,
  onchainDepositQrValue,
  onchainDepositAmountInBaseUnits,
  onchainAddressExplorerUrl,
} from "src/js/onchain";

describe("onchainAddressExplorerUrl", () => {
  it("returns the mainnet Mempool address page", () => {
    expect(onchainAddressExplorerUrl("bc1qexampleaddress")).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );
  });

  it("normalizes bitcoin URIs and selects the Mutinynet explorer", () => {
    expect(
      onchainAddressExplorerUrl("bitcoin:tb1qexampleaddress?amount=1")
    ).toBe("https://mutinynet.com/address/tb1qexampleaddress");
  });

  it("does not return an explorer URL for an unrecognized address", () => {
    expect(onchainAddressExplorerUrl("invalid-address")).toBeNull();
  });
});

describe("onchainDepositAmountError", () => {
  it.each([1, 1000, 5000])(
    "accepts positive amounts without advertised limits: %s",
    (amount) => {
      expect(onchainDepositAmountError(amount, "sat", null)).toBe("");
    }
  );

  it("enforces one-sided and inclusive limits", () => {
    expect(
      onchainDepositAmountError(999, "sat", {
        minAmount: 1000n,
        maxAmount: null,
      })
    ).not.toBe("");
    expect(
      onchainDepositAmountError(1000, "sat", {
        minAmount: 1000n,
        maxAmount: null,
      })
    ).toBe("");
    expect(
      onchainDepositAmountError(5000, "sat", {
        minAmount: null,
        maxAmount: 5000n,
      })
    ).toBe("");
    expect(
      onchainDepositAmountError(5001, "sat", {
        minAmount: null,
        maxAmount: 5000n,
      })
    ).not.toBe("");
    expect(
      onchainDepositAmountError(1, "sat", { minAmount: null, maxAmount: 0n })
    ).not.toBe("");
  });

  it.each([0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid amount %s",
    (amount) => {
      expect(onchainDepositAmountError(amount, "sat", null)).not.toBe("");
    }
  );

  it.each(["sat", "msat", "usd"])(
    "uses the mint's %s limits without adding currency restrictions",
    (unit) => {
      const limits = { minAmount: 1000n, maxAmount: 5000n };
      expect(onchainDepositAmountError(1001, unit, limits)).toBe("");
      expect(onchainDepositAmountError(999, unit, limits)).not.toBe("");
    }
  );

  it.each(["usd", "eur"])(
    "formats %s limits in major currency units",
    (unit) => {
      const symbol = unit === "usd" ? "$" : "€";
      const limits = { minAmount: 1000n, maxAmount: 5000n };
      expect(onchainDepositAmountError(999, unit, limits)).toBe(
        `Enter at least ${symbol}10.00.`
      );
      expect(onchainDepositAmountError(5001, unit, limits)).toBe(
        `Enter no more than ${symbol}50.00.`
      );
    }
  );

  it("compares safe input with large bounds without narrowing the limits", () => {
    const maximum = 18446744073709551615n;
    expect(
      onchainDepositAmountError(1000, "sat", {
        minAmount: 1n,
        maxAmount: maximum,
      })
    ).toBe("");
    expect(
      onchainDepositAmountError(Number.MAX_SAFE_INTEGER, "sat", {
        minAmount: maximum,
        maxAmount: null,
      })
    ).toBe("Enter at least 18,446,744,073,709,551,615 sat.");
  });

  it("formats sat limits with the Bitcoin symbol when enabled", () => {
    expect(
      onchainDepositAmountError(
        999,
        "sat",
        { minAmount: 1000n, maxAmount: null },
        true
      )
    ).toBe("Enter at least ₿1,000.");
  });
});

describe("onchainDepositAmountInBaseUnits", () => {
  it.each([
    [0.29, 29],
    [1.13, 113],
    [4.1, 410],
  ])("converts %s to exactly %s cents", (input, cents) => {
    expect(onchainDepositAmountInBaseUnits(input, 100)).toBe(cents);
  });

  it.each([0.001, 1.131, NaN, Infinity])(
    "rejects invalid cent precision: %s",
    (input) => {
      expect(onchainDepositAmountInBaseUnits(input, 100)).toBeNaN();
    }
  );

  it("does not round fractional sats into valid deposits", () => {
    const amount = onchainDepositAmountInBaseUnits(1.5, 1);
    expect(onchainDepositAmountError(amount, "sat", null)).not.toBe("");
  });
});

describe("bitcoinUriAmount", () => {
  it.each([
    [1, "0.00000001"],
    [25000, "0.00025"],
    [100000000, "1"],
    [123456789, "1.23456789"],
    [Number.MAX_SAFE_INTEGER, "90071992.54740991"],
  ])("formats %s sat as %s BTC", (sats, btc) => {
    expect(bitcoinUriAmount(sats)).toBe(btc);
  });
});

describe("onchainDepositQrValue", () => {
  it("renders a BIP321 URI when the requested amount is known in sat", () => {
    expect(onchainDepositQrValue("bc1qaddress", 25000, "sat")).toBe(
      "bitcoin:bc1qaddress?amount=0.00025"
    );
  });

  it("converts whole-satoshi msat amounts", () => {
    expect(onchainDepositQrValue("bc1qaddress", 25000000, "msat")).toBe(
      "bitcoin:bc1qaddress?amount=0.00025"
    );
  });

  it.each([
    [undefined, "sat"],
    [0, "sat"],
    [1500, "msat"],
    [500, "usd"],
    [500, "eur"],
  ])("falls back to the bare address for %s %s", (amount, unit) => {
    expect(onchainDepositQrValue("bc1qaddress", amount, unit)).toBe(
      "bc1qaddress"
    );
  });
});
