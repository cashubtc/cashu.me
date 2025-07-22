<template>
  <q-page class="q-pa-md text-white">
    <h1>Buckets</h1>
    <p class="text-grey-5 q-mb-md">Organize your tokens</p>
    <SummaryStats :total="totalActiveBalance" :active-count="activeCount" />
    <BucketManager>
      <template
        #toolbar="{
          searchTerm,
          viewMode,
          sortBy,
          toggleMultiSelect,
          multiSelectMode,
          moveSelected,
        }"
      >
        <div class="row items-center q-gutter-sm buckets-toolbar">
          <q-input
            :model-value="searchTerm.value"
            @update:model-value="(val) => (searchTerm.value = val)"
            outlined
            dense
            placeholder="Search buckets…"
          />
          <q-btn-toggle
            :model-value="viewMode.value"
            @update:model-value="(val) => (viewMode.value = val)"
            dense
            :options="[
              { label: 'Active', value: 'all' },
              { label: 'Archived', value: 'archived' },
            ]"
          />
          <q-select
            :model-value="sortBy.value"
            @update:model-value="(val) => (sortBy.value = val)"
            outlined
            dense
            label="Sort"
            :options="[
              'Name (A–Z)',
              'Name (Z–A)',
              'Balance (↓)',
              'Balance (↑)',
            ]"
          />
          <q-btn
            color="primary"
            icon="swap_horiz"
            label="Move Tokens"
            @click="moveSelected"
            aria-label="Move Tokens"
          />
          <q-btn
            flat
            dense
            round
            class="q-ml-sm"
            :icon="multiSelectMode ? 'close' : 'select_all'"
            @click="toggleMultiSelect"
            :aria-pressed="multiSelectMode"
            aria-label="Toggle selection"
          />
        </div>
      </template>
    </BucketManager>
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
@media (max-width: 1400px) {
  h1 {
    font-size: 48px;
    line-height: 1.2;
    margin-top: 0;
  }
}
</style>
