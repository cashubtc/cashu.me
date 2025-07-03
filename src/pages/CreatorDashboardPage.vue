<template>
  <div :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md']">
    <div class="row items-center justify-between">
      <div class="text-h5">{{ $t("CreatorHub.dashboard.title") }}</div>
      <div>
        <q-btn v-if="signerChecked && !nostr.signer" flat color="primary" class="q-ml-sm" @click="connectSigner">
          Connect Nostr Signer
        </q-btn>
        <q-btn flat color="primary" @click="logout">{{ $t("CreatorHub.dashboard.logout") }}</q-btn>
      </div>
    </div>

    <q-banner v-if="needsProfile" dense class="bg-orange text-white q-mt-md">
      <div class="row items-center">
        <div class="col">
          ⚠ Your public profile is incomplete. Fill out and publish the details below so supporters can find you.
        </div>
      </div>
    </q-banner>

    <!-- UNIFIED PROFILE EDITOR -->
    <q-card class="q-mt-md q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h6">Your Public Creator Profile</div>
        <p class="text-caption text-grey-7">This information will be published to Nostr so others can find and subscribe to you.</p>

        <div class="q-gutter-y-md q-mt-md">
          <q-input v-model="profile.display_name" label="Display Name" dense outlined />
          <q-input v-model="profile.picture" label="Profile Picture URL" dense outlined />
          <q-input v-model="profile.about" type="textarea" label="Bio" dense outlined autogrow />
          <q-input v-model="profileRelays" label="Your Public Relays (comma-separated wss://…)" dense outlined hint="These are the relays others will use to find you."/>
          <q-input v-model="profileMints" label="Your Trusted Cashu Mints (comma-separated URLs)" dense outlined hint="Fans will use these mints to pay you."/>
          <q-input v-model="profilePub" label="Your Cashu P2PK Public Key (hex)" dense outlined>
             <template v-if="!hasP2PK" #append>
                <q-btn flat dense color="primary" label="Generate" @click="generateP2PK" />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" :disable="!canPublish" @click="publishFullProfile">
          Publish Profile to Nostr
        </q-btn>
      </q-card-actions>
    </q-card>

    <NutzapNotification class="q-mt-md" />

    <!-- TIER MANAGEMENT (Unchanged) -->
    <div class="q-mt-lg">
      <div class="text-h6">{{ $t("CreatorHub.dashboard.manage_tiers") }}</div>
      <AddTierDialog v-model="showAddTierDialog" :tier="newTier" @save="saveNewTier" />
      <div v-for="tier in tiers" :key="tier.id" class="q-mt-md">
        <q-card>
          <q-card-section>
            <q-input :id="`tier-name-${tier.id}`" v-model="editedTiers[tier.id].name" label="Title" dense outlined class="q-mt-sm" />
            <q-input v-model.number="editedTiers[tier.id].price" label="Cost / month (sats)" type="number" dense outlined class="q-mt-sm">
              <template #hint>
                <div v-if="bitcoinPrice">
                  ~{{ formatCurrency((bitcoinPrice / 100000000) * editedTiers[tier.id].price, "USD") }} /
                  {{ formatCurrency((bitcoinPrice / 100000000) * editedTiers[tier.id].price, "EUR") }}
                </div>
              </template>
            </q-input>
            <q-input v-model="editedTiers[tier.id].description" label="Description (Markdown)" type="textarea" autogrow dense outlined class="q-mt-sm" />
            <q-input v-model="editedTiers[tier.id].welcomeMessage" label="Welcome Message" type="textarea" autogrow dense outlined class="q-mt-sm" />
            <q-input v-model="editedTiers[tier.id].id" label="ID (optional)" dense outlined class="q-mt-sm" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="primary" flat @click="saveTier(tier)">{{ $t("CreatorHub.dashboard.save_tier") }}</q-btn>
            <q-btn outline color="primary" class="q-mr-sm" :style="{ borderRadius: '8px' }" @click="cancelEdit(tier.id)">{{ $t("global.actions.cancel.label") }}</q-btn>
            <q-btn color="negative" flat @click="removeTier(tier.id)">{{ $t("CreatorHub.dashboard.delete_tier") }}</q-btn>
          </q-card-actions>
        </q-card>
      </div>
      <div class="row q-gutter-sm q-mt-md">
        <q-btn color="primary" flat @click="openAddTier">{{ $t("CreatorHub.dashboard.add_tier") }}</q-btn>
        <q-btn color="primary" flat @click="saveAllTiers">{{ $t("CreatorHub.dashboard.save_tier") }}</q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { useCreatorHubStore, Tier } from "stores/creatorHub";
