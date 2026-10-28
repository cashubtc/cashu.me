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
      <div class="seed-label">
        {{ $t("WelcomeSlide3.inputs.seed_phrase.label") }}
      </div>

      <div class="seed-box">
        <div class="seed-text">{{ hiddenMnemonic }}</div>
        <div class="seed-actions">
          <q-btn
            flat
            round
            dense
            :icon="hideMnemonic ? 'visibility' : 'visibility_off'"
            @click="toggleMnemonicVisibility"
            class="action-btn"
            size="sm"
          >
            <q-tooltip>{{ hideMnemonic ? "Show" : "Hide" }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="content_copy"
            @click="copyText(walletStore.mnemonic)"
            class="action-btn"
            size="sm"
          >
            <q-tooltip>{{ $t("global.actions.copy.label") }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <p class="seed-caption">
        {{ $t("WelcomeSlide3.inputs.seed_phrase.caption") }}
      </p>
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
import { KeyRound as KeyRoundIcon } from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
declare const windowMixin: any;
import { useWelcomeStore } from "src/stores/welcome";
import { notifyCopied } from "src/js/notify";
import { useWalletStore } from "src/stores/wallet";
import { ref, computed, onMounted } from "vue";
import { copyToClipboard } from "quasar";

export default {
  name: "WelcomeSlide3",
  components: { WelcomeSlideScaffold },
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

    const copyText = async (text: string) => {
      try {
        await copyToClipboard(text);
        notifyCopied();
      } catch {}
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
      copyText,
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

.seed-label {
  font-size: 15.2px;
  font-family: inherit;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.seed-box {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--app-radius-lg);
  padding: 20px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.seed-box:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.seed-text {
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.8;
  color: white;
  word-wrap: break-word;
  padding-inline-end: 80px; /* Space for action buttons */
}

.seed-actions {
  position: absolute;
  top: 16px;
  inset-inline-end: 12px;
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.seed-caption {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
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
  color: rgba(255, 255, 255, 0.9);
}

.validation-checkbox :deep(.q-checkbox__label) {
  color: rgba(255, 255, 255, 0.9);
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
