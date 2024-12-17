<!-- src/components/WelcomeSlide3.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="vpn_key" size="4em" color="primary" />
      <h2 class="q-mt-xl">Your Seed Phrase</h2>
      <p class="q-mt-sm">
        Store your seed phrase in a password manager or write it down on paper.
        It is the only way to recover your wallet if you lose access to this
        device. You can find your seed phrase in the settings menu.
      </p>
      <q-input
        v-model="walletStore.mnemonic"
        outlined
        readonly
        autogrow
        class="q-mt-md q-pa-md seed-phrase"
        label="Seed Phrase"
        dense
      >
        <template v-slot:append>
          <q-btn flat dense icon="content_copy" @click="copySeed" />
        </template>
      </q-input>
      <q-checkbox
        v-model="welcomeStore.seedPhraseValidated"
        label="I have written it down"
        class="q-mt-md"
        style="font-size: 1rem"
      />
    </div>
  </div>
</template>

<script>
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
import { ref } from "vue";
import { useQuasar } from "quasar";

export default {
  name: "WelcomeSlide3",
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const $q = useQuasar();

    const copySeed = () => {
      navigator.clipboard
        .writeText(welcomeStore.seedPhrase)
        .then(() => {
          $q.notify({
            type: "positive",
            message: "Seed phrase copied to clipboard!",
          });
        })
        .catch(() => {
          $q.notify({
            type: "negative",
            message: "Failed to copy seed phrase.",
          });
        });
    };

    const proceed = () => {
      welcomeStore.seedPhraseValidated = true;
    };

    return {
      welcomeStore,
      walletStore,
      copySeed,
      proceed,
    };
  },
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
p {
  font-size: large;
}
:deep(.q-field__control) {
  padding: 12px 12px !important;
}
.seed-phrase {
  font-size: 0.9rem;
  font-family: monospace;
  padding: 12px 12px !important;
}
</style>
