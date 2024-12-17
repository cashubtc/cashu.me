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
        navigation-visible
        arrows
        prev-icon="arrow_left"
        :next-icon="welcomeStore.canProceed ? 'arrow_right' : 'none'"
        style="height: 100%; width: 100%"
        padding
        @before="onBeforeSlide"
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

    const onBeforeSlide = (newSlide, oldSlide) => {
      // Determine the direction of the slide transition
      const isMovingForward = newSlide > oldSlide;
      const isMovingBackward = newSlide < oldSlide;

      if (isMovingForward && !welcomeStore.canProceed) {
        // Notify the user that they cannot proceed yet
        $q.notify({
          type: "negative",
          message: "Please complete the current step before proceeding.",
        });
        return false; // Prevent the transition
      }

      // Allow the transition
      return true;
    };

    return {
      welcomeStore,
      onBeforeSlide,
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
</style>
