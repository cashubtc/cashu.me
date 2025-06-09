<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- Mnemonic seed phrase input -->
    <div class="q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">
              {{ $t("RestoreView.seed_phrase.label") }}
            </q-item-label>
            <q-item-label caption>
              {{ $t("RestoreView.seed_phrase.caption") }}
            </q-item-label>
            <div class="row q-pt-md">
              <div class="col-12">
                <q-input
                  outlined
                  v-model="mnemonicToRestore"
                  :label="
                    $t('RestoreView.seed_phrase.inputs.seed_phrase.label')
                  "
                  autogrow
                  type="textarea"
                  :error="mnemonicError !== ''"
                  :error-message="mnemonicError"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="content_paste"
                      @click="pasteMnemonic"
                      class="cursor-pointer q-mt-md"
                    ></q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Information about restoring mints -->
    <div class="q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">
              {{ $t("RestoreView.information.label") }}
            </q-item-label>
            <q-item-label caption>
              {{ $t("RestoreView.information.caption") }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Information about adding mints -->
    <div class="q-px-xs text-left q-mt-md" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">
              {{ $t("RestoreView.restore_mints.label") }}
            </q-item-label>
            <q-item-label caption>
              {{ $t("RestoreView.restore_mints.caption") }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- List of mints with restore buttons and balance badges -->
    <div class="q-pb-md q-px-xs text-left" on-left>
      <q-btn
        class="q-ml-sm q-px-md"
        color="primary"
        size="md"
        rounded
        dense
        outline
        @click="restoreAllMints"
        :disabled="!isMnemonicValid || restoringState"
      >
        <q-spinner-hourglass size="sm" v-if="restoringState" class="q-mr-sm" />
        {{ restoreAllMintsText }}
      </q-btn>

      <!-- Mints List with Card Design -->
      <div class="q-pt-md">
        <div v-for="mint in mints" :key="mint.url" class="q-px-md q-mb-md">
          <q-item
            clickable
            @click="restoreMintForMint(mint.url)"
            class="mint-card cursor-pointer"
            :style="{
              'border-radius': '10px',
              border: '1px solid rgba(128, 128, 128, 0.2)',
              padding: '0px',
              position: 'relative',
            }"
            :disable="!isMnemonicValid || restoringState"
          >
            <!-- Loading spinner if mint is being restored -->
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
              name="fade"
            >
              <q-spinner-hourglass
                v-if="restoringMint === mint.url"
                color="white"
                size="1.3rem"
                class="mint-loading-spinner"
              />
            </transition>

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

                    <div class="column q-gutter-y-sm">
                      <!-- Mint Name -->
                      <div
                        v-if="mint.nickname || mint.info?.name"
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          line-height: 16px;
                        "
                      >
                        {{ mint.nickname || mint.info?.name }}
                      </div>
                      <!-- Mint URL -->
                      <div
                        class="text-grey-6"
                        style="
                          font-size: 12px;
                          line-height: 16px;
                          font-family: monospace;
                          margin-top: 4px;
                        "
                      >
                        {{ mint.url }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Balance and Restore Section -->
              <div class="row justify-between q-pb-md q-px-md">
                <div class="col">
                  <!-- Currency units with regular text styling -->
                  <div class="row q-gutter-x-sm">
                    <div
                      v-for="unit in mintClass(mint).units"
                      :key="unit"
                      class="q-py-xs q-px-sm q-my-xs"
                      style="
                        border-radius: 4px;
                        background-color: #1d1d1d;
                        display: inline-block;
                      "
                    >
                      <span
                        style="color: white; font-size: 14px; font-weight: 500"
                      >
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

                <div class="col-auto">
                  <q-btn
                    color="primary"
                    size="sm"
                    rounded
                    dense
                    outline
                    @click.stop="restoreMintForMint(mint.url)"
                    :disabled="!isMnemonicValid || restoringState"
                    :loading="restoringMint === mint.url"
                    :label="$t('RestoreView.actions.restore.label')"
                    class="q-px-md"
                  />
                </div>
              </div>
            </div>
          </q-item>
        </div>
      </div>
    </div>

    <!-- Nostr Mint Restore Component -->
    <NostrMintRestore
      :mnemonic="mnemonicToRestore"
      :is-mnemonic-valid="isMnemonicValid"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import NostrMintRestore from "./NostrMintRestore.vue";

export default defineComponent({
  name: "RestoreView",
  mixins: [windowMixin],
  components: {
    NostrMintRestore,
  },
  data() {
    return {
      mnemonicError: "",
      restoreAllMintsText: this.$i18n.t(
        "RestoreView.actions.restore_all_mints.label"
      ),
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
    isMnemonicValid() {
      if (!this.mnemonicToRestore) {
        return false;
      }
      const words = this.mnemonicToRestore.trim().split(/\s+/);
      return words.length >= 12;
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
    validateMnemonic() {
      // Simple validation: check if mnemonicToRestore has at least 12 words
      const words = this.mnemonicToRestore.trim().split(/\s+/);
      if (words.length < 12) {
        this.mnemonicError = this.$i18n.t("RestoreView.actions.validate.error");
        return false;
      }
      this.mnemonicError = "";
      return true;
    },
    async restoreMintForMint(mintUrl) {
      if (!this.validateMnemonic()) {
        return;
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
        this.mnemonicToRestore = text.trim();
      } catch (error) {
        notifyError(this.$i18n.t("RestoreView.actions.paste.error"));
      }
    },
    async restoreAllMints() {
      let i = 0;
      if (!this.validateMnemonic()) {
        return;
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
.fade-enter-active,
.fade-leave-active {
  transition: transform 1s ease, opacity 1s ease;
}

.mint-card.q-loading {
  opacity: 0.5; /* Reduce opacity when loading */
  pointer-events: none;
}

.mint-loading-spinner {
  position: absolute;
  top: 18px;
  right: 24px;
  z-index: 10;
}

.mint-card:hover {
  border-color: rgba(128, 128, 128, 0.4) !important;
}
</style>
