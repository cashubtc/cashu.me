<!-- src/components/WelcomeSlide3.vue -->
<template>
  <div class="seed-phrase-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <div class="icon-circle">
          <q-icon name="vpn_key" size="2.5em" color="white" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="title">{{ $t("WelcomeSlide3.title") }}</h1>

      <!-- Description -->
      <p class="description">{{ $t("WelcomeSlide3.text") }}</p>

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
              <q-tooltip>Copy</q-tooltip>
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
          :label="$t('WelcomeSlide3.inputs.checkbox.label')"
          color="primary"
          class="validation-checkbox"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
declare const windowMixin: any;
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
import { ref, computed, onMounted } from "vue";
import { useQuasar, copyToClipboard } from "quasar";

export default {
  name: "WelcomeSlide3",
  mixins: [windowMixin],
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const $q = useQuasar();
    let hideMnemonic = ref(true);

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
        $q.notify({ message: "Copied to clipboard!", position: "bottom" });
      } catch {}
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
      hideMnemonic,
      copyText,
    };
  },
};
</script>

<style scoped>
.seed-phrase-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--q-dark);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
}

.header-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
  line-height: 1.2;
  text-align: left;
  width: 100%;
  max-width: 500px;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  width: 100%;
  max-width: 500px;
}

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
  font-family: Inter, -apple-system, "system-ui", "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.seed-box {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
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
  padding-right: 80px; /* Space for action buttons */
}

.seed-actions {
  position: absolute;
  top: 16px;
  right: 12px;
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
  .seed-phrase-slide {
    padding: 30px 15px 15px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  .seed-text {
    font-size: 0.85rem;
    padding-right: 50px;
  }

  .seed-actions {
    top: 12px;
    right: 8px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
