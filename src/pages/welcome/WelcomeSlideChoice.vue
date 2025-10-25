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
      <div class="options-container">
        <!-- Recover Option -->
        <div class="option-card" @click="choose('recover')">
          <div class="option-icon">
            <q-icon name="history" size="2em" color="primary" />
          </div>
          <h3 class="option-title">Recover wallet</h3>
          <p class="option-description">
            Enter your seed phrase, restore mints and ecash.
          </p>
          <q-btn
            color="primary"
            rounded
            label="Recover"
            @click.stop="choose('recover')"
            data-testid="btn-recover"
            class="option-btn"
          />
        </div>

        <!-- Create New Option -->
        <div class="option-card" @click="choose('new')">
          <div class="option-icon">
            <q-icon name="auto_awesome" size="2em" color="primary" />
          </div>
          <h3 class="option-title">Create new wallet</h3>
          <p class="option-description">Generate a new seed and add mints.</p>
          <q-btn
            color="primary"
            rounded
            label="Create"
            @click.stop="choose('new')"
            data-testid="btn-new"
            class="option-btn"
          />
        </div>
      </div>
    </div>

    <!-- Spacer to match other slides -->
    <div class="spacer"></div>
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
  text-align: center;
  flex: 1;
}

.spacer {
  height: 76px; /* Height of controls (36px) + padding (20px) + gap (20px) */
  flex-shrink: 0;
}

.header-icon {
  margin-bottom: 20px;
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
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  max-width: 400px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.option-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.option-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.option-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  text-align: center;
}

.option-description {
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  text-align: center;
}

.option-btn {
  width: 100%;
  height: 40px;
  font-weight: 600;
  text-transform: none;
  font-size: 0.95rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.option-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
