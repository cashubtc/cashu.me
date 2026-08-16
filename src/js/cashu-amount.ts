import { Amount, type AmountLike } from "@cashu/cashu-ts";

type StructuredClonedAmount = {
  value: AmountLike;
};

function isStructuredClonedAmount(
  value: unknown
): value is StructuredClonedAmount {
  if (!value || typeof value !== "object") return false;

  const keys = Object.keys(value);
  if (
    keys.length !== 1 ||
    keys[0] !== "value" ||
    !Object.prototype.hasOwnProperty.call(value, "value")
  ) {
    return false;
  }

  const innerValue = (value as StructuredClonedAmount).value;
  return ["bigint", "number", "string"].includes(typeof innerValue);
}

/**
 * Convert cashu-ts Amount values to the number representation used by the app.
 * IndexedDB's structured clone strips Amount's prototype and leaves its
 * bigint-backed `{ value }` property behind, so accept that legacy shape too.
 */
export function cashuAmountToNumber(value: unknown): number {
  const amountLike = isStructuredClonedAmount(value) ? value.value : value;
  return Amount.from(amountLike as AmountLike).toNumber();
}

/**
 * Normalize every amount-bearing quote field before it crosses the app's
 * persistence boundary.
 */
export function normalizeCashuQuoteAmounts<T extends Record<string, any>>(
  quote: T
): T {
  const normalized: Record<string, any> = { ...quote };

  for (const field of [
    "amount",
    "amount_paid",
    "amount_issued",
    "fee_reserve",
    "fee_paid",
  ]) {
    if (
      field in normalized &&
      normalized[field] !== null &&
      normalized[field] !== undefined
    ) {
      normalized[field] = cashuAmountToNumber(normalized[field]);
    }
  }

  if (Array.isArray(normalized.fee_options)) {
    normalized.fee_options = normalized.fee_options.map((option: any) => ({
      ...option,
      fee_reserve:
        option.fee_reserve === null || option.fee_reserve === undefined
          ? option.fee_reserve
          : cashuAmountToNumber(option.fee_reserve),
    }));
  }

  if (Array.isArray(normalized.change)) {
    normalized.change = normalized.change.map((signature: any) => ({
      ...signature,
      amount:
        signature.amount === null || signature.amount === undefined
          ? signature.amount
          : cashuAmountToNumber(signature.amount),
    }));
  }

  return normalized as T;
}
