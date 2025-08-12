<template>
  <q-btn
    flat
    dense
    round
    size="0.8em"
    :icon="$q.dark.isActive ? 'brightness_3' : 'wb_sunny'"
    color="primary"
    aria-label="Toggle Dark Mode"
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";

const $q = useQuasar();

function toggle() {
  $q.dark.toggle();
  $q.localStorage.set("cashu.darkMode", $q.dark.isActive);
}
</script>
