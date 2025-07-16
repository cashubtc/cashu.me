export type Receipt = {
  id: string;
  amount: number;
  token: string;
  pubkey: string;
  locktime?: number;
  refundPubkey?: string;
  bucketId: string;
  date: string;
  receiver_p2pk?: string;
  unlock_time?: number;
  hashlock?: string;
};

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
  supporterName?: string,
  subscription?: {
    subscription_id: string;
    tier_id: string;
    month_index: number;
    total_months: number;
  }
): string {
  const payload = subscription
    ? {
        type: "cashu_subscription_payment",
        subscription_id: subscription.subscription_id,
        tier_id: subscription.tier_id,
        month_index: subscription.month_index,
        total_months: subscription.total_months,
        token: receipt.token,
        receiver_p2pk: receipt.receiver_p2pk ?? receipt.pubkey,
        unlock_time: receipt.unlock_time ?? receipt.locktime ?? null,
      }
    : {
        token: receipt.token,
        amount: receipt.amount,
        unlockTime: receipt.locktime ?? null,
        bucketId: receipt.bucketId,
        referenceId: receipt.id,
        receiver_p2pk: receipt.receiver_p2pk ?? receipt.pubkey,
        unlock_time: receipt.unlock_time ?? receipt.locktime ?? null,
      };
  return JSON.stringify(payload);
}

export function receiptsToDmText(
  receipts: Array<Receipt>,
  supporterName?: string,
  subscription?: { subscription_id: string; tier_id: string }
): string {
  return receipts
    .map((r, idx) =>
      receiptToDmText(
        r,
        supporterName,
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
