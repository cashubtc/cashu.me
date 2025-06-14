<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md flex flex-center',
    ]"
  >
    <q-card class="q-pa-md" style="max-width: 400px; width: 100%">
      <q-card-section class="text-h6">Nostr Identity</q-card-section>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useNostrStore } from "stores/nostr";
import { generateSecretKey, nip19 } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

export default defineComponent({
  name: "NostrLogin",
  setup() {
    const key = ref("");
    const router = useRouter();
    const nostr = useNostrStore();

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

    return { key, submitKey, createIdentity };
  },
});
</script>
