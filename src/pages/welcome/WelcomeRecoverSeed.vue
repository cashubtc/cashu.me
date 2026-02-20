<template>
  <div class="recover-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <div class="icon-circle">
          <q-icon name="vpn_key" size="2.5em" color="white" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="title">{{ $t("WelcomeRecoverSeed.title") }}</h1>

      <!-- Description -->
      <p class="description">
        {{ $t("WelcomeRecoverSeed.text") }}
      </p>

      <!-- Seed phrase input grid -->
      <div class="input-section">
        <div class="words-grid">
          <div v-for="index in 12" :key="index" class="word-input-wrapper">
            <span class="word-number">{{ index }}</span>
            <q-input
              :model-value="words[index - 1]"
              @update:model-value="updateWord($event, index - 1)"
              outlined
              dense
              :ref="(el) => setInputRef(el, index - 1)"
              @paste="handlePaste($event, index - 1)"
              class="word-input"
              :placeholder="$t('WelcomeRecoverSeed.inputs.word', { index })"
              :input-attrs="{
                autocapitalize: 'none',
                autocorrect: 'off',
                autocomplete: 'off',
                spellcheck: 'false',
              }"
            />
          </div>
        </div>

        <!-- Paste button below inputs -->
        <q-btn
          flat
          :label="$t('WelcomeRecoverSeed.actions.paste_all')"
          @click="paste"
          class="paste-btn"
        />

        <!-- Error message -->
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </div>

      <!-- Disclaimer -->
      <p class="disclaimer">
        {{ $t("WelcomeRecoverSeed.disclaimer") }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { validateMnemonic as validateBip39Mnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { i18n } from "../../boot/i18n";

export default {
  name: "WelcomeRecoverSeed",
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const wallet = useWalletStore();
    const ui = useUiStore();

    const words = ref<string[]>(Array(12).fill(""));
    const inputRefs = ref<any[]>([]);

    const setInputRef = (el: any, index: number) => {
      if (el) {
        inputRefs.value[index] = el;
      }
    };

    type QInputModel = string | number | null;

    const updateWord = (val: QInputModel, index: number) => {
      const lower = String(val ?? "").toLowerCase();

      // Multi word (paste or user typed spaces)
      if (/\s/.test(lower.trim()) && lower.trim().split(/\s+/).length > 1) {
        const splitWords = lower.trim().split(/\s+/);
        splitWords.forEach((w, i) => {
          if (index + i < 12) {
            words.value[index + i] = w;
          }
        });
        const nextIndex = Math.min(index + splitWords.length, 11);
        setTimeout(() => {
          inputRefs.value[nextIndex]?.focus();
        }, 50);

        return;
      }

      // Space to advance, store trimmed
      if (lower.endsWith(" ") && index < 11) {
        words.value[index] = lower.trim();
        setTimeout(() => {
          inputRefs.value[index + 1]?.focus();
        }, 50);
        return;
      }

      // Normal typing
      words.value[index] = lower;
    };

    // Combine individual words into mnemonic
    const mnemonic = computed(() => {
      return words.value
        .filter((w) => w.trim())
        .join(" ")
        .trim()
        .toLowerCase();
    });

    // Count of words filled
    const filledWords = computed(
      () => words.value.filter((w) => w.trim()).length
    );

    // Message to show
    const errorMsg = computed(() => {
      if (filledWords.value === 0) return "";
      if (filledWords.value < 12)
        return `${filledWords.value}/12 words entered`;
      if (!validateBip39Mnemonic(mnemonic.value, wordlist)) {
        return i18n.global.t("RestoreView.actions.validate.error");
      }
      return "";
    });

    // Watch mnemonic and update store
    watch(mnemonic, (val) => {
      restore.mnemonicToRestore = val;
      const valid = validateBip39Mnemonic(val, wordlist);
      welcome.seedEnteredValid = valid;
      if (valid) {
        wallet.setMnemonicFromUser(val);
      }
    });

    // Handle paste on individual input
    const handlePaste = (event: ClipboardEvent, index: number) => {
      event.preventDefault();
      const pastedText = event.clipboardData?.getData("text") || "";
      updateWord(pastedText, index);
    };

    // Paste all from clipboard
    const paste = async () => {
      try {
        const text = await ui.pasteFromClipboard();
        updateWord(text, 0);
      } catch {}
    };

    return {
      welcome,
      restore,
      wallet,
      words,
      errorMsg,
      paste,
      handlePaste,
      updateWord,
      setInputRef,
    };
  },
};
</script>

<style scoped>
.recover-slide {
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
  align-items: center;
  text-align: left;
  flex: 1;
}

.header-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  max-width: 500px; /* unified */
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  max-width: 500px; /* unified */
  width: 100%;
}

.input-section {
  width: 100%;
  max-width: 500px; /* unified */
  margin-bottom: 16px;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.word-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.word-number {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  min-width: 22px;
  text-align: right;
  font-weight: 600;
}

.word-input {
  flex: 1;
  font-family: monospace;
  font-size: 0.9rem;
}

.word-input :deep(.q-field__control) {
  min-height: 44px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.word-input :deep(.q-field__control):hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.word-input :deep(.q-field__native) {
  padding: 0 12px;
}

.word-input :deep(.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(var(--q-primary-rgb), 0.5);
  box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.1);
}

.word-input :deep(input) {
  font-family: monospace;
  font-size: 0.9rem;
  color: white;
}

.word-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

.error-msg {
  font-size: 0.85rem;
  color: rgba(255, 200, 87, 0.9);
  margin: 8px 0 0 0;
  line-height: 1.4;
}

.paste-btn {
  width: auto;
  height: auto;
  font-weight: 500;
  text-transform: none;
  font-size: 0.9rem;
  color: var(--q-primary);
  background: transparent;
  padding: 8px 0;
  transition: color 0.2s ease;
}

.paste-btn:hover {
  color: rgba(var(--q-primary-rgb), 0.8);
  background: transparent;
}

.disclaimer {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  text-align: left;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .recover-slide {
    padding: 30px 15px 15px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  .input-section {
    max-width: 100%;
  }

  .words-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .word-number {
    font-size: 0.7rem;
    min-width: 18px;
  }

  .word-input {
    font-size: 0.85rem;
  }

  .word-input :deep(input) {
    font-size: 0.85rem;
  }

  .paste-btn {
    font-size: 0.85rem;
    padding: 6px 0;
  }

  .disclaimer {
    font-size: 0.8rem;
  }
}
</style>
