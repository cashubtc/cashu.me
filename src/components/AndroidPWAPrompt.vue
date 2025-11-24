<!-- src/components/AndroidPWAPrompt.vue -->
<template>
  <transition appear enter-active-class="animated fadeInDown">
    <div
      v-if="showAndroidPWAPrompt"
      class="pwa-prompt android-pwa-prompt q-pa-md text-center"
    >
      <div class="pwa-prompt-content">
        <i18n-t keypath="AndroidPWAPrompt.text" tag="span">
          <template v-slot:icon>
            <q-icon name="more_vert" size="sm" />
          </template>
          <template v-slot:buttonText>
            <strong>{{ $t("AndroidPWAPrompt.buttonText") }}</strong>
          </template>
        </i18n-t>
        <q-btn
          flat
          icon="close"
          @click="closePrompt"
          size="sm"
          class="close-btn q-px-sm"
        />
      </div>

      <div class="pwa-prompt-arrow"></div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AndroidPWAPrompt",
  data() {
    return {
      showAndroidPWAPromptLocal:
        localStorage.getItem("cashu.ui.showAndroidPWAPrompt") != "seen",
      showAndroidPWAPrompt: false,
    };
  },
  mounted() {
    if (
      this.showAndroidPWAPromptLocal &&
      this.isChromeOnAndroid() &&
      !this.isInStandaloneMode()
    ) {
      this.showAndroidPWAPrompt = true;
    }
  },
  methods: {
    closePrompt() {
      localStorage.setItem("cashu.ui.showAndroidPWAPrompt", "seen");
      this.showAndroidPWAPrompt = false;
    },
    isChromeOnAndroid() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = /android/.test(userAgent);
      const isChrome =
        /chrome/.test(userAgent) && !/edge|edg|opr|opera/.test(userAgent);
      return isAndroid && isChrome;
    },
    isInStandaloneMode() {
      return window.matchMedia("(display-mode: standalone)").matches;
    },
  },
});
</script>

<style scoped>
@keyframes moveUpDown {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.pwa-prompt {
  position: fixed;
  top: 20px;
  right: 20px;
  margin: 0 auto;
  z-index: 9999;
  text-align: center;
  display: flex;
  flex-direction: column; /* Add this line */
  align-items: center; /* Add this line */
  justify-content: center;
  animation: moveUpDown 1s infinite; /* Add this line for animation */
}

.pwa-prompt-content {
  display: inline-flex;
  align-items: center;
  background-color: black;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.pwa-prompt-content q-icon {
  margin-right: 5px;
}

.pwa-prompt-arrow {
  position: relative;
  width: 0;
  height: 0;
  bottom: 60px;
  left: 45%;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
  text-align: center;
  margin: 0 auto;
}
</style>
