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
        dense
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>{{ $t("WelcomeSlide3.inputs.seed_phrase.label") }}</span>
            <InfoTooltip
              class="q-ml-xs"
              :text="$t('WelcomeSlide3.tooltips.seed_phrase')"
            />
          </div>
        </template>
        <template v-slot:append>
          <q-btn
            flat
            dense
            icon="visibility"
            class="cursor-pointer q-mt-md"
            @click="toggleMnemonicVisibility"
            aria-label="Toggle visibility"
            title="Toggle visibility"
          ></q-btn>
          <q-btn
            flat
            dense
            icon="content_copy"
            class="cursor-pointer q-mt-md"
            @click="copy(mnemonicStore.mnemonic)"
            :aria-label="$t('global.actions.copy.label')"
            :title="$t('global.actions.copy.label')"
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

<script>
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
import { useMnemonicStore } from "src/stores/mnemonic";
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useClipboard } from "src/composables/useClipboard";

export default {
  name: "WelcomeSlide3",
  mixins: [windowMixin],
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const mnemonicStore = useMnemonicStore();
    const $q = useQuasar();
    const { copy } = useClipboard();
    let hideMnemonic = ref(true);

    const hiddenMnemonic = computed(() => {
      if (hideMnemonic.value) {
        return mnemonicStore.mnemonic
          .split(" ")
          .map((w) => "*".repeat(6))
          .join(" ");
      }
      return mnemonicStore.mnemonic;
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
      copy,
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
