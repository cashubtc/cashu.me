import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  generateSecretKey,
  getPublicKey,
  SimplePool,
  nip04,
  getEventHash,
  signEvent,
  Event as NostrEvent,
} from "nostr-tools";
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
    pool: {} as SimplePool,
    conversations: useLocalStorage<Record<string, MessengerMessage[]>>(
      "cashu.messenger.conversations",
      {} as Record<string, MessengerMessage[]>,
    ),
    connected: false,
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
    connectRelays() {
      if (this.connected) return;
      this.pool = new SimplePool();
      this.connected = true;
    },
    async sendDm(recipient: string, message: string) {
      this.loadIdentity();
      this.connectRelays();
      const encrypted = await nip04.encrypt(this.privKey, recipient, message);
      const event: NostrEvent = {
        kind: 4,
        pubkey: this.pubKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", recipient]],
        content: encrypted,
        id: "",
        sig: "",
      };
      event.id = getEventHash(event);
      event.sig = signEvent(event, this.privKey);
      await this.pool.publish(this.relays, event);
      this.addOutgoingMessage(recipient, message, event.created_at, event.id);
      return event;
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
      const decrypted = await nip04.decrypt(
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

