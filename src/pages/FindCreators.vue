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
      :creator-pubkey="dialogNpub"
      @confirm="confirmSubscribe"
    />
    <SendTokenDialog />
    <QDialog v-model="showTierDialog">
      <QCard class="tier-dialog">
        <QCardSection class="row items-center justify-between">
          <div class="text-h6">Subscription Tiers</div>
          <QBtn dense flat icon="close" @click="showTierDialog = false" />
        </QCardSection>
        <QSeparator />
        <QCardSection v-if="loadingProfile" class="row justify-center q-pa-md">
          <q-spinner-hourglass />
        </QCardSection>
        <QCardSection v-else-if="nutzapProfile">
          <div class="text-subtitle2 q-mb-xs">P2PK public key</div>
          <div class="text-caption q-mb-sm" style="word-break: break-all">
            {{ nutzapProfile.p2pkPubkey }}
          </div>
          <div class="text-subtitle2 q-mb-xs">Trusted mints</div>
          <ul class="q-pl-md q-mb-sm text-caption">
            <li
              v-for="m in nutzapProfile.trustedMints"
              :key="m"
              style="word-break: break-all"
            >
              {{ m }}
            </li>
          </ul>
          <div class="text-subtitle2 q-mb-xs">Relays</div>
          <ul class="q-pl-md text-caption">
            <li
              v-for="r in nutzapProfile.relays"
              :key="r"
              style="word-break: break-all"
            >
              {{ r }}
            </li>
          </ul>
        </QCardSection>
        <QCardSection v-else>
          <div class="text-center">No Nutzap profile published</div>
        </QCardSection>
        <QCardSection>
          <div v-if="loadingTiers" class="row justify-center q-pa-md">
            <q-spinner-hourglass />
          </div>
          <div v-else-if="tierFetchError" class="text-center">
            Failed to load tiers – check relay connectivity
            <div class="q-mt-md">
              <q-btn flat color="primary" @click="retryFetchTiers">Retry</q-btn>
            </div>
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
                <div v-if="t.media && t.media.length">
                  <MediaPreview
                    v-for="(m, idx) in t.media"
                    :key="idx"
                    :url="m.url"
                    class="q-mt-sm"
                  />
                </div>
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
import SendTokenDialog from "components/SendTokenDialog.vue";
import MediaPreview from "components/MediaPreview.vue";

defineOptions({ components: { MediaPreview } });
import { useSendTokensStore } from "stores/sendTokensStore";
import { useDonationPresetsStore } from "stores/donationPresets";
import { useCreatorsStore } from "stores/creators";
import {
  useNostrStore,
  fetchNutzapProfile,
  RelayConnectionError,
} from "stores/nostr";
import { notifyWarning } from "src/js/notify";
import { useRouter, useRoute } from "vue-router";
import { useMessengerStore } from "stores/messenger";
import { useI18n } from "vue-i18n";
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QSeparator,
} from "quasar";
import { nip19 } from "nostr-tools";

const iframeEl = ref<HTMLIFrameElement | null>(null);
const showDonateDialog = ref(false);
const selectedPubkey = ref("");
const showTierDialog = ref(false);
const loadingTiers = ref(false);
const dialogPubkey = ref(""); // always 64-char hex
const dialogNpub = computed(() => {
  const hex = dialogPubkey.value;
  if (hex.length === 64 && /^[0-9a-f]{64}$/i.test(hex))
    return nip19.npubEncode(hex);
  return "";
});

const sendTokensStore = useSendTokensStore();
const donationStore = useDonationPresetsStore();
const creators = useCreatorsStore();
const nostr = useNostrStore();
const messenger = useMessengerStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const tiers = computed(() => creators.tiersMap[dialogPubkey.value] || []);
const tierFetchError = computed(() => creators.tierFetchError);
const showSubscribeDialog = ref(false);
const selectedTier = ref<any>(null);
const nutzapProfile = ref<any | null>(null);
const loadingProfile = ref(false);
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
    -2
  )}`;
}

async function onMessage(ev: MessageEvent) {
  if (ev.data && ev.data.type === "donate" && ev.data.pubkey) {
    selectedPubkey.value = ev.data.pubkey; // keep hex
    showDonateDialog.value = true;
  } else if (ev.data && ev.data.type === "viewProfile" && ev.data.pubkey) {
    loadingTiers.value = true;
    loadingProfile.value = true;
    nutzapProfile.value = null;
    if (tierTimeout) clearTimeout(tierTimeout);
    tierTimeout = setTimeout(() => {
      loadingTiers.value = false;
    }, 5000);
    await creators.fetchTierDefinitions(ev.data.pubkey);
    dialogPubkey.value = ev.data.pubkey; // keep hex
    try {
      const profile = await fetchNutzapProfile(ev.data.pubkey);
      nutzapProfile.value = profile;
    } catch (e: any) {
      if (e instanceof RelayConnectionError) {
        notifyWarning("Unable to connect to Nostr relays");
      } else {
        console.error(e);
      }
    } finally {
      loadingProfile.value = false;
    }
    await nextTick();
    showTierDialog.value = true;
  } else if (ev.data && ev.data.type === "startChat" && ev.data.pubkey) {
    const pubkey = nostr.resolvePubkey(ev.data.pubkey);
    router.push({ path: "/nostr-messenger", query: { pubkey } });
    const stop = watch(
      () => messenger.started,
      (started) => {
        if (started) {
          messenger.startChat(pubkey);
          stop();
        }
      }
    );
  }
}

watch(tiers, (val) => {
  if (val.length > 0) {
    loadingTiers.value = false;
    if (tierTimeout) clearTimeout(tierTimeout);
  }
});

watch(tierFetchError, (val) => {
  if (val) {
    loadingTiers.value = false;
    if (tierTimeout) clearTimeout(tierTimeout);
  }
});

watch(showTierDialog, (val) => {
  if (!val) {
    nutzapProfile.value = null;
    loadingProfile.value = false;
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

function confirmSubscribe({ bucketId, months, amount, startDate, total }: any) {
  // Nutzap transaction is handled within SubscribeDialog.
  // Close surrounding dialogs and process any additional UI updates here.
  showSubscribeDialog.value = false;
  showTierDialog.value = false;
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

onMounted(async () => {
  window.addEventListener("message", onMessage);
  try {
    await nostr.initNdkReadOnly();
  } catch (e: any) {
    notifyWarning("Failed to connect to Nostr relays", e?.message);
  }

  const npub = route.query.npub;
  if (npub && typeof npub === "string") {
    const sendViewProfile = () => {
      try {
        const decoded = nip19.decode(npub);
        const hex = typeof decoded.data === "string" ? decoded.data : "";
        if (hex) {
          window.postMessage({ type: "viewProfile", pubkey: hex }, "*");
        }
      } catch {
        /* ignore decode errors */
      }
    };

    if (iframeEl.value) {
      const iframe = iframeEl.value;
      if (iframe.contentWindow?.document.readyState === "complete") {
        sendViewProfile();
      } else {
        iframe.addEventListener("load", sendViewProfile, { once: true });
      }
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
  if (tierTimeout) clearTimeout(tierTimeout);
  nutzapProfile.value = null;
  loadingProfile.value = false;
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
