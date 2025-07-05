<template>
  <q-page class="q-pa-md" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
    <div style="max-width:600px;margin:0 auto;width:100%">
      <div class="text-h5 text-center q-mb-lg">Creator Hub</div>
      <div v-if="!loggedIn" class="q-my-xl">
        <q-btn color="primary" class="full-width q-mb-md" @click="loginNip07">Login with Browser Signer</q-btn>
        <q-input v-model="nsec" type="password" label="nsec" outlined dense class="q-mb-sm" />
        <div class="text-negative text-caption q-mb-sm">Keep your nsec secret – it never leaves your browser.</div>
        <q-btn color="primary" outline class="full-width" @click="loginNsec">Login with nsec</q-btn>
      </div>
      <div v-else>
        <div class="text-center q-mb-md">
          Logged in as <span class="text-primary">{{ npub }}</span>
          <q-btn flat dense color="primary" class="q-ml-sm" @click="logout">Logout</q-btn>
        </div>
        <div class="q-gutter-y-sm">
          <q-input v-model="profile.display_name" label="Display Name" dense outlined />
          <q-input v-model="profile.picture" label="Profile Picture URL" dense outlined />
          <q-input v-model="profile.about" label="About" type="textarea" autogrow dense outlined />
          <q-input v-model="profilePub" label="P2PK Public Key" dense outlined>
            <template v-if="!hasP2PK" #append>
              <q-btn flat dense icon="add" @click="generateP2PK" />
            </template>
          </q-input>
          <q-input v-model="profileMints" label="Trusted Mints (comma separated)" dense outlined />
          <q-input v-model="profileRelays" label="Relays (comma separated)" dense outlined />
          <div class="text-center q-mt-sm">
            <q-btn color="primary" :disable="!canPublish" @click="publishFullProfile">Publish Profile</q-btn>
          </div>
        </div>
        <q-separator class="q-my-lg" />
        <div class="text-h6 q-mb-md">Subscription Tiers</div>
        <div v-for="tier in tierList" :key="tier.id" class="q-mb-md">
          <q-card flat bordered :class="{ 'saved-bg': saved[tier.id] }" class="relative-position">
            <transition name="fade">
              <q-icon
                v-if="saved[tier.id]"
                name="check_circle"
                color="positive"
                size="sm"
                class="saved-check"
              />
            </transition>
            <q-card-section>
              <q-input v-model="editedTiers[tier.id].name" label="Title" dense outlined class="q-mt-sm" />
              <q-input v-model.number="editedTiers[tier.id].price" label="Price (sats/month)" type="number" dense outlined class="q-mt-sm" />
              <q-input v-model="editedTiers[tier.id].description" label="Description" type="textarea" autogrow dense outlined class="q-mt-sm" />
              <q-input v-model="editedTiers[tier.id].welcomeMessage" label="Welcome Message" type="textarea" autogrow dense outlined class="q-mt-sm" />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" @click="saveTier(tier.id)">Save</q-btn>
              <q-btn flat color="negative" @click="removeTier(tier.id)">Delete</q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div class="text-center q-mt-md">
          <q-btn color="primary" flat @click="addTier">Add Tier</q-btn>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useCreatorHubStore, type Tier } from 'stores/creatorHub';
import { useNostrStore, fetchNutzapProfile, publishDiscoveryProfile } from 'stores/nostr';
import { useP2PKStore } from 'stores/p2pk';
import { useMintsStore } from 'stores/mints';
import { v4 as uuidv4 } from 'uuid';
import { nip19 } from 'nostr-tools';
import { notifySuccess, notifyError } from 'src/js/notify';

const store = useCreatorHubStore();
const nostr = useNostrStore();
const p2pkStore = useP2PKStore();
const mintsStore = useMintsStore();

const profile = ref({ display_name: '', picture: '', about: '' });
const profilePub = ref('');
const profileMints = ref('');
const profileRelays = ref('');
const nsec = ref('');

const loggedIn = computed(() => !!store.loggedInNpub);
const hasP2PK = computed(() => p2pkStore.p2pkKeys.length > 0);
const tierList = computed<Tier[]>(() => store.getTierArray());
const editedTiers = ref<Record<string, Tier>>({});
const saved = ref<Record<string, boolean>>({});
const npub = computed(() => (store.loggedInNpub ? nip19.npubEncode(store.loggedInNpub) : ''));

const canPublish = computed(
  () => profilePub.value.startsWith('02') && profileMints.value.length > 0 && profile.value.display_name,
);

watch(
  () => store.tiers,
  (val) => {
    const obj: Record<string, Tier> = {};
    const savedObj: Record<string, boolean> = {};
    Object.values(val).forEach((t) => {
      obj[t.id] = { ...t } as Tier;
      savedObj[t.id] = saved.value[t.id] || false;
    });
    editedTiers.value = obj;
    saved.value = savedObj;
  },
  { immediate: true, deep: true },
);

async function loginNip07() {
  await store.loginWithNip07();
  await initPage();
}

async function loginNsec() {
  if (!nsec.value) return;
  await store.loginWithNsec(nsec.value);
  await initPage();
}

function logout() {
  store.logout();
}

async function initPage() {
  if (!store.loggedInNpub) return;
  await nostr.initSignerIfNotSet();
  const p = await nostr.getProfile(store.loggedInNpub);
  if (p) profile.value = { ...p };
  const existing = await fetchNutzapProfile(store.loggedInNpub);
  if (existing) {
    profilePub.value = existing.p2pkPubkey;
    profileMints.value = existing.trustedMints.join(',');
    profileRelays.value = (existing.relays || nostr.relays).join(',');
  } else {
    profileRelays.value = nostr.relays.join(',');
    if (p2pkStore.firstKey) profilePub.value = p2pkStore.firstKey.publicKey;
    if (mintsStore.mints.length > 0) profileMints.value = mintsStore.mints.map((m) => m.url).join(',');
  }
  await store.loadTiersFromNostr(store.loggedInNpub);
}

async function publishFullProfile() {
  try {
    await publishDiscoveryProfile({
      profile: profile.value,
      p2pkPub: profilePub.value,
      mints: profileMints.value.split(',').map((s) => s.trim()).filter(Boolean),
      relays: profileRelays.value.split(',').map((s) => s.trim()).filter(Boolean),
    });
  } catch (e: any) {
    notifyError(e.message);
  }
}

function generateP2PK() {
  p2pkStore.createAndSelectNewKey().then(() => {
    if (!profilePub.value && p2pkStore.firstKey) profilePub.value = p2pkStore.firstKey.publicKey;
  });
}

function addTier() {
  const id = uuidv4();
  store.addTier({ id, name: '', price: 0, description: '', welcomeMessage: '' });
}

async function saveTier(id: string) {
  const data = editedTiers.value[id];
  if (data) {
    store.updateTier(id, data);
    await store.publishTierDefinitions();
    notifySuccess('Tier saved');
    saved.value[id] = true;
    setTimeout(() => {
      saved.value[id] = false;
    }, 2000);
  }
}

function removeTier(id: string) {
  store.removeTier(id);
  store.publishTierDefinitions();
}

onMounted(async () => {
  if (store.loggedInNpub) await initPage();
});
</script>

<style scoped>
.saved-bg {
  background-color: rgba(76, 175, 80, 0.15);
  transition: background-color 0.5s ease;
}
.saved-check {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}
.relative-position {
  position: relative;
}
</style>
