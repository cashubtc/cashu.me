export type Receipt = {
  id: string;
  amount: number;
  token: string;
  pubkey: string;
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
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2
  )}`;
}

export function receiptToDmText(
  receipt: Receipt,
  subscription: {
    subscription_id: string;
    tier_id: string;
    month_index: number;
    total_months: number;
  },
): string {
  const payload: SubscriptionDmPayload = {
    type: "cashu_subscription_payment",
    subscription_id: subscription.subscription_id,
    tier_id: subscription.tier_id,
    month_index: subscription.month_index,
    total_months: subscription.total_months,
    token: receipt.token,
    unlock_time: receipt.locktime ?? null,
  };
  return JSON.stringify(payload);
}

export function receiptsToDmText(
  receipts: Array<Receipt>,
  subscription?: { subscription_id: string; tier_id: string }
): string {
  return receipts
    .map((r, idx) =>
      receiptToDmText(
        r,
        subscription
          ? {
              subscription_id: subscription.subscription_id,
              tier_id: subscription.tier_id,
              month_index: idx + 1,
              total_months: receipts.length,
            }
          : undefined
      )
    )
    .join("\n");
}

export function parseSubscriptionDm(text: string): SubscriptionDmPayload | undefined {
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
    };
  } catch {
    return;
  }
}
