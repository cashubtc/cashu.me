<!-- src/components/WelcomeSlide2.vue -->
<template>
  <div class="pwa-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Image -->
      <div class="header-image">
        <transition
          v-if="isPWA()"
          appear
          enter-active-class="animated bounceIn"
        >
          <q-icon name="check_circle" size="3em" color="positive" />
        </transition>
        <img
          v-else
          src="/pwa-example.jpg"
          alt="PWA Installation Example"
          class="pwa-image"
        />
      </div>

      <!-- Title -->
      <h1 class="title">Install PWA</h1>

      <!-- Content based on PWA status -->
      <div v-if="!isPWA()" class="instructions">
        <p class="intro-text">
          {{ $t("WelcomeSlide2.instruction.intro.text") }}
        </p>

        <!-- Android Instructions -->
        <div class="platform-section">
          <h3 class="platform-title">
            {{ $t("WelcomeSlide2.instruction.android.title") }}
          </h3>
          <div class="instruction-steps">
            <div class="step">
              <q-icon name="more_vert" size="1.2em" class="step-icon" />
              <span>{{
                $t("WelcomeSlide2.instruction.android.step1.text")
              }}</span>
            </div>
            <div class="step">
              <q-icon name="mobile_friendly" size="1.2em" class="step-icon" />
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
        <div class="platform-section">
          <h3 class="platform-title">
            {{ $t("WelcomeSlide2.instruction.ios.title") }}
          </h3>
          <div class="instruction-steps">
            <div class="step">
              <q-icon name="ios_share" size="1.2em" class="step-icon" />
              <span>{{ $t("WelcomeSlide2.instruction.ios.step1.text") }}</span>
            </div>
            <div class="step">
              <q-icon name="add_box_outline" size="1.2em" class="step-icon" />
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

        <p class="outro-text">
          {{ $t("WelcomeSlide2.instruction.outro.text") }}
        </p>
      </div>

      <!-- Success message when PWA is installed -->
      <div v-if="isPWA()" class="success-message">
        <transition appear enter-active-class="animated tada">
          <h3 class="success-title">
            {{ $t("WelcomeSlide2.pwa.success.title") }}
          </h3>
        </transition>
        <p class="success-text">
          {{ $t("WelcomeSlide2.pwa.success.text") }}
        </p>
      </div>
    </div>

    <!-- Spacer to match step 1's controls height -->
    <div class="spacer"></div>

    <!-- PWA Prompts -->
    <iOSPWAPrompt v-if="!isPWA()" />
    <AndroidPWAPrompt v-if="!isPWA()" />
  </div>
</template>

<script lang="ts">
import iOSPWAPrompt from "components/iOSPWAPrompt.vue";
import AndroidPWAPrompt from "components/AndroidPWAPrompt.vue";

export default {
  name: "WelcomeSlide2",
  components: {
    iOSPWAPrompt,
    AndroidPWAPrompt,
  },
  setup() {
    const isPWA = () => {
      return window.matchMedia("(display-mode: standalone)").matches;
    };

    return {
      isPWA,
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
  background: var(--q-dark);
  color: white;
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

.pwa-image {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
  line-height: 1.2;
}

.instructions {
  max-width: 400px;
  width: 100%;
}

.intro-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  text-align: left;
}

.platform-section {
  margin-bottom: 16px;
  text-align: left;
}

.platform-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
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
  color: rgba(255, 255, 255, 0.9);
}

.step-icon {
  color: var(--q-primary);
  margin-top: 1px;
  flex-shrink: 0;
  font-size: 1.05em;
}

.outro-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin: 16px 0 0 0;
  text-align: left;
}

.success-message {
  max-width: 300px;
}

.success-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
}

.success-text {
  font-size: 0.95rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .pwa-slide {
    padding: 30px 15px 15px 15px;
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
