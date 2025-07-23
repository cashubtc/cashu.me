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
        <q-toolbar
          class="bg-transparent q-pl-md q-pr-md q-gutter-md row items-center"
        >
          <q-input
            :model-value="searchTerm.value"
            @update:model-value="(val) => (searchTerm.value = val)"
            outlined
            dense
            placeholder="Search buckets…"
          />
          <q-btn-toggle
            v-model="viewMode.value"
            dense
            unelevated
            toggle-color="primary"
            :options="[
              { label: 'Active', value: 'active' },
              { label: 'Archived', value: 'archived' },
            ]"
          />
          <q-select
            :model-value="sortBy.value"
            @update:model-value="(val) => (sortBy.value = val)"
            outlined
            dense
            label="Sort"
            aria-label="Sort buckets"
            emit-value
            map-options
            :options="[
              { label: 'Name (A–Z)', value: 'name-asc' },
              { label: 'Name (Z–A)', value: 'name-desc' },
              { label: 'Balance (↓)', value: 'balance-desc' },
              { label: 'Balance (↑)', value: 'balance-asc' },
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
        </q-toolbar>
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
h1 {
  font-size: clamp(32px, 6vw, 64px);
  margin: 0;
}
</style>
