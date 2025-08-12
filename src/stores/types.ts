export interface TierMedia {
  url: string;
  title?: string;
  type?: "image" | "video" | "audio";
}

export interface Tier {
  id: string;
  name: string;
  price_sats: number;
  description: string;
  /** Subscription payment frequency */
  frequency?: import("../constants/subscriptionFrequency").SubscriptionFrequency;
  /** Number of days between payments */
  intervalDays?: number;
  benefits?: string[];
  welcomeMessage?: string;
  media?: TierMedia[];
}
