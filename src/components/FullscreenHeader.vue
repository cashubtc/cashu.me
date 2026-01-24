<template>
  <q-header class="bg-dark">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="arrow_back_ios_new"
        @click="goBack"
        color="primary"
        aria-label="Back"
      />
    </q-toolbar>
  </q-header>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "FullscreenHeader",
  mixins: [windowMixin],
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.back();
    };

    return {
      goBack,
    };
  },
});
</script>
