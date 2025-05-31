<template>
  <div style="max-width: 800px; margin: 0 auto">
    <q-input
      rounded
      outlined
      dense
      v-model="searchInput"
      :label="$t('FindCreators.inputs.search.label')"
      :placeholder="$t('FindCreators.inputs.search.placeholder')"
      @keydown.enter.prevent="triggerSearch"
    >
      <template v-slot:append>
        <q-icon name="search" class="cursor-pointer" @click="triggerSearch" />
      </template>
    </q-input>

    <div v-if="searching" class="q-mt-md flex flex-center">
      <q-spinner-dots color="primary" />
    </div>
    <div v-else-if="error" class="q-mt-md text-negative text-bold">
      {{ error }}
    </div>

    <div v-if="searchResults.length" class="q-mt-md">
      <creator-profile-card
        v-for="creator in searchResults"
        :key="creator.pubkey"
        :creator="creator"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useCreatorsStore } from "stores/creators";
import CreatorProfileCard from "components/CreatorProfileCard.vue";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "FindCreatorsView",
  components: {
    CreatorProfileCard,
  },
  setup() {
    const creatorsStore = useCreatorsStore();
    const { searchResults, searching, error } = storeToRefs(creatorsStore);
    const searchInput = ref("");

    const triggerSearch = () => {
      if (searchInput.value.trim()) {
        creatorsStore.searchCreators(searchInput.value.trim());
      }
    };

    let debounceTimeout: number | undefined;
    watch(searchInput, (val) => {
      if (!val) {
        return;
      }
      clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        creatorsStore.searchCreators(val);
      }, 500);
    });

    return {
      searchInput,
      triggerSearch,
      searchResults,
      searching,
      error,
    };
  },
});
</script>
