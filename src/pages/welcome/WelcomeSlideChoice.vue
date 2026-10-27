<template>
  <div class="choice-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <div class="icon-circle">
          <q-icon name="account_balance_wallet" size="2.5em" color="white" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="title">{{ $t("WelcomeSlideChoice.title") }}</h1>

      <!-- Description -->
      <p class="description">
        {{ $t("WelcomeSlideChoice.text") }}
      </p>

      <!-- Options -->
      <div class="options">
        <!-- Create New Option -->
        <div
          class="option"
          role="button"
          tabindex="0"
          data-testid="onboarding-create-wallet"
          @click="choose('new')"
          @keydown.enter.prevent="choose('new')"
          @keydown.space.prevent="choose('new')"
        >
          <q-icon name="auto_awesome" size="24px" class="icon" />
          <div class="text">
            <h3 class="title">
              {{ $t("WelcomeSlideChoice.options.new.title") }}
            </h3>
            <p class="subtitle">
              {{ $t("WelcomeSlideChoice.options.new.subtitle") }}
            </p>
          </div>
          <q-icon name="chevron_right" size="24px" class="chevron rtl-flip" />
        </div>

        <!-- Recover Option -->
        <div
          class="option"
          role="button"
          tabindex="0"
          data-testid="onboarding-recover-wallet"
          @click="choose('recover')"
          @keydown.enter.prevent="choose('recover')"
          @keydown.space.prevent="choose('recover')"
        >
          <q-icon name="history" size="24px" class="icon" />
          <div class="text">
            <h3 class="title">
              {{ $t("WelcomeSlideChoice.options.recover.title") }}
            </h3>
            <p class="subtitle">
              {{ $t("WelcomeSlideChoice.options.recover.subtitle") }}
            </p>
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
.choice-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--app-welcome-bg);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: start;
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
  text-align: start;
  width: 100%;
  max-width: 500px;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: start;
  max-width: 500px;
  width: 100%;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 500px;
}

.option {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  min-height: 72px;
  padding: 16px;
  border-radius: 14px;
  background: var(--app-tint);
  border: 1px solid var(--app-border);
  transition: background-color 0.15s ease;
}

.option:hover {
  background: var(--app-tint-strong);
}

.option:focus-visible {
  outline: 2px solid var(--app-text);
  outline-offset: 2px;
}

.icon {
  flex-shrink: 0;
  color: var(--app-text);
}

.chevron {
  flex-shrink: 0;
  color: var(--app-text-subtle);
}

.text {
  flex: 1;
}

.text .title {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--app-text-muted);
  margin: 0;
  line-height: 1.4;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  /* The carousel slide already insets 16px: the text sits on the shared 16px gutter with
     the footer CTA (R42: 32px read as a different page). */
  .choice-slide {
    padding: 24px 0 16px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    margin-bottom: 28px;
  }
}
</style>
