<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="confirmation_number" size="4em" color="primary" />
      <h2 class="q-mt-md">{{ $t("WelcomeSlideProofs.title") }}</h2>
      <p class="q-mt-sm">{{ $t("WelcomeSlideProofs.text") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeSlideProofs",
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
</style>
