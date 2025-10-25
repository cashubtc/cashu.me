<template>
  <div v-if="!autoAdd" class="nostr-mint-restore">
    <!-- Header -->
    <div class="q-px-xs text-left q-mt-lg">
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label
              overline
              class="text-weight-bold"
              style="
                font-size: 15.2px;
                font-family: Inter, -apple-system, 'system-ui', 'Segoe UI',
                  Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-weight: 600;
                color: #ffffff;
                text-transform: none;
                margin-bottom: 8px;
              "
            >
              {{ $t("RestoreView.nostr_mints.label") }}
            </q-item-label>
            <q-item-label
              caption
              style="
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
              "
            >
              {{ $t("RestoreView.nostr_mints.caption") }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Search Button -->
    <div class="q-pb-lg q-pt-md q-px-xs text-left">
      <q-btn
        class="full-width"
        color="primary"
        size="lg"
        rounded
        @click="searchForMints"
        :disabled="!isMnemonicValid || searchInProgress"
        :loading="searchInProgress"
        style="
          min-height: 48px;
          font-weight: 500;
          text-transform: none;
          font-size: 0.95rem;
        "
      >
        <q-icon name="search" size="20px" class="q-mr-sm" />
        {{ $t("RestoreView.nostr_mints.search_button") }}
      </q-btn>
    </div>

    <!-- Discovered Mints List -->
    <div v-if="availableMints.length > 0" class="q-px-xs">
      <!-- Add Selected Button (Primary Action) -->
      <div class="primary-action-section q-pb-lg q-pt-md">
        <q-btn
          color="primary"
          size="lg"
          rounded
          @click="addSelectedMints"
          :loading="addingMints"
          :disabled="addingMints || selectedMints.length === 0"
          class="full-width"
          style="
            min-height: 48px;
            font-weight: 500;
            text-transform: none;
            font-size: 0.95rem;
          "
        >
          <q-icon name="add" size="20px" class="q-mr-sm" />
          <span
            style="
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{
              $t("RestoreView.nostr_mints.add_selected", {
                count: selectedMints.length,
              })
            }}
          </span>
        </q-btn>
      </div>

      <!-- Select All/Deselect All -->
      <div class="selection-buttons q-pb-lg" style="display: flex; gap: 16px">
        <q-btn
          flat
          size="md"
          color="primary"
          @click="selectAllMints"
          :disabled="allSelected"
          style="
            flex: 1;
            min-height: 40px;
            font-weight: 500;
            text-transform: none;
          "
        >
          {{ $t("RestoreView.nostr_mints.select_all") }}
        </q-btn>
        <q-btn
          flat
          size="md"
          color="grey"
          @click="deselectAllMints"
          :disabled="!anySelected"
          style="
            flex: 1;
            min-height: 40px;
            font-weight: 500;
            text-transform: none;
          "
        >
          {{ $t("RestoreView.nostr_mints.deselect_all") }}
        </q-btn>
      </div>

      <!-- Mints List -->
      <q-list padding class="discovered-mints-list">
        <q-item
          v-for="mint in availableMints"
          :key="mint.url"
          clickable
          @click="toggleMintSelection(mint.url)"
          class="mint-item"
          :class="{ 'mint-item-selected': mint.selected }"
          :style="{
            'border-radius': '12px',
            border: mint.selected
              ? '2px solid var(--q-primary)'
              : '1px solid rgba(128, 128, 128, 0.2)',
            'background-color': mint.selected
              ? 'rgba(var(--q-primary-rgb), 0.1)'
              : 'transparent',
            padding: '16px',
            'margin-bottom': '12px',
            transition: 'all 0.2s ease',
          }"
        >
          <q-item-section avatar>
            <q-checkbox
              :model-value="mint.selected"
              @update:model-value="toggleMintSelection(mint.url)"
              @click.stop
              color="primary"
              class="clickable-checkbox"
            />
          </q-item-section>
          <q-item-section class="text-left">
            <div class="row items-center">
              <!-- Mint Avatar -->
              <q-avatar
                v-if="getMintIconUrl(mint.url)"
                size="34px"
                class="q-mr-sm"
              >
                <q-img
                  spinner-color="white"
                  spinner-size="xs"
                  :src="getMintIconUrl(mint.url)"
                  alt="Mint Icon"
                  style="height: 34px; max-width: 34px; font-size: 12px"
                />
              </q-avatar>

              <!-- Loading spinner for mint info -->
              <q-spinner-dots
                v-else-if="isFetchingMintInfo(mint.url)"
                size="34px"
                color="grey-5"
                class="q-mr-sm"
              />

              <div class="mint-info-container">
                <!-- Mint Name -->
                <q-item-label
                  lines="1"
                  class="text-weight-medium text-left mint-name"
                >
                  {{ getMintDisplayName(mint.url) }}
                </q-item-label>

                <!-- Mint URL -->
                <q-item-label
                  caption
                  lines="2"
                  class="text-grey-6 text-left mint-url"
                >
                  {{ mint.url }}
                </q-item-label>

                <!-- Backup timestamp -->
                <q-item-label caption class="text-grey-5 q-pt-xs text-left">
                  {{ $t("RestoreView.nostr_mints.backed_up") }}:
                  {{ formatDate(mint.timestamp) }}
                </q-item-label>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="hasSearched && !searchInProgress"
      class="q-px-xs text-center q-py-lg"
    >
      <q-icon name="cloud_off" size="lg" color="grey-5" />
      <div class="text-grey-6 q-mt-sm">
        {{ $t("RestoreView.nostr_mints.no_backups_found") }}
      </div>
      <div class="text-grey-5 caption q-mt-xs">
        {{ $t("RestoreView.nostr_mints.no_backups_hint") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import { useMintsStore, MintClass } from "src/stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";
import { notifyError } from "src/js/notify";
import { date } from "quasar";

export default defineComponent({
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
@import "src/css/mintlist.css";

.discovered-mints-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 0 !important;
}

.nostr-mint-restore {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 2rem;
  padding-top: 1rem;
}

/* Mint item styling - specific to NostrMintRestore */
.mint-item {
  text-align: left;
}

.mint-item:hover {
  transform: translateY(-2px);
}

/* Primary action section */
.primary-action-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Clickable checkbox */
.clickable-checkbox {
  cursor: pointer;
}

/* Ensure all text aligns to the left */
.text-left {
  text-align: left !important;
}
</style>
