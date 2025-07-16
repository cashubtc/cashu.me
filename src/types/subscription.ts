export interface SubscriptionPaymentPayload {
  type: "cashu_subscription_payment";
  token: string;
  receiver_p2pk: string;
  unlock_time: number;
  subscription_id: string;
  tier_id: string;
  month_index: number;
  total_months: number;
}
