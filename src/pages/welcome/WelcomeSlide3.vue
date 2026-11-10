<!-- src/components/WelcomeSlide3.vue -->
<template>
  <WelcomeSlideScaffold
    class="seed-phrase-slide"
    :icon="KeyRoundIcon"
    :title="$t('WelcomeSlide3.title')"
    :text="$t('WelcomeSlide3.text')"
  >
    <!-- Seed Phrase Section -->
    <div class="seed-section">
      <!-- The words show masked until Show; the field's own Show and Copy actions stand in
           for the lock glyph. -->
      <SeedPhraseField
        class="seed-phrase"
        :mnemonic="walletStore.mnemonic"
        :label="$t('WelcomeSlide3.inputs.seed_phrase.label')"
        described-by="welcome-seed-caption"
      />

      <CjkText
        id="welcome-seed-caption"
        tag="p"
        class="seed-caption"
        :text="$t('WelcomeSlide3.inputs.seed_phrase.caption')"
      />
    </div>

    <!-- Checkbox -->
    <div class="checkbox-section">
      <q-checkbox
        v-model="welcomeStore.seedPhraseValidated"
        data-testid="onboarding-seed-confirmed"
        :label="$t('WelcomeSlide3.inputs.checkbox.label')"
        color="primary"
        class="validation-checkbox"
      />
    </div>
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import { KeyRound as KeyRoundIcon } from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import SeedPhraseField from "src/components/ui/SeedPhraseField.vue";
declare const windowMixin: any;
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
import { onMounted } from "vue";

export default {
  name: "WelcomeSlide3",
  components: {
    CjkText,
    SeedPhraseField,
    WelcomeSlideScaffold,
  },
  mixins: [windowMixin],
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();

    onMounted(() => {
      // Ensure mnemonic is generated for new-wallet flow only
      if (welcomeStore.onboardingPath === "new" && !walletStore.mnemonic) {
        walletStore.initializeMnemonic();
      }
    });

    const proceed = () => {
      welcomeStore.seedPhraseValidated = true;
    };

    return {
      KeyRoundIcon,
      welcomeStore,
      walletStore,
      proceed,
    };
  },
};
</script>

<style scoped>
.seed-section {
  width: 100%;
  margin-bottom: 24px;
}

.seed-phrase {
  margin-bottom: 12px;
}

.seed-caption {
  font-size: 0.85rem;
  color: var(--app-text-subtle);
  margin: 0;
  line-height: 1.4;
}

.checkbox-section {
  justify-content: center;
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.validation-checkbox {
  font-size: 0.95rem;
  color: var(--app-text-muted);
}

.validation-checkbox :deep(.q-checkbox__label) {
  color: var(--app-text-muted);
  font-size: 0.95rem;
  line-height: 1.4;
}
</style>
