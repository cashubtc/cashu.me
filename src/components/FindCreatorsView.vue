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
        @donate="openDonateDialog(creator)"
      />
    </div>
    <DonateDialog v-model="showDonateDialog" @confirm="handleDonate" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useCreatorsStore } from "stores/creators";
import CreatorProfileCard from "components/CreatorProfileCard.vue";
import DonateDialog from "components/DonateDialog.vue";
import { storeToRefs } from "pinia";
import { useSendTokensStore } from "stores/sendTokensStore";

export default defineComponent({
  name: "FindCreatorsView",
  components: {
    CreatorProfileCard,
    DonateDialog,
  },
  setup() {
    const creatorsStore = useCreatorsStore();
    const { searchResults, searching, error } = storeToRefs(creatorsStore);
    const searchInput = ref("");
    const sendTokensStore = useSendTokensStore();
    const showDonateDialog = ref(false);
    const donateCreator = ref<any>(null);

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

    const openDonateDialog = (creator: any) => {
      donateCreator.value = creator;
      showDonateDialog.value = true;
    };

    const handleDonate = ({ bucketId, locked }: { bucketId: string; locked: boolean }) => {
      sendTokensStore.clearSendData();
      sendTokensStore.sendData.bucketId = bucketId;
      sendTokensStore.sendData.p2pkPubkey = locked ? donateCreator.value.pubkey : "";
      sendTokensStore.showLockInput = locked;
      showDonateDialog.value = false;
      sendTokensStore.showSendTokens = true;
    };

    return {
      searchInput,
      triggerSearch,
      searchResults,
      searching,
      error,
      showDonateDialog,
      openDonateDialog,
      handleDonate,
    };
  },
});
</script>
