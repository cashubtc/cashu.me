<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">New Chat</div>
    <q-input v-model="pubkey" label="Recipient Pubkey" @keyup.enter="start" dense />
    <q-btn
      label="Start"
      color="primary"
      class="q-mt-sm"
      @click="start"
      :disable="!pubkey.trim()"
      dense
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { nip19 } from 'nostr-tools';
import { notifyError } from 'src/js/notify';

const emit = defineEmits(['start']);
const pubkey = ref('');

const start = () => {
  const pk = pubkey.value.trim();
  if (!pk) return;
  let valid = /^[0-9a-fA-F]{64}$/.test(pk);
  if (!valid && pk.startsWith('npub')) {
    try {
      const decoded = nip19.decode(pk);
      valid = decoded.type === 'npub' && typeof decoded.data === 'string';
    } catch {}
  }
  if (!valid) {
    notifyError('Invalid Nostr pubkey');
    return;
  }
  emit('start', pk);
  pubkey.value = '';
};
</script>
