import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";
import { Event as NostrEvent } from "nostr-tools";
import { useNostrStore, SignerType } from "./nostr";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStore } from "./settings";
import { sanitizeMessage, createFormattedTokenMessage, CASHU_TOKEN_START, CASHU_TOKEN_END } from "src/js/message-utils";
import { notifySuccess, notifyError } from "src/js/notify";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useBucketsStore } from './buckets';
import { useLockedTokensStore } from './lockedTokens';
import { useReceiveTokensStore } from './receiveTokensStore'; // Added for existing logic

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
      let privKey: string | undefined = undefined;
      if (
        nostr.signerType !== "NIP07" &&
        nostr.signerType !== "NIP46"
      ) {
        privKey = nostr.privKeyHex;
        if (!privKey) return { success: false, event: null } as any;
      }
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
    async sendToken(
      recipient: string,
      amount: number,
      bucketId: string,
      memo?: string,
    ) {
      try {
        const wallet = useWalletStore();
        const mints = useMintsStore();
        const proofsStore = useProofsStore();
        const settings = useSettingsStore();
        const tokens = useTokensStore();

        const sendAmount = Math.floor(
          amount * mints.activeUnitCurrencyMultiplyer,
        );

        const mintWallet = wallet.mintWallet(
          mints.activeMintUrl,
          mints.activeUnit,
        );
        const proofsForBucket = mints.activeProofs.filter(
          (p) => p.bucketId === bucketId,
        );

        const { sendProofs } = await wallet.send(
          proofsForBucket,
          mintWallet,
          sendAmount,
          true,
          settings.includeFeesInSendAmount,
          bucketId,
        );

        const tokenStr = proofsStore.serializeProofs(sendProofs);
        // const payload = {
        //   token: tokenStr,
        //   amount: sendAmount,
        //   unlockTime: null, // unlockTime is not a feature of regular tokens yet
        //   bucketId,
        //   referenceId: uuidv4(),
        // };

        const tokenData = {
          token: tokenStr,
          amount: sendAmount,
          memo: memo || "Cashu token", // Use provided memo or a default
          // unlockTime: undefined, // Not available here, createFormattedTokenMessage will handle undefined
        };

        const formattedMessage = createFormattedTokenMessage(tokenData);

        const { success, event } = await this.sendDm(recipient, formattedMessage);
        if (success) {
          // addOutgoingMessage is called within sendDm, so local history is updated there.
          // We still need to add the pending token to the token store for tracking.
          tokens.addPendingToken({
            amount: -sendAmount, // Negative amount for outgoing
            token: tokenStr,
            unit: mints.activeUnit,
            mint: mints.activeMintUrl,
            bucketId,
          });
        }
        return success;
      } catch (e) {
        console.error(e);
        notifyError("Failed to send token");
        return false;
      }
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
      let privKey: string | undefined = undefined;
      if (
        nostr.signerType !== SignerType.NIP07 &&
        nostr.signerType !== SignerType.NIP46
      ) {
        privKey = nostr.privKeyHex;
        if (!privKey) return;
      }
      const decrypted = await nostr.decryptNip04(
        privKey,
        event.pubkey,
        event.content
      );
      if (this.eventLog.some((m) => m.id === event.id)) return;

      // Check if the message is a formatted token message (for P2PK or regular)
      // The new formatted messages will be handled by ChatMessageBubble.vue for display and receive action.
      // P2PK tokens are already handled by the logic below if they are in the old JSON format.
      // This section needs to be aware of the new formatted messages for P2PKs that might arrive this way too.

      if (decrypted.includes(CASHU_TOKEN_START) && decrypted.includes(CASHU_TOKEN_END)) {
        // This is a formatted token message.
        // The ChatMessageBubble will handle parsing and the receive button.
        // For P2PK, the user would click "receive" and then it would go through `receiveTokensStore`
        // which then calls `walletStore.redeem` which has P2PK unlocking logic.
        // So, we just add it as a regular message.
        // The P2PK specific storage into `lockedTokensStore` directly from messenger was for *unsolicited* P2PK tokens.
        // Formatted messages imply user interaction to receive.
      } else {
        // Attempt to parse the decrypted message as an OLD JSON token payload (for backward compatibility or other systems)
        let isTokenPayload = false;
        let tokenString: string | undefined = undefined;
        try {
          const payload = JSON.parse(decrypted);
          if (payload && typeof payload.token === 'string') {
            tokenString = payload.token;
            isTokenPayload = true;
          }
        } catch (e) {
          // Not a JSON payload or doesn't fit the token structure, treat as regular message
        }

        if (isTokenPayload && tokenString) {
          const tokensStore = useTokensStore();
          const decodedToken = tokensStore.decodeToken(tokenString);

          if (decodedToken && decodedToken.token && decodedToken.token.length > 0 &&
              decodedToken.token[0].proofs && decodedToken.token[0].proofs.length > 0 &&
              decodedToken.token[0].proofs.some(proof => proof.secret.startsWith('P2PK:'))) {
            // This is a P2PK token (from old JSON format)
            const bucketsStore = useBucketsStore();
            const lockedTokensStore = useLockedTokensStore();
            const subscriptionsLabel = 'Subscriptions';
            let subscriptionsBucket = bucketsStore.getBucketByLabel(subscriptionsLabel);

            if (!subscriptionsBucket) {
              const newBucket = await bucketsStore.addBucket({ name: subscriptionsLabel });
              if (newBucket) {
                  subscriptionsBucket = newBucket;
              } else {
                  notifyError('Failed to create Subscriptions bucket.');
                  isTokenPayload = false; // Treat as regular message to avoid losing it
              }
            }

            if (subscriptionsBucket && isTokenPayload) { // check isTokenPayload again in case bucket creation failed
              await lockedTokensStore.addLockedToken({ token: tokenString, bucketId: subscriptionsBucket.id, mint: decodedToken.token[0].mint, amount: tokensStore.sumProofs(decodedToken.token[0].proofs) });
              notifySuccess(`P2PK token added to ${subscriptionsLabel} bucket.`);
              const p2pkMsgContent = `P2PK token for ${tokensStore.sumProofs(decodedToken.token[0].proofs)} sats received and stored in ${subscriptionsLabel}. (Legacy format)`;
              const p2pkMsg: MessengerMessage = {
                id: event.id, pubkey: event.pubkey, content: p2pkMsgContent, created_at: event.created_at, outgoing: false,
              };
              if (!this.conversations[event.pubkey]) this.conversations[event.pubkey] = [];
              if (!this.conversations[event.pubkey].some((m) => m.id === p2pkMsg.id))
                this.conversations[event.pubkey].push(p2pkMsg);
              this.unreadCounts[event.pubkey] = (this.unreadCounts[event.pubkey] || 0) + 1;
              this.eventLog.push(p2pkMsg);
              if (this.currentConversation !== event.pubkey) {
                notifySuccess(p2pkMsgContent.slice(0,40));
              }
              return;
            }
          }
        }
      }
      // Default message handling (if not a special P2PK JSON or if it's a formatted token)
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
      if (!this.conversations[event.pubkey].some((m) => m.id === msg.id))
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
      let privKey: string | undefined = undefined;
      if (
        nostr.signerType !== SignerType.NIP07 &&
        nostr.signerType !== SignerType.NIP46
      ) {
        privKey = nostr.privKeyHex;
        if (!privKey) {
          notifyError('No private key set. Please configure your Nostr identity.');
          return;
        }
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
      // Reconnect the nostr store with the updated relays
      nostr.connect(relays as any);
    },

    disconnect() {
      const nostr = useNostrStore();
      nostr.disconnect();
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
