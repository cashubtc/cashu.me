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
      <!-- The outlined field, read-only but keeping its edge (readonly-outlined), with its
           label floating above the words (owner, 2026-10-29); its own Show and Copy actions
           stand in for the lock glyph. The words show masked until Show. -->
      <q-field
        outlined
        readonly
        stack-label
        class="seed-field readonly-outlined"
        :label="$t('WelcomeSlide3.inputs.seed_phrase.label')"
      >
        <template #control>
          <div
            class="seed-text"
            dir="ltr"
            role="textbox"
            aria-readonly="true"
            aria-multiline="true"
            :aria-label="$t('WelcomeSlide3.inputs.seed_phrase.label')"
            aria-describedby="welcome-seed-caption"
          >
            {{ hiddenMnemonic }}
          </div>
        </template>
        <template #append>
          <IconButton
            :label="
              hideMnemonic
                ? $t('global.actions.show_seed.label')
                : $t('global.actions.hide_seed.label')
            "
            tooltip
            @click="toggleMnemonicVisibility"
          >
            <EyeIcon v-if="hideMnemonic" :size="20" />
            <EyeOffIcon v-else :size="20" />
          </IconButton>
          <CopyButton
            class="touch-target-44"
            :value="walletStore.mnemonic"
            :tooltip="$t('global.actions.copy.label')"
          />
        </template>
      </q-field>

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
import IconButton from "src/components/ui/IconButton.vue";
import {
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  KeyRound as KeyRoundIcon,
} from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
declare const windowMixin: any;
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
import { ref, computed, onMounted } from "vue";

export default {
  name: "WelcomeSlide3",
  components: {
    CjkText,
    IconButton,
    EyeIcon,
    EyeOffIcon,
    CopyButton,
    WelcomeSlideScaffold,
  },
  mixins: [windowMixin],
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const hideMnemonic = ref(true);

    onMounted(() => {
      // Ensure mnemonic is generated for new-wallet flow only
      if (welcomeStore.onboardingPath === "new" && !walletStore.mnemonic) {
        walletStore.initializeMnemonic();
      }
    });

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
      KeyRoundIcon,
      welcomeStore,
      walletStore,
      proceed,
      toggleMnemonicVisibility,
      hiddenMnemonic,
      hideMnemonic,
    };
  },
};
</script>

<style scoped>
.seed-section {
  width: 100%;
  margin-bottom: 24px;
}

.seed-field {
  margin-bottom: 12px;
}

.seed-text {
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--app-text);
  word-wrap: break-word;
  padding: 2px 0 12px;
  width: 100%;
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

@media (max-width: 600px) {
  .seed-text {
    font-size: 0.85rem;
  }
}
</style>
