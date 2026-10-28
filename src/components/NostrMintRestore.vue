<template>
  <SettingsSection
    v-if="!autoAdd"
    flat
    class="nostr-mint-restore"
    :title="$t('RestoreView.nostr_mints.label')"
    :caption="$t('RestoreView.nostr_mints.caption')"
  >
    <q-btn
      class="full-width"
      color="primary"
      outline
      rounded
      @click="searchForMints"
      :disabled="!isMnemonicValid || searchInProgress"
      :loading="searchInProgress"
    >
      <SearchIcon :size="20" class="q-mr-sm" />
      {{ $t("RestoreView.nostr_mints.search_button") }}
      <template v-slot:loading
        ><PendingDots class="on-left" />{{
          $t("RestoreView.nostr_mints.search_button")
        }}</template
      >
    </q-btn>

    <!-- Discovered mints: the standard mint card, selected with its checkbox. -->
    <div v-if="availableMints.length > 0" class="q-mt-lg">
      <q-btn
        color="primary"
        unelevated
        rounded
        @click="addSelectedMints"
        :loading="addingMints"
        :disabled="addingMints || selectedMints.length === 0"
        class="full-width"
      >
        <PlusIcon :size="20" class="q-mr-sm" />
        {{
          $t("RestoreView.nostr_mints.add_selected", {
            count: selectedMints.length,
          })
        }}
        <template v-slot:loading
          ><PendingDots class="on-left" />{{
            $t("RestoreView.nostr_mints.add_selected", {
              count: selectedMints.length,
            })
          }}</template
        >
      </q-btn>

      <div class="row no-wrap q-my-md selection-buttons">
        <q-btn
          flat
          rounded
          class="col"
          @click="selectAllMints"
          :disabled="allSelected"
        >
          {{ $t("RestoreView.nostr_mints.select_all") }}
        </q-btn>
        <q-btn
          flat
          rounded
          class="col"
          @click="deselectAllMints"
          :disabled="!anySelected"
        >
          {{ $t("RestoreView.nostr_mints.deselect_all") }}
        </q-btn>
      </div>

      <div
        v-for="mint in availableMints"
        :key="mint.url"
        class="discovered-mint"
      >
        <MintCard
          clickable
          :active="mint.selected"
          :icon-url="getMintIconUrl(mint.url) || undefined"
          :name="getMintDisplayName(mint.url)"
          :url="mint.url"
          :loading="isFetchingMintInfo(mint.url)"
          @click="toggleMintSelection(mint.url)"
        >
          <template #action>
            <q-checkbox
              :model-value="mint.selected"
              @update:model-value="toggleMintSelection(mint.url)"
              @click.stop
              color="primary"
              dense
              class="restore-mint-check"
              :aria-label="getMintDisplayName(mint.url)"
            />
          </template>
          <template #meta>
            <span class="text-caption text-app-muted">
              {{ $t("RestoreView.nostr_mints.backed_up") }}:
              {{ formatDate(mint.timestamp) }}
            </span>
          </template>
        </MintCard>
      </div>
    </div>

    <EmptyState
      v-else-if="hasSearched && !searchInProgress"
      :icon="CloudOffIcon"
      :title="$t('RestoreView.nostr_mints.no_backups_found')"
      :text="$t('RestoreView.nostr_mints.no_backups_hint')"
    />
  </SettingsSection>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import EmptyState from "src/components/ui/EmptyState.vue";
import MintCard from "src/components/MintCard.vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";
import {
  CloudOff as CloudOffIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
} from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import { useMintsStore, MintClass } from "src/stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";
import { notifyError } from "src/js/notify";
import { date } from "quasar";

