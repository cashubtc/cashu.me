export interface CreatorIdentity {
  nostrPubkey: string; // hex encoded Nostr pubkey
  cashuP2pk: string; // SEC-compressed Cashu P2PK key
}

export interface SubscribeTierOptions {
  creator: CreatorIdentity;
  tierId: string;
  months: number;
  price: number;
  startDate: number;
  relayList: string[];
}
