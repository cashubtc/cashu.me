<template>
  <q-header class="bg-marginal-bg">
    <q-toolbar>
      <q-btn
        flat
        dense
        rounded
        icon="arrow_back_ios_new"
        to="/"
        color="primary"
        aria-label="Menu"
        no-caps
        ><span class="q-mx-md text-weight-bold">Wallet</span>
      </q-btn>
      <!-- <q-toolbar-title> </q-toolbar-title> -->
    </q-toolbar>
  </q-header>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FullscreenHeader",
  setup() {
    return {};
  },
});
</script>
