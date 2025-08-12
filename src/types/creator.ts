export interface CreatorIdentity {
  nostrPubkey: string; // hex encoded Nostr pubkey
  cashuP2pk: string; // SEC-compressed Cashu P2PK key
}

export function isValidCashuP2pk(key: string): boolean {
  return /^(02|03)[0-9a-f]{64}$/i.test(key);
}

export interface SubscribeTierOptions {
  creator: CreatorIdentity;
  tierId: string;
  months: number;
  price: number;
  startDate: number;
  relayList: string[];
  htlc?: boolean;
  frequency?: import("../constants/subscriptionFrequency").SubscriptionFrequency;
  intervalDays?: number;
  tierName?: string;
  benefits?: string[];
  creatorName?: string;
  creatorAvatar?: string;
}
