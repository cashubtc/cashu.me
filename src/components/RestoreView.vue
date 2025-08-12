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
                  autogrow
                  type="textarea"
                  :error="mnemonicError !== ''"
                  :error-message="mnemonicError"
                >
                  <template #label>
                    <div class="row items-center no-wrap">
                      <span>{{
                        $t("RestoreView.seed_phrase.inputs.seed_phrase.label")
                      }}</span>
                      <InfoTooltip
                        class="q-ml-xs"
                        :text="
                          $t(
                            'RestoreView.seed_phrase.inputs.seed_phrase.tooltip',
                          )
                        "
                      />
                    </div>
                  </template>
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
      <q-list padding class="q-pt-md">
        <!-- List mints here -->
        <div v-for="mint in mints" :key="mint.url">
          <q-item>
            <q-item-section>
              <q-item-label
                class="q-mb-xs"
                lines="1"
                style="
                  word-break: break-all;
                  overflow-wrap: break-word;
                  white-space: normal;
                "
              >
                <q-icon
                  name="account_balance"
                  size="xs"
                  class="q-ml-xs q-mb-xs"
                />
                <q-span class="q-ma-xs" style="font-size: 15px">
                  {{ mint.nickname || mint.url }}
                </q-span>
              </q-item-label>
              <q-item-label>
                <q-badge
                  v-for="unit in mintClass(mint).units"
                  :key="unit"
                  color="primary"
                  :label="
                    formatCurrency(mintClass(mint).unitBalance(unit), unit)
                  "
                  class="q-mx-xs q-mb-xs"
                />
              </q-item-label>
              <q-item-label
                class="q-px-xs q-pt-xs q-pb-xs"
                v-if="restoringMint === mint.url"
                caption
              >
                {{ restoreStatus }}
              </q-item-label>
              <q-linear-progress
                v-if="restoringMint === mint.url"
                :value="restoreProgress"
                color="primary"
                class="q-pl-md"
                style="max-width: 630px"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                class="q-ml-sm q-px-md"
                color="primary"
                size="md"
                rounded
                dense
                outline
                @click="restoreMintForMint(mint.url)"
                :disabled="!isMnemonicValid || restoringState"
                :loading="restoringMint === mint.url"
                :label="$t('RestoreView.actions.restore.label')"
              />
            </q-item-section>
          </q-item>
          <q-separator spaced />
        </div>
      </q-list>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useMnemonicStore } from "src/stores/mnemonic";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "RestoreView",
  mixins: [windowMixin],
  data() {
    return {
      mnemonicError: "",
      restoreAllMintsText: this.$i18n.t(
        "RestoreView.actions.restore_all_mints.label",
      ),
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    ...mapWritableState(useMnemonicStore, ["mnemonic"]),
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
          "RestoreView.actions.restore.in_progress",
        );
        await this.restoreMint(mintUrl);
      } catch (error) {
        console.error("Error restoring mint:", error);
        notifyError(
          this.$i18n.t("RestoreView.actions.restore.error", {
            error: error.message || error,
          }),
        );
      } finally {
        this.restoreAllMintsText = this.$i18n.t(
          "RestoreView.actions.restore_all_mints.label",
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
            },
          );
          await this.restoreMint(mint.url);
        }
        notifySuccess(
          this.$i18n.t("RestoreView.actions.restore_all_mints.success"),
        );
      } catch (error) {
        console.error("Error restoring mints:", error);
        notifyError(
          this.$i18n.t("RestoreView.actions.restore_all_mints.error", {
            error: error.message || error,
          }),
        );
      } finally {
        this.restoreAllMintsText = this.$i18n.t(
          "RestoreView.actions.restore_all_mints.label",
        );
      }
    },
  },
});
</script>
