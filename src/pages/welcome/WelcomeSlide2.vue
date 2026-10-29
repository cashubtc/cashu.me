<!-- src/components/WelcomeSlide2.vue -->
<template>
  <WelcomeSlideScaffold class="pwa-slide" :title="$t('WelcomeSlide2.title')">
    <!-- The hero: the installed check, or the photograph in a full-column frame 200px tall
         (the whole 3:2 picture contained, never cropped), in the app's mode. -->
    <template #hero>
      <div
        class="header-image"
        :class="{ centered: isInstalling || wasInstalled }"
      >
        <transition v-if="isPWA()" appear enter-active-class="animated fadeIn">
          <CircleCheckIcon :size="48" class="text-positive" />
        </transition>
        <div v-else class="pwa-image-frame">
          <img
            :src="installImage"
            :alt="$t('WelcomeSlide2.alt.pwa_example')"
            class="pwa-image"
            width="1200"
            height="800"
          />
          <div v-if="isInstalling" class="installing-overlay">
            <PendingDots size="48px" />
            <div class="installing-text">
              {{ $t("WelcomeSlide2.installing") }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Content based on PWA status -->
    <div
      v-if="!isPWA()"
      class="instructions"
      :class="{ 'fade-out': isInstalling }"
    >
      <div class="q-mb-md" v-if="canPromptInstall">
        <q-btn color="primary" rounded @click="promptInstall">
          <SquarePlusIcon :size="20" class="q-mr-sm" />
          {{ $t("WalletPage.install.text") }}
        </q-btn>
      </div>
      <CjkText
        v-if="!wasInstalled"
        tag="p"
        class="intro-text"
        :text="$t('WelcomeSlide2.instruction.intro.text')"
      />

      <!-- Android Instructions -->
      <div v-if="!wasInstalled && !isIos" class="platform-section">
        <h3 class="platform-title">
          {{ $t("WelcomeSlide2.instruction.android.title") }}
        </h3>
        <div class="instruction-steps">
          <div class="step">
            <EllipsisVerticalIcon :size="18" class="step-icon" />
            <span>{{
              $t("WelcomeSlide2.instruction.android.step1.text")
            }}</span>
          </div>
          <div class="step">
            <SquarePlusIcon :size="18" class="step-icon" />
            <i18n-t
              keypath="WelcomeSlide2.instruction.android.step2.text"
              tag="span"
            >
              <template v-slot:buttonText>
                <strong>{{
                  $t("WelcomeSlide2.instruction.android.step2.buttonText")
                }}</strong>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>

      <!-- iOS Instructions -->
      <div v-if="!wasInstalled && !isAndroid" class="platform-section">
        <h3 class="platform-title">
          {{ $t("WelcomeSlide2.instruction.ios.title") }}
        </h3>
        <div class="instruction-steps">
          <div class="step">
            <ShareIcon :size="18" class="step-icon" />
            <span>{{ $t("WelcomeSlide2.instruction.ios.step1.text") }}</span>
          </div>
          <div class="step">
            <SquarePlusIcon :size="18" class="step-icon" />
            <i18n-t
              keypath="WelcomeSlide2.instruction.ios.step2.text"
              tag="span"
            >
              <template v-slot:buttonText>
                <strong>{{
                  $t("WelcomeSlide2.instruction.ios.step2.buttonText")
                }}</strong>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>

      <CjkText
        v-if="!wasInstalled"
        tag="p"
        class="outro-text"
        :text="$t('WelcomeSlide2.instruction.outro.text')"
      />
    </div>

    <!-- Success message when PWA is installed or installation confirmed -->
    <div v-if="isPWA() || wasInstalled" class="success-message">
      <transition appear enter-active-class="animated fadeIn">
        <h3 class="success-title">
          {{ $t("WelcomeSlide2.pwa.success.title") }}
        </h3>
      </transition>
      <CjkText
        tag="p"
        v-if="isPWA()"
        class="success-text"
        :text="$t('WelcomeSlide2.pwa.success.text')"
      />
      <CjkText
        tag="p"
        v-else
        class="success-text"
        :text="$t('WelcomeSlide2.pwa.success.nextSteps')"
      />
    </div>

    <!-- PWA Prompts -->
    <PwaPrompt
      platform="ios"
      v-if="!isPWA() && !wasInstalled && !isInstalling && isIos"
    />
    <PwaPrompt
      platform="android"
      v-if="
        !isPWA() &&
        !wasInstalled &&
        !isInstalling &&
        !canPromptInstall &&
        !isIos
      "
    />
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import {
  CircleCheck as CircleCheckIcon,
  EllipsisVertical as EllipsisVerticalIcon,
  Share as ShareIcon,
  SquarePlus as SquarePlusIcon,
} from "lucide-vue-next";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useQuasar } from "quasar";
import PwaPrompt from "src/components/PwaPrompt.vue";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";

