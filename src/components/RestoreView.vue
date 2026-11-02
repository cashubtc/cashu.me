<template>
  <div class="restore-view text-left">
    <!-- Mnemonic seed phrase input -->
    <SettingsSection
      v-if="!onboarding"
      flat
      :title="$t('RestoreView.seed_phrase.label')"
      :caption="$t('RestoreView.seed_phrase.caption')"
    >
      <q-input
        outlined
        v-model="mnemonicInput"
        :label="$t('RestoreView.seed_phrase.inputs.seed_phrase.label')"
        autogrow
        type="textarea"
        hide-bottom-space
        :error="mnemonicError !== ''"
        :error-message="mnemonicError"
      >
        <template v-slot:append>
          <IconButton
            :label="$t('global.actions.paste.label')"
            @click="pasteMnemonic"
            ><ClipboardPasteIcon :size="20"
          /></IconButton>
        </template>
      </q-input>
      <!-- Restored ecash is not covered by this wallet's seed until sent to yourself. -->
      <AppCallout
        variant="warning"
        class="q-mt-md"
        data-testid="restore-seed-warning"
        :text="$t('RestoreView.information.caption')"
      />
    </SettingsSection>

    <!-- Mints to restore -->
    <SettingsSection
      flat
      :title="onboarding ? '' : $t('RestoreView.restore_mints.label')"
      :caption="onboarding ? '' : $t('RestoreView.restore_mints.caption')"
    >
      <!-- One select-all toggle on the list's end edge (two far-apart links read as a
           segmented control with a dead half, council R77-R78). -->
      <div
        v-if="mints.length > 0 && !onboarding"
        class="row justify-end q-mb-sm restore-select-toggle"
      >
        <q-btn
          flat
          rounded
          no-caps
          color="primary"
          @click="allSelected ? deselectAllMints() : selectAllMints()"
        >
          {{
            allSelected
              ? $t("RestoreView.actions.deselect_all.label")
              : $t("RestoreView.actions.select_all.label")
          }}
        </q-btn>
      </div>

      <!-- Mints List with Card Design -->
      <div>
        <div v-for="mint in mints" :key="mint.url" class="q-mb-md">
          <!-- The installed-mint card: avatar, name and host on top
               with the selection box in the top corner, holdings and the restore action
               below on the same edges. -->
          <MintCard
            clickable
            class="cursor-pointer"
            :active="selectedMints.has(mint.url)"
            :disable="restoringState"
            :icon-url="mintIconUrl(mint)"
            :name="mint.nickname || mint.info?.name"
            :url="mint.url"
            :balances="
              heldUnits(mint).map((unit) =>
                formatCurrency(mintClass(mint).unitBalance(unit), unit)
              )
            "
            @click="toggleMintSelection(mint.url)"
          >
            <template #action>
              <q-checkbox
                :model-value="selectedMints.has(mint.url)"
                @update:model-value="toggleMintSelection(mint.url)"
                @click.stop
                color="primary"
                dense
                class="restore-mint-check"
                :aria-label="mint.nickname || mint.info?.name || mint.url"
              />
            </template>
            <template v-if="!onboarding" #meta>
              <MintCardAction
                :label="$t('RestoreView.actions.restore.label')"
                :disable="!isMnemonicValid || restoringState"
                :loading="restoringMint === mint.url"
                @click="restoreMintForMint(mint.url)"
              >
                <template #icon><ArchiveRestoreIcon :size="16" /></template>
              </MintCardAction>
            </template>
            <!-- Restore Progress -->
            <div v-if="restoringMint === mint.url">
              <div class="text-app-muted q-mb-xs" style="font-size: 12px">
                {{ restoreStatus }}
              </div>
              <q-linear-progress
                :value="restoreProgress"
                color="primary"
                style="height: 4px; border-radius: 2px"
              />
            </div>
          </MintCard>
        </div>
      </div>
      <!-- Restore Selected Mints Button (Primary Action) -->
      <div v-if="mints.length > 0" class="primary-action-section q-mt-sm">
        <q-btn
          color="primary"
          rounded
          unelevated
          @click="restoreSelectedMints"
          :disabled="
            (onboarding ? false : !isMnemonicValid) ||
            restoringState ||
            selectedMintsCount === 0
          "
          :loading="restoringState"
          class="full-width"
        >
          <ArchiveRestoreIcon :size="20" class="q-mr-sm" />
          {{
            $t("RestoreView.actions.restore_selected_mints.label", {
              count: selectedMintsCount,
            })
          }}
          <template #loading
            ><BusyLabel>{{
              $t("RestoreView.actions.restore_selected_mints.label", {
                count: selectedMintsCount,
              })
            }}</BusyLabel></template
          >
        </q-btn>
      </div>
    </SettingsSection>

    <!-- Nostr Mint Restore Component -->
    <NostrMintRestore
      v-if="!onboarding"
      :mnemonic="normalisedMnemonic"
      :is-mnemonic-valid="isMnemonicValid"
    />
  </div>
</template>

