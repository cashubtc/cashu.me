<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- Mnemonic seed phrase input -->
    <div class="q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">
              Restore from Seed Phrase
            </q-item-label>
            <q-item-label caption>
              Enter your seed phrase to restore your wallet. Before you restore,
              make sure you have added all the mints that you have used before.
            </q-item-label>
            <div class="row q-pt-md">
              <div class="col-12">
                <q-input
                  outlined
                  v-model="mnemonicToRestore"
                  label="Seed phrase"
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
              Information
            </q-item-label>
            <q-item-label caption>
              The wizard will only <i>restore</i> ecash from another seed
              phrase, you will not be able to use this seed phrase or change the
              seed phrase of the wallet that you're currently using. This means
              that restored ecash will not be protected by your current seed
              phrase as long as you don't send the ecash to yourself once.
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
              Restore Mints
            </q-item-label>
            <q-item-label caption>
              Select the mint to restore. You can add more mints in the main
              screen under "Mints" and restore them here.
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
              >
                Restore
              </q-btn>
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
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "RestoreView",
  mixins: [windowMixin],
  data() {
    return {
      mnemonicError: "",
      restoreAllMintsText: "Restore All Mints",
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
    mintClass(mint) {
      return new MintClass(mint);
    },
    validateMnemonic() {
      // Simple validation: check if mnemonicToRestore has at least 12 words
      const words = this.mnemonicToRestore.trim().split(/\s+/);
      if (words.length < 12) {
        this.mnemonicError = "Mnemonic should be at least 12 words.";
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
        this.restoreAllMintsText = "Restoring mint ...";
        await this.restoreMint(mintUrl);
      } catch (error) {
        console.error("Error restoring mint:", error);
        notifyError(`Error restoring mint: ${error.message || error}`);
      } finally {
        this.restoreAllMintsText = "Restore All Mints";
      }
    },
    async pasteMnemonic() {
      try {
        const text = await navigator.clipboard.readText();
        this.mnemonicToRestore = text.trim();
      } catch (error) {
        notifyError("Failed to read clipboard contents.");
      }
    },
    async restoreAllMints() {
      let i = 0;
      if (!this.validateMnemonic()) {
        return;
      }
      try {
        for (const mint of this.mints) {
          this.restoreAllMintsText = `Restoring mint ${++i} of ${
            this.mints.length
          } ...`;
          await this.restoreMint(mint.url);
        }
        notifySuccess("All mints restored successfully.");
      } catch (error) {
        console.error("Error restoring mints:", error);
        notifyError(`Error restoring mints: ${error.message || error}`);
      } finally {
        this.restoreAllMintsText = "Restore All Mints";
      }
    },
  },
});
</script>
