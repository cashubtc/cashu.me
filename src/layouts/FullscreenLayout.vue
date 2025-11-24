<template>
  <q-layout view="lHh Lpr lFf">
    <FullscreenHeader />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import FullscreenHeader from "components/FullscreenHeader.vue";

export default defineComponent({
  name: "FullscreenLayout",
  mixins: [windowMixin],
  components: {
    FullscreenHeader,
  },
});
</script>
