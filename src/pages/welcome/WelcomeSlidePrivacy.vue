<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="visibility_off" size="4em" color="primary" />
      <h2 class="q-mt-md">{{ $t("WelcomeSlidePrivacy.title") }}</h2>
      <p class="q-mt-sm">{{ $t("WelcomeSlidePrivacy.text") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeSlidePrivacy",
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
</style>
