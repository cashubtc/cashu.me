import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";
import { Event as NostrEvent } from "nostr-tools";
import { SignerType } from "./nostr";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStore } from "./settings";
import { DEFAULT_RELAYS } from "src/config/relays";
import { sanitizeMessage } from "src/js/message-utils";
import { notifySuccess, notifyError } from "src/js/notify";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useBucketsStore } from "./buckets";
import { useLockedTokensStore } from "./lockedTokens";
import { useNostrStore } from "./nostr";
import { cashuDb, type LockedToken } from "./dexie";
import { DEFAULT_BUCKET_ID } from "./buckets";
import token from "src/js/token";

function parseSubscriptionPaymentPayload(
  obj: any,
): { token: string; unlock_time?: number } | undefined {
  if (obj?.type !== "cashu_subscription_payment" || !obj.token) return;
  return { token: obj.token, unlock_time: obj.unlock_time };
}

export interface SubscriptionPayment {
  token: string;
  subscription_id: string;
  tier_id: string;
  month_index: number;
  total_months: number;
  amount: number;
  unlock_time?: number;
}

export type MessengerMessage = {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  outgoing: boolean;
  subscriptionPayment?: SubscriptionPayment;
  autoRedeem?: boolean;
};

export const useMessengerStore = defineStore("messenger", {
  state: () => {
    const settings = useSettingsStore();
    if (!Array.isArray(settings.defaultNostrRelays?.value)) {
      settings.defaultNostrRelays.value = DEFAULT_RELAYS;
    }
    const userRelays = Array.isArray(settings.defaultNostrRelays?.value)
      ? settings.defaultNostrRelays.value
      : [];
    const relays = userRelays.length ? userRelays : DEFAULT_RELAYS;
    return {
      relays,
      conversations: useLocalStorage<Record<string, MessengerMessage[]>>(
        "cashu.messenger.conversations",
        {} as Record<string, MessengerMessage[]>,
      ),
      unreadCounts: useLocalStorage<Record<string, number>>(
        "cashu.messenger.unread",
        {} as Record<string, number>,
      ),
      pinned: useLocalStorage<Record<string, boolean>>(
        "cashu.messenger.pinned",
        {} as Record<string, boolean>,
      ),
      eventLog: useLocalStorage<MessengerMessage[]>(
        "cashu.messenger.eventLog",
        [] as MessengerMessage[],
      ),
      currentConversation: "",
      drawerOpen: useLocalStorage<boolean>("cashu.messenger.drawerOpen", true),
      started: false,
      watchInitialized: false,
    };
  },
  getters: {
    connected(): boolean {
      const nostr = useNostrStore();
      return nostr.connected;
    },
  },
  actions: {
    normalizeKey(pk: string): string {
      return useNostrStore().resolvePubkey(pk);
    },
    normalizeStoredConversations() {
      // normalize conversation keys and merge duplicates
      for (const key of Object.keys(this.conversations)) {
        const normalized = this.normalizeKey(key);
        const msgs = this.conversations[key];
        if (!msgs) continue;
        if (!this.conversations[normalized]) this.conversations[normalized] = [];
        for (const msg of msgs) {
          msg.pubkey = normalized;
          if (!this.conversations[normalized].some((m) => m.id === msg.id)) {
            this.conversations[normalized].push(msg);
          }
        }
        if (normalized !== key) delete this.conversations[key];
      }

      for (const key of Object.keys(this.unreadCounts)) {
        const normalized = this.normalizeKey(key);
        if (normalized !== key) {
          this.unreadCounts[normalized] =
            (this.unreadCounts[normalized] || 0) + this.unreadCounts[key];
          delete this.unreadCounts[key];
        }
      }

      for (const key of Object.keys(this.pinned)) {
        const normalized = this.normalizeKey(key);
        if (normalized !== key) {
          this.pinned[normalized] = this.pinned[normalized] || this.pinned[key];
          delete this.pinned[key];
        }
      }

      // normalize event log entries
      this.eventLog.forEach((msg) => {
        msg.pubkey = this.normalizeKey(msg.pubkey);
      });
    },
    async loadIdentity() {
      const nostr = useNostrStore();
      try {
        await nostr.initSignerIfNotSet();
      } catch (e) {
        console.warn("[messenger] signer unavailable, continuing read-only", e);
      }
    },
    async sendDm(recipient: string, message: string, relays?: string[]) {
      recipient = this.normalizeKey(recipient);
      await this.loadIdentity();
      const nostr = useNostrStore();
      let privKey: string | undefined = undefined;
      if (nostr.signerType !== "NIP07" && nostr.signerType !== "NIP46") {
        privKey = nostr.privKeyHex;
        if (!privKey) return { success: false, event: null } as any;
      }

      const list = relays && relays.length ? relays : (this.relays as any);
      for (const r of list) {
        try {
          const { success, event } = await nostr.sendNip04DirectMessage(
            recipient,
            message,
            privKey,
            nostr.pubkey,
            [r],
          );
          if (success && event) {
            this.addOutgoingMessage(
              recipient,
              message,
              event.created_at,
              event.id,
            );
            return { success: true, event } as any;
          }
          console.warn(`[messenger.sendDm] failed via ${r}`);
        } catch (e) {
          console.error(`[messenger.sendDm] relay ${r}`, e);
        }
      }
      return { success: false } as any;
    },
    async sendToken(
      recipient: string,
      amount: number,
      bucketId: string,
      memo?: string,
      subscription?: {
        subscription_id: string;
        tier_id: string;
        month_index: number;
        total_months: number;
      },
    ) {
      try {
        recipient = this.normalizeKey(recipient);
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
        const payload = subscription
          ? {
              type: "cashu_subscription_payment",
              subscription_id: subscription.subscription_id,
              tier_id: subscription.tier_id,
              month_index: subscription.month_index,
              total_months: subscription.total_months,
              token: tokenStr,
            }
          : {
              token: tokenStr,
              amount: sendAmount,
              unlockTime: null,
              bucketId,
              referenceId: uuidv4(),
            };

        const { success, event } = await this.sendDm(
          recipient,
          JSON.stringify(payload),
        );
        if (success && event) {
          if (subscription) {
            const msg = this.conversations[recipient]?.find(
              (m) => m.id === event.id,
            );
            const logMsg = this.eventLog.find((m) => m.id === event.id);
            const payment: SubscriptionPayment = {
              token: tokenStr,
              subscription_id: subscription.subscription_id,
              tier_id: subscription.tier_id,
              month_index: subscription.month_index,
              total_months: subscription.total_months,
              amount: sendAmount,
            };
            if (msg) msg.subscriptionPayment = payment;
            if (logMsg) logMsg.subscriptionPayment = payment;
          }
          tokens.addPendingToken({
            amount: -sendAmount,
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
      id?: string,
    ) {
      pubkey = this.normalizeKey(pubkey);
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

    pushOwnMessage(event: NostrEvent) {
      const msg = this.eventLog.find((m) => m.id === event.id);
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content);
        const sub = parseSubscriptionPaymentPayload(payload);
        if (sub) {
          const decoded = token.decode(sub.token);
          const amount = decoded
            ? token.getProofs(decoded).reduce((s, p) => s + p.amount, 0)
            : 0;
          msg.subscriptionPayment = {
            token: sub.token,
            subscription_id: payload.subscription_id,
            tier_id: payload.tier_id,
            month_index: payload.month_index,
            total_months: payload.total_months,
            amount,
            unlock_time: sub.unlock_time,
          };
        }
      } catch {}
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
        event.content,
      );
      let subscriptionInfo: SubscriptionPayment | undefined;
      const lines = decrypted.split("\n").filter((l) => l.trim().length > 0);
      for (const line of lines) {
        let payload: any;
        try {
          payload = JSON.parse(line);
        } catch (e) {
          console.warn("[messenger.addIncomingMessage] invalid JSON", e);
          continue;
        }
        const sub = parseSubscriptionPaymentPayload(payload);
        if (sub) {
          const decoded = token.decode(sub.token);
          const amount = decoded
            ? token.getProofs(decoded).reduce((s, p) => s + p.amount, 0)
            : 0;
          subscriptionInfo = {
            token: sub.token,
            subscription_id: payload.subscription_id,
            tier_id: payload.tier_id,
            month_index: payload.month_index,
            total_months: payload.total_months,
            amount,
            unlock_time: sub.unlock_time,
          };
          const unlockTs = sub.unlock_time ?? payload.unlockTime ?? 0;
          const entry: LockedToken = {
            id: uuidv4(),
            tokenString: sub.token,
            amount,
            owner: "creator",
            creatorNpub: useNostrStore().pubkey,
            subscriberNpub: event.pubkey,
            tierId: payload.tier_id ?? "",
            intervalKey: payload.subscription_id ?? "",
            unlockTs,
            autoRedeem: true,
            status:
              unlockTs && unlockTs > Math.floor(Date.now() / 1000)
                ? "pending"
                : "unlockable",
            subscriptionEventId: null,
            subscriptionId: payload.subscription_id,
            monthIndex: payload.month_index,
            totalMonths: payload.total_months,
            label: "Subscription payment",
          };
          await cashuDb.lockedTokens.put(entry);

          const receiveStore = useReceiveTokensStore();
          receiveStore.receiveData.tokensBase64 = sub.token;
          await receiveStore.enqueue(() =>
            receiveStore.receiveToken(sub.token, DEFAULT_BUCKET_ID),
          );
        } else if (payload && payload.type === "cashu_subscription_claimed") {
          const sub = await cashuDb.subscriptions.get(payload.subscription_id);
          const idx = sub?.intervals.findIndex(
            (i) => i.monthIndex === payload.month_index
          );
          if (sub && idx !== undefined && idx >= 0) {
            sub.intervals[idx].status = "claimed";
            await cashuDb.subscriptions.update(sub.id, {
              intervals: sub.intervals,
            });
            notifySuccess("Subscription payment claimed");
          }
        } else if (payload && payload.token) {
          const tokensStore = useTokensStore();
          const decoded = tokensStore.decodeToken(payload.token);
          if (decoded) {
            const proofs = token.getProofs(decoded);
            if (proofs.some((p) => p.secret.startsWith("P2PK:"))) {
              const buckets = useBucketsStore();
              let bucket = buckets.bucketList.find(
                (b) => b.name === "Subscriptions",
              );
              if (!bucket) {
                bucket = buckets.addBucket({ name: "Subscriptions" });
              }
              if (bucket) {
                const amount =
                  payload.amount !== undefined
                    ? payload.amount
                    : proofs.reduce((s, p) => s + p.amount, 0);
                useLockedTokensStore().addLockedToken({
                  amount,
                  token: payload.token,
                  pubkey: event.pubkey,
                  locktime:
                    payload.unlock_time ?? payload.unlockTime,
                  bucketId: bucket.id,
                });
              }
              // don't auto-receive locked tokens
            } else {
              const receiveStore = useReceiveTokensStore();
              receiveStore.receiveData.tokensBase64 = payload.token;
              receiveStore.receiveData.bucketId =
                payload.bucketId ?? receiveStore.receiveData.bucketId;
              await receiveStore.enqueue(() =>
                receiveStore.receiveToken(
                  payload.token,
                  receiveStore.receiveData.bucketId,
                ),
              );
            }
          }
        }
      }
      if (this.eventLog.some((m) => m.id === event.id)) return;
      const msg: MessengerMessage = {
        id: event.id,
        pubkey: event.pubkey,
        content: sanitizeMessage(decrypted),
        created_at: event.created_at,
        outgoing: false,
      };
      if (subscriptionInfo) {
        msg.subscriptionPayment = subscriptionInfo;
        msg.autoRedeem = true;
      }
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
      this.normalizeStoredConversations();
      if (!this.watchInitialized) {
        watch(
          () => [useNostrStore().pubkey, this.relays],
          () => {
            if (this.started) {
              this.started = false;
              this.start();
            }
          },
          { deep: true },
        );
        this.watchInitialized = true;
      }
      if (this.started) {
        return;
      }
      try {
        await this.loadIdentity();
        const nostr = useNostrStore();
        let privKey: string | undefined = undefined;
        if (
          nostr.signerType !== SignerType.NIP07 &&
          nostr.signerType !== SignerType.NIP46
        ) {
          privKey = nostr.privKeyHex;
          if (!privKey) {
            console.warn(
              "[messenger] no private key set, running in read-only mode",
            );
          }
        }
        const since = this.eventLog.reduce(
          (max, m) => (m.created_at > max ? m.created_at : max),
          0,
        );
        await nostr.subscribeToNip04DirectMessagesCallback(
          privKey,
          nostr.pubkey,
          async (ev, _decrypted) => {
            await this.addIncomingMessage(ev as NostrEvent);
          },
          since,
        );
      } catch (e) {
        console.error("[messenger.start]", e);
      } finally {
        this.started = true;
      }
    },

    isConnected(): boolean {
      const nostr = useNostrStore();
      return nostr.connected;
    },

    async connect(relays: string[]) {
      const nostr = useNostrStore();
      this.relays = relays as any;
      // Reconnect the nostr store with the updated relays
      await nostr.connect(relays as any);
    },

    removeRelay(relay: string) {
      this.relays = (this.relays as any).filter((r: string) => r !== relay);
      const nostr = useNostrStore();
      nostr.connect(this.relays as any);
    },

    disconnect() {
      const nostr = useNostrStore();
      nostr.disconnect();
    },

    createConversation(pubkey: string) {
      pubkey = this.normalizeKey(pubkey);
      if (!this.conversations[pubkey]) {
        this.conversations[pubkey] = [];
      }
      if (this.unreadCounts[pubkey] === undefined) {
        this.unreadCounts[pubkey] = 0;
      }
    },

    startChat(pubkey: string) {
      pubkey = this.normalizeKey(pubkey);
      this.createConversation(pubkey);
      this.markRead(pubkey);
      this.setCurrentConversation(pubkey);
    },

    markRead(pubkey: string) {
      pubkey = this.normalizeKey(pubkey);
      this.unreadCounts[pubkey] = 0;
    },

    togglePin(pubkey: string) {
      pubkey = this.normalizeKey(pubkey);
      this.pinned[pubkey] = !this.pinned[pubkey];
    },

    setCurrentConversation(pubkey: string) {
      if (!pubkey) {
        this.currentConversation = "";
        return;
      }
      this.currentConversation = this.normalizeKey(pubkey);
    },

    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
    },

    setDrawer(open: boolean) {
      this.drawerOpen = open;
    },
  },
});
