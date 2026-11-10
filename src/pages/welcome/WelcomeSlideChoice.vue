<template>
  <WelcomeSlideScaffold
    class="choice-slide"
    :icon="WalletIcon"
    :title="$t('WelcomeSlideChoice.title')"
    :text="$t('WelcomeSlideChoice.text')"
  >
    <!-- Options -->
    <div class="options">
      <!-- Create New Option -->
      <OptionRow
        data-testid="onboarding-create-wallet"
        @click="choose('new')"
        class="welcome-option"
        icon-size="sm"
      >
        <template #icon><SparklesIcon :size="20" /></template>
        <template #label>{{
          $t("WelcomeSlideChoice.options.new.title")
        }}</template>
        <template #caption>{{
          $t("WelcomeSlideChoice.options.new.subtitle")
        }}</template>
        <template #trailing
          ><ChevronRightIcon :size="20" class="chevron"
        /></template>
      </OptionRow>

      <!-- Recover Option -->
      <OptionRow
        data-testid="onboarding-recover-wallet"
        @click="choose('recover')"
        class="welcome-option"
        icon-size="sm"
      >
        <template #icon><KeyRoundIcon :size="20" /></template>
        <template #label>{{
          $t("WelcomeSlideChoice.options.recover.title")
        }}</template>
        <template #caption>{{
          $t("WelcomeSlideChoice.options.recover.subtitle")
        }}</template>
        <template #trailing
          ><ChevronRightIcon :size="20" class="chevron"
        /></template>
      </OptionRow>
    </div>
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import OptionRow from "src/components/ui/OptionRow.vue";
import {
  ChevronRight as ChevronRightIcon,
  KeyRound as KeyRoundIcon,
  Sparkles as SparklesIcon,
  Wallet as WalletIcon,
} from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useWalletStore } from "src/stores/wallet";
export default {
  name: "WelcomeSlideChoice",
  components: {
    OptionRow,
    SparklesIcon,
    KeyRoundIcon,
    ChevronRightIcon,
    WelcomeSlideScaffold,
  },
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
/* Both choices are the same height whether or not a caption wraps; larger text grows
   them. */
.welcome-option {
  min-height: 88px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.chevron {
  flex-shrink: 0;
  color: var(--app-text-subtle);
}
</style>
