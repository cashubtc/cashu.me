<template>
  <q-page :class="[$q.dark.isActive ? 'text-white' : 'text-dark', 'q-pa-md']">
    <h1>Buckets</h1>
    <p class="text-grey-5 q-mb-md">Organize your tokens</p>
    <SummaryStats :total="totalActiveBalance" :active-count="activeCount" />
    <BucketManager />
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      class="bucket-fab"
      scroll-target="body"
    >
      <q-btn
        fab
        color="primary"
        icon="add"
        @click="dialogOpen = true"
        aria-label="Create bucket"
      />
    </q-page-sticky>
    <BucketDialog v-model="dialogOpen" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import BucketManager from "components/BucketManager.vue";
import BucketDialog from "components/BucketDialog.vue";
import SummaryStats from "components/SummaryStats.vue";
import { useBucketsStore } from "stores/buckets";

const bucketsStore = useBucketsStore();
const { totalActiveBalance, activeCount } = storeToRefs(bucketsStore);

const dialogOpen = ref(false);
</script>

<style scoped>
h1 {
  font-size: clamp(32px, 6vw, 64px);
  margin: 0;
}
</style>
