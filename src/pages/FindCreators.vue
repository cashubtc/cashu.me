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
          <div v-if="!tiers.length" class="text-center">
            Creator has no subscription tiers
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import DonateDialog from "components/DonateDialog.vue";
import SubscribeDialog from "components/SubscribeDialog.vue";
import SubscriptionReceipt from "components/SubscriptionReceipt.vue";
import SendTokenDialog from "components/SendTokenDialog.vue";
import { useSendTokensStore } from "stores/sendTokensStore";
import { useDonationPresetsStore } from "stores/donationPresets";
import { useLockedTokensStore } from "stores/lockedTokens";
import { useCreatorsStore } from "stores/creators";
import { useNostrStore } from "stores/nostr";
import { useMintsStore } from "stores/mints";
import { notifyError, notifySuccess, notifyWarning } from "src/js/notify";
import { useDmChatsStore } from "stores/dmChats";
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
import { receiptsToDmText } from "src/js/receipt-utils";

const iframeEl = ref<HTMLIFrameElement | null>(null);
const showDonateDialog = ref(false);
const selectedPubkey = ref("");
const showTierDialog = ref(false);
const dialogPubkey = ref("");

const sendTokensStore = useSendTokensStore();
const donationStore = useDonationPresetsStore();
const lockedStore = useLockedTokensStore();
const creators = useCreatorsStore();
const nostr = useNostrStore();
const mintsStore = useMintsStore();
const { t } = useI18n();
const tiers = computed(() => creators.tiersMap[dialogPubkey.value] || []);
const showSubscribeDialog = ref(false);
const showReceiptDialog = ref(false);
const receiptList = ref<any[]>([]);
const selectedTier = ref<any>(null);

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
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
}

async function onMessage(ev: MessageEvent) {
  if (ev.data && ev.data.type === "donate" && ev.data.pubkey) {
    selectedPubkey.value = ev.data.pubkey;
    showDonateDialog.value = true;
  } else if (ev.data && ev.data.type === "viewProfile" && ev.data.pubkey) {
    await creators.fetchTierDefinitions(ev.data.pubkey);
    dialogPubkey.value = ev.data.pubkey;
    await nextTick();
    showTierDialog.value = true;
  }
}

function openSubscribe(tier: any) {
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
}

async function confirmSubscribe({
  months,
  amount,
  startDate,
  total,
}: any) {
  if (!dialogPubkey.value) return;
  Loading.show({ message: "Loading..." });
  try {
    const receipts = (await donationStore.createDonationPreset(
      months,
      amount,
      dialogPubkey.value,
      undefined,
      startDate,
      true,
      {
        tierName: selectedTier.value?.name,
        benefits: selectedTier.value?.benefits || [],
        frequency: 'monthly',
      }
    )) as any[];
    let supporterName = nostr.pubkey;
    try {
      const prof = await nostr.getProfile(nostr.pubkey);
      supporterName =
        prof?.display_name || prof?.name || prof?.username || nostr.pubkey;
    } catch {}
    const dmMessage = receiptsToDmText(receipts, supporterName);
    const { success, event } = await nostr.sendNip04DirectMessage(
      dialogPubkey.value,
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
    showTierDialog.value = false;
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
      bucketId
    );
    showDonateDialog.value = false;
  }
}

onMounted(() => {
  window.addEventListener("message", onMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
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
