import { Amount } from "@cashu/cashu-ts";
import { describe, expect, it } from "vitest";
import {
  cashuAmountToNumber,
  normalizeCashuQuoteAmounts,
} from "src/js/cashu-amount";

describe("cashu amount persistence normalization", () => {
  it("recovers an Amount whose prototype was stripped by structured clone", () => {
    const persistedAmount = structuredClone(Amount.from(42));

    expect(persistedAmount).toEqual({ value: 42n });
    expect(cashuAmountToNumber(persistedAmount)).toBe(42);
  });

  it("normalizes nested quote amounts before IndexedDB persistence", () => {
    const normalized = normalizeCashuQuoteAmounts({
      quote: "melt-quote",
      amount: Amount.from(100),
      fee_reserve: Amount.from(5),
      fee_options: [
        { fee_index: 1, fee_reserve: Amount.from(7), estimated_blocks: 6 },
      ],
      change: [
        {
          id: "keyset-id",
          amount: structuredClone(Amount.from(2)),
          C_: "signature",
        },
      ],
    });

    expect(normalized).toEqual({
      quote: "melt-quote",
      amount: 100,
      fee_reserve: 5,
      fee_options: [{ fee_index: 1, fee_reserve: 7, estimated_blocks: 6 }],
      change: [{ id: "keyset-id", amount: 2, C_: "signature" }],
    });
    expect(() => JSON.stringify(normalized)).not.toThrow();
  });
});
