<!-- src/components/WelcomeSlide3.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="vpn_key" size="4em" color="primary" />
      <h2 class="q-mt-xl">Your Seed Phrase</h2>
      <p class="q-mt-sm">
        Store your seed phrase in a password manager or on paper. Your seed
        phrase is the only way to recover your funds if you lose access to this
        device.
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
          <q-btn
            flat
            dense
            icon="content_copy"
            @click="copyText(walletStore.mnemonic)"
          />
        </template>
      </q-input>
      <p class="q-mt-none" style="font-size: 0.8rem; color: grey">
        You can see your seed phrase in the settings.
      </p>
      <q-checkbox
        v-model="welcomeStore.seedPhraseValidated"
        label="I have written it down"
        class="q-mt-sm"
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
  mixins: [windowMixin],
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const $q = useQuasar();

    const proceed = () => {
      welcomeStore.seedPhraseValidated = true;
    };

    return {
      welcomeStore,
      walletStore,
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
.seed-phrase :deep(.q-field__control) {
  padding: 12px 12px !important;
}
.seed-phrase {
  font-size: 0.9rem;
  font-family: monospace;
  padding: 12px 12px !important;
}
</style>
