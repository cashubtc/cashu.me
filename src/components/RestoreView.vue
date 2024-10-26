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
              Enter your seed phrase to restore your wallet.
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
    <div class="q-py-md q-px-xs text-left" on-left>
      <q-list padding>
        <!-- List mints here -->
        <div v-for="mint in mints" :key="mint.url">
          <q-item>
            <q-item-section>
              <q-item-label lines="1" style="word-break: break-word">
                {{ mint.nickname || mint.url }}
              </q-item-label>
              <q-item-label>
                <q-badge
                  v-for="unit in mintClass(mint).units"
                  :key="unit"
                  color="primary"
                  :label="
                    formatCurrency(mintClass(mint).unitBalance(unit), unit)
                  "
                  class="q-mx-xs"
                />
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                class="q-ml-sm q-px-md"
                color="primary"
                size="sm"
                rounded
                outline
                @click="restoreMintForMint(mint.url)"
                :disabled="!isMnemonicValid || restoringState"
                :loading="restoringMint === mint.url"
              >
                Restore
              </q-btn>
            </q-item-section>
          </q-item>
          <q-separator spaced inset="item" />
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
  data() {
    return {
      mnemonicError: "",
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    ...mapWritableState(useWalletStore, ["mnemonic"]),
    ...mapWritableState(useRestoreStore, ["mnemonicToRestore"]),
    ...mapState(useRestoreStore, ["restoringState", "restoringMint"]),
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
    formatCurrency(amount, unit) {
      // Implement your currency formatting logic here
      // For example, converting satoshis to BTC if needed
      return `${amount} ${unit}`;
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
        await this.restoreMint(mintUrl);
        // notifySuccess(`Successfully restored mint: ${mintUrl}`);
      } catch (error) {
        console.error("Error restoring mint:", error);
        notifyError(`Error restoring mint: ${error.message || error}`);
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
  },
});
</script>
