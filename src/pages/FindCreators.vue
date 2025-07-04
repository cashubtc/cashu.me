<template>
  <div class="find-creators-wrapper">
    <iframe
      ref="iframeEl"
      src="/find-creators.html"
      class="find-creators-frame"
      title="Find Creators"
    />
    <DonateDialog v-model="showDonateDialog" @confirm="handleDonate" />
    <SubscribeDialog
      v-model="showSubscribeDialog"
      :tier="selectedTier"
      :supporter-pubkey="nostr.pubkey"
      :creator-pubkey="dialogPubkey.value"
      @confirm="confirmSubscribe"
    />
    <SubscriptionReceipt v-model="showReceiptDialog" :receipts="receiptList" />
    <SendTokenDialog />
    <QDialog v-model="showTierDialog">
      <QCard class="tier-dialog">
        <QCardSection class="row items-center justify-between">
          <div class="text-h6">Subscription Tiers</div>
          <QBtn dense flat icon="close" @click="showTierDialog = false" />
        </QCardSection>
        <QSeparator />
        <QCardSection>
          <div v-if="loadingTiers" class="row justify-center q-pa-md">
            <q-spinner-hourglass />
          </div>
          <div v-else-if="!tiers.length" class="text-center">
            Creator has no subscription tiers
            <div class="q-mt-md">
              <q-btn flat color="primary" @click="retryFetchTiers">Retry</q-btn>
            </div>
          </div>
          <div v-else>
            <QCard
              v-for="t in tiers"
              :key="t.id"
              flat
              bordered
              class="q-mb-md tier-card"
            >
              <QCardSection>
                <div class="row items-center justify-between">
                  <div class="text-subtitle1">{{ t.name }}</div>
                  <div class="text-subtitle2 text-primary">
                    {{ getPrice(t) }} sats/month
                  </div>
                </div>
                <div class="q-mt-sm">{{ t.description }}</div>
                <ul class="q-pl-md q-mt-xs text-caption">
                  <li v-for="b in t.benefits" :key="b">{{ b }}</li>
                </ul>
              </QCardSection>
              <QCardActions align="right" class="subscribe-container">
                <QBtn
                  label="Subscribe"
                  color="primary"
                  class="subscribe-btn"
                  @click="openSubscribe(t)"
                />
              </QCardActions>
            </QCard>
          </div>
        </QCardSection>
      </QCard>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import DonateDialog from "components/DonateDialog.vue";
import SubscribeDialog from "components/SubscribeDialog.vue";
import SubscriptionReceipt from "components/SubscriptionReceipt.vue";
import SendTokenDialog from "components/SendTokenDialog.vue";
import { useSendTokensStore } from "stores/sendTokensStore";
import { useDonationPresetsStore } from "stores/donationPresets";
import { useCreatorsStore } from "stores/creators";
import { useNostrStore, fetchNutzapProfile } from "stores/nostr";
import { notifyError, notifySuccess, notifyWarning } from "src/js/notify";
import { useNutzapStore } from "stores/nutzap";
import { useI18n } from "vue-i18n";
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QSeparator,
  Loading,
} from "quasar";
import { nip19 } from "nostr-tools";

const iframeEl = ref<HTMLIFrameElement | null>(null);
const showDonateDialog = ref(false);
const selectedPubkey = ref("");
const showTierDialog = ref(false);
const loadingTiers = ref(false);
const dialogPubkey = ref("");

const sendTokensStore = useSendTokensStore();
const donationStore = useDonationPresetsStore();
const creators = useCreatorsStore();
const nostr = useNostrStore();
const nutzap = useNutzapStore();
const { t } = useI18n();
const tiers = computed(() => creators.tiersMap[dialogPubkey.value] || []);
const showSubscribeDialog = ref(false);
const showReceiptDialog = ref(false);
const receiptList = ref<any[]>([]);
const selectedTier = ref<any>(null);
let tierTimeout: ReturnType<typeof setTimeout> | null = null;

