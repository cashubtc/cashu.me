import { defineStore } from 'pinia';
import { nip19 } from 'nostr-tools';
import { Conversation, Message, ConversationsRecord, NostrEvent } from './types';
import { useNostrStore } from './nostrStore';

export const useDmChatsStore = defineStore('dmChats', {
  state: () => ({
    conversations: {} as ConversationsRecord,
    activeChatRecipientPkHex: null as string | null,
    processedEventIds: new Set<string>(),
  }),

  getters: {
    sortedConversationsList(state): Conversation[] {
      return Object.values(state.conversations)
        .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    },
    activeChatMessages(state): Message[] {
      if (!state.activeChatRecipientPkHex || !state.conversations[state.activeChatRecipientPkHex]) {
        return [];
      }
      return state.conversations[state.activeChatRecipientPkHex].messages;
    },
    activeChatDisplayName(state): string | null {
      if (!state.activeChatRecipientPkHex || !state.conversations[state.activeChatRecipientPkHex]) {
        return null;
      }
      return state.conversations[state.activeChatRecipientPkHex].displayName;
    },
  },

  actions: {
    hasProcessedEvent(eventId: string): boolean {
      return this.processedEventIds.has(eventId);
    },
    markEventAsProcessed(eventId: string) {
      this.processedEventIds.add(eventId);
      if (this.processedEventIds.size > 1000) {
          const oldest = Array.from(this.processedEventIds).slice(0, 200);
          oldest.forEach(id => this.processedEventIds.delete(id));
      }
    },
    _ensureConversationExists(recipientPkHex: string) {
      if (!this.conversations[recipientPkHex]) {
        this.conversations[recipientPkHex] = {
          recipientPkHex: recipientPkHex,
          messages: [],
          lastMessageTimestamp: Date.now(),
          unreadCount: 0,
          displayName: nip19.npubEncode(recipientPkHex).substring(0, 12) + '...',
        };
      }
    },

    addReceivedMessage(payload: {
      nostrEvent: NostrEvent;
      decryptedContent: string;
      otherPartyPkHex: string;
      isEchoOfSent?: boolean;
    }) {
      const { nostrEvent, decryptedContent, otherPartyPkHex } = payload;
      if (!nostrEvent.id || this.hasProcessedEvent(nostrEvent.id)) return;

      this._ensureConversationExists(otherPartyPkHex);
      const convo = this.conversations[otherPartyPkHex];

      if (convo.messages.some(m => m.id === nostrEvent.id)) {
        this.markEventAsProcessed(nostrEvent.id);
        return;
      }

      const nostrStore = useNostrStore();

      const newMessage: Message = {
        id: nostrEvent.id!,
        content: decryptedContent,
        isOutgoing: nostrEvent.pubkey === nostrStore.pk,
        timestamp: nostrEvent.created_at * 1000,
        senderPkHex: nostrEvent.pubkey,
        recipientPkHex: otherPartyPkHex,
      };

      convo.messages.push(newMessage);
      convo.messages.sort((a, b) => a.timestamp - b.timestamp);
      convo.lastMessageTimestamp = newMessage.timestamp;

      if (!newMessage.isOutgoing && this.activeChatRecipientPkHex !== otherPartyPkHex) {
        convo.unreadCount = (convo.unreadCount || 0) + 1;
      }
      this.markEventAsProcessed(nostrEvent.id);
    },
    
    addEncryptedMessagePlaceholder(nostrEvent: NostrEvent, otherPartyPkHex: string, reason: string = "Cannot decrypt in signer mode.") {
        if (!nostrEvent.id || this.hasProcessedEvent(nostrEvent.id)) return;
        this._ensureConversationExists(otherPartyPkHex);
        const convo = this.conversations[otherPartyPkHex];
        if (convo.messages.some(m => m.id === nostrEvent.id)) {
            this.markEventAsProcessed(nostrEvent.id);
            return;
        }
        const nostrStore = useNostrStore();
        const newMessage: Message = {
            id: nostrEvent.id!,
            content: `[Encrypted Message - ${reason}] Original content: ${nostrEvent.content.substring(0,50)}...`,
            isOutgoing: nostrEvent.pubkey === nostrStore.pk,
            timestamp: nostrEvent.created_at * 1000,
            senderPkHex: nostrEvent.pubkey,
            recipientPkHex: otherPartyPkHex,
        };
        convo.messages.push(newMessage);
        convo.messages.sort((a, b) => a.timestamp - b.timestamp);
        convo.lastMessageTimestamp = newMessage.timestamp;
        if (!newMessage.isOutgoing && this.activeChatRecipientPkHex !== otherPartyPkHex) {
            convo.unreadCount = (convo.unreadCount || 0) + 1;
        }
        this.markEventAsProcessed(nostrEvent.id);
    },

    addOptimisticSentMessage(payload: { content: string; recipientPkHex: string }) {
      const { content, recipientPkHex } = payload;
      this._ensureConversationExists(recipientPkHex);
      const convo = this.conversations[recipientPkHex];
      const nostrStore = useNostrStore();

      const tempId = `temp-${Date.now()}-${Math.random().toString(16).substring(2)}`;
      const newMessage: Message = {
        id: tempId,
        content: content,
        isOutgoing: true,
        timestamp: Date.now(),
        senderPkHex: nostrStore.pk!,
        recipientPkHex: recipientPkHex,
        status: 'sending',
      };
      convo.messages.push(newMessage);
      convo.lastMessageTimestamp = newMessage.timestamp;
    },

    selectChat(recipientPkHex: string) {
      this._ensureConversationExists(recipientPkHex);
      this.activeChatRecipientPkHex = recipientPkHex;
      if (this.conversations[recipientPkHex]) {
        this.conversations[recipientPkHex].unreadCount = 0;
      }
    },

    startOrSelectConversation(recipientPkHex: string) {
      this._ensureConversationExists(recipientPkHex);
      this.selectChat(recipientPkHex);
    },

  },
});
