<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center" style="max-width: 700px; width: 100%">
      <q-icon name="account_balance_wallet" size="4em" color="primary" />
      <h2 class="q-mt-xl">Set up your wallet</h2>
      <p class="q-mt-sm">
        Do you want to recover from a seed phrase or create a new wallet?
      </p>

      <div class="row q-col-gutter-md q-mt-lg">
        <div class="col-12 col-md-6">
          <q-card class="option-card full-height" style="min-height: 160px">
            <q-card-section class="text-center column fit">
              <div class="row items-center justify-center q-gutter-sm">
                <q-icon name="history" size="2em" color="primary" />
                <div class="text-h6">Recover wallet</div>
              </div>
              <div class="text-subtitle2 q-mt-sm">
                Enter your seed phrase, restore mints and ecash.
              </div>
              <div class="q-mt-auto q-px-xl">
                <q-btn
                  color="primary"
                  rounded
                  label="Recover"
                  @click="choose('recover')"
                  data-testid="btn-recover"
                  class="full-width"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card class="option-card full-height" style="min-height: 160px">
            <q-card-section class="text-center column fit">
              <div class="row items-center justify-center q-gutter-sm">
                <q-icon name="auto_awesome" size="2em" color="primary" />
                <div class="text-h6">Create new wallet</div>
              </div>
              <div class="text-subtitle2 q-mt-sm">
                Generate a new seed and add mints.
              </div>
              <div class="q-mt-auto q-px-xl">
                <q-btn
                  color="primary"
                  rounded
                  label="Create"
                  @click="choose('new')"
                  data-testid="btn-new"
                  class="full-width"
                />
              </div>
            </q-card-section>
          </q-card>
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
.option-card {
  border-radius: 12px;
}
h2 {
  font-weight: bold;
}
p {
  font-size: large;
}
</style>
