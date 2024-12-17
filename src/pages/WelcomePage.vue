<!-- src/components/WelcomePage.vue -->
<template>
  <q-dialog
    v-model="welcomeStore.showWelcome"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    full-screen
  >
    <q-card class="q-pa-none" style="height: 100%">
      <q-carousel
        v-model="welcomeStore.currentSlide"
        animated
        control-color="primary"
        class="flex-1"
      >
        <q-carousel-slide :name="0">
          <WelcomeSlide1 />
        </q-carousel-slide>
        <q-carousel-slide :name="1">
          <WelcomeSlide2 />
        </q-carousel-slide>
        <q-carousel-slide :name="2">
          <WelcomeSlide3 />
        </q-carousel-slide>
        <q-carousel-slide :name="3">
          <WelcomeSlide4 />
        </q-carousel-slide>
      </q-carousel>

      <div class="q-pa-md flex justify-between">
        <q-btn
          flat
          icon="arrow_left"
          label="Previous"
          :disable="!welcomeStore.canGoPrev"
          @click="welcomeStore.goToPrevSlide"
        />
        <q-btn
          flat
          icon="arrow_right"
          label="Next"
          :disable="!welcomeStore.canProceed"
          @click="welcomeStore.goToNextSlide"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { onMounted } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import WelcomeSlide1 from "./welcome/WelcomeSlide1.vue";
import WelcomeSlide2 from "./welcome/WelcomeSlide2.vue";
import WelcomeSlide3 from "./welcome/WelcomeSlide3.vue";
import WelcomeSlide4 from "./welcome/WelcomeSlide4.vue";

export default {
  name: "WelcomePage",
  components: {
    WelcomeSlide1,
    WelcomeSlide2,
    WelcomeSlide3,
    WelcomeSlide4,
  },
  setup() {
    const welcomeStore = useWelcomeStore();

    onMounted(() => {
      welcomeStore.initializeWelcome();
    });

    return {
      welcomeStore,
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

.custom-navigation {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
</style>
