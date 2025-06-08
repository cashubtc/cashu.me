<template>
  <div>
    <q-input
      v-model="relayText"
      type="textarea"
      label="Relay URLs (one per line)"
      class="q-mb-sm"
      dense
    />
    <div class="row q-gutter-sm">
      <q-btn label="Connect" color="primary" @click="connect" dense />
      <q-btn label="Disconnect" color="primary" @click="disconnect" dense />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

const messenger = useMessengerStore();

const relayText = ref(messenger.relays.join('\n'));

watch(
  () => messenger.relays,
  (r) => {
    relayText.value = r.join('\n');
  },
);

const connect = () => {
  const relays = relayText.value
    .split(/\n|\r/)
    .map((r) => r.trim())
    .filter((r) => r.length);
  messenger.connect(relays);
};

const disconnect = () => {
  messenger.disconnect();
};
</script>
