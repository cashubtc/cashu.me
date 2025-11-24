<!-- src/components/WelcomePage.vue -->
<template>
  <q-card class="bg-dark q-pa-none" style="height: 100%">
    <WelcomeSlide4 />
  </q-card>
  <q-dialog persistent transition-show="slide-up" transition-hide="fadeOut">
  </q-dialog>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import WelcomeSlide4 from "./welcome/WelcomeSlide4.vue";

export default {
  name: "TermsPage",
  components: {
    WelcomeSlide4,
  },
  setup() {
    onMounted(() => {});

    return {};
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
