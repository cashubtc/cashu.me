<!-- src/components/WelcomePage.vue -->
<template>
  <!-- A page, not a dialog: the window is the one scroller, so on a wide screen the scrollbar
       and the wheel area are the window's, not a 640px card's (owner 2026-10-29b, item 6).
       Every step keeps one column (item 16): the scaffold's FlowColumn and FlowFooter's
       column share one edge; slides carry no padding. -->
  <div
    v-if="welcomeStore.showWelcome"
    class="welcome-page welcome-surface"
    @drop.prevent="dragFile"
    @dragover.prevent
  >
    <q-carousel
      v-model="welcomeStore.currentSlide"
      animated
      control-color="primary"
      class="welcome-carousel welcome-surface"
    >
      <q-carousel-slide :name="0">
        <WelcomeSlide1 />
      </q-carousel-slide>
      <q-carousel-slide :name="1">
        <WelcomeSlide2 />
      </q-carousel-slide>
      <q-carousel-slide :name="2">
        <WelcomeSlideChoice />
      </q-carousel-slide>
      <!-- New wallet flow: seed display at slide 3 -->
      <q-carousel-slide :name="3" v-if="welcomeStore.onboardingPath === 'new'">
        <WelcomeSlide3 />
      </q-carousel-slide>
      <!-- Recover flow: seed input at slide 3 -->
      <q-carousel-slide
        :name="3"
        v-else-if="welcomeStore.onboardingPath === 'recover'"
      >
        <WelcomeRecoverSeed />
      </q-carousel-slide>
      <!-- Mints setup at slide 4 (both paths) -->
      <q-carousel-slide :name="4" v-if="welcomeStore.onboardingPath">
        <WelcomeMintSetup />
      </q-carousel-slide>
      <!-- Recover flow: restore ecash at slide 5 -->
      <q-carousel-slide
        :name="5"
        v-if="welcomeStore.onboardingPath === 'recover'"
      >
        <WelcomeRestoreEcash />
      </q-carousel-slide>
    </q-carousel>

    <FlowFooter v-if="welcomeStore.currentSlide > 0" class="welcome-footer">
      <div class="welcome-footer__row">
        <IconButton
          v-if="welcomeStore.canGoPrev"
          class="welcome-footer__back"
          :icon="ChevronLeftIcon"
          :icon-size="24"
          :label="$t('WelcomePage.actions.previous.label')"
          @click="welcomeStore.goToPrevSlide"
        />
        <q-btn
          rounded
          unelevated
          color="primary"
          class="welcome-footer__next"
          data-testid="onboarding-next"
          :label="$t('WelcomePage.actions.next.label')"
          :disable="!welcomeStore.canProceed"
          @click="welcomeStore.goToNextSlide"
          v-if="welcomeStore.currentSlide !== 2"
        />
      </div>
    </FlowFooter>
  </div>
</template>

<script lang="ts">
import { ChevronLeft as ChevronLeftIcon } from "lucide-vue-next";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import IconButton from "src/components/ui/IconButton.vue";
import { onMounted, ref, watch } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useStorageStore } from "src/stores/storage";
import WelcomeSlide1 from "src/pages/welcome/WelcomeSlide1.vue";
import WelcomeSlide2 from "src/pages/welcome/WelcomeSlide2.vue";
import WelcomeSlide3 from "src/pages/welcome/WelcomeSlide3.vue";
import WelcomeSlideChoice from "src/pages/welcome/WelcomeSlideChoice.vue";
import WelcomeRecoverSeed from "src/pages/welcome/WelcomeRecoverSeed.vue";
import WelcomeMintSetup from "src/pages/welcome/WelcomeMintSetup.vue";
import WelcomeRestoreEcash from "src/pages/welcome/WelcomeRestoreEcash.vue";

export default {
  name: "WelcomePage",
  components: {
    FlowFooter,
    IconButton,
    WelcomeSlide1,
    WelcomeSlide2,
    WelcomeSlide3,
    WelcomeSlideChoice,
    WelcomeRecoverSeed,
    WelcomeMintSetup,
    WelcomeRestoreEcash,
  },
  setup() {
    const welcomeStore = useWelcomeStore();
    const storageStore = useStorageStore();
    const fileUpload = ref(null);

    const onChangeFileUpload = () => {
      const file = fileUpload.value.files[0];
      if (file) readFile(file);
    };

    const readFile = (file) => {
      const reader = new FileReader();
      reader.onload = (f) => {
        const backup = JSON.parse(f.target.result);
        storageStore.restoreFromBackup(backup);
      };
      reader.readAsText(file);
    };

    const dragFile = (ev) => {
      const file = ev.dataTransfer.files[0];
      if (file) readFile(file);
    };

    onMounted(() => {
      welcomeStore.initializeWelcome();
    });

    // Each step starts at its top: the window keeps its scroll position across steps.
    watch(
      () => welcomeStore.currentSlide,
      () => window.scrollTo({ top: 0 })
    );

    return {
      ChevronLeftIcon,
      welcomeStore,
      fileUpload,
      onChangeFileUpload,
      dragFile,
    };
  },
};
</script>

<style scoped>
/* The page fills the window and grows with its step; the window scrolls it. */
.welcome-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

/* The carousel and its panels grow with the step instead of holding a fixed height with
   their own scroller (Quasar's 400px carousel and .scroll panel). clip, not hidden, so the
   slide transition stays clipped without making the carousel a scroll container, and the
   footers can stick to the window's bottom. */
.welcome-carousel,
.welcome-carousel :deep(.q-carousel__slides-container),
.welcome-carousel :deep(.q-panel),
.welcome-carousel :deep(.q-carousel__slide) {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  height: auto;
  min-height: 0;
}
.welcome-carousel {
  overflow: clip;
}
.welcome-carousel :deep(.q-panel) {
  overflow: visible;
}
.welcome-carousel :deep(.q-carousel__slide) {
  padding: 0;
}

/* Back and Next stay at the bottom of the window while the step scrolls under them. */
.welcome-footer {
  bottom: 0;
  position: sticky;
  z-index: 1;
}

/* Back and Next on the footer's column: Back 48px, then Next takes the rest. */
.welcome-footer__row {
  align-items: center;
  display: flex;
  gap: 12px;
}
.welcome-footer__back {
  flex-shrink: 0;
  height: 48px;
  width: 48px;
}
.welcome-footer__next {
  flex: 1;
  min-height: 52px;
  min-width: 0;
}
</style>