export default {
  name: "WelcomeSlide2",
  components: {
    CjkText,
    PendingDots,
    CircleCheckIcon,
    SquarePlusIcon,
    EllipsisVerticalIcon,
    ShareIcon,
    PwaPrompt,
    WelcomeSlideScaffold,
  },
  setup() {
    const $q = useQuasar();
    // The app's mode, not the OS's: the two can differ.
    // The dark and light photographs are not in public/ yet; both modes show the one we have.
    const installImage = computed(() =>
      $q.dark.isActive ? "/pwa-example.jpg" : "/pwa-example.jpg"
    );

    const isPWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true
      );
    };

    const deferredPrompt = ref<any | null>(null);
    const canPromptInstall = ref(false);
    const isInstalling = ref(false);
    const wasInstalled = ref(false);
    const installStartTs = ref<number | null>(null);
    const minInstallDurationMs = 4000;
    const isIos = computed(() => {
      const ua = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(ua);
    });
    const isAndroid = computed(() => {
      const ua = window.navigator.userAgent.toLowerCase();
      return /android/.test(ua);
    });

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar on mobile
      e.preventDefault();
      deferredPrompt.value = e;
      canPromptInstall.value = true;
    };

    const handleAppInstalled = () => {
      deferredPrompt.value = null;
      canPromptInstall.value = false;
      const now = Date.now();
      const elapsed = installStartTs.value ? now - installStartTs.value : 0;
      const remaining = Math.max(0, minInstallDurationMs - elapsed);
      window.setTimeout(() => {
        wasInstalled.value = true;
        isInstalling.value = false;
        installStartTs.value = null;
      }, remaining);
    };

    const promptInstall = async () => {
      if (!deferredPrompt.value) return;
      deferredPrompt.value.prompt();
      try {
        const { outcome } = await deferredPrompt.value.userChoice;
        if (outcome === "accepted") {
          // user accepted: show installing state until appinstalled or timeout
          isInstalling.value = true;
          installStartTs.value = Date.now();
          // Fallback timeout to clear installing state if appinstalled doesn't fire
          window.setTimeout(() => {
            if (!isPWA()) {
              isInstalling.value = false;
              installStartTs.value = null;
            }
          }, 15000);
        }
      } finally {
        // Chrome requires nulling after one use
        deferredPrompt.value = null;
        canPromptInstall.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
      // Use globally captured event if it fired before this component mounted
      const anyWindow = window as any;
      if (anyWindow.__deferredBeforeInstallPrompt) {
        deferredPrompt.value = anyWindow.__deferredBeforeInstallPrompt;
        canPromptInstall.value = true;
      }
      const onBipAvailable = () => {
        const w: any = window;
        if (w.__deferredBeforeInstallPrompt) {
          deferredPrompt.value = w.__deferredBeforeInstallPrompt;
          canPromptInstall.value = true;
        }
      };
      window.addEventListener("bip-available", onBipAvailable);
      // Keep a reference for cleanup
      (onMounted as any)._onBipAvailable = onBipAvailable;
    });

    onBeforeUnmount(() => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      const refHandler = (onMounted as any)._onBipAvailable;
      if (refHandler) {
        window.removeEventListener("bip-available", refHandler);
      }
    });

    return {
      installImage,
      isPWA,
      canPromptInstall,
      promptInstall,
      isIos,
      isAndroid,
      isInstalling,
      wasInstalled,
    };
  },
};
</script>

<style scoped>
.header-image {
  display: flex;
  justify-content: center;
  transition: margin-top 0.45s ease-in-out;
  width: 100%;
}

.header-image.centered {
  margin-top: 15vh;
}

/* The photograph's frame: the full column, 200px tall, reserved before the image decodes. */
.pwa-image-frame {
  display: flex;
  height: 200px;
  justify-content: center;
  position: relative;
  width: 100%;
}

.pwa-image {
  height: 100%;
  object-fit: contain;
  width: 100%;
}

/* "Installing" over the photograph: on its own opaque page-coloured backing, never on bare
   photo pixels. */
.installing-overlay {
  align-items: center;
  background: var(--app-welcome-bg);
  border-radius: var(--app-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 8px;
  left: 50%;
  padding: 16px 24px;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.installing-text {
  color: var(--app-text);
  font-size: 0.9rem;
}

/* Instructions and the success message sit on the column's start edge. */
.instructions,
.success-message {
  text-align: start;
  width: 100%;
}

.instructions.fade-out {
  height: 0;
  margin: 0;
  opacity: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease, margin 0.3s ease;
}

.intro-text {
  color: var(--app-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 20px;
}

.platform-section {
  margin-bottom: 16px;
}

.platform-title {
  color: var(--app-text);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 8px;
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step {
  align-items: flex-start;
  color: var(--app-text-muted);
  display: flex;
  font-size: 0.9rem;
  gap: 10px;
  line-height: 1.4;
}

.step-icon {
  color: var(--app-accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.outro-text {
  color: var(--app-text-muted);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 16px 0 0;
}

.success-title {
  color: var(--app-text);
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 15px;
}

.success-text {
  color: var(--app-text-muted);
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 600px) {
  .intro-text,
  .outro-text {
    font-size: 0.9rem;
  }

  .step {
    font-size: 0.85rem;
  }

  .platform-title {
    font-size: 0.95rem;
  }
}

.animated.bounceIn {
  animation-duration: 0.8s;
}

.animated.tada {
  animation-duration: 1s;
}
</style>
