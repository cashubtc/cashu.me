<template>
  <div class="find-creators-wrapper">
    <iframe
      ref="iframeEl"
      src="/find-creators.html"
      class="find-creators-frame"
      title="Find Creators"
    />
    <DonateDialog v-model="showDonateDialog" @confirm="handleDonate" />
    <SendTokenDialog />
    <QDialog v-model="showTierDialog">
      <QCard class="tier-dialog">
        <QCardSection class="row items-center justify-between">
          <div class="text-h6">Subscription Tiers</div>
          <QBtn dense flat icon="close" @click="showTierDialog = false" />
        </QCardSection>
        <QSeparator />
        <QCardSection>
          <div v-if="!tiers.length" class="text-center">Creator has no subscription tiers</div>
          <div v-else>
            <QCard v-for="t in tiers" :key="t.id" flat bordered class="q-mb-md">
              <QCardSection>
                <div class="row items-center justify-between">
                  <div class="text-subtitle1">{{ t.name }}</div>
                  <div class="text-subtitle2 text-primary">{{ t.price_sats }} sat/month</div>
                </div>
                <div class="q-mt-sm">{{ t.description }}</div>
                <ul class="q-pl-md q-mt-xs text-caption">
                  <li v-for="b in t.benefits" :key="b">{{ b }}</li>
                </ul>
              </QCardSection>
            </QCard>
          </div>
        </QCardSection>
      </QCard>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import DonateDialog from 'components/DonateDialog.vue';
import SendTokenDialog from 'components/SendTokenDialog.vue';
import { useSendTokensStore } from 'stores/sendTokensStore';
import { useDonationPresetsStore } from 'stores/donationPresets';
import { useCreatorsStore } from 'stores/creators';
import { QDialog, QCard, QCardSection, QBtn, QSeparator } from 'quasar';
import { nip19 } from 'nostr-tools';

const iframeEl = ref<HTMLIFrameElement | null>(null);
const showDonateDialog = ref(false);
const selectedPubkey = ref('');
const showTierDialog = ref(false);
const dialogPubkey = ref('');

const sendTokensStore = useSendTokensStore();
const donationStore = useDonationPresetsStore();
const creators = useCreatorsStore();
const tiers = computed(() => creators.tiersMap[dialogPubkey.value] || []);

function bech32ToHex(pubkey: string): string {
  try {
    const decoded = nip19.decode(pubkey);
    return typeof decoded.data === 'string' ? decoded.data : pubkey;
  } catch {
    return pubkey;
  }
}

async function onMessage(ev: MessageEvent) {
  if (ev.data && ev.data.type === 'donate' && ev.data.pubkey) {
    selectedPubkey.value = ev.data.pubkey;
    showDonateDialog.value = true;
  } else if (ev.data && ev.data.type === 'viewProfile' && ev.data.pubkey) {
    await creators.fetchTierDefinitions(ev.data.pubkey);
    dialogPubkey.value = ev.data.pubkey;
    await nextTick();
    showTierDialog.value = true;
  }
}

function handleDonate({ bucketId, locked, type, amount, months, message }: any) {
  if (!selectedPubkey.value) return;
  if (type === 'one-time') {
    sendTokensStore.clearSendData();
    sendTokensStore.recipientPubkey = selectedPubkey.value;
    sendTokensStore.sendViaNostr = true;
    sendTokensStore.sendData.bucketId = bucketId;
    sendTokensStore.sendData.amount = amount;
    sendTokensStore.sendData.memo = message;
    sendTokensStore.sendData.p2pkPubkey = locked ? selectedPubkey.value : '';
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

onMounted(() => {
  window.addEventListener('message', onMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage);
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
</style>
