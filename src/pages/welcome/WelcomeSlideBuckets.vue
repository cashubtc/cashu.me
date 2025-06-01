<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="inventory" size="4em" color="primary" />
      <h2 class="q-mt-md">{{ $t("WelcomeSlideBuckets.title") }}</h2>
      <p class="q-mt-sm">{{ $t("WelcomeSlideBuckets.text") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeSlideBuckets",
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
</style>
