<template>
  <WelcomeSlideScaffold
    class="mint-setup-slide"
    :icon="MintIcon"
    :title="$t('WelcomeMintSetup.title')"
    :text="$t('WelcomeMintSetup.text')"
  >
    <!-- One column at the field's width: your mints, add a mint, then discovery, each under
         the same section divider the Mints tab uses. -->
    <div class="mint-setup-body">
      <section
        v-if="
          mints.mints.length > 0 ||
          (welcome.onboardingPath === 'recover' && restoringMints)
        "
        class="mint-setup-section"
      >
        <SectionDivider :label="$t('WelcomeMintSetup.sections.your_mints')" />
        <!-- Restoring indicator during recover + Nostr search -->
        <div
          v-if="welcome.onboardingPath === 'recover' && restoringMints"
          class="row items-center no-wrap q-mb-md text-app-muted"
        >
          <PendingDots class="q-mr-sm" />
          {{ $t("WelcomeMintSetup.restoring") }}
        </div>
        <div v-for="mint in mints.mints" :key="mint.url" class="mint-item">
          <MintCard
            :icon-url="getMintIconUrlExisting(mint)"
            :name="mint.nickname || mint.info?.name"
            :url="mint.url"
          />
        </div>
      </section>

      <!-- Manual add mint: the Mints tab's field and full-width action. -->
      <section class="mint-setup-section">
        <SectionDivider :label="$t('MintSettings.add.title')" />
        <div data-testid="onboarding-mint-url">
          <q-input
            outlined
            v-model="addMintData.url"
            :label="$t('global.inputs.mint_url.label')"
            :placeholder="$t('WelcomeMintSetup.placeholder.mint_url')"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintInput"
            class="url-input"
          />
        </div>
        <q-btn
          color="primary"
          rounded
          unelevated
          data-testid="onboarding-add-mint"
          class="full-width q-mt-md"
          :disable="addMintData.url.length === 0"
          @click="sanitizeMintUrlAndShowAddDialog"
        >
          <PlusIcon :size="18" class="q-mr-sm" />
          {{ $t("MintSettings.add.actions.add_mint.label") }}
        </q-btn>
      </section>

      <!-- Recovery-specific: search user mints on nostr using seed -->
      <section
        v-if="welcome.onboardingPath === 'recover'"
        class="mint-setup-section"
      >
        <NostrMintRestore
          :mnemonic="restore.mnemonicToRestore"
          :is-mnemonic-valid="isSeedValid"
          :auto-add="true"
        />
      </section>

      <!-- Discover mints on nostr (global) -->
      <section class="mint-setup-section">
        <SectionDivider
          class="q-mb-sm"
          :label="$t('MintSettings.discover.title')"
        />
        <MintDiscovery :autoDiscover="true" :allowCreateReview="false" />
      </section>
    </div>

    <AddMintDialog
      :addMintData="addMintData"
      :showAddMintDialog="showAddMintDialog"
      @update:showAddMintDialog="showAddMintDialog = $event"
      :addMintBlocking="addMintBlocking"
      @add="addMintInternal"
    />
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import { Building2 as MintIcon, Plus as PlusIcon } from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import { computed, onMounted } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useMintsStore } from "src/stores/mints";
import AddMintDialog from "src/components/AddMintDialog.vue";
import MintCard from "src/components/MintCard.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import NostrMintRestore from "src/components/NostrMintRestore.vue";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import MintDiscovery from "src/components/MintDiscovery.vue";

export default {
  name: "WelcomeMintSetup",
  components: {
    PendingDots,
    PlusIcon,
    WelcomeSlideScaffold,
    AddMintDialog,
    NostrMintRestore,
    MintDiscovery,
    MintCard,
    SectionDivider,
  },
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const mints = useMintsStore();
    const nostrMintBackup = useNostrMintBackupStore();

    const isSeedValid = computed(() => {
      const s = restore.mnemonicToRestore?.trim() || "";
      return s.split(/\s+/).length >= 12;
    });

    // Show spinner while the Nostr mint search is in progress in recover flow
    const restoringMints = computed(
      () => isSeedValid.value && nostrMintBackup.searchInProgress
    );

    // Read through the store each time: adding a mint replaces the store's object, and a
    // captured reference kept showing the added URL in the field.
    const addMintData = computed(() => mints.addMintData);
    const showAddMintDialog = computed({
      get: () => mints.showAddMintDialog,
      set: (v: boolean) => (mints.showAddMintDialog = v),
    });
    const addMintBlocking = computed(() => mints.addMintBlocking);

    const sanitizeMintUrlAndShowAddDialog = () => {
      mints.showAddMintDialog = true;
    };
    const addMintInternal = async (data: {
      url: string;
      nickname?: string;
    }) => {
      await mints.addMint(data, true);
      mints.addMintData = { url: "", nickname: "" } as any;
    };

    const getMintIconUrlExisting = (mint: any) =>
      mint?.info?.icon_url || undefined;

    // Mark mint setup as completed on mount since it's optional
    // Users can proceed with or without adding mints
    onMounted(() => {
      welcome.mintSetupCompleted = true;
    });

    return {
      MintIcon,
      welcome,
      restore,
      mints,
      isSeedValid,
      addMintData,
      showAddMintDialog,
      addMintBlocking,
      sanitizeMintUrlAndShowAddDialog,
      addMintInternal,
      getMintIconUrlExisting,
      restoringMints,
    };
  },
};
</script>

<style scoped>
/* The step's own content: the slide's column, every block on its edges. */
.mint-setup-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}
.mint-setup-section {
  width: 100%;
}
.mint-item + .mint-item {
  margin-top: 12px;
}
</style>
