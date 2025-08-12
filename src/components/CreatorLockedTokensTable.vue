<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <h6 class="q-mt-none q-mb-md">Creator Locked Tokens</h6>
    <div class="q-mb-sm" v-if="pendingTokens.length > 1">
      <q-btn flat dense color="primary" @click="redeemAll">{{
        $t("CreatorLockedTokensTable.redeem_all")
      }}</q-btn>
    </div>
    <q-list bordered>
      <q-item v-for="token in paginatedTokens" :key="token.id">
        <q-item-section avatar>
          <q-icon name="lock" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ formatCurrency(token.amount, activeUnit) }}
          </q-item-label>
          <q-item-label caption v-if="token.unlockTs">
            Unlock: {{ formatTs(token.unlockTs) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge
            v-if="token.redeemed"
            color="positive"
            rounded
            class="q-mr-sm"
            ><q-icon name="check"
          /></q-badge>
          <q-btn
            flat
            dense
            icon="download"
            v-if="canRedeem(token) && !token.redeemed"
            @click="redeem(token)"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div v-if="paginatedTokens.length === 0" class="text-center q-mt-md">
      <q-item-label caption>No tokens</q-item-label>
    </div>
    <div v-else-if="maxPages > 1" class="text-center q-mt-lg">
      <div style="display: flex; justify-content: center">
        <q-pagination
          v-model="currentPage"
          :max="maxPages"
          :max-pages="5"
          direction-links
          boundary-links
        />
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useDexieLockedTokensStore } from "stores/lockedTokensDexie";
import { cashuDb } from "stores/dexie";
import { useMintsStore } from "stores/mints";
import { useReceiveTokensStore } from "stores/receiveTokensStore";
import { useWalletStore } from "stores/wallet";
import { useP2PKStore } from "stores/p2pk";
import { useNostrStore } from "stores/nostr";
import { useUiStore } from "stores/ui";

export default defineComponent({
  name: "CreatorLockedTokensTable",
  props: { bucketId: { type: String, required: true } },
  data() {
    return { currentPage: 1, pageSize: 5 };
  },
  computed: {
    ...mapState(useDexieLockedTokensStore, ["lockedTokens"]),
    ...mapState(useMintsStore, ["activeUnit"]),
    filteredTokens() {
      const nostrPubkey = useNostrStore().pubkey;
      return this.lockedTokens.filter(
        (t) =>
          t.owner === "creator" &&
          t.creatorNpub === nostrPubkey &&
          t.tierId === this.bucketId,
      );
    },
    maxPages() {
      return Math.ceil(this.filteredTokens.length / this.pageSize);
    },
    paginatedTokens() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTokens.slice().reverse().slice(start, end);
    },
    pendingTokens() {
      return this.filteredTokens.filter(
        (t) => !t.redeemed && this.canRedeem(t),
      );
    },
  },
  methods: {
    formattedDate(dateStr) {
      const date = parseISO(dateStr);
      return formatDistanceToNow(date, { addSuffix: false });
    },
    formatTs(ts) {
      const d = new Date(ts * 1000);
      return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
        "0" + d.getDate()
      ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${(
        "0" + d.getMinutes()
      ).slice(-2)}`;
    },
    formatCurrency(amount, unit) {
      return useUiStore().formatCurrency(amount, unit);
    },
    canRedeem(token) {
      const now = Math.floor(Date.now() / 1000);
      return !token.unlockTs || token.unlockTs <= now;
    },
    async redeem(token) {
      const receiveStore = useReceiveTokensStore();
      const wallet = useWalletStore();
      const p2pkStore = useP2PKStore();
      receiveStore.receiveData.tokensBase64 = token.tokenString;
      receiveStore.receiveData.bucketId = token.tierId;
      receiveStore.receiveData.p2pkPrivateKey =
        p2pkStore.getPrivateKeyForP2PKEncodedToken(token.tokenString);
      await cashuDb.lockedTokens.update(token.id, {
        status: "processing",
        redeemed: true,
      });
      await receiveStore.enqueue(() => wallet.receive(token.tokenString));
      await cashuDb.lockedTokens.update(token.id, { status: "claimed" });
      if (token.subscriptionId) {
        const sub = await cashuDb.subscriptions.get(token.subscriptionId);
        const idx = sub?.intervals.findIndex(
          (i) =>
            i.intervalKey === token.intervalKey || i.lockedTokenId === token.id,
        );
        if (sub && idx !== undefined && idx >= 0) {
          sub.intervals[idx].status = "claimed";
          sub.intervals[idx].redeemed = true;
          await cashuDb.subscriptions.update(sub.id, {
            intervals: sub.intervals,
          });
        }
      }
    },

    async redeemAll() {
      for (const t of this.pendingTokens) {
        await this.redeem(t);
      }
    },
  },
});
</script>
