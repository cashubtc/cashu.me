<template>
  <q-page class="bg-grey-10 flex justify-center">
    <q-card
      class="q-pa-lg q-mt-md q-mb-md bg-grey-9 shadow-4"
      style="max-width: 1200px; width: 100%"
    >
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5">Creator Hub</div>
        <ThemeToggle />
      </div>
      <div v-if="!loggedIn" class="q-mt-lg q-mb-lg">
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
    <q-card class="section-card">
      <CreatorProfileForm />
    </q-card>
  </template>
  <template #after>
    <q-card class="section-card">
      <div>
        <div class="text-h6 q-mb-md">Subscription Tiers</div>
        <Draggable v-model="draggableTiers" item-key="id" handle=".drag-handle" @end="updateOrder">
          <template #item="{ element }">
            <div class="q-mb-md">
              <TierItem
                :tier-data="element"
                @edit="editTier(element.id)"
                @delete="confirmDelete(element.id)"
              />
            </div>
          </template>
        </Draggable>
        <div class="text-center q-mt-md">
          <q-btn color="primary" flat @click="addTier">Add Tier</q-btn>
        </div>
      </div>
    </q-card>
  </template>
</q-splitter>
<div v-else>
  <q-tabs v-model="tab" no-caps align="justify" class="q-mb-md">
    <q-tab name="profile" label="Profile" />
    <q-tab name="tiers" label="Subscription Tiers" />
  </q-tabs>
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="profile">
      <q-card class="section-card">
        <CreatorProfileForm />
      </q-card>
    </q-tab-panel>
    <q-tab-panel name="tiers">
      <q-card class="section-card">
        <div>
          <div class="text-h6 q-mb-md">Subscription Tiers</div>
          <Draggable v-model="draggableTiers" item-key="id" handle=".drag-handle" @end="updateOrder">
            <template #item="{ element }">
              <div class="q-mb-md">
                <TierItem
                  :tier-data="element"
                  @edit="editTier(element.id)"
                  @delete="confirmDelete(element.id)"
                />
              </div>
            </template>
          </Draggable>
          <div class="text-center q-mt-md">
            <q-btn color="primary" flat @click="addTier">Add Tier</q-btn>
          </div>
        </div>
      </q-card>
    </q-tab-panel>
  </q-tab-panels>
</div>
<DeleteModal v-model="deleteDialog" @confirm="performDelete" />
<AddTierDialog v-model="showTierDialog" :tier="currentTier" @save="refreshTiers" />
</div>
<PublishBar
  v-if="loggedIn"
  :publishing="publishing"
  @publish="publishFullProfile"
  @save="saveProfile"
/>
</q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import Draggable from 'vuedraggable';
import { useCreatorHubStore, type Tier } from 'stores/creatorHub';
import {
  useNostrStore,
  fetchNutzapProfile,
  publishDiscoveryProfile,
  RelayConnectionError,
  PublishTimeoutError,
} from 'stores/nostr';
import { useP2PKStore } from 'stores/p2pk';
import { useMintsStore } from 'stores/mints';
import { useCreatorProfileStore } from 'stores/creatorProfile';
import { storeToRefs } from 'pinia';
import { nip19 } from 'nostr-tools';
import { notifySuccess, notifyError } from 'src/js/notify';
import CreatorProfileForm from 'components/CreatorProfileForm.vue';
import TierItem from 'components/TierItem.vue';
import AddTierDialog from 'components/AddTierDialog.vue';
import DeleteModal from 'components/DeleteModal.vue';
import ThemeToggle from 'components/ThemeToggle.vue';
import PublishBar from 'components/PublishBar.vue';

const store = useCreatorHubStore();
const nostr = useNostrStore();
const p2pkStore = useP2PKStore();
const mintsStore = useMintsStore();
const profileStore = useCreatorProfileStore();
const $q = useQuasar();

const {
  display_name,
  picture,
  about,
  pubkey: profilePub,
  mints: profileMints,
  relays: profileRelays,
  isDirty,
} = storeToRefs(profileStore);
const profile = computed(() => ({
  display_name: display_name.value,
  picture: picture.value,
  about: about.value,
}));
const nsec = ref('');
const isMobile = computed(() => $q.screen.lt.md);
const splitterModel = ref(50);
const tab = ref<'profile' | 'tiers'>('profile');

const loggedIn = computed(() => !!store.loggedInNpub);
const tierList = computed<Tier[]>(() => store.getTierArray());
const draggableTiers = ref<Tier[]>([]);
const deleteDialog = ref(false);
const deleteId = ref('');
const showTierDialog = ref(false);
const currentTier = ref<Partial<Tier>>({});
const publishing = ref(false);
const npub = computed(() => (store.loggedInNpub ? nip19.npubEncode(store.loggedInNpub) : ''));

watch(
  tierList,
  (val) => {
    draggableTiers.value = [...val];
  },
  { immediate: true },
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
  if (p) profileStore.setProfile(p);
  if (profileStore.mints.length) {
    profileMints.value = [...profileStore.mints];
  }
  if (profileStore.relays.length) {
    profileRelays.value = [...profileStore.relays];
  }
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
    if (!profileStore.relays.length) {
      profileRelays.value = [...nostr.relays];
    }
    if (p2pkStore.firstKey) profilePub.value = p2pkStore.firstKey.publicKey;
    if (!profileStore.mints.length && mintsStore.mints.length > 0)
      profileMints.value = mintsStore.mints.map((m) => m.url);
  }
  await store.loadTiersFromNostr(store.loggedInNpub);
  profileStore.markClean();
}

async function publishFullProfile() {
  publishing.value = true;
  try {
    await publishDiscoveryProfile({
      profile: profile.value,
      p2pkPub: profilePub.value,
      mints: profileMints.value,
      relays: profileRelays.value,
    });
    notifySuccess('Profile updated');
    profileStore.markClean();
  } catch (e: any) {
    if (e instanceof PublishTimeoutError) {
      notifyError('Publishing timed out');
    } else {
      notifyError(e?.message || 'Failed to publish profile');
    }
  } finally {
    publishing.value = false;
  }
}

async function saveProfile() {
  await publishFullProfile();
}

function addTier() {
  currentTier.value = { name: '', price: 0, description: '', welcomeMessage: '' };
  showTierDialog.value = true;
}

function editTier(id: string) {
  const t = store.tiers[id];
  if (t) {
    currentTier.value = { ...t };
    showTierDialog.value = true;
  }
}

function confirmDelete(id: string) {
  deleteId.value = id;
  deleteDialog.value = true;
}

function updateOrder() {
  store.setTierOrder(draggableTiers.value.map((t) => t.id));
}

function refreshTiers() {
  draggableTiers.value = [...tierList.value];
}

async function removeTier(id: string) {
  try {
    store.removeTier(id);
    await store.publishTierDefinitions();
  } catch (e: any) {
    notifyError(e?.message || 'Failed to delete tier');
  }
}

async function performDelete() {
  if (!deleteId.value) return;
  await removeTier(deleteId.value);
  deleteDialog.value = false;
}

onMounted(async () => {
  if (store.loggedInNpub) await initPage();
});
</script>

<style lang="scss" src="../css/creator-hub.scss" scoped></style>


