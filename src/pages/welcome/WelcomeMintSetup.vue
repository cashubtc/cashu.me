<template>
  <div class="mint-setup-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <div class="icon-circle">
          <q-icon name="account_tree" size="2.5em" color="white" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="title">{{ $t("WelcomeMintSetup.title") }}</h1>

      <!-- Description -->
      <p class="description">
        {{ $t("WelcomeMintSetup.text") }}
      </p>

      <!-- Your added mints -->
      <div class="mints-section">
        <div class="mints-section-header">
          <h3 v-if="mints.mints.length > 0" class="section-title">
            {{ $t("WelcomeMintSetup.sections.your_mints") }}
          </h3>
          <!-- Restoring indicator during recover + Nostr search -->
          <div
            v-if="welcome.onboardingPath === 'recover' && restoringMints"
            class="row items-center q-mb-md q-px-lg"
          >
            <q-spinner-dots size="24px" color="grey-5" class="q-mr-sm" />
            <div class="text-grey-6">
              {{ $t("WelcomeMintSetup.restoring") }}
            </div>
          </div>
        </div>
        <div v-for="mint in mints.mints" :key="mint.url" class="mint-item">
          <div class="mint-content">
            <q-avatar
              v-if="getMintIconUrlExisting(mint)"
              size="34px"
              class="mint-icon"
            >
              <q-img
                spinner-color="white"
                spinner-size="xs"
                :src="getMintIconUrlExisting(mint)"
                alt="Mint Icon"
                style="height: 34px; max-width: 34px; font-size: 12px"
              />
            </q-avatar>
            <div class="mint-info">
              <div class="mint-name">
                {{ mint.nickname || mint.info?.name }}
              </div>
              <div class="mint-url">{{ mint.url }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual add mint -->
      <div class="add-mint-section">
        <h3 class="section-title">{{ $t("MintSettings.add.title") }}</h3>
        <div class="add-mint-inputs">
          <q-input
            rounded
            outlined
            v-model="addMintData.url"
            :placeholder="$t('WelcomeMintSetup.placeholder.mint_url')"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintInput"
            class="q-mb-md mint-input url-input"
          />
        </div>
        <div class="add-mint-button">
          <q-btn
            flat
            rounded
            :disable="addMintData.url.length === 0"
            @click="
              addMintData.url.length > 0
                ? sanitizeMintUrlAndShowAddDialog()
                : null
            "
            class="add-mint-btn"
          >
            <q-icon name="add" size="18px" class="q-mr-sm" />
            <span>{{ $t("MintSettings.add.actions.add_mint.label") }}</span>
          </q-btn>
        </div>
      </div>

      <!-- Recovery-specific: search user mints on nostr using seed -->
      <div v-if="welcome.onboardingPath === 'recover'">
        <NostrMintRestore
          :mnemonic="restore.mnemonicToRestore"
          :is-mnemonic-valid="isSeedValid"
          :auto-add="true"
        />
      </div>

      <!-- Discover mints on nostr (global) -->
      <div>
        <MintDiscovery :autoDiscover="true" :allowCreateReview="false" />
      </div>
    </div>

    <AddMintDialog
      :addMintData="addMintData"
      :showAddMintDialog="showAddMintDialog"
      @update:showAddMintDialog="showAddMintDialog = $event"
      :addMintBlocking="addMintBlocking"
      @add="addMintInternal"
    />
  </div>
</template>

<script lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import AddMintDialog from "src/components/AddMintDialog.vue";
import NostrMintRestore from "src/components/NostrMintRestore.vue";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import MintDiscovery from "../../components/MintDiscovery.vue";

export default {
  name: "WelcomeMintSetup",
  components: { AddMintDialog, NostrMintRestore, MintDiscovery },
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const mints = useMintsStore();
    const nostr = useNostrStore();
    const nostrMintBackup = useNostrMintBackupStore();
    const ui = useUiStore();

    const isSeedValid = computed(() => {
      const s = restore.mnemonicToRestore?.trim() || "";
      return s.split(/\s+/).length >= 12;
    });

    // Show spinner while the Nostr mint search is in progress in recover flow
    const restoringMints = computed(
      () => isSeedValid.value && nostrMintBackup.searchInProgress
    );

    const addMintData = mints.addMintData; // reactive from store
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

    const mintClass = (mint: any) => new MintClass(mint);
    const formatCurrency = (amount: number, unit: string) =>
      ui.formatCurrency(amount, unit);
    const getMintIconUrlExisting = (mint: any) =>
      mint?.info?.icon_url || undefined;

    const markDone = () => {
      welcome.mintSetupCompleted = true;
    };

    // Mark mint setup as completed on mount since it's optional
    // Users can proceed with or without adding mints
    onMounted(() => {
      welcome.mintSetupCompleted = true;
    });

    return {
      welcome,
      restore,
      mints,
      isSeedValid,
      addMintData,
      showAddMintDialog,
      addMintBlocking,
      sanitizeMintUrlAndShowAddDialog,
      addMintInternal,
      mintClass,
      formatCurrency,
      getMintIconUrlExisting,
      markDone,
      restoringMints,
    };
  },
};
</script>

<style scoped>
.mint-setup-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--q-dark);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  flex: 1;
  width: 100%;
  max-width: 500px;
}

.header-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
  line-height: 1.2;
  text-align: left;
  width: 100%;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  width: 100%;
}

.mints-section,
.add-mint-section {
  width: 100%;
  margin-bottom: 24px;
}

.section-title {
  font-size: 15.2px;
  font-family: Inter, -apple-system, "system-ui", "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
}

.mint-item {
  padding: 12px 12px 12px 0px;
  border-radius: 12px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.mint-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.mint-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.mint-info {
  flex: 1;
}

.mint-name {
  font-size: 15.2px;
  font-family: Inter, -apple-system, "system-ui", "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.mint-url {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

.add-mint-inputs {
  margin-bottom: 16px;
}

.add-mint-button {
  margin-top: 12px;
}

.add-mint-btn {
  width: auto;
  min-width: 100px;
  height: 36px;
  font-weight: 500;
  text-transform: none;
  font-size: 0.9rem;
  border-radius: 18px;
  color: var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.1);
  transition: all 0.2s ease;
}

.add-mint-btn:hover {
  background: rgba(var(--q-primary-rgb), 0.2);
  transform: translateY(-1px);
}

.add-mint-btn:disabled {
  color: rgba(255, 255, 255, 0.3);
  background: transparent;
  transform: none;
}

.mint-input .q-field__control {
  height: 44px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.mint-input .q-field__control:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.mint-input .q-field--focused .q-field__control {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(var(--q-primary-rgb), 0.5);
  box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.1);
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .mint-setup-slide {
    padding: 30px 15px 15px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  .mints-section,
  .add-mint-section {
    width: 100%;
  }

  .section-title {
    font-size: 14px;
  }

  .mint-name {
    font-size: 14px;
  }

  .mint-url {
    font-size: 0.85rem;
  }
}
</style>
