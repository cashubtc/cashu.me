import { decodeOffer } from "bolt12-utils";

export type DecodedBolt12Offer = {
  amount?: string;
  description?: string;
  currency?: string;
  issuer?: string;
  issuer_id?: string;
};

export function decodeBolt12Offer(offer: string): DecodedBolt12Offer {
  const decoded = decodeOffer(offer);

  return {
    amount: decoded.amount?.toString(),
    description: decoded.description || "",
    currency: decoded.currency,
    issuer: decoded.issuer,
    issuer_id: decoded.issuer_id,
  };
}
