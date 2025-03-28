<!-- src/components/WelcomeSlide2.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center relative-position">
      <transition v-if="isPWA()" appear enter-active-class="animated bounceIn">
        <q-icon name="check_circle" size="4em" color="positive" />
      </transition>
      <q-icon v-else name="download_for_offline" size="4em" color="primary" />
      <h2 class="q-mt-xl">Install PWA</h2>
      <div class="text-left" v-if="!isPWA()">
        <p class="q-mt-md instruction">
          {{ $t("WelcomeSlide2.instruction.intro.text") }}
        </p>
        <h6>{{ $t("WelcomeSlide2.instruction.android.title") }}</h6>
        <p class="sub-instruction">
          <i18n-t keypath="WelcomeSlide2.instruction.android.step1.item">
            <template v-slot:icon>
              <q-icon name="more_vert" size="1.5em" class="q-pr-xs" />
            </template>
            <template v-slot:text>
              <span>{{
                $t("WelcomeSlide2.instruction.android.step1.text")
              }}</span>
            </template>
          </i18n-t>
          <br />
          <i18n-t keypath="WelcomeSlide2.instruction.android.step2.item">
            <template v-slot:icon>
              <q-icon name="mobile_friendly" size="1.2em" class="q-pr-xs" />
            </template>
            <template v-slot:text>
              <i18n-t keypath="WelcomeSlide2.instruction.android.step2.text">
                <template v-slot:buttonText>
                  <strong>{{
                    $t("WelcomeSlide2.instruction.android.step2.buttonText")
                  }}</strong>
                </template>
              </i18n-t>
            </template>
          </i18n-t>
        </p>
        <h6>{{ $t("WelcomeSlide2.instruction.ios.title") }}</h6>
        <p class="sub-instruction">
          <i18n-t keypath="WelcomeSlide2.instruction.ios.step1.item">
            <template v-slot:icon>
              <q-icon name="ios_share" size="1.2em" class="q-pr-xs" />
            </template>
            <template v-slot:text>
              <span>{{ $t("WelcomeSlide2.instruction.ios.step1.text") }}</span>
            </template>
          </i18n-t>
          <br />
          <i18n-t keypath="WelcomeSlide2.instruction.ios.step2.item">
            <template v-slot:icon>
              <q-icon name="add_box_outline" size="1.2em" class="q-pr-xs" />
            </template>
            <template v-slot:text>
              <i18n-t keypath="WelcomeSlide2.instruction.ios.step2.text">
                <template v-slot:buttonText>
                  <strong>{{
                    $t("WelcomeSlide2.instruction.ios.step2.buttonText")
                  }}</strong>
                </template>
              </i18n-t>
            </template>
          </i18n-t>
        </p>
        <p>
          {{ $t("WelcomeSlide2.instruction.outro.text") }}
        </p>
      </div>

      <div class="text-center" v-if="isPWA()">
        <transition appear enter-active-class="animated tada">
          <h3 class="q-mt-lg">{{ $t("WelcomeSlide2.pwa.success.title") }}</h3>
        </transition>
        <p class="q-mt-md">
          {{ $t("WelcomeSlide2.pwa.success.text") }}
        </p>
      </div>
    </div>
  </div>
  <iOSPWAPrompt v-if="!isPWA()" />
  <AndroidPWAPrompt v-if="!isPWA()" />
</template>

<script>
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
.relative-position {
  position: relative;
}
.instruction {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.instruction span {
  margin-left: 0.5rem;
  font-size: 1rem;
}
h2 {
  font-weight: bold;
}
h6 {
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
p {
  font-size: large;
}
.sub-instruction {
  margin-left: 0.5rem;
}
</style>
