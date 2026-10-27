<template>
  <SettingsPageShell :title="$t('MintRatings.title')">
    <MintRatingsComponent
      v-if="mintUrl"
      :url="mintUrl"
      :reviews="reviews"
      :allowCreateReview="allowCreateReview"
      :mintInfo="mintInfo"
      @close="goBack"
    />
    <div v-else class="text-center q-pa-lg">
      <div class="text-h6 text-grey-5">
        {{ $t("MintRatings.no_mint_url") }}
      </div>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintRatingsComponent from "src/components/MintRatingsComponent.vue";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "MintRatingsPage",
  components: {
    SettingsPageShell,
    MintRatingsComponent,
  },
  data() {
    return {
      mintUrl: "",
      reviews: [],
      allowCreateReview: true,
      mintInfo: null,
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
