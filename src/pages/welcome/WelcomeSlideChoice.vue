<template>
  <div class="choice-slide">
    <!-- Main content area -->
    <div class="welcome-slide__content">
      <!-- Header Icon -->
      <div class="welcome-slide__icon">
        <div class="app-icon-circle app-icon-circle--xl">
          <q-icon name="account_balance_wallet" size="2.5em" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="welcome-slide__title">{{ $t("WelcomeSlideChoice.title") }}</h1>

      <!-- Description -->
      <p class="welcome-slide__description">
        {{ $t("WelcomeSlideChoice.text") }}
      </p>

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
    </div>
  </div>
</template>

<script lang="ts">
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
export default {
  name: "WelcomeSlideChoice",
  setup() {
    const welcomeStore = useWelcomeStore();
    const walletStore = useWalletStore();
    const choose = (path: "new" | "recover") => {
      welcomeStore.setPath(path);
      // advance to next stage immediately for snappier UX
      welcomeStore.setCurrentSlide(3);
    };
    return { welcomeStore, walletStore, choose };
  },
};
</script>

<style scoped>
.welcome-option {
  min-height: 72px;
}

.choice-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--app-welcome-bg);
  color: var(--app-text);
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
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

/* Mobile adjustments */
@media (max-width: 600px) {
  /* The carousel slide already insets 16px: the text sits on the shared 16px gutter with
     the footer CTA (R42: 32px read as a different page). */
  .choice-slide {
    padding: 24px 0 16px;
  }
}
</style>
