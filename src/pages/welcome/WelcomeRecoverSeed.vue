<template>
  <div class="recover-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <q-icon name="vpn_key" size="3em" color="primary" />
      </div>

      <!-- Title -->
      <h1 class="title">Enter your seed phrase</h1>

      <!-- Description -->
      <p class="description">
        Paste or type your 12 word seed phrase to recover.
      </p>

      <!-- Seed phrase input -->
      <div class="input-section">
        <q-input
          v-model="mnemonic"
          outlined
          autogrow
          type="textarea"
          :error="errorMsg !== ''"
          :error-message="errorMsg"
          class="seed-phrase"
          label="Seed phrase"
        />

        <!-- Paste button below input -->
        <q-btn flat label="Paste" @click="paste" class="paste-btn" />
      </div>

      <!-- Disclaimer -->
      <p class="disclaimer">
        Your seed phrase is only used locally to derive your wallet keys.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, watch } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";

export default {
  name: "WelcomeRecoverSeed",
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const wallet = useWalletStore();
    const ui = useUiStore();

    const mnemonic = computed({
      get: () => restore.mnemonicToRestore,
      set: (v: string) => {
        restore.mnemonicToRestore = v;
      },
    });

    const errorMsg = computed(() => {
      if (!restore.mnemonicToRestore) return "";
      const words = restore.mnemonicToRestore.trim().split(/\s+/);
      return words.length === 12 ? "" : "Mnemonic should be 12 words.";
    });

    watch(
      () => restore.mnemonicToRestore,
      (val) => {
        const valid = !!val && val.trim().split(/\s+/).length >= 12;
        welcome.seedEnteredValid = valid;
        if (valid) {
          // set wallet mnemonic so all subsequent ops use this seed
          wallet.setMnemonicFromUser(val.trim());
        }
      },
      { immediate: true }
    );

    const paste = async () => {
      try {
        const text = await ui.pasteFromClipboard();
        restore.mnemonicToRestore = (text || "").trim();
      } catch {}
    };

    return { welcome, restore, wallet, mnemonic, errorMsg, paste };
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
  align-items: flex-start;
  text-align: left;
  flex: 1;
}

.header-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
  line-height: 1.2;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  max-width: 400px;
}

.input-section {
  width: 100%;
  max-width: 400px;
  margin-bottom: 16px;
}

.seed-phrase {
  font-size: 0.9rem;
  font-family: monospace;
  margin-bottom: 12px;
}

.seed-phrase :deep(.q-field__control) {
  padding: 12px 12px !important;
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

  .paste-btn {
    font-size: 0.85rem;
    padding: 6px 0;
  }

  .disclaimer {
    font-size: 0.8rem;
  }
}
</style>
