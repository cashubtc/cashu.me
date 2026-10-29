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
      <!-- The outlined field, read-only, with its label floating above the words (owner,
           2026-10-29); its own Show and Copy actions stand in for the lock glyph. -->
      <q-field
        outlined
        readonly
        stack-label
        class="seed-field"
        :label="$t('WelcomeSlide3.inputs.seed_phrase.label')"
      >
        <template #control>
          <div class="seed-text">{{ hiddenMnemonic }}</div>
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
            :value="walletStore.mnemonic"
            :tooltip="$t('global.actions.copy.label')"
          />
        </template>
      </q-field>

      <CjkText
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

/* Unified content width */
.seed-section,
.checkbox-section {
  max-width: 500px;
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

/* Mobile adjustments */
@media (max-width: 600px) {
  .seed-text {
    font-size: 0.85rem;
    padding-inline-end: 50px;
  }

  .seed-actions {
    top: 12px;
    inset-inline-end: 8px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
