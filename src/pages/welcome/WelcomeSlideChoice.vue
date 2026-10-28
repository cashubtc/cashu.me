<template>
  <WelcomeSlideScaffold
    class="choice-slide"
    :icon="WalletIcon"
    :title="$t('WelcomeSlideChoice.title')"
    :text="$t('WelcomeSlideChoice.text')"
    themed-text
    :mobile-gutter="false"
  >
    <!-- Options -->
    <div class="options">
      <!-- Create New Option -->
      <div
        class="app-option-row welcome-option"
        role="button"
        tabindex="0"
        data-testid="onboarding-create-wallet"
        @click="choose('new')"
        @keydown.enter.prevent="choose('new')"
        @keydown.space.prevent="choose('new')"
      >
        <div class="app-icon-circle app-icon-circle--sm">
          <q-icon name="auto_awesome" size="22px" />
        </div>
        <div class="app-option-row__text">
          <div class="app-option-row__label">
            {{ $t("WelcomeSlideChoice.options.new.title") }}
          </div>
          <div class="app-option-row__caption">
            {{ $t("WelcomeSlideChoice.options.new.subtitle") }}
          </div>
        </div>
        <q-icon name="chevron_right" size="24px" class="chevron rtl-flip" />
      </div>

      <!-- Recover Option -->
      <div
        class="app-option-row welcome-option"
        role="button"
        tabindex="0"
        data-testid="onboarding-recover-wallet"
        @click="choose('recover')"
        @keydown.enter.prevent="choose('recover')"
        @keydown.space.prevent="choose('recover')"
      >
        <div class="app-icon-circle app-icon-circle--sm">
          <q-icon name="history" size="22px" />
        </div>
        <div class="app-option-row__text">
          <div class="app-option-row__label">
            {{ $t("WelcomeSlideChoice.options.recover.title") }}
          </div>
          <div class="app-option-row__caption">
            {{ $t("WelcomeSlideChoice.options.recover.subtitle") }}
          </div>
        </div>
        <q-icon name="chevron_right" size="24px" class="chevron rtl-flip" />
      </div>
    </div>
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import { Wallet as WalletIcon } from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
export default {
  name: "WelcomeSlideChoice",
  components: { WelcomeSlideScaffold },
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const choose = (path: "new" | "recover") => {
      welcomeStore.setPath(path);
      // advance to next stage immediately for snappier UX
      welcomeStore.setCurrentSlide(3);
    };
    return { WalletIcon, welcomeStore, walletStore, choose };
  },
};
</script>

<style scoped>
.welcome-option {
  min-height: 72px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 500px;
}

.chevron {
  flex-shrink: 0;
  color: var(--app-text-subtle);
}
</style>
