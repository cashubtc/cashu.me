<template>
  <q-dialog v-model="show" persistent>
    <q-card>
      <q-card-section class="text-h6">Nostr Error</q-card-section>

      <!-- Message -->
      <q-card-section>
        <p v-if="isLocked">
          Please unlock your NIP‑07 signer extension and click <b>Retry</b>, or
          paste an <code>nsec</code> below.
        </p>
        <p v-else-if="reason === 'no-signer'">
          Please unlock your NIP‑07 signer extension or paste an
          <code>nsec</code>
          to continue.
        </p>
        <p v-else>An unknown error occurred while starting Nostr.</p>
      </q-card-section>

      <!-- nsec input (for both locked + no‑signer) -->
      <q-card-section v-if="allowPaste">
        <q-input
          v-model="nsec"
          type="password"
          label="nsec (private key)"
          dense
          autofocus
        />
      </q-card-section>

      <!-- actions -->
      <q-card-actions align="right">
        <q-btn flat label="Close" @click="closeDialog" />
        <q-btn
          v-if="allowPaste"
          color="primary"
          label="Continue"
          @click="saveNsec"
        />
        <q-btn v-else color="primary" label="Retry" @click="retry" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBootErrorStore } from "stores/bootError";

const errStore = useBootErrorStore();
const show = computed(() => !!errStore.error);
const reason = computed(() => errStore.error?.reason ?? "unknown");
const isLocked = computed(() => reason.value === "nip07-locked");
const allowPaste = computed(
  () => isLocked.value || reason.value === "no-signer",
);

const nsec = ref("");

function saveNsec() {
  if (!nsec.value.startsWith("nsec")) return;
  window.localStorage.setItem("nsec", nsec.value.trim());
  errStore.clear();
  location.reload();
}

function retry() {
  errStore.clear();
  location.reload();
}

function closeDialog() {
  errStore.clear();
}
</script>
