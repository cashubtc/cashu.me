<template>
  <q-dialog v-model="show" ref="dialog">
    <q-card class="q-pa-md" style="min-width: 300px">
      <q-card-section class="text-h6">Relays</q-card-section>
      <q-card-section>
        <RelayManager />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          v-close-popup
          @click="hideDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import RelayManager from "./RelayManager.vue";

const show = ref(false);

function showDialog() {
  show.value = true;
}

function hideDialog() {
  show.value = false;
}

defineExpose({ show: showDialog, hide: hideDialog });
</script>
