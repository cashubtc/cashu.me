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

const emit = defineEmits(['start']);
const pubkey = ref('');

const start = () => {
  const pk = pubkey.value.trim();
  if (!pk) return;
  emit('start', pk);
  pubkey.value = '';
};
</script>
