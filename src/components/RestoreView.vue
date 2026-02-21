<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- ============================================ -->
    <!-- NEW LAYOUT: Non-onboarding (matches Figma)   -->
    <!-- ============================================ -->
    <template v-if="!onboarding">
      <!-- Page Title -->
      <div class="restore-page-title">
        {{ $t("RestoreView.seed_phrase.label") }}
      </div>

      <!-- Seed Phrase Section -->
      <div class="seed-section">
        <!-- Label row: "SEED PHRASE" + Paste button -->
        <div class="seed-label-row">
          <span class="section-label">
            {{ $t("RestoreView.seed_phrase.inputs.seed_phrase.label") }}
          </span>
          <q-btn
            flat
            dense
            class="paste-action"
            @click="pasteMnemonic"
          >
            <q-icon name="content_paste" size="14px" class="q-mr-xs" />
            <span>{{ $t("RestoreView.actions.paste.label") }}</span>
          </q-btn>
        </div>

        <!-- Helper text -->
        <div class="section-description">
          {{ $t("RestoreView.seed_phrase.caption") }}
        </div>

        <!-- 12-word input grid (2 columns) -->
        <div class="words-grid">
          <div v-for="index in 12" :key="index" class="word-input-wrapper">
            <span class="word-number">{{ index }}</span>
            <q-input
              :model-value="words[index - 1]"
              @update:model-value="updateWord($event, index - 1)"
              outlined
              dense
              :ref="(el) => setInputRef(el, index - 1)"
              @paste="handlePaste($event, index - 1)"
              class="word-input"
              :input-attrs="{
                autocapitalize: 'none',
                autocorrect: 'off',
                autocomplete: 'off',
                spellcheck: 'false',
              }"
            >
              <template v-slot:append>
                <q-icon
                  v-if="isWordValid(index - 1)"
                  name="check"
                  size="14px"
                  color="positive"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Error message -->
        <p v-if="mnemonicError" class="error-msg">{{ mnemonicError }}</p>
      </div>

      <!-- Mints to Scan Section -->
      <div class="mints-section">
        <div class="section-label">
          {{ $t("RestoreView.mints_to_scan.label") }}
        </div>
        <div class="section-description">
          {{ $t("RestoreView.mints_to_scan.description") }}
        </div>

        <!-- Find Mints via Nostr (inline card) -->
        <NostrMintRestore
          :mnemonic="normalisedMnemonic"
          :is-mnemonic-valid="isMnemonicValid"
          :inline-mode="true"
        />

        <!-- Connected Mints divider -->
        <div class="section-divider q-my-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("RestoreView.connected_mints.label") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- Connected mints list -->
        <div v-if="mints.length > 0" class="connected-mints-list">
          <div v-for="mint in mints" :key="mint.url" class="q-mb-sm">
            <q-item
              class="mint-card"
              :style="{
                'border-radius': '10px',
                border: '1px solid rgba(128, 128, 128, 0.2)',
                padding: '0px',
                position: 'relative',
              }"
            >
              <div class="full-width" style="position: relative">
                <div class="row items-center q-pa-md">
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

                <!-- Currency units -->
                <div
                  v-if="mintClass(mint).units.length > 0"
                  class="row q-pb-md q-pl-md q-pr-md"
                >
                  <div class="col">
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
                  </div>
                </div>

                <!-- Restore Progress -->
                <div
                  v-if="restoringMint === mint.url"
                  class="q-px-md q-pb-md"
                >
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
            </q-item>
          </div>
        </div>

        <!-- Empty state when no connected mints -->
        <div v-else class="empty-mints-card">
          <q-icon name="account_balance" size="24px" color="grey-6" />
          <div class="empty-description">
            {{ $t("RestoreView.empty_state.description") }}
          </div>
          <q-btn
            outline
            dense
            class="add-mint-btn"
            @click="openAddMintDialog"
          >
            <q-icon name="add" size="16px" class="q-mr-xs" />
            {{ $t("RestoreView.empty_state.add_by_url") }}
          </q-btn>
        </div>
      </div>

      <!-- Bottom scan button -->
      <div class="bottom-action">
        <q-btn
          class="full-width scan-all-btn"
          unelevated
          :disabled="!isMnemonicValid || restoringState || mints.length === 0"
          :loading="restoringState"
          @click="restoreAllMints"
        >
          <q-icon name="restore" size="20px" class="q-mr-sm" />
          {{ $t("RestoreView.actions.scan_all.label") }}
        </q-btn>
      </div>
    </template>

    <!-- ============================================ -->
    <!-- PRESERVED: Onboarding layout (unchanged)     -->
    <!-- ============================================ -->
    <template v-else>
      <!-- List of mints with restore buttons and balance badges -->
      <div class="q-pb-md q-px-xs text-left" on-left>
        <!-- Restore Selected Mints Button (Primary Action) -->
        <div v-if="mints.length > 0" class="primary-action-section q-pb-md">
          <q-btn
            color="primary"
            size="md"
            rounded
            @click="restoreSelectedMints"
            :disabled="restoringState || selectedMintsCount === 0"
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

        <!-- Mints List with Card Design -->
        <div class="q-pt-md">
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
              :disable="restoringState"
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
                          style="
                            height: 34px;
                            max-width: 34px;
                            font-size: 12px;
                          "
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
                      <div
                        class="text-grey-6 q-mb-xs"
                        style="font-size: 12px"
                      >
                        {{ restoreStatus }}
                      </div>
                      <q-linear-progress
                        :value="restoreProgress"
                        color="primary"
                        style="height: 4px; border-radius: 2px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-item>
          </div>
        </div>
      </div>
    </template>
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
import { validateMnemonic as validateBip39Mnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export default defineComponent({
  name: "RestoreView",
  mixins: [windowMixin],
  components: {
    NostrMintRestore,
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
      // Word-input state (used in non-onboarding mode)
      words: Array(12).fill("") as string[],
      inputRefs: [] as any[],
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
    // Joins words array into a single mnemonic string (non-onboarding)
    wordsJoined(): string {
      return this.words
        .filter((w: string) => w.trim())
        .join(" ")
        .trim()
        .toLowerCase();
    },
    normalisedMnemonic(): string {
      if (!this.onboarding) {
        // In non-onboarding mode, derive from the words grid
        return this.wordsJoined;
      }
      // Onboarding mode: derive from store (set by WelcomeRecoverSeed)
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
    // Sync words grid → store (non-onboarding)
    wordsJoined(val: string) {
      if (!this.onboarding) {
        this.mnemonicToRestore = val;
      }
    },
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
    // --- Word input methods (ported from WelcomeRecoverSeed) ---
    setInputRef(el: any, index: number) {
      if (el) {
        this.inputRefs[index] = el;
      }
    },
    updateWord(val: string | number | null, index: number) {
      const lower = String(val ?? "").toLowerCase();

      // Multi-word (paste or user typed spaces)
      if (/\s/.test(lower.trim()) && lower.trim().split(/\s+/).length > 1) {
        const splitWords = lower.trim().split(/\s+/);
        splitWords.forEach((w, i) => {
          if (index + i < 12) {
            this.words[index + i] = w;
          }
        });
        const nextIndex = Math.min(index + splitWords.length, 11);
        setTimeout(() => {
          this.inputRefs[nextIndex]?.focus();
        }, 50);
        return;
      }

      // Space to advance
      if (lower.endsWith(" ") && index < 11) {
        this.words[index] = lower.trim();
        setTimeout(() => {
          this.inputRefs[index + 1]?.focus();
        }, 50);
        return;
      }

      // Normal typing
      this.words[index] = lower;
    },
    handlePaste(event: ClipboardEvent, index: number) {
      event.preventDefault();
      const pastedText = event.clipboardData?.getData("text") || "";
      this.updateWord(pastedText, index);
    },
    isWordValid(index: number): boolean {
      const word = this.words[index]?.trim();
      if (!word) return false;
      return wordlist.includes(word);
    },
    // --- End word input methods ---
    openAddMintDialog() {
      const mintsStore = useMintsStore();
      mintsStore.showAddMintDialog = true;
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
        const cleaned = (text || "")
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        // Populate the words grid
        cleaned.forEach((w, i) => {
          if (i < 12) {
            this.words[i] = w;
          }
        });
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

<!-- Unscoped: shared mintlist styles + onboarding classes -->
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

<!-- Scoped: new Figma layout styles -->
<style scoped>
/* Page title */
.restore-page-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
  padding: 24px 16px 0 16px;
  text-align: left;
}

/* Seed section */
.seed-section {
  padding: 24px 16px 8px 16px;
}

/* Shared section label */
.section-label {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
}

/* Shared section description */
.section-description {
  color: #888;
  font-size: 14px;
  line-height: 21px;
  margin-top: 8px;
  margin-bottom: 16px;
}

/* Seed label row: label left, paste right */
.seed-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paste-action {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  text-transform: none;
  font-weight: 400;
}

/* Words grid - 2 columns */
.words-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;
}

.word-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-number {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  min-width: 18px;
  text-align: right;
}

.word-input {
  flex: 1;
}

.word-input :deep(.q-field__control) {
  min-height: 42px;
  border-radius: 8px;
  background: transparent;
}

.word-input :deep(.q-field__native) {
  padding: 0 12px;
  font-size: 14px;
  color: white;
}

.word-input :deep(.q-field--focused .q-field__control) {
  border-color: rgba(var(--q-primary-rgb), 0.5);
  box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.1);
}

/* Error message */
.error-msg {
  font-size: 13px;
  color: rgba(255, 200, 87, 0.9);
  margin: 12px 0 0 0;
  line-height: 1.4;
}

/* Mints section */
.mints-section {
  padding: 16px;
}

/* Section divider (reuses SettingsView pattern) */
.section-divider {
  display: flex;
  align-items: center;
  width: 100%;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #48484a;
}

.divider-text {
  padding: 0 10px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

/* Empty state card */
.empty-mints-card {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.empty-description {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  line-height: 18px;
}

.add-mint-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  text-transform: none;
  font-size: 12px;
  padding: 4px 12px;
}

.add-mint-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Bottom scan button */
.bottom-action {
  padding: 16px;
}

.scan-all-btn {
  background-color: #181818 !important;
  color: rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  min-height: 40px;
  text-transform: none;
  font-size: 14px;
  font-weight: 500;
}

.scan-all-btn:not([disabled]):hover {
  background-color: #222 !important;
  color: rgba(255, 255, 255, 0.6);
}

.scan-all-btn:not([disabled]) {
  color: rgba(255, 255, 255, 0.7);
}

/* Connected mints list */
.connected-mints-list {
  max-height: none;
}

/* Mobile adjustments */
@media (max-width: 360px) {
  .words-grid {
    gap: 8px;
  }

  .word-number {
    min-width: 14px;
    font-size: 11px;
  }
}
</style>
