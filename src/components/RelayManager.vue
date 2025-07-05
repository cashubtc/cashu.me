<template>
  <div>
    <q-input
      v-model="relayText"
      type="textarea"
      label="Relay URLs (one per line)"
      class="q-mb-sm"
      dense
    />
    <div class="q-mb-sm" v-if="relayStatuses.length">
      <div v-for="s in relayStatuses" :key="s.url" class="row items-center q-my-xs">
        <q-icon
          :name="s.connected ? 'check_circle' : 'warning'"
          :color="s.connected ? 'positive' : 'negative'"
          size="sm"
          class="q-mr-xs"
        />
        <span class="text-caption">{{ s.url }}</span>
        <q-icon
          name="delete_outline"
          size="sm"
          class="q-ml-xs cursor-pointer"
          @click="removeRelay(s.url)"
        />
      </div>
    </div>
    <div class="row q-gutter-sm">
      <q-btn label="Connect" color="primary" @click="connect" dense />
      <q-btn label="Disconnect" color="primary" @click="disconnect" dense />
    </div>
    <div class="q-mt-sm">
      <q-btn
        label="Use fallback relays"
        color="primary"
        @click="relayText = DEFAULT_RELAYS.join('\n')"
        dense
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import { useMessengerStore } from "src/stores/messenger";
import { notifySuccess, notifyError } from "src/js/notify";
import { useNdk } from "src/composables/useNdk";
import { DEFAULT_RELAYS } from "boot/ndk";
import type NDK from "@nostr-dev-kit/ndk";

const messenger = useMessengerStore();

const relayText = ref((messenger.relays ?? []).join("\n"));

const ndkRef = ref<NDK | null>(null);
onMounted(() => {
  useNdk({ requireSigner: false }).then((n) => (ndkRef.value = n));
});

const relayStatuses = computed(() =>
  (messenger.relays ?? []).map(url => ({
    url,
    connected: ndkRef.value?.pool.relays.get(url)?.connected === true,
  }))
);

watch(
  () => messenger.relays,
  (r) => {
    relayText.value = (r ?? []).join("\n");
  }
);

const connect = async () => {
  const urls = (relayText.value || "")
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter(Boolean);
  try {
      const ndk = await useNdk({ requireSigner: false });
      for (const url of urls) {
        ndk.addExplicitRelay(url);
      }
      await messenger.connect(urls);
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

const removeRelay = (url: string) => {
  messenger.removeRelay(url);
};
</script>
