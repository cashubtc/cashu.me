import { decodePaymentRequest } from "@cashu/cashu-ts";

/** What a payment request asks for, read back from its encoded form. */
export type RequestFields = {
  /** The request's own short id: what tells two requests apart at a glance. */
  id?: string;
  amount?: number;
  unit: string;
  mints?: string[];
  description?: string;
};

export function requestFields(
  encoded: string,
  fallbackUnit: string
): RequestFields {
  try {
    const decoded = decodePaymentRequest(encoded);
    return {
      id: decoded.id,
      amount: decoded.amount !== undefined ? Number(decoded.amount) : undefined,
      unit: decoded.unit || fallbackUnit,
      mints: decoded.mints?.length ? decoded.mints : undefined,
      description: decoded.description,
    };
  } catch {
    return { unit: fallbackUnit };
  }
}
