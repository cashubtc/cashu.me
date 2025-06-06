<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md',
    ]"
  >
    <div class="q-mb-md">
      <q-btn flat color="primary" to="/find-creators">{{
        $t("CreatorHub.profile.back")
      }}</q-btn>
    </div>
    <div class="text-h5 q-mb-md">{{ profile.display_name || creatorNpub }}</div>
    <div v-if="profile.picture" class="q-mb-md">
      <img :src="profile.picture" style="max-width: 150px" />
    </div>
    <div v-if="profile.about" class="q-mb-md">{{ profile.about }}</div>
    <div v-if="followers !== null" class="text-caption q-mb-md">
      {{ $t("FindCreators.labels.followers") }}: {{ followers }} |
      {{ $t("FindCreators.labels.following") }}: {{ following }}
    </div>

    <div>
      <div class="text-h6 q-mb-sm">{{ $t("CreatorHub.profile.tiers") }}</div>
      <div v-if="!tiers.length">Creator has no subscription tiers</div>
      <div v-else>
        <div v-for="t in tiers" :key="t.id" class="q-pa-sm q-my-sm bg-grey-2">
          <div class="text-h6">{{ t.name }} — {{ t.price_sats }} sats/month</div>
          <div class="text-body1">{{ t.description }}</div>
          <ul>
            <li v-for="benefit in t.benefits" :key="benefit">{{ benefit }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useNostrStore } from "stores/nostr";
import { useCreatorsStore } from "stores/creators";
import { usePriceStore } from "stores/price";
import { useUiStore } from "stores/ui";
import { renderMarkdown as renderMarkdownFn } from "src/js/simple-markdown";

export default defineComponent({
  name: "PublicCreatorProfilePage",
  setup() {
    const route = useRoute();
    const nostr = useNostrStore();
    const creators = useCreatorsStore();
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);
    const creatorNpub = route.params.npubOrVanityName as string;
    const profile = ref<any>({});
    const tiers = computed(() => creators.tiersMap[creatorNpub] || []);
    const followers = ref<number | null>(null);
    const following = ref<number | null>(null);
    onMounted(async () => {
      creators.fetchTierDefinitions(creatorNpub);
      const p = await nostr.getProfile(creatorNpub);
      if (p) profile.value = { ...p };
      followers.value = await nostr.fetchFollowerCount(creatorNpub);
      following.value = await nostr.fetchFollowingCount(creatorNpub);
    });
    function renderMarkdown(text: string): string {
      return renderMarkdownFn(text || "");
    }

    function formatFiat(sats: number): string {
      if (!priceStore.bitcoinPrice) return "";
      const value = (priceStore.bitcoinPrice / 100000000) * sats;
      return uiStore.formatCurrency(value, "USD", true);
    }

    return {
      creatorNpub,
      profile,
      tiers,
      followers,
      following,
      bitcoinPrice,
      renderMarkdown,
      formatFiat,
    };
  },
});
</script>
