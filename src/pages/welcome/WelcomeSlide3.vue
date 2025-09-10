<!-- src/components/WelcomeSlide3.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="vpn_key" size="4em" color="primary" />
      <h2 class="q-mt-xl">{{ $t("WelcomeSlide3.title") }}</h2>
      <p class="q-mt-sm">{{ $t("WelcomeSlide3.text") }}</p>
      <q-input
        v-model="hiddenMnemonic"
        outlined
        readonly
        autogrow
        class="q-mt-md q-pa-md seed-phrase"
        :label="$t('WelcomeSlide3.inputs.seed_phrase.label')"
        dense
      >
        <template v-slot:append>
          <q-btn
            flat
            dense
            icon="visibility"
            class="cursor-pointer q-mt-md"
            @click="toggleMnemonicVisibility"
          ></q-btn>
          <q-btn
            flat
            dense
            icon="content_copy"
            class="cursor-pointer q-mt-md"
            @click="copyText(walletStore.mnemonic)"
          ></q-btn>
        </template>
      </q-input>
      <p class="q-mt-none" style="font-size: 0.8rem; color: grey">
        {{ $t("WelcomeSlide3.inputs.seed_phrase.caption") }}
      </p>
      <q-checkbox
        v-model="welcomeStore.seedPhraseValidated"
        :label="$t('WelcomeSlide3.inputs.checkbox.label')"
        class="q-mt-sm"
        style="font-size: 1rem"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
import { ref, computed } from "vue";
import { useQuasar } from "quasar";

export default {
  name: "WelcomeSlide3",
  mixins: [windowMixin],
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const $q = useQuasar();
    let hideMnemonic = ref(true);

    const hiddenMnemonic = computed(() => {
      if (hideMnemonic.value) {
        return walletStore.mnemonic
          .split(" ")
          .map((w) => "*".repeat(6))
          .join(" ");
      }
      return walletStore.mnemonic;
    });

    const toggleMnemonicVisibility = () => {
      hideMnemonic.value = !hideMnemonic.value;
    };

    const proceed = () => {
      welcomeStore.seedPhraseValidated = true;
    };

    return {
      welcomeStore,
      walletStore,
      proceed,
      toggleMnemonicVisibility,
      hiddenMnemonic,
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
