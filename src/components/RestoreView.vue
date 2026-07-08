<template>
  <div class="restore-view text-left">
    <!-- Mnemonic seed phrase input -->
    <SettingsSection
      v-if="!onboarding"
      :title="$t('RestoreView.seed_phrase.label')"
      :caption="$t('RestoreView.seed_phrase.caption')"
    >
      <q-item class="settings-control-item q-pt-md">
        <q-item-section>
          <q-input
            outlined
            v-model="mnemonicInput"
            :label="$t('RestoreView.seed_phrase.inputs.seed_phrase.label')"
            autogrow
            type="textarea"
            :error="mnemonicError !== ''"
            :error-message="mnemonicError"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                round
                icon="content_paste"
                @click="pasteMnemonic"
              ></q-btn>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- Information about restoring mints -->
    <div v-if="!onboarding" class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-title">
          {{ $t("RestoreView.information.label") }}
        </div>
        <div class="settings-section-caption">
          {{ $t("RestoreView.information.caption") }}
        </div>
      </div>
    </div>

    <!-- Mints to restore -->
    <div class="settings-section">
      <div v-if="!onboarding" class="settings-section-header">
        <div class="settings-section-title">
          {{ $t("RestoreView.restore_mints.label") }}
        </div>
        <div class="settings-section-caption">
          {{ $t("RestoreView.restore_mints.caption") }}
        </div>
      </div>

      <!-- Restore Selected Mints Button (Primary Action) -->
      <div v-if="mints.length > 0" class="primary-action-section q-mb-md">
        <q-btn
          color="primary"
          size="md"
          rounded
          @click="restoreSelectedMints"
          :disabled="
            (onboarding ? false : !isMnemonicValid) ||
            restoringState ||
            selectedMintsCount === 0
          "
          :loading="restoringState"
          class="q-px-md"
        >
          <q-icon name="restore" class="q-mr-sm" />
          {{
            $t("RestoreView.actions.restore_selected_mints.label", {
              count: selectedMintsCount,
            })
          }}
        </q-btn>
      </div>

      <!-- Select All/Deselect All Buttons -->
      <div
        v-if="mints.length > 0 && !onboarding"
        class="row items-center q-gutter-sm q-mb-md"
      >
        <q-btn
          size="sm"
          rounded
          outline
          color="primary"
          class="q-px-md"
          @click="selectAllMints"
          :disabled="allSelected"
        >
          {{ $t("RestoreView.actions.select_all.label") }}
        </q-btn>
        <q-btn
          size="sm"
          rounded
          outline
          color="grey"
          class="q-px-md"
          @click="deselectAllMints"
          :disabled="!anySelected"
        >
          {{ $t("RestoreView.actions.deselect_all.label") }}
        </q-btn>
      </div>

      <!-- Mints List with Card Design -->
      <div>
        <div v-for="mint in mints" :key="mint.url" class="q-mb-md">
          <q-item
            clickable
            @click="toggleMintSelection(mint.url)"
            class="mint-card cursor-pointer"
            :style="{
              'border-radius': '10px',
              border: selectedMints.has(mint.url)
                ? '1px solid var(--q-primary)'
                : '1px solid rgba(128, 128, 128, 0.2)',
              padding: '0px',
              position: 'relative',
              'background-color': selectedMints.has(mint.url)
                ? 'rgba(var(--q-primary-rgb), 0.1)'
                : 'transparent',
            }"
            :disable="(onboarding ? false : !isMnemonicValid) || restoringState"
          >
            <div class="full-width" style="position: relative">
              <div class="row items-center q-pa-md">
                <!-- Checkbox Section -->
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="selectedMints.has(mint.url)"
                    @update:model-value="toggleMintSelection(mint.url)"
                    @click.stop
                    color="primary"
                    class="clickable-checkbox"
                  />
                </q-item-section>

                <div class="col">
                  <div class="row items-center">
                    <!-- Mint Avatar -->
                    <q-avatar
                      v-if="getMintIconUrl(mint)"
                      size="34px"
                      class="q-mr-sm"
                    >
                      <q-img
                        spinner-color="white"
                        spinner-size="xs"
                        :src="getMintIconUrl(mint)"
                        alt="Mint Icon"
                        style="height: 34px; max-width: 34px; font-size: 12px"
                      />
                    </q-avatar>

                    <div class="mint-info-container">
                      <!-- Mint Name -->
                      <div
                        v-if="mint.nickname || mint.info?.name"
                        class="mint-name"
                      >
                        {{ mint.nickname || mint.info?.name }}
                      </div>
                      <!-- Mint URL -->
                      <div class="text-grey-6 mint-url">
                        {{ mint.url }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Balance and Restore Section -->
              <div class="row justify-between q-pb-md q-pl-lg q-pr-md">
                <div class="col">
                  <!-- Currency units with regular text styling -->
                  <div class="row q-gutter-x-sm">
                    <div
                      v-for="unit in mintClass(mint).units"
                      :key="unit"
                      class="currency-unit-badge"
                    >
                      <span class="currency-unit-text">
                        {{
                          formatCurrency(
                            mintClass(mint).unitBalance(unit),
                            unit
                          )
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- Restore Progress -->
                  <div v-if="restoringMint === mint.url" class="q-mt-sm">
                    <div class="text-grey-6 q-mb-xs" style="font-size: 12px">
                      {{ restoreStatus }}
                    </div>
                    <q-linear-progress
                      :value="restoreProgress"
                      color="primary"
                      style="height: 4px; border-radius: 2px"
                    />
                  </div>
                </div>

                <div v-if="!onboarding" class="col-auto">
                  <q-btn
                    color="secondary"
                    size="sm"
                    rounded
                    dense
                    flat
                    @click.stop="restoreMintForMint(mint.url)"
                    :disabled="!isMnemonicValid || restoringState"
                    :loading="restoringMint === mint.url"
                    icon="restore"
                    class="q-px-sm"
                  >
                    <q-tooltip>{{
                      $t("RestoreView.actions.restore.label")
                    }}</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </q-item>
        </div>
      </div>
    </div>

    <!-- Nostr Mint Restore Component -->
    <NostrMintRestore
      v-if="!onboarding"
      :mnemonic="normalisedMnemonic"
      :is-mnemonic-valid="isMnemonicValid"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
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
    NostrMintRestore,
    SettingsSection,
  },
  props: {
    onboarding: { type: Boolean, default: false },
  },
  data() {
    return {
      restoreAllMintsText: this.$i18n.t(
        "RestoreView.actions.restore_all_mints.label"
      ),
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
    anySelected() {
      return this.selectedMints.size > 0;
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
    ...mapActions(useRestoreStore, ["restoreMint"]),
    ...mapActions(useUiStore, ["pasteFromClipboard"]),
    mintClass(mint) {
      return new MintClass(mint);
    },
    getMintIconUrl: function (mint) {
      if (mint.info) {
        if (mint.info.icon_url) {
          return mint.info.icon_url;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    },
    formatCurrency(amount, unit) {
      return useUiStore().formatCurrency(amount, unit);
    },
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
      let i = 0;

      try {
        for (const mintUrl of selectedMintUrls) {
          this.restoreAllMintsText = this.$i18n.t(
            "RestoreView.actions.restore_selected_mints.in_progress",
            {
              index: ++i,
              length: selectedMintUrls.length,
            }
          );
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
      } finally {
        this.restoreAllMintsText = this.$i18n.t(
          "RestoreView.actions.restore_all_mints.label"
        );
      }
    },
    async restoreMintForMint(mintUrl) {
      if (!this.onboarding) {
        if (!this.isMnemonicValid) return;
        this.mnemonicToRestore = this.normalisedMnemonic;
      }

      try {
        this.restoreAllMintsText = this.$i18n.t(
          "RestoreView.actions.restore.in_progress"
        );
        await this.restoreMint(mintUrl);
      } catch (error) {
        console.error("Error restoring mint:", error);
        notifyError(
          this.$i18n.t("RestoreView.actions.restore.error", {
            error: error.message || error,
          })
        );
      } finally {
        this.restoreAllMintsText = this.$i18n.t(
          "RestoreView.actions.restore_all_mints.label"
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
    async restoreAllMints() {
      let i = 0;
      if (!this.onboarding) {
        if (!this.isMnemonicValid) return;
        this.mnemonicToRestore = this.normalisedMnemonic;
      }
      try {
        for (const mint of this.mints) {
          this.restoreAllMintsText = this.$i18n.t(
            "RestoreView.actions.restore_all_mints.in_progress",
            {
              index: ++i,
              length: this.mints.length,
            }
          );
          await this.restoreMint(mint.url);
        }
        notifySuccess(
          this.$i18n.t("RestoreView.actions.restore_all_mints.success")
        );
      } catch (error) {
        console.error("Error restoring mints:", error);
        notifyError(
          this.$i18n.t("RestoreView.actions.restore_all_mints.error", {
            error: error.message || error,
          })
        );
      } finally {
        this.restoreAllMintsText = this.$i18n.t(
          "RestoreView.actions.restore_all_mints.label"
        );
      }
    },
  },
});
</script>

<style>
@import "src/css/mintlist.css";

/* Fallback action section - specific to RestoreView */
.fallback-action-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Primary action section */
.primary-action-section {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
