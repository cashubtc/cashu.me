<template>
  <q-dialog v-model="show" ref="dialog">
    <q-card class="q-pa-md" style="min-width: 300px">
      <div class="text-subtitle1 q-mb-sm">New Chat</div>
      <q-input
        v-model="pubkey"
        label="Recipient Pubkey"
        @keyup.enter="start"
        dense
      />
      <q-btn
        label="Start"
        color="primary"
        class="q-mt-sm"
        @click="start"
        :disable="!pubkey.trim()"
        dense
      />
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { nip19 } from "nostr-tools";
import { notifyError } from "src/js/notify";
import { useNostrStore } from "src/stores/nostr";

const emit = defineEmits(["start"]);
const show = ref(false);
const pubkey = ref("");
const nostr = useNostrStore();

function start() {
  const pk = pubkey.value.trim();
  if (!pk) return;
  let valid = /^[0-9a-fA-F]{64}$/.test(pk);
  if (!valid && pk.startsWith("npub")) {
    try {
      const decoded = nip19.decode(pk);
      valid = decoded.type === "npub" && typeof decoded.data === "string";
    } catch {}
  }
  if (!valid) {
    notifyError("Invalid Nostr pubkey");
    return;
  }
  const resolved = nostr.resolvePubkey(pk);
  emit("start", resolved);
  pubkey.value = "";
  show.value = false;
}

function showDialog() {
  show.value = true;
}

function hideDialog() {
  show.value = false;
}

defineExpose({ show: showDialog, hide: hideDialog });
</script>
