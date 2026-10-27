<template>
  <q-header class="bg-dark">
    <q-toolbar class="app-toolbar">
      <q-btn
        flat
        dense
        round
        class="app-toolbar-btn"
        @click="goBack"
        :aria-label="$t('common.back')"
      >
        <ChevronLeftIcon :size="24" />
      </q-btn>
    </q-toolbar>
  </q-header>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronLeft as ChevronLeftIcon } from "lucide-vue-next";

export default defineComponent({
  name: "FullscreenHeader",
  components: { ChevronLeftIcon },
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
