<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md',
    ]"
  >
    <div class="q-mb-md">
      <q-btn flat color="primary" to="/find-creators">{{
        $t("CreatorHub.profile.back")
      }}</q-btn>
    </div>
    <div class="text-h5 q-mb-md">{{ profile.display_name || creatorNpub }}</div>
    <div v-if="profile.picture" class="q-mb-md">
      <img :src="profile.picture" style="max-width: 150px" />
    </div>
    <div v-if="profile.about" class="q-mb-md">{{ profile.about }}</div>
    <SubscribeDialog
      v-model="showSubscribeDialog"
      :tier="selectedTier"
      :supporter-pubkey="nostr.pubkey"
      :creator-pubkey="creatorNpub"
      @confirm="confirmSubscribe"
    />
    <SubscriptionReceipt v-model="showReceiptDialog" :receipts="receiptList" />
    <div v-if="followers !== null" class="text-caption q-mb-md">
      {{ $t("FindCreators.labels.followers") }}: {{ followers }} |
      {{ $t("FindCreators.labels.following") }}: {{ following }}
    </div>

    <div>
      <div class="text-h6 q-mb-sm">{{ $t("CreatorHub.profile.tiers") }}</div>
      <div v-if="!tiers.length" class="text-body1 q-mb-md">
        Creator has no subscription tiers
      </div>
      <div v-else>
        <q-card
          v-for="t in tiers"
          :key="t.id"
          flat
          bordered
          class="q-mb-md tier-card"
        >
          <q-card-section class="row items-center justify-between bg-grey-2">
            <div class="text-subtitle1">{{ t.name }}</div>
            <div class="text-subtitle2">
              {{ getPrice(t) }} sats/month
              <span v-if="priceStore.bitcoinPrice">
                ({{ formatFiat(getPrice(t)) }})
              </span>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-body1 q-mb-sm">{{ t.description }}</div>
            <ul class="q-pl-md q-mb-none">
              <li v-for="benefit in t.benefits" :key="benefit">
                {{ benefit }}
              </li>
            </ul>
            <div class="q-mt-md text-right subscribe-container">
              <q-btn
                label="Subscribe"
                color="primary"
                class="subscribe-btn"
                @click="openSubscribe(t)"
              />
            </div>
            <PaywalledContent
              :creator-npub="creatorNpub"
              :tier-id="t.id"
              class="q-mt-md"
            >
              <div>Protected content visible to subscribers.</div>
            </PaywalledContent>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useCreatorsStore } from "stores/creators";
import { useNostrStore } from "stores/nostr";
import { useDonationPresetsStore } from "stores/donationPresets";
import { useLockedTokensStore } from "stores/lockedTokens";
import { usePriceStore } from "stores/price";
import { useUiStore } from "stores/ui";
import SubscribeDialog from "components/SubscribeDialog.vue";
import SubscriptionReceipt from "components/SubscriptionReceipt.vue";
import { useMintsStore } from "stores/mints";
import { notifyError, notifySuccess, notifyWarning } from "src/js/notify";
import { useDmChatsStore } from "stores/dmChats";
import { useI18n } from "vue-i18n";
import { Loading } from "quasar";
import { renderMarkdown as renderMarkdownFn } from "src/js/simple-markdown";
import PaywalledContent from "components/PaywalledContent.vue";
import { receiptsToDmText } from "src/js/receipt-utils";

export default defineComponent({
  name: "PublicCreatorProfilePage",
  components: { PaywalledContent, SubscriptionReceipt },
  setup() {
    const route = useRoute();
    const creatorNpub = route.params.npub as string;
    const creators = useCreatorsStore();
    const nostr = useNostrStore();
    const donationStore = useDonationPresetsStore();
    const lockedStore = useLockedTokensStore();
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const mintsStore = useMintsStore();
    const { t } = useI18n();
    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);
    const profile = ref<any>({});
    const tiers = computed(() => creators.tiersMap[creatorNpub] || []);
    const showSubscribeDialog = ref(false);
    const showReceiptDialog = ref(false);
    const receiptList = ref<any[]>([]);
    const selectedTier = ref<any>(null);
    const followers = ref<number | null>(null);
    const following = ref<number | null>(null);
    onMounted(async () => {
      await creators.fetchTierDefinitions(creatorNpub);
      const p = await nostr.getProfile(creatorNpub);
      if (p) profile.value = { ...p };
      followers.value = await nostr.fetchFollowerCount(creatorNpub);
      following.value = await nostr.fetchFollowingCount(creatorNpub);
    });

    const openSubscribe = (tier: any) => {
      const info = mintsStore.activeInfo || {};
      const nuts = Array.isArray(info.nut_supports)
        ? info.nut_supports
        : Object.keys(info.nuts || {}).map((n) => Number(n));
      if (!(nuts.includes(10) && nuts.includes(11))) {
        notifyError(t("wallet.notifications.lock_not_supported"));
        return;
      }
      selectedTier.value = tier;
      showSubscribeDialog.value = true;
    };

    const formatTs = (ts: number) => {
      const d = new Date(ts * 1000);
      return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
    };

    const confirmSubscribe = async ({
      months,
      amount,
      startDate,
      total,
    }: any) => {
      Loading.show({ message: "Loading..." });
      try {
        const receipts = (await donationStore.createDonationPreset(
          months,
          amount,
          creatorNpub,
          undefined,
          startDate,
          true
        )) as any[];
        let supporterName = nostr.pubkey;
        try {
          const prof = await nostr.getProfile(nostr.pubkey);
          supporterName =
            prof?.display_name || prof?.name || prof?.username || nostr.pubkey;
        } catch {}
        const dmMessage = receiptsToDmText(receipts, supporterName);
        const { success, event } = await nostr.sendNip04DirectMessage(
          creatorNpub,
          dmMessage
        );
        if (success) {
          notifySuccess(t("FindCreators.notifications.subscription_success"));
          if (event) useDmChatsStore().addOutgoing(event);
        } else {
          notifyWarning(t("wallet.notifications.nostr_dm_failed"));
        }
        receiptList.value = receipts;
        showReceiptDialog.value = true;
        showSubscribeDialog.value = false;
      } catch (e: any) {
        notifyError(e.message);
      } finally {
        Loading.hide();
      }
    };
    function renderMarkdown(text: string): string {
      return renderMarkdownFn(text || "");
    }

    function formatFiat(sats: number): string {
      if (!priceStore.bitcoinPrice) return "";
      const value = (priceStore.bitcoinPrice / 100000000) * sats;
      return uiStore.formatCurrency(value, "USD", true);
    }

    function getPrice(t: any): number {
      return t.price_sats ?? t.price ?? 0;
    }

    return {
      creatorNpub,
      profile,
      tiers,
      showSubscribeDialog,
      showReceiptDialog,
      receiptList,
      selectedTier,
      followers,
      following,
      bitcoinPrice,
      priceStore,
      renderMarkdown,
      formatFiat,
      getPrice,
      openSubscribe,
      confirmSubscribe,
    };
  },
});
</script>

<style scoped>
.tier-card .subscribe-btn {
  display: none;
}

.tier-card:hover .subscribe-btn {
  display: inline-flex;
}
</style>
