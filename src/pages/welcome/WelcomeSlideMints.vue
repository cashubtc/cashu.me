<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="factory" size="4em" color="primary" />
      <h2 class="q-mt-md">{{ $t("WelcomeSlideMints.title") }}</h2>
      <p class="q-mt-sm">{{ $t("WelcomeSlideMints.text") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeSlideMints",
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
</style>
