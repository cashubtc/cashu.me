<template>
  <q-page class="q-pa-md">
    <header class="flex flex-wrap items-center gap-2 mb-4">
      <button
        @click="$router.go(-1)"
        aria-label="Go back"
        class="p-2"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold">My Subscribers ({{ count }})</h1>
      <div class="flex-grow"></div>
      <div class="relative flex-1 min-w-[200px] max-w-[300px]">
        <SearchIcon
          class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        />
        <input
          v-model="filter"
          type="text"
          placeholder="Search"
          class="w-full rounded border pl-8 pr-2 py-1"
        />
      </div>
      <button
        @click="showFilters = true"
        class="p-2"
        aria-label="Filters"
      >
        <FilterIcon class="w-5 h-5" />
      </button>
    </header>
    <CreatorSubscribers
      v-model:filter="filter"
      v-model:showFilters="showFilters"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import CreatorSubscribers from 'components/CreatorSubscribers.vue';
import { useCreatorSubscriptionsStore } from 'stores/creatorSubscriptions';
import {
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
} from 'lucide-vue-next';

const creatorSubscriptionsStore = useCreatorSubscriptionsStore();
const { subscriptions } = storeToRefs(creatorSubscriptionsStore);
const count = computed(() => subscriptions.value.length);

const filter = ref('');
const showFilters = ref(false);
</script>
