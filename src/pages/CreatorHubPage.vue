<template>
  <q-page class="bg-grey-10 flex justify-center">
    <q-card
      class="q-pa-lg q-my-xl bg-grey-9 shadow-4"
      style="max-width:1024px"
    >
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
<q-splitter v-if="!isMobile" v-model="splitterModel">
  <template #before>
    <div class="q-gutter-md">
      <q-input v-model="profile.display_name" label="Display Name" dense outlined />
      <q-input v-model="profile.picture" label="Profile Picture URL" dense outlined />
      <q-input v-model="profile.about" label="About" type="textarea" autogrow dense outlined />
      <div>
        <q-select
          v-if="hasP2PK"
          v-model="profilePub"
          filled
          dense
          map-options
          emit-value
          :options="p2pkOptions"
          use-input
          fill-input
          input-debounce="0"
          label="P2PK Public Key"
        >
          <template #append>
            <q-btn flat dense icon="add" @click="generateP2PK" />
          </template>
          <template #after-options>
            <q-item clickable @click="generateP2PK">
              <q-item-section>Generate new key</q-item-section>
            </q-item>
          </template>
        </q-select>
        <div v-else class="row items-center q-gutter-sm">
          <div class="text-caption">You don't have a P2PK Public key.</div>
          <q-btn flat dense color="primary" label="Generate" @click="generateP2PK" />
        </div>
        <div v-if="profilePub" class="text-caption q-mt-xs">{{ selectedKeyShort }}</div>
      </div>
      <q-select
        v-model="profileMints"
        multiple
        use-input
        use-chips
        hide-dropdown-icon
        new-value-mode="add-unique"
        :options="[]"
        dense
        outlined
        persistent-hint
        hint="Press Enter after typing each URL"
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>Trusted Mints</span>
            <InfoTooltip class="q-ml-xs" text="Type a mint URL and press Enter" />
          </div>
        </template>
      </q-select>
      <q-select
        v-model="profileRelays"
        multiple
        use-input
        use-chips
        hide-dropdown-icon
        new-value-mode="add-unique"
        :options="[]"
        dense
        outlined
        persistent-hint
        hint="Press Enter after typing each URL"
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>Relays</span>
            <InfoTooltip class="q-ml-xs" text="Type a relay URL and press Enter" />
          </div>
        </template>
      </q-select>
      <div class="text-center q-mt-sm">
        <q-btn color="primary" class="q-mr-sm" :disable="!canPublish" @click="saveProfile">Save Changes</q-btn>
        <q-btn color="primary" outline :disable="!canPublish" @click="publishFullProfile">Publish Profile</q-btn>
      </div>
    </div>
  </template>
  <template #after>
    <div>
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
  </template>
</q-splitter>
<div v-else>
  <q-tabs v-model="tab" no-caps align="justify" class="q-mb-md">
    <q-tab name="profile" label="Profile" />
    <q-tab name="tiers" label="Subscription Tiers" />
  </q-tabs>
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="profile">
      <div class="q-gutter-md">
        <q-input v-model="profile.display_name" label="Display Name" dense outlined />
        <q-input v-model="profile.picture" label="Profile Picture URL" dense outlined />
        <q-input v-model="profile.about" label="About" type="textarea" autogrow dense outlined />
        <div>
        <q-select
          v-if="hasP2PK"
          v-model="profilePub"
          filled
          dense
          map-options
          emit-value
          :options="p2pkOptions"
          use-input
          fill-input
          input-debounce="0"
          label="P2PK Public Key"
        >
          <template #append>
            <q-btn flat dense icon="add" @click="generateP2PK" />
          </template>
          <template #after-options>
            <q-item clickable @click="generateP2PK">
              <q-item-section>Generate new key</q-item-section>
            </q-item>
          </template>
        </q-select>
        <div v-else class="row items-center q-gutter-sm">
          <div class="text-caption">You don't have a P2PK Public key.</div>
          <q-btn flat dense color="primary" label="Generate" @click="generateP2PK" />
        </div>
        <div v-if="profilePub" class="text-caption q-mt-xs">{{ selectedKeyShort }}</div>
      </div>
        <q-select
          v-model="profileMints"
          multiple
          use-input
          use-chips
          hide-dropdown-icon
          new-value-mode="add-unique"
          :options="[]"
          dense
          outlined
          persistent-hint
          hint="Press Enter after typing each URL"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>Trusted Mints</span>
              <InfoTooltip class="q-ml-xs" text="Type a mint URL and press Enter" />
            </div>
          </template>
        </q-select>
        <q-select
          v-model="profileRelays"
          multiple
          use-input
          use-chips
          hide-dropdown-icon
          new-value-mode="add-unique"
          :options="[]"
          dense
          outlined
          persistent-hint
          hint="Press Enter after typing each URL"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>Relays</span>
              <InfoTooltip class="q-ml-xs" text="Type a relay URL and press Enter" />
            </div>
          </template>
        </q-select>
        <div class="text-center q-mt-sm">
          <q-btn color="primary" class="q-mr-sm" :disable="!canPublish" @click="saveProfile">Save Changes</q-btn>
          <q-btn color="primary" outline :disable="!canPublish" @click="publishFullProfile">Publish Profile</q-btn>
        </div>
      </div>
    </q-tab-panel>
    <q-tab-panel name="tiers">
      <div>
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
    </q-tab-panel>
  </q-tab-panels>
