<template>
  <div class="space-y-4">
    <CreatorProfileForm
      v-model:display_name="display_name"
      v-model:picture="picture"
      v-model:about="about"
      v-model:profilePub="profilePub"
      v-model:profileMints="profileMints"
      v-model:profileRelays="profileRelays"
      :hasP2PK="hasP2PK"
      :p2pkOptions="p2pkOptions"
      :selectedKeyShort="selectedKeyShort"
      :generateP2PK="generateP2PK"
    />
    <div class="flex space-x-2">
      <q-btn color="primary" :disable="!isDirty" @click="saveProfile">Save Changes</q-btn>
      <q-btn color="primary" outline :disable="!isDirty" @click="publishProfile">Publish Profile</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CreatorProfileForm from './CreatorProfileForm.vue';
import { useCreatorHubStore } from 'stores/creatorHub';
import { useCreatorProfileStore } from 'stores/creatorProfile';
import { useP2PKStore } from 'stores/p2pk';
import { useNostrStore, publishDiscoveryProfile } from 'stores/nostr';
import { useMintsStore } from 'stores/mints';
import { storeToRefs } from 'pinia';
import { notifySuccess, notifyError } from 'src/js/notify';
import { shortenString } from 'src/js/string-utils';

const hub = useCreatorHubStore();
const profileStore = useCreatorProfileStore();
const p2pkStore = useP2PKStore();
const nostr = useNostrStore();
const mintsStore = useMintsStore();

const {
  display_name,
  picture,
  about,
  pubkey: profilePub,
  mints: profileMints,
  relays: profileRelays,
  isDirty,
} = storeToRefs(profileStore);

const hasP2PK = computed(() => p2pkStore.p2pkKeys.length > 0);
const p2pkOptions = computed(() =>
  p2pkStore.p2pkKeys.map(k => ({ label: shortenString(k.publicKey, 16, 6), value: k.publicKey }))
);
const selectedKeyShort = computed(() =>
  profilePub.value ? shortenString(profilePub.value, 16, 6) : ''
);

function generateP2PK() {
  p2pkStore.createAndSelectNewKey().then(() => {
    if (!profilePub.value && p2pkStore.firstKey) profilePub.value = p2pkStore.firstKey.publicKey;
  });
}

async function publishProfile() {
  try {
    await publishDiscoveryProfile({
      profile: {
        display_name: display_name.value,
        picture: picture.value,
        about: about.value,
      },
      p2pkPub: profilePub.value || '',
      mints: profileMints.value,
      relays: profileRelays.value,
    });
    notifySuccess('Profile updated');
    profileStore.markClean();
  } catch (e: any) {
    notifyError(e?.message || 'Failed to publish profile');
  }
}

async function saveProfile() {
  await publishProfile();
}
</script>
