<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md',
    ]"
  >
    <div class="q-mb-md">
      <q-btn flat color="primary" to="/creator/dashboard">
        {{ $t("CreatorHub.profile.back") }}
      </q-btn>
    </div>
    <div class="text-h5 q-mb-md">{{ profile.display_name || pubkey }}</div>
    <div v-if="profile.picture" class="q-mb-md">
      <img :src="profile.picture" style="max-width: 150px" />
    </div>
    <div v-if="profile.about" class="q-mb-md">{{ profile.about }}</div>

    <div v-if="tiers.length">
      <div class="text-h6 q-mb-sm">{{ $t("CreatorHub.profile.tiers") }}</div>
      <div v-for="tier in tiers" :key="tier.id" class="q-mb-md">
        <div class="text-subtitle1">
          {{ tier.name }} - {{ tier.price }} sats
          <span v-if="bitcoinPrice" class="text-caption">
            ({{ formatFiat(tier.price) }})
          </span>
        </div>
        <div class="text-caption" v-html="renderMarkdown(tier.description)"></div>
        <q-btn
          color="primary"
          dense
          class="q-mt-sm"
          @click="supportTier(tier)"
          >{{ $t("CreatorHub.profile.support") }}</q-btn
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useNostrStore } from "stores/nostr";
import { useCreatorHubStore, Tier } from "stores/creatorHub";
import { usePriceStore } from "stores/price";
import { useUiStore } from "stores/ui";
import { renderMarkdown as renderMarkdownFn } from "src/js/simple-markdown";

export default defineComponent({
  name: "MyProfilePage",
  setup() {
    const nostr = useNostrStore();
    const hub = useCreatorHubStore();
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);
    const pubkey = computed(() => hub.loggedInNpub || nostr.pubkey);
    const profile = ref<any>({});
    const tiers = ref(hub.getTierArray());

    onMounted(async () => {
      if (!pubkey.value) return;
      const p = await nostr.getProfile(pubkey.value);
      if (p) profile.value = { ...p };
    });

    function renderMarkdown(text: string): string {
      return renderMarkdownFn(text || "");
    }

    function formatFiat(sats: number): string {
      if (!priceStore.bitcoinPrice) return "";
      const value = (priceStore.bitcoinPrice / 100000000) * sats;
      return uiStore.formatCurrency(value, "USD", true);
    }

    async function supportTier(tier: Tier) {
      if (tier.welcomeMessage) {
        try {
          await useNostrStore().sendNip04DirectMessage(
            pubkey.value,
            tier.welcomeMessage,
          );
        } catch (e) {
          console.error(e);
        }
      }
    }

    return {
      pubkey,
      profile,
      tiers,
      bitcoinPrice,
      renderMarkdown,
      formatFiat,
      supportTier,
    };
  },
});
</script>
