import { JSONInt, type SerializedSwapPreview } from "@cashu/cashu-ts";
import type { Event } from "nostr-tools";

export type OwnedPaymentRequest = {
  id: string;
  identity: string;
  encoded: string;
  createdAt: string;
  archived?: boolean;
};
export type PaymentJob = {
  id: string;
  identity: string;
  direction: "incoming" | "outgoing";
  state:
    | "pending"
    | "review"
    | "prepared"
    | "ready"
    | "published"
    | "confirmed"
    | "failed";
  createdAt: string;
  updatedAt: string;
  requestId?: string;
  requestEncoded?: string;
  payload?: string;
  token?: string;
  mint: string;
  unit: string;
  historyId: string;
  matching?: boolean;
  reason?: string;
  fingerprint?: string;
  proofIds?: string[];
  preview?: SerializedSwapPreview;
  envelope?: Event;
  relays?: string[];
  transport?: { type: string; target: string };
  acceptedRelays?: string[];
  attempts: number;
  retryAt?: number;
  amount?: number;
  fee?: number;
};
export type PaymentEnvelope = {
  id: string;
  identity: string;
  created_at: number;
  state: "stored" | "processed" | "invalid";
  event?: Event;
  receiptIds?: string[];
};
export type RelayCheckpoint = {
  id: string;
  identity: string;
  relay: string;
  until?: number;
  limit: number;
  boundaryCount?: number;
  complete: boolean;
  syncedThrough?: number;
  error?: string;
};

/** Clone through the SDK serializer: no Vue proxies, Amount instances or bigint loss. */
export function paymentDto<T>(value: T): T {
  return JSONInt.parse(JSONInt.stringify(value)!) as T;
}
