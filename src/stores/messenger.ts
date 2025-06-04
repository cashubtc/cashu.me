import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  generateSecretKey,
  getPublicKey,
  Event as NostrEvent,
} from "nostr-tools";
import { useNostrStore } from "./nostr";
import { bytesToHex } from "@noble/hashes/utils";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStore } from "./settings";
import { sanitizeMessage } from "src/js/message-utils";

export type MessengerMessage = {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  outgoing: boolean;
};

export const useMessengerStore = defineStore("messenger", {
  state: () => ({
    privKey: useLocalStorage<string>("cashu.messenger.privKey", ""),
    pubKey: useLocalStorage<string>("cashu.messenger.pubKey", ""),
    relays: useSettingsStore().defaultNostrRelays,
    conversations: useLocalStorage<Record<string, MessengerMessage[]>>(
      "cashu.messenger.conversations",
      {} as Record<string, MessengerMessage[]>,
    ),
  }),
  actions: {
    loadIdentity() {
      if (!this.privKey) {
        const sk = generateSecretKey();
        this.privKey = bytesToHex(sk);
        this.pubKey = getPublicKey(sk);
      } else if (!this.pubKey) {
        this.pubKey = getPublicKey(this.privKey);
      }
    },
    async sendDm(recipient: string, message: string) {
      this.loadIdentity();
      const nostr = useNostrStore();
      const ev = await nostr.sendNip04DirectMessage(
        recipient,
        message,
        this.privKey,
        this.pubKey,
      );
      if (ev) {
        this.addOutgoingMessage(recipient, message, ev.created_at, ev.id);
      }
      return ev as any;
    },
    addOutgoingMessage(
      pubkey: string,
      content: string,
      created_at?: number,
      id?: string,
    ) {
      const msg: MessengerMessage = {
        id: id || uuidv4(),
        pubkey,
        content: sanitizeMessage(content),
        created_at: created_at ?? Math.floor(Date.now() / 1000),
        outgoing: true,
      };
      if (!this.conversations[pubkey]) this.conversations[pubkey] = [];
      this.conversations[pubkey].push(msg);
    },
    async addIncomingMessage(event: NostrEvent) {
      this.loadIdentity();
      const nostr = useNostrStore();
      const decrypted = await nostr.decryptNip04(
        this.privKey,
        event.pubkey,
        event.content,
      );
      const msg: MessengerMessage = {
        id: event.id,
        pubkey: event.pubkey,
        content: sanitizeMessage(decrypted),
        created_at: event.created_at,
        outgoing: false,
      };
      if (!this.conversations[event.pubkey]) {
        this.conversations[event.pubkey] = [];
      }
      this.conversations[event.pubkey].push(msg);
    },
  },
});

