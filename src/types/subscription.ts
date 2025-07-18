export interface SubscriptionPaymentPayload {
  type: "cashu_subscription_payment";
  token: string;
  unlock_time: number;
  subscription_id: string;
  tier_id: string;
  month_index: number;
  total_months: number;
  htlc_hash?: string;
  htlc_secret?: string;
}
