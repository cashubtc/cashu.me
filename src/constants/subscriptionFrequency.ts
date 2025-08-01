export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';

export const FREQUENCY_TO_DAYS: Record<SubscriptionFrequency, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export function frequencyToDays(freq: SubscriptionFrequency): number {
  return FREQUENCY_TO_DAYS[freq] || 30;
}
