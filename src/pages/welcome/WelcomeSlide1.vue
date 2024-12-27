<!-- src/components/WelcomeSlide1.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <transition appear enter-active-class="animated bounce">
        <img
          src="/clean.png"
          alt="Clean Icon"
          class="q-my-lg"
          style="width: 80px; height: 80px"
        />
      </transition>
      <h2 class="q-mt-md">Welcome to Cashu</h2>
      <div class="text-left">
        <p class="q-mt-sm">
          Cashu.me is a free and open-source Bitcoin wallet that uses ecash to
          keep your funds secure and private.
        </p>
        <q-expansion-item
          dense
          dense-toggle
          class="text-left q-mt-lg"
          label="Click to learn more"
        >
          <p class="q-mt-md">
            Cashu is a free and open-source ecash protocol for Bitcoin. You can
            learn more about it at
            <a href="https://cashu.space" target="_blank">cashu.space</a>.
          </p>
          <p class="q-mt-md">
            This wallet is not affiliated with any mint. To use this wallet, you
            need to connect to one or more Cashu mints that you trust.
          </p>
          <p class="q-mt-md">
            This wallet stores ecash that only you have access to. If you delete
            your browser data without a seed phrase backup, you will lose your
            tokens.
          </p>
          <p class="q-mt-md">
            This wallet is in beta. We hold no responsibility for people losing
            access to funds. Use at your own risk! This code is open-source and
            licensed under the MIT license.
          </p>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeSlide1",
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
p {
  font-size: large;
}
</style>
