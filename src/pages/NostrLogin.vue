<template>
  <q-page class="bg-grey-10 q-pa-md flex flex-center">
    <q-card
      class="q-pa-md bg-grey-9 shadow-4"
      style="max-width: 400px; width: 100%"
    >
      <q-card-section class="text-h6">Nostr Identity</q-card-section>
      <q-card-section v-if="hasExistingKey">
        <q-banner dense class="bg-grey-3 q-mb-md">
          A private key is already present. Click "Use Key" to continue or
          replace it below.
        </q-banner>
      </q-card-section>
      <q-card-section>
        <q-input v-model="key" type="text" label="nsec or hex private key" />
      </q-card-section>
      <q-card-actions vertical class="q-gutter-sm">
        <q-btn color="primary" @click="submitKey">Use Key</q-btn>
        <q-btn flat color="primary" @click="createIdentity"
          >Create Identity</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useNostrStore } from "stores/nostr";
import { generateSecretKey, nip19 } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

export default defineComponent({
  name: "NostrLogin",
  setup() {
    const nostr = useNostrStore();
    const key = ref(nostr.activePrivateKeyNsec || nostr.privKeyHex || "");
    const hasExistingKey = computed(() => !!key.value);
    const router = useRouter();

    const normalizeKey = (input: string): string => {
      const trimmed = input.trim();
      if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
        return nip19.nsecEncode(hexToBytes(trimmed));
      }
      return trimmed;
    };

    const submitKey = async () => {
      if (!key.value.trim()) return;
      await nostr.initPrivateKeySigner(normalizeKey(key.value));
      if (nostr.pubkey) router.push("/wallet");
    };

    const createIdentity = async () => {
      const sk = generateSecretKey();
      const nsec = nip19.nsecEncode(sk);
      await nostr.initPrivateKeySigner(nsec);
      if (nostr.pubkey) router.push("/wallet");
    };

    return { key, hasExistingKey, submitKey, createIdentity };
  },
});
</script>
