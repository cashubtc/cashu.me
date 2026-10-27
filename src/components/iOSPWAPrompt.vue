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
<!-- Shared prompt styles: src/css/elements.scss (.pwa-prompt). -->
<style scoped>
.pwa-prompt {
  bottom: 0;
  left: 0;
  right: 0;
}
.pwa-prompt-arrow {
  border-top: 10px solid var(--app-border-strong);
}
</style>
