<!-- src/components/WelcomeSlide2.vue -->
<template>
  <div class="pwa-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Image -->
      <div
        class="header-image"
        :class="{ centered: isInstalling || wasInstalled }"
      >
        <transition v-if="isPWA()" appear enter-active-class="animated fadeIn">
          <CircleCheckIcon :size="48" class="text-positive" />
        </transition>
        <div v-else class="pwa-image-wrapper">
          <img
            src="/pwa-example.jpg"
            :alt="$t('WelcomeSlide2.alt.pwa_example')"
            class="pwa-image"
          />
          <div v-if="isInstalling" class="installing-overlay">
            <PendingDots size="48px" />
            <div class="installing-text">
              {{ $t("WelcomeSlide2.installing") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <h1 class="title">{{ $t("WelcomeSlide2.title") }}</h1>

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
        <p v-if="!wasInstalled" class="intro-text">
          {{ $t("WelcomeSlide2.instruction.intro.text") }}
        </p>

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
              <i18n-t keypath="WelcomeSlide2.instruction.android.step2.text">
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
              <i18n-t keypath="WelcomeSlide2.instruction.ios.step2.text">
                <template v-slot:buttonText>
                  <strong>{{
                    $t("WelcomeSlide2.instruction.ios.step2.buttonText")
                  }}</strong>
                </template>
              </i18n-t>
            </div>
          </div>
        </div>

        <p v-if="!wasInstalled" class="outro-text">
          {{ $t("WelcomeSlide2.instruction.outro.text") }}
        </p>
      </div>

      <!-- Success message when PWA is installed or installation confirmed -->
      <div v-if="isPWA() || wasInstalled" class="success-message">
        <transition appear enter-active-class="animated fadeIn">
          <h3 class="success-title">
            {{ $t("WelcomeSlide2.pwa.success.title") }}
          </h3>
        </transition>
        <p v-if="isPWA()" class="success-text">
          {{ $t("WelcomeSlide2.pwa.success.text") }}
        </p>
        <p v-else class="success-text">
          {{ $t("WelcomeSlide2.pwa.success.nextSteps") }}
        </p>
      </div>
    </div>

    <!-- Spacer to match step 1's controls height -->
    <div class="spacer"></div>

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
  </div>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import {
  CircleCheck as CircleCheckIcon,
  EllipsisVertical as EllipsisVerticalIcon,
  Share as ShareIcon,
  SquarePlus as SquarePlusIcon,
} from "lucide-vue-next";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import PwaPrompt from "src/components/PwaPrompt.vue";

export default {
  name: "WelcomeSlide2",
  components: {
    PendingDots,
    CircleCheckIcon,
    SquarePlusIcon,
    EllipsisVerticalIcon,
    ShareIcon,
    PwaPrompt,
  },
  setup() {
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
.pwa-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--app-welcome-bg);
  color: var(--app-text);
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.spacer {
  height: 76px; /* Height of controls (36px) + padding (20px) + gap (20px) */
  flex-shrink: 0;
}

.header-image {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-image {
  transition: margin-top 0.45s ease-in-out;
}

.header-image.centered {
  margin-top: 15vh;
}

.pwa-image {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.pwa-image-wrapper {
  position: relative;
}

.installing-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -65%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.installing-text {
  font-size: 0.9rem;
  color: var(--app-text-muted);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--app-text);
  line-height: 1.2;
}

.instructions {
  max-width: 500px;
  width: 100%;
}

.instructions.fade-out {
  opacity: 0;
  height: 0;
  margin: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease, margin 0.3s ease;
}

.intro-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--app-text-muted);
  margin: 0 0 20px 0;
  text-align: start;
}

.platform-section {
  margin-bottom: 16px;
  text-align: start;
}

.platform-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 8px 0;
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--app-text-muted);
}

.step-icon {
  color: var(--q-primary);
  margin-top: 1px;
  flex-shrink: 0;
}

.outro-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--app-text-muted);
  margin: 16px 0 0 0;
  text-align: start;
}

.success-message {
  max-width: 500px;
}

/* Unified content width */
.title,
.instructions,
.success-message {
  width: 100%;
  max-width: 500px;
}

.success-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 15px 0;
}

.success-text {
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--app-text-muted);
  margin: 0;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  /* The carousel slide already insets 16px: the text sits on the shared 16px gutter with
     the footer CTA (32px read as a different page). */
  .pwa-slide {
    padding: 24px 0 16px;
  }

  .title {
    font-size: 1.6rem;
  }

  .instructions {
    max-width: 100%;
  }

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

/* Animations */
.animated.bounceIn {
  animation-duration: 0.8s;
}

.animated.tada {
  animation-duration: 1s;
}
</style>
