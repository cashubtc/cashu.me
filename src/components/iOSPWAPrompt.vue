<template>
  <transition enter-active-class="animated fadeInUp">
    <div
      v-if="showIosPWAPrompt"
      class="pwa-prompt q-pa-md q-mx-auto text-center"
    >
      <div class="pwa-prompt-content">
        <i18n-t keypath="iOSPWAPrompt.text" tag="span">
          <template v-slot:icon>
            <q-icon name="ios_share" size="sm" />
          </template>
          <template v-slot:buttonText>
            <strong>{{ $t("iOSPWAPrompt.buttonText") }}</strong>
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
  name: "iOSPWAPrompt",
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      showIosPWAPromptLocal:
        localStorage.getItem("cashu.ui.showIosPWAPrompt") != "seen",
      showIosPWAPrompt: false,
    };
  },
  mounted() {
    if (
      this.showIosPWAPromptLocal &&
      this.isiOsSafari() &&
      !this.isInStandaloneMode()
    ) {
      this.showIosPWAPrompt = true;
    }
  },
  watch: {},
  computed: {},
  methods: {
    closePrompt() {
      localStorage.setItem("cashu.ui.showIosPWAPrompt", "seen");
      this.showIosPWAPrompt = false;
    },
    isiOsSafari() {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipod/.test(userAgent) && /safari/.test(userAgent);
    },
    isInStandaloneMode() {
      return "standalone" in window.navigator && window.navigator.standalone;
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
  bottom: 0;
  left: 0;
  right: 0;
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
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
  margin: 2px auto;
  text-align: center;
}
</style>
