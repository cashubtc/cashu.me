<template>
  <SettingsPageShell>
    <!-- No page title: the mint header below names the page. -->
    <MintRatingsComponent
      v-if="mintUrl"
      :url="mintUrl"
      :reviews="reviews"
      :allowCreateReview="allowCreateReview"
      :mintInfo="mintInfo"
      @close="goBack"
    />
    <EmptyState
      v-else
      :icon="LandmarkIcon"
      :title="$t('MintRatings.no_mint_url')"
    />
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import { Landmark as LandmarkIcon } from "lucide-vue-next";
import EmptyState from "src/components/ui/EmptyState.vue";
import MintRatingsComponent from "src/components/MintRatingsComponent.vue";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "MintRatingsPage",
  components: {
    SettingsPageShell,
    MintRatingsComponent,
    EmptyState,
  },
  data() {
    return {
      mintUrl: "",
      reviews: [],
      allowCreateReview: true,
      mintInfo: null,
      LandmarkIcon: markRaw(LandmarkIcon),
    };
  },
  methods: {
    goBack() {
      // Navigate back to the previous page
      this.$router.back();
    },
    loadMintInfo() {
      // Try to get mint info from the recommendations store first
      const recsStore = useMintRecommendationsStore();
      let info = recsStore.getHttpInfoForUrl(this.mintUrl);

      // If not found in recommendations, try to get it from mints store
      if (!info) {
        const mintsStore = useMintsStore();
        const mint = mintsStore.mints.find((m) => m.url === this.mintUrl);
        if (mint && mint.info) {
          info = mint.info;
        }
      }

      if (info) {
        this.mintInfo = info;
      }
    },
  },
  created() {
    // Get data from route query params
    if (this.$route.query.mintUrl) {
      this.mintUrl = this.$route.query.mintUrl as string;
      this.allowCreateReview = this.$route.query.allowCreateReview !== "false";

      // Load mint info from store
      this.loadMintInfo();
    } else {
      // No mint URL provided, redirect back
      this.$router.push("/");
    }
  },
});
</script>
