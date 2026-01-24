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
        <div class="option" @click="choose('new')">
          <q-icon name="auto_awesome" size="2em" color="primary" class="icon" />
          <div class="text">
            <h3 class="title">
              {{ $t("WelcomeSlideChoice.options.new.title") }}
            </h3>
            <p class="subtitle">
              {{ $t("WelcomeSlideChoice.options.new.subtitle") }}
            </p>
          </div>
        </div>

        <!-- Recover Option -->
        <div class="option" @click="choose('recover')">
          <q-icon name="history" size="2em" color="primary" class="icon" />
          <div class="text">
            <h3 class="title">
              {{ $t("WelcomeSlideChoice.options.recover.title") }}
            </h3>
            <p class="subtitle">
              {{ $t("WelcomeSlideChoice.options.recover.subtitle") }}
            </p>
          </div>
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
  max-width: 500px;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  max-width: 500px;
  width: 100%;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 500px;
  padding: 16px 0px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.option:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.text {
  flex: 1;
}

.text .title {
  font-size: 15.2px; /* Exact match to platform titles in WelcomeSlide2 */
  font-family: Inter, -apple-system, "system-ui", "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .choice-slide {
    padding: 30px 15px 15px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  .option {
    padding: 12px;
  }

  .text .title {
    font-size: 14px;
  }

  .subtitle {
    font-size: 0.85rem;
  }
}
</style>