function getPrice(t: any): number {
  return t.price_sats ?? t.price ?? 0;
}

function bech32ToHex(pubkey: string): string {
  try {
    const decoded = nip19.decode(pubkey);
    return typeof decoded.data === "string" ? decoded.data : pubkey;
  } catch {
    return pubkey;
  }
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2,
  )}`;
}

async function onMessage(ev: MessageEvent) {
  if (ev.data && ev.data.type === "donate" && ev.data.pubkey) {
    selectedPubkey.value = ev.data.pubkey;
    showDonateDialog.value = true;
  } else if (ev.data && ev.data.type === "viewProfile" && ev.data.pubkey) {
    loadingTiers.value = true;
    if (tierTimeout) clearTimeout(tierTimeout);
    tierTimeout = setTimeout(() => {
      loadingTiers.value = false;
    }, 5000);
    await creators.fetchTierDefinitions(ev.data.pubkey);
    dialogPubkey.value = ev.data.pubkey;
    await nextTick();
    showTierDialog.value = true;
  }
}

watch(tiers, (val) => {
  if (val.length > 0) {
    loadingTiers.value = false;
    if (tierTimeout) clearTimeout(tierTimeout);
  }
});

function openSubscribe(tier: any) {
  selectedTier.value = tier;
  showSubscribeDialog.value = true;
}

function retryFetchTiers() {
  if (!dialogPubkey.value) return;
  loadingTiers.value = true;
  if (tierTimeout) clearTimeout(tierTimeout);
  tierTimeout = setTimeout(() => {
    loadingTiers.value = false;
  }, 5000);
  creators.fetchTierDefinitions(dialogPubkey.value);
}

async function confirmSubscribe({
  bucketId,
  months,
  amount,
  startDate,
  total,
}: any) {
  if (!dialogPubkey.value) return;
  Loading.show({ message: "Loading..." });
  try {
    const profile = await fetchNutzapProfile(dialogPubkey.value);
    if (!profile) {
      notifyError("Creator has not published a Nutzap profile (kind-10019)");
      return;
    }

    const receipts = (await nutzap.send({
      npub: dialogPubkey.value,
      months,
      amount,
      startDate,
    })) as any[];

    receiptList.value = receipts;
    showReceiptDialog.value = true;
    showSubscribeDialog.value = false;
    showTierDialog.value = false;
    notifySuccess(t("FindCreators.notifications.subscription_success"));
  } catch (e: any) {
    notifyError(e.message);
  } finally {
    Loading.hide();
  }
}

function handleDonate({
  bucketId,
  locked,
  type,
  amount,
  months,
  message,
}: any) {
  if (!selectedPubkey.value) return;
  if (type === "one-time") {
    sendTokensStore.clearSendData();
    sendTokensStore.recipientPubkey = selectedPubkey.value;
    sendTokensStore.sendViaNostr = true;
    sendTokensStore.sendData.bucketId = bucketId;
    sendTokensStore.sendData.amount = amount;
    sendTokensStore.sendData.memo = message;
    sendTokensStore.sendData.p2pkPubkey = locked ? selectedPubkey.value : "";
    sendTokensStore.showLockInput = locked;
    showDonateDialog.value = false;
    sendTokensStore.showSendTokens = true;
  } else {
    donationStore.createDonationPreset(
      months,
      amount,
      selectedPubkey.value,
      bucketId,
    );
    showDonateDialog.value = false;
  }
}

onMounted(async () => {
  await nostr.initSignerIfNotSet();
  window.addEventListener("message", onMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
  if (tierTimeout) clearTimeout(tierTimeout);
});
</script>

<style scoped>
.find-creators-wrapper {
  height: 100vh;
  padding: 0;
  margin: 0;
}

.find-creators-frame {
  border: none;
  width: 100%;
  height: 100%;
}

.tier-dialog {
  width: 100%;
  max-width: 500px;
}

.tier-card .subscribe-btn {
  display: none;
}

.tier-card:hover .subscribe-btn {
  display: inline-flex;
}
</style>
