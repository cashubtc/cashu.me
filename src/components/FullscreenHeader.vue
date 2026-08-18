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
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "FullscreenHeader",
  mixins: [windowMixin],
  setup() {
    const router = useRouter();
    const route = useRoute();

    const goBack = () => {
      // Prefer history back when there is a previous in-app entry,
      // otherwise fall back to the hierarchical parent route.
      if (window.history.state && window.history.state.back) {
        router.back();
        return;
      }
      const parentPath = route.path.replace(/\/[^/]+\/?$/, "");
      router.push(parentPath.length > 0 ? parentPath : "/");
    };

    return {
      goBack,
    };
  },
});
</script>