import AddTierDialog from "components/AddTierDialog.vue";
import NutzapNotification from "components/NutzapNotification.vue";
import {
  useNostrStore,
  fetchNutzapProfile,
  // NEW: Import our powerful new function
  publishDiscoveryProfile,
} from "stores/nostr";
import { useP2PKStore } from "stores/p2pk";
import { useMintsStore } from "stores/mints";
import { useRouter } from "vue-router";
import { usePriceStore } from "stores/price";
import { useUiStore } from "stores/ui";
import { v4 as uuidv4 } from "uuid";
import { notifySuccess, notifyError } from "src/js/notify";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "CreatorDashboardPage",
  components: { AddTierDialog, NutzapNotification },
  setup() {
    const { t } = useI18n();
    const store = useCreatorHubStore();
    const nostr = useNostrStore();
    const router = useRouter();
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const signerChecked = ref(false);

    // --- State for all profile fields ---
    const profile = ref({ display_name: "", picture: "", about: "" });
    const profilePub = ref("");
    const profileMints = ref("");
    const profileRelays = ref("");
    const needsProfile = ref(false);

    const canPublish = computed(
      () => profilePub.value.startsWith("02") && profileMints.value.length > 0 && profile.value.display_name
    );

    const p2pkStore = useP2PKStore();
    const mintsStore = useMintsStore();
    const hasP2PK = computed(() => p2pkStore.p2pkKeys.length > 0);
    const tiers = computed<Tier[]>(() => store.getTierArray());
    const editedTiers = ref<Record<string, Tier>>({});

    watch(
      () => store.tiers,
      (val) => {
        const obj: Record<string, Tier> = {};
        Object.values(val).forEach((t) => {
          obj[t.id] = { ...t };
        });
        editedTiers.value = obj;
      },
      { immediate: true, deep: true }
    );

    async function initPage() {
      if (!store.loggedInNpub) {
        router.push("/creator/login");
        return;
      }
      // Fetch Kind 0
      const p = await nostr.getProfile(store.loggedInNpub);
      if (p) profile.value = { ...p };

      // Fetch Kind 10019
      const npub = nostr.pubkey;
      const existingNutzap = await fetchNutzapProfile(npub);
      if (existingNutzap) {
        profilePub.value = existingNutzap.p2pkPubkey;
        profileMints.value = existingNutzap.trustedMints.join(',');
        profileRelays.value = (existingNutzap.relays || nostr.relays).join(',');
      } else {
        // Pre-fill with defaults if no profile exists
        profileRelays.value = nostr.relays.join(',');
        if (p2pkStore.firstKey) {
            profilePub.value = p2pkStore.firstKey.publicKey;
        }
        if (mintsStore.mints.length > 0) {
            profileMints.value = mintsStore.mints.map(m => m.url).join(',');
        }
      }
      needsProfile.value = !existingNutzap || !p;
    }

    onMounted(async () => {
      try {
        await nostr.initSignerIfNotSet();
        await initPage();
      } catch (e) {
        notifyError('Creator dashboard disabled – signer missing');
      } finally {
        signerChecked.value = true;
      }
    });

    const logout = () => {
      store.logout();
      router.push("/creator/login");
    };

    // --- NEW: Unified Publish Function ---
    // This function gathers all data from the form and calls our new store action
    async function publishFullProfile() {
      if (!canPublish.value) {
        notifyError("Please fill out your Display Name, P2PK key, and at least one Mint URL.");
        return;
      }
      try {
        await publishDiscoveryProfile({
          profile: profile.value,
          p2pkPub: profilePub.value,
          mints: profileMints.value.split(",").map((s) => s.trim()).filter(Boolean),
          relays: profileRelays.value.split(",").map((s) => s.trim()).filter(Boolean),
        });
        needsProfile.value = false;
      } catch (e: any) {
        notifyError(e.message || "Failed to publish profile.");
      }
    }

    const showAddTierDialog = ref(false);
    const newTier = ref<Partial<Tier>>({});

    const openAddTier = () => {
      newTier.value = { id: uuidv4(), name: "", price: 0, description: "", welcomeMessage: "" };
      showAddTierDialog.value = true;
    };

    const saveNewTier = async (tier: Partial<Tier>) => {
      showAddTierDialog.value = false;
      store.addTier(tier);
      await store.publishTierDefinitions();
      notifySuccess("Tier added");
    };

    const saveAllTiers = async () => {
      tiers.value.forEach((t) => saveTier(t));
      await store.publishTierDefinitions();
      notifySuccess("All tiers saved");
    };

    const removeTier = async (id: string) => {
      store.removeTier(id);
      await store.publishTierDefinitions();
      notifySuccess("Tier removed");
    };

    async function generateP2PK() {
      await p2pkStore.createAndSelectNewKey();
      // auto-populate the field if it's empty
      if (!profilePub.value && p2pkStore.firstKey) {
          profilePub.value = p2pkStore.firstKey.publicKey
      }
    }

    async function connectSigner() {
      try {
        await nostr.connectBrowserSigner();
        notifySuccess(t("wallet.signer_connected"));
      } catch (e: any) {
        notifyError((e as Error).message);
      }
    }

    const saveTier = async (tier: Tier) => {
      const data = editedTiers.value[tier.id];
      if (data) {
        store.updateTier(tier.id, { ...data });
        await store.publishTierDefinitions();
        notifySuccess("Tier updated");
      }
    };

    const cancelEdit = (id: string) => {
      const tier = store.tiers[id];
      if (tier) editedTiers.value[id] = { ...tier };
      else delete editedTiers.value[id];
    };

    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);
    const formatCurrency = (amount: number, unit: string) => uiStore.formatCurrency(amount, unit);

    return {
      profile,
      tiers,
      needsProfile,
      hasP2PK,
      bitcoinPrice,
      formatCurrency,
      logout,
      openAddTier,
      showAddTierDialog,
      newTier,
      saveNewTier,
      saveAllTiers,
      removeTier,
      saveTier,
      generateP2PK,
      connectSigner,
      editedTiers,
      cancelEdit,
      profilePub,
      profileMints,
      profileRelays,
      canPublish,
      publishFullProfile, // Expose the new function to the template
      signerChecked,
      nostr,
    };
  },
});
</script>
