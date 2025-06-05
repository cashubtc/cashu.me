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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DonateDialog from 'components/DonateDialog.vue';
import SendTokenDialog from 'components/SendTokenDialog.vue';
import { useSendTokensStore } from 'stores/sendTokensStore';
import { useDonationPresetsStore } from 'stores/donationPresets';

const iframeEl = ref<HTMLIFrameElement | null>(null);
const showDonateDialog = ref(false);
const selectedPubkey = ref('');

const sendTokensStore = useSendTokensStore();
const donationStore = useDonationPresetsStore();

function onMessage(ev: MessageEvent) {
  if (ev.data && ev.data.type === 'donate' && ev.data.pubkey) {
    selectedPubkey.value = ev.data.pubkey;
    showDonateDialog.value = true;
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
