<template>
  <WelcomeSlideScaffold
    class="recover-slide"
    :icon="KeyRoundIcon"
    :title="$t('WelcomeRecoverSeed.title')"
    :text="$t('WelcomeRecoverSeed.text')"
  >
    <!-- Seed phrase input grid -->
    <div class="input-section">
      <div class="words-grid">
        <!-- Each word is an outlined field whose label (Word 1, Word 2…) stays visible with
             the word in it; the words are Latin, so they read left to right in every locale. -->
        <div v-for="index in 12" :key="index" class="word-input-wrapper">
          <q-input
            :model-value="words[index - 1]"
            @update:model-value="updateWord($event, index - 1)"
            outlined
            :ref="(el) => setInputRef(el, index - 1)"
            @paste="handlePaste($event, index - 1)"
            class="word-input"
            :label="$t('WelcomeRecoverSeed.inputs.word', { index })"
            :input-attrs="{
              dir: 'ltr',
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
    <CjkText
      tag="p"
      class="disclaimer"
      :text="$t('WelcomeRecoverSeed.disclaimer')"
    />
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import { KeyRound as KeyRoundIcon } from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import { ref, computed, watch } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { validateMnemonic as validateBip39Mnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { i18n } from "src/boot/i18n";

export default {
  name: "WelcomeRecoverSeed",
  components: { CjkText, WelcomeSlideScaffold },
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
        return i18n.global.t("WelcomeRecoverSeed.progress.words_entered", {
          count: filledWords.value,
        });
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
      KeyRoundIcon,
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
.input-section {
  margin-bottom: 16px;
  width: 100%;
}

/* Three words a row, two on phones; minmax(0, 1fr) keeps a long word inside its cell. */
.words-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 12px;
}

.word-input-wrapper {
  min-width: 0;
}

.word-input :deep(input) {
  font-family: monospace;
}

.error-msg {
  color: var(--app-danger);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 8px 0 0;
}

/* Paste all: a 44px text action in the accent, underlined on hover. */
.paste-btn {
  color: var(--app-accent);
  min-height: 44px;
  padding: 0 4px;
}

.paste-btn:hover {
  text-decoration: underline;
}

.disclaimer {
  color: var(--app-text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  text-align: start;
}

@media (max-width: 600px) {
  .words-grid {
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .disclaimer {
    font-size: 0.8rem;
  }
}
</style>
