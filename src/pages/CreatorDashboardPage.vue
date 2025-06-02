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
      <div v-for="tier in tiers" :key="tier.id" class="q-mt-md q-pa-sm bg-grey-2">
        <q-input v-model="tier.name" label="Tier Name" dense class="q-mt-sm" />
        <q-input v-model.number="tier.price" label="Price (sats)" type="number" dense class="q-mt-sm" />
        <q-input v-model="tier.perks" label="Perks" type="textarea" dense class="q-mt-sm" />
        <q-btn color="negative" flat class="q-mt-sm" @click="removeTier(tier.id)">Delete</q-btn>
      </div>
      <q-btn color="primary" flat class="q-mt-md" @click="addTier">{{ $t('CreatorHub.dashboard.add_tier') }}</q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useCreatorHubStore, Tier } from 'stores/creatorHub';
import { useNostrStore } from 'stores/nostr';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CreatorDashboardPage',
  setup() {
    const store = useCreatorHubStore();
    const nostr = useNostrStore();
    const router = useRouter();
    const profile = ref<any>({ display_name: '', picture: '', about: '' });
    const tiers = ref<Tier[]>([]);

    onMounted(async () => {
      if (!store.loggedInNpub) {
        router.push('/creator/login');
        return;
      }
      const p = await nostr.getProfile(store.loggedInNpub);
      if (p) profile.value = { ...p };
      tiers.value = store.getTierArray();
    });

    const logout = () => {
      store.logout();
      router.push('/creator/login');
    };

    const saveProfile = async () => {
      await store.updateProfile(profile.value);
    };

    const addTier = () => {
      store.addTier({ name: '', price: 0, perks: '' });
      tiers.value = store.getTierArray();
    };

    const removeTier = (id: string) => {
      store.removeTier(id);
      tiers.value = store.getTierArray();
    };

    return { profile, tiers, logout, saveProfile, addTier, removeTier };
  }
});
</script>
