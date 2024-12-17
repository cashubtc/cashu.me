<!-- src/components/WelcomeSlide2.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center relative-position">
      <q-icon name="install_mobile" size="4em" color="primary" />
      <h2 class="q-mt-none">Install PWA</h2>
      <div class="text-left" v-if="!isPWA()">
        <p class="q-mt-md instruction">
          For the best experience, use this wallet with your device's native web
          browser (Safari on iOS, Chrome on Android) and install it as a PWA.
        </p>
        <h6>Android (Chrome)</h6>
        <p class="sub-instruction">
          1. <q-icon name="menu" size="1.5em" class="q-pr-xs" />
          <span>Tap the menu on the top right </span><br />
          2. Press <strong>Add to Home screen</strong>
        </p>
        <h6>iOS (Safari)</h6>
        <p class="sub-instruction">
          1. <q-icon name="ios_share" size="1.2em" class="q-pr-xs" />
          <span>Tap the share button </span> <br />
          2. Press <strong>Add to Home screen</strong>
        </p>
        <p>
          Once you have installed this app on your device, close this browser
          window and use the app from your home screen.
        </p>
      </div>

      <div class="text-center" v-if="isPWA()">
        <q-icon name="check_circle" size="4em" color="positive" />
        <h2 class="q-mt-lg">Success!</h2>
        <p class="q-mt-md">
          You have installed Cashu as a PWA. Close any other open browser
          windows and use the app from your home screen.
        </p>
      </div>
    </div>
  </div>
  <iOSPWAPrompt />
  <AndroidPWAPrompt />
</template>

<script>
import iOSPWAPrompt from "components/iOSPWAPrompt.vue";
import AndroidPWAPrompt from "../../components/AndroidPWAPrompt.vue";
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
