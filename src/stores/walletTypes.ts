export enum PaymentMethod {
  Bolt11 = "bolt11",
  Bolt12 = "bolt12",
  Bolt12Subpayment = "bolt12-subpayment",
  Onchain = "onchain",
  OnchainSubpayment = "onchain-subpayment",
}

// A NUT-04/05 payment method: either a first-class member of PaymentMethod
// or a custom method string advertised by a mint.
export type PaymentMethodId = PaymentMethod | (string & {});

const KNOWN_PAYMENT_METHODS = new Set<string>(Object.values(PaymentMethod));

const SUBPAYMENT_SUFFIX = "-subpayment";

// Custom method names are used to build mint endpoint paths; only accept
// conservative identifiers from mint advertisements (NUT-04 requires
// [a-z0-9_-]+; we additionally cap the length). Names ending in
// "-subpayment" are rejected because that suffix is reserved for the
// wallet's internal subpayment history entries.
const CUSTOM_METHOD_PATTERN = /^[a-z0-9_-]{1,32}$/;

export function isValidCustomMethodName(method: unknown): method is string {
  return (
    typeof method === "string" &&
    CUSTOM_METHOD_PATTERN.test(method) &&
    !method.endsWith(SUBPAYMENT_SUFFIX)
  );
}

export function isCustomPaymentMethod(
  method?: string | null
): method is string {
  return Boolean(method) && !KNOWN_PAYMENT_METHODS.has(method as string);
}

// "bolt12-subpayment" -> "bolt12"
export function basePaymentMethod(method: string): string {
  return method.endsWith(SUBPAYMENT_SUFFIX)
    ? method.slice(0, -SUBPAYMENT_SUFFIX.length)
    : method;
}

export function subpaymentMethod(method: string): string {
  return `${method}${SUBPAYMENT_SUFFIX}`;
}

// Fallback display name for a payment method without an advertised
// `method_name` (NUT-06). Mirrors cdk's `derived_method_name` so derived
// labels match across implementations: words split on "_"/"-" are
// title-cased and joined with spaces (e.g. "bank_transfer" -> "Bank
// Transfer").
export function paymentMethodLabel(method: string): string {
  return basePaymentMethod(method)
    .split(/[_-]/)
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
    )
    .join(" ");
}

export enum UnifiedTransactionType {
  Ecash = "ecash",
  Lightning = "lightning",
  Onchain = "onchain",
}