<script lang="ts">
import MintCardAction from "src/components/ui/MintCardAction.vue";
import IconButton from "src/components/ui/IconButton.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import MintCard from "src/components/MintCard.vue";
import AppCallout from "src/components/AppCallout.vue";
import {
  ClipboardPaste as ClipboardPasteIcon,
  ArchiveRestore as ArchiveRestoreIcon,
} from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { mintIconUrl } from "src/js/wallet-helpers";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import NostrMintRestore from "./NostrMintRestore.vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";
import { validateMnemonic as validateBip39Mnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export default defineComponent({
  name: "RestoreView",
  mixins: [windowMixin],
  components: {
    MintCardAction,
    IconButton,
    BusyLabel,
    MintCard,
    AppCallout,
    ClipboardPasteIcon,
    ArchiveRestoreIcon,
    NostrMintRestore,
    SettingsSection,
  },
  props: {
    onboarding: { type: Boolean, default: false },
  },
  data() {
    return {
      selectedMints: new Set(), // Track selected mint URLs
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    ...mapWritableState(useWalletStore, ["mnemonic"]),
    ...mapWritableState(useRestoreStore, [
      "mnemonicToRestore",
      "restoreProgress",
    ]),
    ...mapState(useRestoreStore, [
      "restoringState",
      "restoringMint",
      "restoreStatus",
    ]),

    mnemonicInput: {
      get(): string {
        return this.mnemonicToRestore || "";
      },
      set(v: string) {
        // lowercase live, keep spacing as typed to avoid cursor jumps
        this.mnemonicToRestore = (v || "").toLowerCase();
      },
    },
    normalisedMnemonic(): string {
      return (this.mnemonicToRestore || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .join(" ");
    },
    mnemonicWordCount(): number {
      return this.normalisedMnemonic
        ? this.normalisedMnemonic.split(" ").length
        : 0;
    },
    isMnemonicValid(): boolean {
      if (this.onboarding) return true;
      if (this.mnemonicWordCount < 12) return false;
      return validateBip39Mnemonic(this.normalisedMnemonic, wordlist);
    },
    mnemonicError(): string {
      if (this.onboarding) return "";

      const count = this.mnemonicWordCount;
      if (count === 0) return "";
      if (count < 12) return `${count}/12 words entered`;

      if (!validateBip39Mnemonic(this.normalisedMnemonic, wordlist)) {
        return this.$i18n.t("RestoreView.actions.validate.error");
      }

      return "";
    },
    allSelected() {
      return (
        this.mints.length > 0 &&
        this.mints.every((mint) => this.selectedMints.has(mint.url))
      );
    },
    selectedMintsCount() {
      return this.selectedMints.size;
    },
  },
  mounted() {
    if (this.onboarding) {
      this.selectAllMints();
    }
  },
  watch: {
    mints: {
      handler() {
        if (this.onboarding) {
          this.selectAllMints();
        }
      },
      deep: true,
    },
    onboarding(newVal) {
      if (newVal) {
        this.selectAllMints();
      }
    },
  },
  methods: {
    // Only the units this mint holds; a row of zero chips is noise.
    heldUnits(mint: any): string[] {
      const m = this.mintClass(mint);
      return m.units.filter((unit: string) => m.unitBalance(unit) > 0);
    },
    ...mapActions(useRestoreStore, ["restoreMint"]),
    ...mapActions(useUiStore, ["pasteFromClipboard"]),
    mintClass(mint) {
      return new MintClass(mint);
    },
    mintIconUrl,
    toggleMintSelection(mintUrl) {
      if (this.selectedMints.has(mintUrl)) {
        this.selectedMints.delete(mintUrl);
      } else {
        this.selectedMints.add(mintUrl);
      }
    },
    selectAllMints() {
      this.mints.forEach((mint) => {
        this.selectedMints.add(mint.url);
      });
    },
    deselectAllMints() {
      this.selectedMints.clear();
    },
    async restoreSelectedMints() {
      if (this.selectedMintsCount === 0) {
        return;
      }

      if (!this.onboarding) {
        if (!this.isMnemonicValid) return;
        this.mnemonicToRestore = this.normalisedMnemonic;
      }

      const selectedMintUrls = Array.from(this.selectedMints);

      try {
        for (const mintUrl of selectedMintUrls) {
          await this.restoreMint(mintUrl);
        }
        notifySuccess(
          this.$i18n.t("RestoreView.actions.restore_selected_mints.success", {
            count: selectedMintUrls.length,
          })
        );
        // Clear selections after successful restore
        this.deselectAllMints();
      } catch (error) {
        console.error("Error restoring selected mints:", error);
        notifyError(
          this.$i18n.t("RestoreView.actions.restore_selected_mints.error", {
            error: error.message || error,
          })
        );
      }
    },
    async restoreMintForMint(mintUrl) {
      if (!this.onboarding) {
        if (!this.isMnemonicValid) return;
        this.mnemonicToRestore = this.normalisedMnemonic;
      }

      try {
        await this.restoreMint(mintUrl);
      } catch (error) {
        console.error("Error restoring mint:", error);
        notifyError(
          this.$i18n.t("RestoreView.actions.restore.error", {
            error: error.message || error,
          })
        );
      }
    },
    async pasteMnemonic() {
      try {
        const text = await this.pasteFromClipboard();
        this.mnemonicToRestore = (text || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .join(" ");
      } catch (error) {
        notifyError(this.$i18n.t("RestoreView.actions.paste.error"));
      }
    },
  },
});
</script>

<style>
@import "src/css/mintlist.css";

/* Primary action section */
.primary-action-section {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
