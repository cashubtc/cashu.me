<!-- src/components/WelcomeSlide1.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="wallet" size="4em" color="primary" />
      <h2 class="q-mt-none">Welcome to Cashu</h2>
      <div class="text-left">
        <p class="q-mt-sm">
          Cashu is a simple and secure Bitcoin wallet that uses Ecash technology
          to keep your funds secure and private.
        </p>
        <p class="q-mt-md">
          To use this wallet, you need to connect to one or more Ecash mints.
          Only use mints that you trust.
        </p>
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
