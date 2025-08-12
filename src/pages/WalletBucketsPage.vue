<template>
  <q-layout
    view="lHh Lpr lFf"
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'wallet-layout',
    ]"
  >
    <Sidebar />
    <HeaderBar />
    <q-page-container class="q-pa-md">
      <BucketManager />
      <q-fab
        v-if="selectedCount > 0"
        icon="swap_horiz"
        label="Move Tokens"
        color="primary"
        class="move-fab"
        @click="moveSelected"
      />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import Sidebar from "components/Sidebar.vue";
import HeaderBar from "components/HeaderBar.vue";
import BucketManager from "components/BucketManager.vue";
import { useBucketsStore } from "stores/buckets";

const bucketsStore = useBucketsStore();
const { selectedBucketIds } = storeToRefs(bucketsStore);

const selectedCount = computed(() => selectedBucketIds.value.length);

function moveSelected() {
  bucketsStore.moveSelectedBuckets();
}
</script>

<style scoped lang="scss">
.wallet-layout {
  min-height: 100vh;
}
.move-fab {
  position: fixed;
  bottom: $spacing-base * 2;
  right: $spacing-base * 2;
}
</style>
