<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-input dense v-model="search" placeholder="Search" clearable @update:model-value="onSearch" />
    </div>
    <SubscriberFilters class="q-mb-md" />
    <q-tabs v-model="activeTab" dense class="text-grey-7" active-color="primary" indicator-color="primary">
      <q-tab name="all" :label="`All (${counts.all})`" />
      <q-tab name="weekly" :label="`Weekly (${counts.weekly})`" />
      <q-tab name="biweekly" :label="`Bi-weekly (${counts.biweekly})`" />
      <q-tab name="monthly" :label="`Monthly (${counts.monthly})`" />
      <q-tab name="pending" :label="`Pending (${counts.pending})`" />
      <q-tab name="ended" :label="`Ended (${counts.ended})`" />
    </q-tabs>
    <q-virtual-scroll
      class="q-mt-md"
      :items="filtered"
      :virtual-scroll-item-size="48"
    >
      <template #default="{ item: s }">
        <div class="q-pa-sm">
          {{ s.name }} - {{ s.tierName }}
        </div>
      </template>
    </q-virtual-scroll>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import SubscriberFilters from 'src/components/subscribers/SubscriberFilters.vue';
import { useCreatorSubscribersStore } from 'src/stores/creatorSubscribers';
import { useSubscribersStore } from 'src/stores/subscribersStore';

const store = useCreatorSubscribersStore();
const viewStore = useSubscribersStore();
const { filtered, counts, activeTab } = storeToRefs(store);

const search = ref(viewStore.query);

const onSearch = useDebounceFn((val: string) => {
  viewStore.applyFilters({ query: val });
}, 220);
</script>
