<template>
  <div class="choice-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <q-icon name="account_balance_wallet" size="3em" color="primary" />
      </div>

      <!-- Title -->
      <h1 class="title">Set up your wallet</h1>

      <!-- Description -->
      <p class="description">
        Do you want to recover from a seed phrase or create a new wallet?
      </p>

      <!-- Options -->
      <div class="options">
        <!-- Recover Option -->
        <div class="option" @click="choose('recover')">
          <q-icon name="history" size="2em" color="primary" class="icon" />
          <div class="text">
            <h3 class="title">Recover wallet</h3>
            <p class="subtitle">
              Enter your seed phrase, restore mints and ecash.
            </p>
            <q-btn
              outline
              rounded
              label="Recover"
              @click.stop="choose('recover')"
              data-testid="btn-recover"
              class="btn"
            />
          </div>
        </div>

        <!-- Create New Option -->
        <div class="option" @click="choose('new')">
          <q-icon name="auto_awesome" size="2em" color="primary" class="icon" />
          <div class="text">
            <h3 class="title">Create new wallet</h3>
            <p class="subtitle">Generate a new seed and add mints.</p>
            <q-btn
              outline
              rounded
              label="Create"
              @click.stop="choose('new')"
              data-testid="btn-new"
              class="btn"
            />
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

.options {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 400px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
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

.btn {
  width: auto;
  min-width: 120px;
  height: 40px;
  font-weight: 600;
  text-transform: none;
  font-size: 0.95rem;
  border-radius: 20px;
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

  .option-card {
    padding: 20px;
  }

  .option-title {
    font-size: 1rem;
  }

  .option-description {
    font-size: 0.85rem;
  }

  .option-btn {
    height: 36px;
    font-size: 0.9rem;
  }
}
</style>
