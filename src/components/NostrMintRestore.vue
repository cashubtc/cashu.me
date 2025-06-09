<template>
  <div class="nostr-mint-restore">
    <!-- Header -->
    <div class="q-px-xs text-left q-mt-md">
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">
              {{ $t("RestoreView.nostr_mints.label") }}
            </q-item-label>
            <q-item-label caption>
              {{ $t("RestoreView.nostr_mints.caption") }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Search Button -->
    <div class="q-pb-md q-px-xs text-left">
      <q-btn
        class="q-ml-sm q-px-md"
        color="secondary"
        size="md"
        rounded
        dense
        outline
        @click="searchForMints"
        :disabled="!isMnemonicValid || searchInProgress"
        :loading="searchInProgress"
      >
        <q-icon name="search" class="q-mr-sm" />
        {{ $t("RestoreView.nostr_mints.search_button") }}
      </q-btn>

      <!-- Refresh Button (shown after first search) -->
      <q-btn
        v-if="hasSearched"
        class="q-ml-sm q-px-md"
        color="grey"
        size="md"
        rounded
        dense
        flat
        @click="searchForMints"
        :disabled="!isMnemonicValid || searchInProgress"
      >
        <q-icon name="refresh" />
      </q-btn>
    </div>

    <!-- Discovered Mints List -->
    <div v-if="availableMints.length > 0" class="q-px-xs">
      <!-- Select All/Deselect All -->
      <div class="selection-buttons q-px-sm q-pb-md">
        <q-btn
          flat
          dense
          size="md"
          color="primary"
          @click="selectAllMints"
          :disabled="allSelected"
          class="q-mr-md q-px-md"
        >
          {{ $t("RestoreView.nostr_mints.select_all") }}
        </q-btn>
        <q-btn
          flat
          dense
          size="md"
          color="grey"
          @click="deselectAllMints"
          :disabled="!anySelected"
          class="q-px-md"
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
        >
          <q-item-section avatar>
            <q-checkbox
              v-model="mint.selected"
              @click="toggleMintSelection(mint.url)"
              color="primary"
              class="clickable-checkbox"
            />
          </q-item-section>
          <q-item-section class="text-left">
            <q-item-label lines="1" class="text-weight-medium text-left">
              {{ getShortUrl(mint.url) }}
            </q-item-label>
            <q-item-label
              caption
              lines="2"
              class="text-grey-6 text-left mint-url"
            >
              {{ mint.url }}
            </q-item-label>
            <q-item-label caption class="text-grey-5 q-pt-xs text-left">
              {{ $t("RestoreView.nostr_mints.backed_up") }}:
              {{ formatDate(mint.timestamp) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Add Selected Button -->
      <div
        class="add-selected-section q-px-sm q-pt-lg q-pb-md"
        v-if="selectedMints.length > 0"
      >
        <q-btn
          class="q-px-md"
          color="primary"
          size="md"
          rounded
          @click="addSelectedMints"
          :loading="addingMints"
          :disabled="addingMints"
        >
          {{
            $t("RestoreView.nostr_mints.add_selected", {
              count: selectedMints.length,
            })
          }}
        </q-btn>
      </div>
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

<script>
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import { useMintsStore } from "src/stores/mints";
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
  },
  data() {
    return {
      hasSearched: false,
      addingMints: false,
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

    mintExists(url) {
      return this.mints.some((mint) => mint.url === url);
    },

    getShortUrl(url) {
      return getShortUrl(url);
    },

    formatDate(timestamp) {
      return date.formatDate(timestamp * 1000, "MMM DD, YYYY");
    },
  },

  beforeUnmount() {
    // Clear discovered mints when component is destroyed
    this.clearDiscoveredMints();
  },
});
</script>

<style scoped>
.discovered-mints-list {
  max-height: 400px;
  overflow-y: auto;
}

.nostr-mint-restore {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
}

/* Selection buttons styling */
.selection-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Mint item styling */
.mint-item {
  text-align: left;
}

/* Mint URL styling - using monospace font like in MintSettings */
.mint-url {
  font-family: monospace !important;
  font-size: 0.9em !important;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: normal;
}

/* Clickable checkbox */
.clickable-checkbox {
  cursor: pointer;
}

/* Add selected button section */
.add-selected-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.5rem;
  text-align: left;
}

/* Ensure all text aligns to the left */
.text-left {
  text-align: left !important;
}
</style>