</div>
</q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useCreatorHubStore, type Tier } from 'stores/creatorHub';
import { useNostrStore, fetchNutzapProfile, publishDiscoveryProfile, RelayConnectionError } from 'stores/nostr';
import { useP2PKStore } from 'stores/p2pk';
import { useMintsStore } from 'stores/mints';
import { v4 as uuidv4 } from 'uuid';
import { nip19 } from 'nostr-tools';
import { notifySuccess, notifyError } from 'src/js/notify';
import { shortenString } from 'src/js/string-utils';

const store = useCreatorHubStore();
const nostr = useNostrStore();
const p2pkStore = useP2PKStore();
const mintsStore = useMintsStore();
const $q = useQuasar();

const profile = ref({ display_name: '', picture: '', about: '' });
const profilePub = ref('');
const profileMints = ref<string[]>([]);
const profileRelays = ref<string[]>([]);
const nsec = ref('');
const isMobile = computed(() => $q.screen.lt.md);
const splitterModel = ref(50);
const tab = ref<'profile' | 'tiers'>('profile');

const loggedIn = computed(() => !!store.loggedInNpub);
const hasP2PK = computed(() => p2pkStore.p2pkKeys.length > 0);
const p2pkOptions = computed(() =>
  p2pkStore.p2pkKeys.map((k) => ({
    label: shortenString(k.publicKey, 16, 6),
    value: k.publicKey,
  }))
);
const selectedKeyShort = computed(() =>
  profilePub.value ? shortenString(profilePub.value, 16, 6) : ''
);
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
  let existing = null;
  try {
    existing = await fetchNutzapProfile(store.loggedInNpub);
  } catch (e: any) {
    if (e instanceof RelayConnectionError) {
      notifyError('Unable to connect to Nostr relays');
      return;
    }
    throw e;
  }
  if (existing) {
    profilePub.value = existing.p2pkPubkey;
    profileMints.value = [...existing.trustedMints];
    profileRelays.value = existing.relays ? [...existing.relays] : [...nostr.relays];
  } else {
    profileRelays.value = [...nostr.relays];
    if (p2pkStore.firstKey) profilePub.value = p2pkStore.firstKey.publicKey;
    if (mintsStore.mints.length > 0) profileMints.value = mintsStore.mints.map((m) => m.url);
  }
  await store.loadTiersFromNostr(store.loggedInNpub);
}

async function publishFullProfile() {
  try {
    await publishDiscoveryProfile({
      profile: profile.value,
      p2pkPub: profilePub.value,
      mints: profileMints.value,
      relays: profileRelays.value,
    });
  } catch (e: any) {
    notifyError(e.message);
  }
}

async function saveProfile() {
  await publishFullProfile();
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
    try {
      store.updateTier(id, data);
      await store.publishTierDefinitions();
      notifySuccess('Tier saved');
      saved.value[id] = true;
      setTimeout(() => {
        saved.value[id] = false;
      }, 2000);
    } catch (e: any) {
      notifyError(e?.message || 'Failed to save tier');
    }
  }
}

async function removeTier(id: string) {
  try {
    store.removeTier(id);
    await store.publishTierDefinitions();
  } catch (e: any) {
    notifyError(e?.message || 'Failed to delete tier');
  }
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
