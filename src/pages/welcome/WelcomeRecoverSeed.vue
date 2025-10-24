<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center" style="max-width: 800px; width: 100%">
      <q-icon name="vpn_key" size="4em" color="primary" />
      <h2 class="q-mt-xl">Enter your seed phrase</h2>
      <p class="q-mt-sm">Paste or type your 12 word seed phrase to recover.</p>

      <q-input
        v-model="mnemonic"
        outlined
        autogrow
        type="textarea"
        :error="errorMsg !== ''"
        :error-message="errorMsg"
        class="q-mt-md seed-phrase"
        label="Seed phrase"
      >
        <template v-slot:append>
          <q-btn
            flat
            dense
            icon="content_paste"
            class="cursor-pointer q-mt-md"
            @click="paste"
            label="Paste"
          />
        </template>
      </q-input>
      <p class="q-mt-none" style="font-size: 0.8rem; color: grey">
        Your seed phrase is only used locally to derive your wallet keys.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, watch } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";

export default {
  name: "WelcomeRecoverSeed",
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const wallet = useWalletStore();
    const ui = useUiStore();

    const mnemonic = computed({
      get: () => restore.mnemonicToRestore,
      set: (v: string) => {
        restore.mnemonicToRestore = v;
      },
    });

    const errorMsg = computed(() => {
      if (!restore.mnemonicToRestore) return "";
      const words = restore.mnemonicToRestore.trim().split(/\s+/);
      return words.length === 12 ? "" : "Mnemonic should be 12 words.";
    });

    watch(
      () => restore.mnemonicToRestore,
      (val) => {
        const valid = !!val && val.trim().split(/\s+/).length >= 12;
        welcome.seedEnteredValid = valid;
        if (valid) {
          // set wallet mnemonic so all subsequent ops use this seed
          wallet.setMnemonicFromUser(val.trim());
        }
      },
      { immediate: true }
    );

    const paste = async () => {
      try {
        const text = await ui.pasteFromClipboard();
        restore.mnemonicToRestore = (text || "").trim();
      } catch {}
    };

    return { welcome, restore, wallet, mnemonic, errorMsg, paste };
  },
};
</script>

<style scoped>
.seed-phrase :deep(.q-field__control) {
  padding: 12px 12px !important;
}
.seed-phrase {
  font-size: 0.9rem;
  font-family: monospace;
}
h2 {
  font-weight: bold;
}
p {
  font-size: large;
}
</style>
