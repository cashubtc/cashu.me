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
import { ref, watch } from "vue";
import { useMessengerStore } from "src/stores/messenger";
import { notifySuccess, notifyError } from "src/js/notify";

const messenger = useMessengerStore();

const relayText = ref(messenger.relays.join("\n"));

watch(
  () => messenger.relays,
  (r) => {
    relayText.value = r.join("\n");
  }
);

const connect = async () => {
  const relays = relayText.value
    .split(/\n|\r/)
    .map((r) => r.trim())
    .filter((r) => r.length);
  try {
    await messenger.connect(relays);
    notifySuccess("Connected to relays");
  } catch (err: any) {
    notifyError(err?.message || "Failed to connect");
  }
};

const disconnect = async () => {
  try {
    await Promise.resolve(messenger.disconnect());
    notifySuccess("Disconnected from relays");
  } catch (err: any) {
    notifyError(err?.message || "Failed to disconnect");
  }
};
</script>
