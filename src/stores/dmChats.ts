import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

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
      "cashu.dmChats",
      {} as Record<string, DMMessage[]>
    ),
  }),
  actions: {
    loadChats() {
      const stored = localStorage.getItem("cashu.dmChats");
      if (stored) {
        try {
          this.chats = JSON.parse(stored);
        } catch {}
      }
    },
    addIncoming(event: NDKEvent) {
      const msg: DMMessage = {
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        created_at: event.created_at,
        outgoing: false,
      };
      if (!this.chats[event.pubkey]) {
        this.chats[event.pubkey] = [];
      }
      this.chats[event.pubkey].push(msg);
    },
    addOutgoing(event: NDKEvent) {
      const recipientTag = event.tags?.find((t) => t[0] === "p");
      const recipient = recipientTag ? (recipientTag[1] as string) : "";
      const msg: DMMessage = {
        id: event.id,
        pubkey: recipient,
        content: event.content,
        created_at: event.created_at,
        outgoing: true,
      };
      if (!this.chats[recipient]) {
        this.chats[recipient] = [];
      }
      this.chats[recipient].push(msg);
    },
  },
});
