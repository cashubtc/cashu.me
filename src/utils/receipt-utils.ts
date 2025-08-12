import { exportFile } from "quasar";
import { format } from "date-fns";
import token from "src/js/token";
import type { MessengerMessage } from "src/stores/messenger";

export function saveReceipt(msg: MessengerMessage) {
  if (!msg.subscriptionPayment) return;
  const decoded = token.decode(msg.subscriptionPayment.token);
  const amount = decoded
    ? token.getProofs(decoded).reduce((s, p) => s + p.amount, 0)
    : 0;
  const mintUrl = decoded ? token.getMint(decoded) : "";
  const data = {
    rawToken: msg.subscriptionPayment.token,
    amount,
    mintUrl,
    unlock_time: msg.subscriptionPayment.unlock_time,
  };
  const fileName = `fundstr_${msg.subscriptionPayment.subscription_id}_${format(
    new Date(),
    "yyyyMMdd-HHmmss"
  )}.json`;
  exportFile(fileName, JSON.stringify(data, null, 2), "application/json");
}

export type Receipt = {
  id: string;
  amount: number;
  token: string;
  locktime?: number;
  bucketId: string;
  date: string;
};

export interface SubscriptionDmPayload {
  type: "cashu_subscription_payment";
  token: string;
  unlock_time: number | null;
  subscription_id: string;
  tier_id: string;
  month_index: number;
  total_months: number;
  htlc_hash?: string;
  htlc_secret?: string;
}

export interface SubscriptionMeta {
  subscription_id: string;
  tier_id: string;
  month_index: number;
  total_months: number;
}

export function subscriptionPayload(
  token: string,
  unlock_time: number | null,
  meta: SubscriptionMeta,
  htlc_hash?: string
) {
  return {
    type: "cashu_subscription_payment" as const,
    token,
    unlock_time,
    subscription_id: meta.subscription_id,
    tier_id: meta.tier_id,
    month_index: meta.month_index,
    total_months: meta.total_months,
    ...(htlc_hash ? { htlc_hash } : {}),
  };
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${
    "0" + d.getDate()
  }.slice(-2) ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2
  )}`;
}

export function parseSubscriptionDm(
  text: string
): SubscriptionDmPayload | undefined {
  try {
    const obj = JSON.parse(text);
    if (obj?.type !== "cashu_subscription_payment" || !obj.token) return;
    return {
      type: "cashu_subscription_payment",
      token: obj.token,
      unlock_time: obj.unlock_time ?? null,
      subscription_id: obj.subscription_id,
      tier_id: obj.tier_id,
      month_index: obj.month_index,
      total_months: obj.total_months,
      htlc_hash: obj.htlc_hash,
      htlc_secret: obj.htlc_secret,
    };
  } catch {
    return;
  }
}
