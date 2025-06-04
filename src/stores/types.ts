export interface NostrRelay {
  url: string;
  socket: WebSocket | null;
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected' | 'disconnecting';
  subscriptionId?: string;
  sub?: any; // nostr-tools Sub object
  error?: string; // To store error messages
  eoseReceived?: boolean; // To track EOSE for initial sync
  notice?: string; // To store last notice from relay
}

export interface NostrEvent {
  id?: string;
  kind: number;
  pubkey: string;
  created_at: number;
  tags: string[][];
  content: string;
  sig?: string;
}

export interface SignerInfo {
  remoteSignerPubkey?: string;
  relays?: string[];
  secret?: string; // NIP-46 secret
  canSign?: boolean;
  canDecrypt?: boolean;
}

export interface Message {
  id: string; // Nostr event ID
  content: string;
  isOutgoing: boolean;
  timestamp: number; // Milliseconds
  senderPkHex: string; // Pubkey of the sender
  recipientPkHex: string; // Pubkey of the recipient (for context in conversation)
  status?: 'sending' | 'sent' | 'failed'; // Optional: for optimistic updates
}

export interface Conversation {
  recipientPkHex: string;
  messages: Message[];
  lastMessageTimestamp: number; // Milliseconds, for sorting
  unreadCount: number;
  displayName: string; // npub1... or fetched profile name
}

export type ConversationsRecord = Record<string, Conversation>;
