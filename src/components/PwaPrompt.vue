<!-- The "add to home screen" hint for a browser that can install the wallet: Chrome on Android
     (top, points at the menu) or Safari on iPhone (bottom, points at Share). Shown until closed. -->
<template>
  <transition
    :appear="isAndroid"
    :enter-active-class="
      isAndroid ? 'animated fadeInDown' : 'animated fadeInUp'
    "
  >
    <div
      v-if="show"
      class="pwa-prompt q-pa-md text-center"
      :class="
        isAndroid
          ? 'android-pwa-prompt pwa-prompt--android'
          : 'q-mx-auto pwa-prompt--ios'
      "
    >
      <div class="pwa-prompt-content">
        <i18n-t :keypath="`${i18nKey}.text`" tag="span">
          <template v-slot:icon>
            <q-icon :name="isAndroid ? 'more_vert' : 'ios_share'" size="sm" />
          </template>
          <template v-slot:buttonText>
            <strong>{{ $t(`${i18nKey}.buttonText`) }}</strong>
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
import { defineComponent, PropType } from "vue";

type PwaPlatform = "android" | "ios";

// The "seen" flag each platform has always used; kept so a dismissed prompt stays dismissed.
const SEEN_KEYS: Record<PwaPlatform, string> = {
  android: "cashu.ui.showAndroidPWAPrompt",
  ios: "cashu.ui.showIosPWAPrompt",
};

export default defineComponent({
  name: "PwaPrompt",
  props: {
    platform: {
      type: String as PropType<PwaPlatform>,
      required: true,
      validator: (value: string) => value === "android" || value === "ios",
    },
  },
  data() {
    return {
      show: false,
    };
  },
  computed: {
    isAndroid(): boolean {
      return this.platform === "android";
    },
    i18nKey(): string {
      return this.isAndroid ? "AndroidPWAPrompt" : "iOSPWAPrompt";
    },
  },
  mounted() {
    const notSeen = localStorage.getItem(SEEN_KEYS[this.platform]) != "seen";
    if (notSeen && this.isSupportedBrowser() && !this.isInStandaloneMode()) {
      this.show = true;
    }
  },
  methods: {
    closePrompt() {
      localStorage.setItem(SEEN_KEYS[this.platform], "seen");
      this.show = false;
    },
    isSupportedBrowser(): boolean {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (this.isAndroid) {
        const isChrome =
          /chrome/.test(userAgent) && !/edge|edg|opr|opera/.test(userAgent);
        return /android/.test(userAgent) && isChrome;
      }
      return /iphone|ipod/.test(userAgent) && /safari/.test(userAgent);
    },
    isInStandaloneMode(): boolean {
      if (this.isAndroid) {
        return window.matchMedia("(display-mode: standalone)").matches;
      }
      return (
        "standalone" in window.navigator &&
        !!(window.navigator as any).standalone
      );
    },
  },
});
</script>

<!-- Shared prompt styles: src/css/elements.scss (.pwa-prompt). -->
<style scoped>
.pwa-prompt--android {
  top: 20px;
  right: 20px;
}
.pwa-prompt--android .pwa-prompt-arrow {
  position: relative;
  bottom: 60px;
  left: 45%;
  border-bottom: 10px solid var(--app-border-strong);
}
.pwa-prompt--ios {
  bottom: 0;
  left: 0;
  right: 0;
}
.pwa-prompt--ios .pwa-prompt-arrow {
  border-top: 10px solid var(--app-border-strong);
}
</style>
