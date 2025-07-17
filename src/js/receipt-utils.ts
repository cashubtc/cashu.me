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
) {
  return {
    type: "cashu_subscription_payment" as const,
    token,
    unlock_time,
    subscription_id: meta.subscription_id,
    tier_id: meta.tier_id,
    month_index: meta.month_index,
    total_months: meta.total_months,
  };
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2
  )}`;
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
