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
      <div v-else class="q-gutter-md">
        <q-card v-for="t in tiers" :key="t.id" flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="row items-center justify-between">
              <div class="text-subtitle1">{{ t.name }}</div>
              <div class="text-subtitle2">
                {{ t.price_sats }} sats/month
                <span v-if="bitcoinPrice"> ({{ formatFiat(t.price_sats) }})</span>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-body1 q-mb-sm">{{ t.description }}</div>
            <ul class="q-pl-md">
              <li v-for="benefit in t.benefits" :key="benefit">{{ benefit }}</li>
            </ul>
          </q-card-section>
        </q-card>
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
    const creatorNpub = route.params.npub as string;
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