export default defineComponent({
  components: {
    EmptyState,
    MintCard,
    PendingDots,
    PlusIcon,
    SearchIcon,
    SettingsSection,
  },
  setup() {
    return { CloudOffIcon };
  },
  name: "NostrMintRestore",
  props: {
    mnemonic: {
      type: String,
      required: true,
    },
    isMnemonicValid: {
      type: Boolean,
      required: true,
    },
    // If true, component renders no UI, starts searching immediately
    // and auto-adds discovered mints to the wallet.
    autoAdd: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hasSearched: false,
      addingMints: false,
      mintInfoCache: new Map(), // Cache for mint info to avoid duplicate requests
      fetchingMintInfo: new Set(), // Track which mints are currently being fetched
    };
  },
  computed: {
    ...mapState(useNostrMintBackupStore, [
      "discoveredMints",
      "searchInProgress",
    ]),
    ...mapState(useMintsStore, ["mints"]),

    // Filter out mints that already exist
    availableMints() {
      return this.discoveredMints.filter((mint) => !this.mintExists(mint.url));
    },

    selectedMints() {
      return this.availableMints.filter((mint) => mint.selected);
    },

    allSelected() {
      return (
        this.availableMints.length > 0 &&
        this.availableMints.every((mint) => mint.selected)
      );
    },

    anySelected() {
      return this.availableMints.some((mint) => mint.selected);
    },
  },
  watch: {
    // Watch for changes in discovered mints and fetch their info
    discoveredMints: {
      handler(newMints) {
        if (newMints && newMints.length > 0) {
          this.fetchMintInfoForDiscoveredMints();
          // In autoAdd mode, add newly discovered mints immediately
          if (this.autoAdd) {
            this.autoAddNewDiscoveredMints(newMints);
          }
        }
      },
      immediate: true,
    },
    // In autoAdd mode, when mnemonic becomes valid, start searching immediately
    isMnemonicValid: {
      handler(v) {
        if (this.autoAdd && v && !this.hasSearched) {
          this.searchForMints();
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(useNostrMintBackupStore, [
      "searchMintsOnNostr",
      "toggleMintSelection",
      "selectAllMints",
      "deselectAllMints",
      "addSelectedMintsToWallet",
      "clearDiscoveredMints",
    ]),

    async searchForMints() {
      if (!this.isMnemonicValid) {
        notifyError(this.$t("RestoreView.nostr_mints.invalid_mnemonic"));
        return;
      }

      try {
        await this.searchMintsOnNostr(this.mnemonic);
        this.hasSearched = true;
      } catch (error) {
        console.error("Failed to search for mints:", error);
        notifyError(this.$t("RestoreView.nostr_mints.search_error"));
      }
    },

    async addSelectedMints() {
      if (this.selectedMints.length === 0) {
        return;
      }

      this.addingMints = true;

      try {
        await this.addSelectedMintsToWallet(this.selectedMints);
        // Clear selections after successful addition
        this.deselectAllMints();
      } catch (error) {
        console.error("Failed to add selected mints:", error);
        notifyError(this.$t("RestoreView.nostr_mints.add_error"));
      } finally {
        this.addingMints = false;
      }
    },

    async autoAddNewDiscoveredMints(mints) {
      try {
        const mintsStore = useMintsStore();
        for (const m of mints) {
          const url = m.url;
          if (!this.mintExists(url)) {
            try {
              await mintsStore.addMint({ url }, false);
            } catch (e) {
              console.error(`Auto-add mint failed for ${url}:`, e);
            }
          }
        }
      } catch (e) {
        console.error("Auto-add discovered mints failed:", e);
      }
    },

    mintExists(url) {
      return this.mints.some((mint) => mint.url === url);
    },

    getShortUrl(url) {
      return getShortUrl(url);
    },

    formatDate(timestamp) {
      return date.formatDate(timestamp * 1000, "MMM DD, YYYY");
    },

    // Fetch mint information for all discovered mints in the background
    async fetchMintInfoForDiscoveredMints() {
      const availableMints = this.availableMints;

      // Fetch mint info for each mint in parallel, but don't block the UI
      availableMints.forEach(async (mint) => {
        if (
          !this.mintInfoCache.has(mint.url) &&
          !this.fetchingMintInfo.has(mint.url)
        ) {
          this.fetchingMintInfo.add(mint.url);

          try {
            const mintInfo = await this.fetchMintInfo(mint.url);
            this.mintInfoCache.set(mint.url, mintInfo);

            // Force reactivity by triggering a re-render
            this.$forceUpdate();
          } catch (error) {
            console.error(`Failed to fetch mint info for ${mint.url}:`, error);
            // Set empty info to avoid retrying
            this.mintInfoCache.set(mint.url, null);
          } finally {
            this.fetchingMintInfo.delete(mint.url);
          }
        }
      });
    },

    // Fetch mint information using cashu-ts
    async fetchMintInfo(mintUrl) {
      try {
        // Create a temporary mint object for the MintClass
        const tempMint = {
          url: mintUrl,
          keys: [],
          keysets: [],
        };

        const mintClass = new MintClass(tempMint);
        const mintInfo = await mintClass.api.getInfo();
        return mintInfo;
      } catch (error) {
        console.error(`Error fetching mint info for ${mintUrl}:`, error);
        throw error;
      }
    },

    // Get mint info from cache
    getMintInfo(mintUrl) {
      return this.mintInfoCache.get(mintUrl);
    },

    // Get mint icon URL
    getMintIconUrl(mintUrl) {
      const mintInfo = this.getMintInfo(mintUrl);
      if (mintInfo && mintInfo.icon_url) {
        return mintInfo.icon_url;
      }
      return null;
    },

    // Get mint display name
    getMintDisplayName(mintUrl) {
      const mintInfo = this.getMintInfo(mintUrl);
      if (mintInfo && mintInfo.name) {
        return mintInfo.name;
      }
      return this.getShortUrl(mintUrl);
    },

    // Check if mint info is being fetched
    isFetchingMintInfo(mintUrl) {
      return this.fetchingMintInfo.has(mintUrl);
    },
  },

  mounted() {
    // In autoAdd mode, start searching right away if mnemonic is valid
    if (this.autoAdd && this.isMnemonicValid && !this.hasSearched) {
      this.searchForMints();
    }
  },

  beforeUnmount() {
    // Clear discovered mints when component is destroyed
    this.clearDiscoveredMints();
    // Clear cache
    this.mintInfoCache.clear();
    this.fetchingMintInfo.clear();
  },
});
</script>

<style scoped>
.nostr-mint-restore {
  margin-top: 24px;
}
.discovered-mint + .discovered-mint {
  margin-top: 12px;
}
</style>
