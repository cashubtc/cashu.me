<!-- src/components/WelcomeSlide3.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="vpn_key" size="4em" color="primary" />
      <h2 class="q-mt-md">Your Seed Phrase</h2>
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
        class="q-mt-md q-pa-md"
        label="Seed Phrase"
        dense
      >
        <template v-slot:append>
          <q-btn flat dense icon="content_copy" @click="copySeed" />
        </template>
      </q-input>
      <q-btn
        outline
        rounded
        color="primary "
        class="q-mt-md"
        @click="proceed"
        style="font-size: large"
      >
        <q-icon
          :name="welcomeStore.seedPhraseValidated ? 'check' : 'close'"
          :color="welcomeStore.seedPhraseValidated ? 'positive' : 'negative'"
          class="q-mr-sm"
        />
        I have written it down
      </q-btn>
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
</style>
