<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md',
    ]"
  >
    <div class="row items-center justify-between">
      <div class="text-h5">{{ $t("CreatorHub.dashboard.title") }}</div>
      <q-btn flat color="primary" @click="logout">{{
        $t("CreatorHub.dashboard.logout")
      }}</q-btn>
      <q-btn
        v-if="!nostr.signer"
        flat
        color="primary"
        class="q-ml-sm"
        @click="connectSigner"
      >
        Connect Nostr Signer
      </q-btn>
    </div>

    <q-banner v-if="needsProfile" dense class="bg-orange text-white q-mt-md">
      <div class="row items-center">
        <div class="col">
          ⚠ You haven’t published a Nutzap profile yet. Supporters cannot
          subscribe to your tiers.
        </div>
        <q-btn
          v-if="!hasP2PK"
          color="white"
          text-color="orange"
          label="Generate P2PK key"
          @click="generateP2PK"
          class="q-ml-md"
        />
      </div>
    </q-banner>

    <!-- NEW: profile composer ------------------------------------- -->
    <q-card class="q-mt-md q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-h6">Nutzap receiving profile</div>
        <q-input v-model="profilePub" label="P2PK pubkey (hex, start with 02…)" dense />
        <q-input v-model="profileMints" label="Trusted mints (comma-separated URLs)" dense />
        <q-input v-model="profileRelays" label="Relay hints (comma-separated wss://…)" dense />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" :disable="!canSaveNutzap" @click="publishProfile">Publish now</q-btn>
      </q-card-actions>
    </q-card>

    <NutzapNotification class="q-mt-md" />

    <div class="q-mt-md">
      <div class="text-h6">{{ $t("CreatorHub.dashboard.edit_profile") }}</div>
      <q-input
        v-model="profile.display_name"
        label="Display Name"
        class="q-mt-sm"
      />
      <q-input
        v-model="profile.picture"
        label="Profile Picture URL"
        class="q-mt-sm"
      />
      <q-input
        v-model="profile.about"
        type="textarea"
        label="Bio"
        class="q-mt-sm"
      />
      <q-btn color="primary" flat class="q-mt-sm" @click="saveProfile">{{
        $t("global.actions.update.label")
      }}</q-btn>
    </div>

    <div class="q-mt-lg">
      <div class="text-h6">{{ $t("CreatorHub.dashboard.manage_tiers") }}</div>
      <AddTierDialog
        v-model="showAddTierDialog"
        :tier="newTier"
        @save="saveNewTier"
      />
      <div v-for="tier in tiers" :key="tier.id" class="q-mt-md">
        <q-card>
          <q-card-section>
            <q-input
              :id="`tier-name-${tier.id}`"
              v-model="editedTiers[tier.id].name"
              label="Title"
              dense
              outlined
              class="q-mt-sm"
            />
            <q-input
              v-model.number="editedTiers[tier.id].price"
              label="Cost / month (sats)"
              type="number"
              dense
              outlined
              class="q-mt-sm"
            >
              <template #hint>
                <div v-if="bitcoinPrice">
                  ~{{
                    formatCurrency(
                      (bitcoinPrice / 100000000) * editedTiers[tier.id].price,
                      "USD"
                    )
                  }}
                  /
                  {{
                    formatCurrency(
                      (bitcoinPrice / 100000000) * editedTiers[tier.id].price,
                      "EUR"
                    )
                  }}
                </div>
              </template>
            </q-input>
            <q-input
              v-model="editedTiers[tier.id].description"
              label="Description (Markdown)"
              type="textarea"
              autogrow
              dense
              outlined
              class="q-mt-sm"
            />
            <q-input
              v-model="editedTiers[tier.id].welcomeMessage"
              label="Welcome Message"
              type="textarea"
              autogrow
              dense
              outlined
              class="q-mt-sm"
            />
            <q-input
              v-model="editedTiers[tier.id].id"
              label="ID (optional)"
              dense
              outlined
              class="q-mt-sm"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="primary" flat @click="saveTier(tier)">{{
              $t("CreatorHub.dashboard.save_tier")
            }}</q-btn>
            <q-btn
              outline
              color="primary"
              class="q-mr-sm"
              :style="{ borderRadius: '8px' }"
              @click="cancelEdit(tier.id)"
              >{{ $t("global.actions.cancel.label") }}</q-btn
            >
            <q-btn color="negative" flat @click="removeTier(tier.id)">{{
              $t("CreatorHub.dashboard.delete_tier")
            }}</q-btn>
          </q-card-actions>
        </q-card>
      </div>
      <div class="row q-gutter-sm q-mt-md">
        <q-btn color="primary" flat @click="openAddTier">{{
          $t("CreatorHub.dashboard.add_tier")
        }}</q-btn>
        <q-btn color="primary" flat @click="saveAllTiers">{{
          $t("CreatorHub.dashboard.save_tier")
        }}</q-btn>
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
  publishNutzapProfile,
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
    const profile = ref<any>({ display_name: "", picture: "", about: "" });
    const needsProfile = ref(false);

    const profilePub = ref("");
    const profileMints = ref("");
    const profileRelays = ref("");

    const canSaveNutzap = computed(
      () => profilePub.value.startsWith("02") && profileMints.value.length > 0
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
      const p = await nostr.getProfile(store.loggedInNpub);
      if (p) profile.value = { ...p };
      const npub = nostr.pubkey;
      const existing = await fetchNutzapProfile(npub);
      needsProfile.value = !existing;
    }

    onMounted(async () => {
      try {
        await initPage();
      } catch (e) {
        notifyError('Creator dashboard disabled – signer missing');
      }
    });

    const logout = () => {
      store.logout();
      router.push("/creator/login");
    };

    const saveProfile = async () => {
      await store.updateProfile(profile.value);
      notifySuccess("Profile saved");
    };

    const showAddTierDialog = ref(false);
    const newTier = ref<Partial<Tier>>({});

    const openAddTier = () => {
      newTier.value = {
        id: uuidv4(),
        name: "",
        price: 0,
        description: "",
        welcomeMessage: "",
      };
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

    async function doPublish() {
      const first = p2pkStore.firstKey;
      if (!first) {
        notifyError('No P2PK key');
      }
      try {
        await publishNutzapProfile({
          p2pkPub: first.publicKey,
          mints: mintsStore.mints.map((m) => m.url),
          relays: nostr.relays,
        });
        notifySuccess("Profile published");
        needsProfile.value = false;
      } catch (e: any) {
        notifyError("Failed to publish");
      }
    }

    async function publishProfile() {
      try {
        await publishNutzapProfile({
          p2pkPub: profilePub.value,
          mints: profileMints.value.split(",").map((s) => s.trim()),
          relays: profileRelays.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        });
        notifySuccess("Nutzap profile published ✔");
        needsProfile.value = false;
      } catch (e: any) {
        notifyError(e);
      }
    }

    async function generateP2PK() {
      await p2pkStore.createAndSelectNewKey();
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
      if (tier) {
        editedTiers.value[id] = { ...tier };
      } else {
        delete editedTiers.value[id];
        if (newTier.value.id === id) {
          showAddTierDialog.value = false;
        }
      }
    };

    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);

    const formatCurrency = (amount: number, unit: string) =>
      uiStore.formatCurrency(amount, unit);

    return {
      profile,
      tiers,
      needsProfile,
      hasP2PK,
      bitcoinPrice,
      formatCurrency,
      logout,
      saveProfile,
      openAddTier,
      showAddTierDialog,
      newTier,
      saveNewTier,
      saveAllTiers,
      removeTier,
      saveTier,
      doPublish,
      generateP2PK,
      connectSigner,
      editedTiers,
      cancelEdit,
      profilePub,
      profileMints,
      profileRelays,
      canSaveNutzap,
      publishProfile,
    };
  },
});
</script>
