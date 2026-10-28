<!-- The "add to home screen" sheet for a browser that can install the wallet: Safari on iPhone
     (two steps: Share, then Add to Home Screen) or Chrome on Android (an Install button that
     opens the browser's own install flow, or the menu steps when the browser hasn't offered
     one). It floats at the bottom without dimming the wallet, and shows until closed. -->
<template>
  <transition name="pwa-prompt" appear>
    <section v-if="show" class="pwa-prompt" :aria-label="$t('PwaPrompt.title')">
      <div class="pwa-prompt__head">
        <img :src="appIcon" alt="" class="pwa-prompt__icon" />
        <div class="pwa-prompt__titles">
          <div class="pwa-prompt__title">{{ $t("PwaPrompt.title") }}</div>
          <div class="pwa-prompt__text">{{ $t("PwaPrompt.text") }}</div>
        </div>
        <IconButton
          v-if="!canInstall"
          class="pwa-prompt__close"
          :icon="XIcon"
          :label="$t('global.actions.close.label')"
          @click="closePrompt"
        />
      </div>

      <template v-if="canInstall">
        <q-btn
          unelevated
          rounded
          color="primary"
          class="full-width"
          :label="$t('PwaPrompt.install')"
          @click="install"
        />
        <q-btn
          flat
          rounded
          class="pwa-prompt__later"
          :label="$t('PwaPrompt.notNow')"
          @click="closePrompt"
        />
      </template>
      <ol v-else class="pwa-prompt__steps">
        <li
          v-for="(step, i) in steps"
          :key="step.text"
          class="pwa-prompt__step"
        >
          <span class="pwa-prompt__num">{{ i + 1 }}</span>
          <span class="pwa-prompt__step-text">{{ step.text }}</span>
          <component
            :is="step.icon"
            :size="20"
            class="pwa-prompt__glyph"
            aria-hidden="true"
          />
        </li>
      </ol>
    </section>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  EllipsisVertical as EllipsisVerticalIcon,
  Share as ShareIcon,
  SquarePlus as SquarePlusIcon,
  X as XIcon,
} from "lucide-vue-next";
import IconButton from "src/components/ui/IconButton.vue";

type PwaPlatform = "android" | "ios";

// The browser's deferred install offer (Chromium only; not in the DOM typings).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// The "seen" flag each platform has always used; kept so a dismissed prompt stays dismissed.
const SEEN_KEYS: Record<PwaPlatform, string> = {
  android: "cashu.ui.showAndroidPWAPrompt",
  ios: "cashu.ui.showIosPWAPrompt",
};

// src/boot/base.js captures the offer as early as possible and announces it with this event.
const deferredOffer = (): BeforeInstallPromptEvent | null =>
  (window as any).__deferredBeforeInstallPrompt ?? null;

export default defineComponent({
  name: "PwaPrompt",
  setup() {
    return { XIcon };
  },
  components: { IconButton, XIcon },
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
      appIcon: "/icons/apple-icon-180x180.png",
      deferredPrompt: null as BeforeInstallPromptEvent | null,
    };
  },
  computed: {
    isAndroid(): boolean {
      return this.platform === "android";
    },
    canInstall(): boolean {
      return this.isAndroid && !!this.deferredPrompt;
    },
    steps(): { text: string; icon: unknown }[] {
      return this.isAndroid
        ? [
            {
              text: this.$t("PwaPrompt.android.menu"),
              icon: EllipsisVerticalIcon,
            },
            { text: this.$t("PwaPrompt.android.add"), icon: SquarePlusIcon },
          ]
        : [
            { text: this.$t("PwaPrompt.ios.share"), icon: ShareIcon },
            { text: this.$t("PwaPrompt.ios.add"), icon: SquarePlusIcon },
          ];
    },
  },
  mounted() {
    if (this.isAndroid) {
      this.deferredPrompt = deferredOffer();
      window.addEventListener("bip-available", this.onOfferAvailable);
      window.addEventListener("appinstalled", this.closePrompt);
    }
    const notSeen = localStorage.getItem(SEEN_KEYS[this.platform]) != "seen";
    if (notSeen && this.isSupportedBrowser() && !this.isInStandaloneMode()) {
      this.show = true;
    }
  },
  beforeUnmount() {
    window.removeEventListener("bip-available", this.onOfferAvailable);
    window.removeEventListener("appinstalled", this.closePrompt);
  },
  methods: {
    closePrompt() {
      localStorage.setItem(SEEN_KEYS[this.platform], "seen");
      this.show = false;
    },
    onOfferAvailable() {
      this.deferredPrompt = deferredOffer();
    },
    // The offer can be used once: whatever the person chooses, the prompt has done its job.
    async install() {
      const offer = this.deferredPrompt;
      if (!offer) return;
      this.deferredPrompt = null;
      (window as any).__deferredBeforeInstallPrompt = null;
      try {
        await offer.prompt();
        await offer.userChoice;
      } finally {
        this.closePrompt();
      }
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

<style scoped>
/* One sheet on the raised surface, in the app column, above the page's bottom edge and its
   safe area. No scrim: installing is optional, so the wallet stays usable behind it. */
.pwa-prompt {
  background: var(--app-raised);
  border: 1px solid var(--app-border-strong);
  border-bottom: 0;
  border-radius: var(--app-radius-xl) var(--app-radius-xl) 0 0;
  bottom: 0;
  box-shadow: var(--app-shadow-md);
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  gap: 16px;
  inset-inline: 0;
  margin-inline: auto;
  max-width: var(--app-content);
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  position: fixed;
  text-align: start;
  z-index: 3000;
}
.pwa-prompt__head {
  align-items: center;
  display: flex;
  gap: 12px;
}
.pwa-prompt__icon {
  border-radius: 22%;
  flex-shrink: 0;
  height: 48px;
  width: 48px;
}
.pwa-prompt__titles {
  flex: 1;
  min-width: 0;
}
.pwa-prompt__title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
.pwa-prompt__title,
.pwa-prompt__text {
  text-wrap: pretty;
}
.pwa-prompt__text {
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 1.4;
  margin-top: 2px;
}
.pwa-prompt__close {
  align-self: flex-start;
  color: var(--app-text-muted) !important;
  flex-shrink: 0;
  /* The 44px button's glyph ink onto the sheet's 16px edge, level with the title. */
  margin-block-start: -10px;
  margin-inline-end: -12px;
}
.pwa-prompt__later {
  align-self: center;
  color: var(--app-text-muted);
  margin-top: -8px;
}
.pwa-prompt__steps {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0 16px;
}
/* The steps as one grouped list, like a settings group: a hairline between rows. */
.pwa-prompt__step {
  align-items: center;
  display: flex;
  font-size: 15px;
  gap: 12px;
  min-height: 52px;
}
.pwa-prompt__step + .pwa-prompt__step {
  border-top: 1px solid var(--app-group-edge);
}
.pwa-prompt__num {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  height: 24px;
  justify-content: center;
  width: 24px;
}
.pwa-prompt__step-text {
  flex: 1;
  min-width: 0;
}
/* Safari's and Chrome's own glyphs, as a picture of what to look for (not a control). */
.pwa-prompt__glyph {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.pwa-prompt-enter-active,
.pwa-prompt-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.pwa-prompt-enter-from,
.pwa-prompt-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
@media (prefers-reduced-motion: reduce) {
  .pwa-prompt-enter-active,
  .pwa-prompt-leave-active {
    transition: opacity 200ms ease;
  }
  .pwa-prompt-enter-from,
  .pwa-prompt-leave-to {
    transform: none;
  }
}
</style>
