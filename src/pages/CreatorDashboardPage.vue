<template>
  <div :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md']">
    <div class="row items-center justify-between">
      <div class="text-h5">{{ $t('CreatorHub.dashboard.title') }}</div>
      <q-btn flat color="primary" @click="logout">{{ $t('CreatorHub.dashboard.logout') }}</q-btn>
    </div>

    <div class="q-mt-md">
      <div class="text-h6">{{ $t('CreatorHub.dashboard.edit_profile') }}</div>
      <q-input v-model="profile.display_name" label="Display Name" class="q-mt-sm" />
      <q-input v-model="profile.picture" label="Profile Picture URL" class="q-mt-sm" />
      <q-input v-model="profile.about" type="textarea" label="Bio" class="q-mt-sm" />
      <q-btn color="primary" flat class="q-mt-sm" @click="saveProfile">{{ $t('global.actions.update.label') }}</q-btn>
    </div>

    <div class="q-mt-lg">
      <div class="text-h6">{{ $t('CreatorHub.dashboard.manage_tiers') }}</div>
      <div
        v-for="tier in tiers"
        :key="tier.id"
        class="q-mt-md q-pa-sm bg-grey-2"
      >
        <q-input
          :id="`tier-name-${tier.id}`"
          v-model="tier.name"
          label="Tier Name"
          dense
          class="q-mt-sm"
        />
        <q-input
          v-model.number="tier.price"
          label="Price (sats)"
          type="number"
          dense
          class="q-mt-sm"
        >
          <template #hint>
            <div v-if="bitcoinPrice">
              ~{{ formatCurrency((bitcoinPrice / 100000000) * tier.price, 'USD') }}
              /
              {{ formatCurrency((bitcoinPrice / 100000000) * tier.price, 'EUR') }}
            </div>
          </template>
        </q-input>
        <q-input
          v-model="tier.perks"
          label="Perks (Markdown)"
          type="textarea"
          autogrow
          dense
          class="q-mt-sm"
        />
        <q-input
          v-model="tier.welcomeMessage"
          label="Welcome Message"
          type="textarea"
          autogrow
          dense
          class="q-mt-sm"
        />
        <q-input
          v-model="tier.id"
          label="ID (optional)"
          dense
          class="q-mt-sm"
        />
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn
            color="primary"
            flat
            @click="saveTier(tier)"
            >Save Tier</q-btn
          >
          <q-btn
            color="negative"
            flat
            @click="removeTier(tier.id)"
            >Delete Tier</q-btn
          >
        </div>
      </div>
      <q-btn
        color="primary"
        flat
        class="q-mt-md"
        @click="addTier"
        >{{ $t('CreatorHub.dashboard.add_tier') }}</q-btn
      >
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  nextTick,
} from 'vue';
import { useCreatorHubStore, Tier } from 'stores/creatorHub';
import { useNostrStore } from 'stores/nostr';
import { useRouter } from 'vue-router';
import { usePriceStore } from 'stores/price';
import { useUiStore } from 'stores/ui';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'CreatorDashboardPage',
  setup() {
    const store = useCreatorHubStore();
    const nostr = useNostrStore();
    const router = useRouter();
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const profile = ref<any>({ display_name: '', picture: '', about: '' });
    const tiers = computed<Tier[]>(() => store.getTierArray());

    onMounted(async () => {
      if (!store.loggedInNpub) {
        router.push('/creator/login');
        return;
      }
      const p = await nostr.getProfile(store.loggedInNpub);
      if (p) profile.value = { ...p };
    });

    const logout = () => {
      store.logout();
      router.push('/creator/login');
    };

    const saveProfile = async () => {
      await store.updateProfile(profile.value);
    };

    const addTier = async () => {
      const id = uuidv4();
      store.addTier({ id, name: '', price: 0, perks: '', welcomeMessage: '' });
      await nextTick();
      const el = document.getElementById(`tier-name-${id}`);
      if (el) (el as HTMLInputElement).focus();
    };

    const removeTier = (id: string) => {
      store.removeTier(id);
    };

    const saveTier = (tier: Tier) => {
      store.updateTier(tier.id, { ...tier });
    };

    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);

    const formatCurrency = (amount: number, unit: string) =>
      uiStore.formatCurrency(amount, unit);

    return {
      profile,
      tiers,
      bitcoinPrice,
      formatCurrency,
      logout,
      saveProfile,
      addTier,
      removeTier,
      saveTier,
    };
  }
});
</script>
