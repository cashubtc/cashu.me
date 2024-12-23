<!-- src/components/WelcomePage.vue -->
<template>
  <q-dialog
    v-model="welcomeStore.showWelcome"
    persistent
    transition-show="slide-up"
    transition-hide="fadeOut"
    full-screen
    @drop.prevent="dragFile"
    @dragover.prevent
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
          v-if="welcomeStore.canGoPrev"
          @click="welcomeStore.goToPrevSlide"
        />
        <q-space />
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
import { onMounted, ref } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useMintsStore } from "src/stores/mints";
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
    const mintsStore = useMintsStore();
    const fileUpload = ref(null);

    const onChangeFileUpload = () => {
      const file = fileUpload.value.files[0];
      if (file) readFile(file);
    };

    const readFile = (file) => {
      const reader = new FileReader();
      reader.onload = (f) => {
        const backup = JSON.parse(f.target.result);
        mintsStore.restoreFromBackup(backup);
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

.custom-navigation {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
</style>
