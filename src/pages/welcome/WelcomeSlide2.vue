<!-- src/components/WelcomeSlide2.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center relative-position">
      <q-icon name="install_mobile" size="4em" color="primary" />
      <h2 class="q-mt-md">Install PWA</h2>
      <div class="text-left">
        <p class="q-mt-md">
          This wallet does not have a server backend but runs on your device.
          For the best experience, use this wallet with your device's native web
          browser (Safari on iOS, Chrome on Android).
        </p>
        <p>
          <strong>Android:</strong> In Chrome click the hamburger menu at the
          top right.
        </p>
        <p>
          <strong>iOS:</strong> In Safari click the share button and press the
          Add to Home screen button.
        </p>
        <p>
          Once you have installed this app on your device, close this browser
          window and use the app from your home screen.
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
p {
  font-size: large;
}
</style>
