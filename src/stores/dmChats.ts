import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { STORAGE_KEYS } from "../js/storageKeys";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { sanitizeMessage } from "../js/message-utils";

export type DMMessage = {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  outgoing: boolean;
};

export const useDmChatsStore = defineStore("dmChats", {
  state: () => ({
    chats: useLocalStorage<Record<string, DMMessage[]>>(
      STORAGE_KEYS.DM_CHATS,
      {} as Record<string, DMMessage[]>
    ),
    unreadCounts: useLocalStorage<Record<string, number>>(
      STORAGE_KEYS.DM_CHATS_UNREAD,
      {} as Record<string, number>
    ),
  }),
  actions: {
    loadChats() {
      const stored = localStorage.getItem(STORAGE_KEYS.DM_CHATS);
      if (stored) {
        try {
          this.chats = JSON.parse(stored);
        } catch {}
      }
      const storedUnread = localStorage.getItem(STORAGE_KEYS.DM_CHATS_UNREAD);
      if (storedUnread) {
        try {
          this.unreadCounts = JSON.parse(storedUnread);
        } catch {}
      }
    },
    addIncoming(event: NDKEvent) {
      const msg: DMMessage = {
        id: event.id,
        pubkey: event.pubkey,
        content: sanitizeMessage(event.content),
        created_at: event.created_at,
        outgoing: false,
      };
      if (!this.chats[event.pubkey]) {
        this.chats[event.pubkey] = [];
      }
      this.chats[event.pubkey].push(msg);
      this.unreadCounts[event.pubkey] =
        (this.unreadCounts[event.pubkey] || 0) + 1;
    },
    addOutgoing(event: NDKEvent) {
      const recipientTag = event.tags?.find((t) => t[0] === "p");
      const recipient = recipientTag ? (recipientTag[1] as string) : "";
      const msg: DMMessage = {
        id: event.id,
        pubkey: recipient,
        content: sanitizeMessage(event.content),
        created_at: event.created_at,
        outgoing: true,
      };
      if (!this.chats[recipient]) {
        this.chats[recipient] = [];
      }
      this.chats[recipient].push(msg);
    },
    markChatRead(pubkey: string) {
      this.unreadCounts[pubkey] = 0;
    },
  },
});
