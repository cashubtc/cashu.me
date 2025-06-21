<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md" style="min-width: 300px">
      <q-card-section class="text-h6">Nostr Error</q-card-section>
      <q-card-section>
        <template v-if="error?.reason === 'nip07-locked'">
          <p>Please unlock your NIP-07 signer extension and retry.</p>
        </template>
        <template v-else-if="error?.reason === 'no-signer'">
          <p>No available Nostr signer found. Please enter your nsec key.</p>
          <q-input v-model="nsec" label="nsec" type="text" dense autofocus />
        </template>
        <template v-else>
          <p>An unknown error occurred while starting Nostr.</p>
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-if="error?.reason === 'no-signer'"
          flat
          color="primary"
          @click="saveNsec"
          >Continue</q-btn
        >
        <q-btn
          v-else
          flat
          color="primary"
          @click="retry"
          >Retry</q-btn
        >
        <q-btn flat label="Close" @click="errStore.clear()" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBootErrorStore } from 'stores/bootError'

const errStore = useBootErrorStore()
const { error } = storeToRefs(errStore)

const nsec = ref('')

const model = computed({
  get: () => error.value !== null,
  set: (v: boolean) => {
    if (!v) errStore.clear()
  }
})

function saveNsec() {
  const key = nsec.value.trim()
  if (!key) return
  localStorage.setItem('nsec', key)
  errStore.clear()
  location.reload()
}

function retry() {
  errStore.clear()
  location.reload()
}
</script>
