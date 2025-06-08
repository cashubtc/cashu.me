import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";
import { Event as NostrEvent } from "nostr-tools";
import { useNostrStore } from "./nostr";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStore } from "./settings";
import { sanitizeMessage } from "src/js/message-utils";
import { notifySuccess, notifyError } from "src/js/notify";

export type MessengerMessage = {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  outgoing: boolean;
};

export const useMessengerStore = defineStore("messenger", {
  state: () => ({
    relays: useSettingsStore().defaultNostrRelays,
    conversations: useLocalStorage<Record<string, MessengerMessage[]>>(
      "cashu.messenger.conversations",
      {} as Record<string, MessengerMessage[]>
    ),
    unreadCounts: useLocalStorage<Record<string, number>>(
      "cashu.messenger.unread",
      {} as Record<string, number>
    ),
    eventLog: useLocalStorage<MessengerMessage[]>(
      "cashu.messenger.eventLog",
      [] as MessengerMessage[]
    ),
    currentConversation: "",
    drawerOpen: useLocalStorage<boolean>("cashu.messenger.drawerOpen", true),
    started: false,
    watchInitialized: false,
  }),
  getters: {
    connected(): boolean {
      const nostr = useNostrStore();
      return nostr.connected;
    },
  },
  actions: {
    async loadIdentity() {
      const nostr = useNostrStore();
      await nostr.initSignerIfNotSet();
    },
    async sendDm(recipient: string, message: string) {
      await this.loadIdentity();
      const nostr = useNostrStore();
      const privKey = nostr.privKeyHex;
      if (!privKey) return { success: false, event: null } as any;
      const { success, event } = await nostr.sendNip04DirectMessage(
        recipient,
        message,
        privKey,
        nostr.pubkey
      );
      if (success && event) {
        this.addOutgoingMessage(recipient, message, event.created_at, event.id);
      }
      return { success, event } as any;
    },
    addOutgoingMessage(
      pubkey: string,
      content: string,
      created_at?: number,
      id?: string
    ) {
      const messageId = id || uuidv4();
      if (this.eventLog.some((m) => m.id === messageId)) return;
      const msg: MessengerMessage = {
        id: messageId,
        pubkey,
        content: sanitizeMessage(content),
        created_at: created_at ?? Math.floor(Date.now() / 1000),
        outgoing: true,
      };
      if (!this.conversations[pubkey]) this.conversations[pubkey] = [];
      if (!this.conversations[pubkey].some((m) => m.id === messageId))
        this.conversations[pubkey].push(msg);
      this.eventLog.push(msg);
    },
    async addIncomingMessage(event: NostrEvent) {
      await this.loadIdentity();
      const nostr = useNostrStore();
      const privKey = nostr.privKeyHex;
      if (!privKey) return;
      const decrypted = await nostr.decryptNip04(
        privKey,
        event.pubkey,
        event.content
      );
      if (this.eventLog.some((m) => m.id === event.id)) return;
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
      if (!this.conversations[event.pubkey].some((m) => m.id === event.id))
        this.conversations[event.pubkey].push(msg);
      this.unreadCounts[event.pubkey] =
        (this.unreadCounts[event.pubkey] || 0) + 1;
      this.eventLog.push(msg);
      if (this.currentConversation !== event.pubkey) {
        const snippet = msg.content.slice(0, 40);
        notifySuccess(snippet);
      }
    },

    async start() {
      if (!this.watchInitialized) {
        watch(
          () => [useNostrStore().pubkey, this.relays],
          () => {
            if (this.started) {
              this.started = false;
              this.start();
            }
          },
          { deep: true }
        );
        this.watchInitialized = true;
      }
      if (this.started) {
        return;
      }
      await this.loadIdentity();
      const nostr = useNostrStore();
      const privKey = nostr.privKeyHex;
      if (!privKey) {
        notifyError('No private key set. Please configure your Nostr identity.');
        return;
      }
      const since = this.eventLog.reduce(
        (max, m) => (m.created_at > max ? m.created_at : max),
        0
      );
      await nostr.subscribeToNip04DirectMessagesCallback(
        privKey,
        nostr.pubkey,
        async (ev, _decrypted) => {
          await this.addIncomingMessage(ev as NostrEvent);
        },
        since
      );
      this.started = true;
    },

    isConnected(): boolean {
      const nostr = useNostrStore();
      return nostr.connected;
    },

    connect(relays: string[]) {
      const nostr = useNostrStore();
      this.relays = relays as any;
      nostr.relays = relays as any;
      nostr.initNdkReadOnly();
    },

    disconnect() {
      const nostr = useNostrStore();
      if (nostr.ndk && (nostr.ndk as any).pool) {
        for (const relay of (nostr.ndk as any).pool.relays.values()) {
          relay.disconnect && relay.disconnect();
        }
      }
      nostr.connected = false;
    },

    createConversation(pubkey: string) {
      if (!this.conversations[pubkey]) {
        this.conversations[pubkey] = [];
      }
      if (this.unreadCounts[pubkey] === undefined) {
        this.unreadCounts[pubkey] = 0;
      }
    },

    markRead(pubkey: string) {
      this.unreadCounts[pubkey] = 0;
    },

    setCurrentConversation(pubkey: string) {
      this.currentConversation = pubkey;
    },

    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
    },

    setDrawer(open: boolean) {
      this.drawerOpen = open;
    },
  },
});
