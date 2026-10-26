<!-- src/components/WelcomePage.vue -->
<template>
  <q-dialog
    v-model="welcomeStore.showWelcome"
    persistent
    transition-show="slide-up"
    transition-hide="fadeOut"
    :maximized="$q.screen.lt.sm"
    @drop.prevent="dragFile"
    @dragover.prevent
  >
    <q-card class="q-pa-none welcome-surface" style="height: 100%">
      <q-carousel
        v-model="welcomeStore.currentSlide"
        animated
        control-color="primary"
        class="flex-1 welcome-surface"
        style="height: 100%"
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
        <q-carousel-slide
          :name="3"
          v-if="welcomeStore.onboardingPath === 'new'"
        >
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

      <div
        class="welcome-footer welcome-surface row items-center no-wrap"
        v-if="welcomeStore.currentSlide > 0"
      >
        <q-btn
          flat
          round
          icon="chevron_left"
          class="welcome-footer__back"
          :aria-label="$t('WelcomePage.actions.previous.label')"
          v-if="welcomeStore.canGoPrev"
          @click="welcomeStore.goToPrevSlide"
        />
        <q-btn
          rounded
          unelevated
          no-caps
          color="primary"
          class="welcome-footer__next"
          data-testid="onboarding-next"
          :label="$t('WelcomePage.actions.next.label')"
          :disable="!welcomeStore.canProceed"
          @click="welcomeStore.goToNextSlide"
          v-if="
            welcomeStore.currentSlide > 0 && welcomeStore.currentSlide !== 2
          "
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useStorageStore } from "src/stores/storage";
import WelcomeSlide1 from "./welcome/WelcomeSlide1.vue";
import WelcomeSlide2 from "./welcome/WelcomeSlide2.vue";
import WelcomeSlide3 from "./welcome/WelcomeSlide3.vue";
import WelcomeSlideChoice from "./welcome/WelcomeSlideChoice.vue";
import WelcomeRecoverSeed from "./welcome/WelcomeRecoverSeed.vue";
import WelcomeMintSetup from "./welcome/WelcomeMintSetup.vue";
import WelcomeRestoreEcash from "./welcome/WelcomeRestoreEcash.vue";

export default {
  name: "WelcomePage",
  components: {
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

    return {
      welcomeStore,
      fileUpload,
      onChangeFileUpload,
      dragFile,
    };
  },
};
</script>

<style scoped>
.q-dialog__inner {
  height: 100%;
  width: 100%;
  margin: 0; /* Align dialog to cover the entire viewport */
}

.q-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.q-carousel {
  flex: 1;
}

.welcome-footer {
  gap: 12px;
  padding: 12px 16px 24px;
}

.welcome-footer__back {
  width: 48px;
  height: 48px;
}

.welcome-footer__next {
  flex: 1;
  max-width: 500px;
  min-height: 52px;
  font-size: 16px;
  font-weight: 600;
}
</style>
