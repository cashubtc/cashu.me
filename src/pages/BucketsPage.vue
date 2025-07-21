<template>
  <q-page class="q-pa-md">
    <BucketManager />
    <q-fab
      v-if="selectedCount > 0"
      icon="swap_horiz"
      label="Move Tokens"
      color="primary"
      class="move-fab"
      @click="moveSelected"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import BucketManager from 'components/BucketManager.vue';
import { useBucketsStore } from 'stores/buckets';

const bucketsStore = useBucketsStore();
const { selectedBucketIds } = storeToRefs(bucketsStore);

const selectedCount = computed(() => selectedBucketIds.value.length);

function moveSelected() {
  bucketsStore.moveSelectedBuckets();
}
</script>

<style scoped lang="scss">
.move-fab {
  position: fixed;
  bottom: $spacing-base * 2;
  right: $spacing-base * 2;
}
</style>
