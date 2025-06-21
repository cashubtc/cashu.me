<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md" style="min-width: 300px">
      <q-card-section class="text-h6">Nostr Error</q-card-section>
      <q-card-section>
        <p v-if="error?.reason === 'no-signer'">
          No available Nostr signer was found. Please install a signer extension
          or provide an nsec key.
        </p>
        <p v-else-if="error?.reason === 'connect-failed'">
          Failed to connect to the configured relays. Check your internet
          connection and try again.
        </p>
        <p v-else>
          An unknown error occurred while starting Nostr.
        </p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="retry">Retry</q-btn>
        <q-btn v-close-popup flat color="grey" @click="close">Close</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNdkBootStore } from 'src/stores/ndkBoot'

const ndkBoot = useNdkBootStore()
const { error } = storeToRefs(ndkBoot)

const model = computed({
  get: () => error.value !== null,
  set: (v: boolean) => {
    if (!v) ndkBoot.setError(null)
  }
})

function retry() {
  ndkBoot.retry()
}

function close() {
  ndkBoot.setError(null)
}
</script>
