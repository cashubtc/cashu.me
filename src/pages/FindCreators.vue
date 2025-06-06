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
      <QCard>
        <QCardSection>
          <div v-if="!tiers.length">Creator has no subscription tiers</div>
          <div v-else>
            <div v-for="t in tiers" :key="t.id" class="q-mb-md">
              <div>{{ t.name }} — {{ t.price_sats }} sat/month</div>
              <div>{{ t.description }}</div>
              <ul>
                <li v-for="b in t.benefits" :key="b">{{ b }}</li>
              </ul>
            </div>
          </div>
        </QCardSection>
        <QCardSection class="text-right">
          <QBtn flat label="Close" @click="showTierDialog = false" />
        </QCardSection>
      </QCard>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DonateDialog from 'components/DonateDialog.vue';
import SendTokenDialog from 'components/SendTokenDialog.vue';
import { useSendTokensStore } from 'stores/sendTokensStore';
import { useDonationPresetsStore } from 'stores/donationPresets';
import { useCreatorsStore } from 'stores/creators';
import { QDialog, QCard, QCardSection, QBtn } from 'quasar';

const iframeEl = ref<HTMLIFrameElement | null>(null);
const showDonateDialog = ref(false);
const selectedPubkey = ref('');
const showTierDialog = ref(false);
const dialogPubkey = ref('');

const sendTokensStore = useSendTokensStore();
const donationStore = useDonationPresetsStore();
const creators = useCreatorsStore();
const tiers = computed(() => creators.tiersMap[dialogPubkey.value] || []);

async function onMessage(ev: MessageEvent) {
  if (ev.data && ev.data.type === 'donate' && ev.data.pubkey) {
    selectedPubkey.value = ev.data.pubkey;
    showDonateDialog.value = true;
  } else if (ev.data && ev.data.type === 'viewProfile' && ev.data.pubkey) {
    await creators.fetchTierDefinitions(ev.data.pubkey);
    dialogPubkey.value = ev.data.pubkey;
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
</style>
