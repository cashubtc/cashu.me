<template>
  <q-header class="bg-dark">
    <q-toolbar class="app-toolbar">
      <IconButton
        data-testid="fullscreen-back"
        :label="$t('common.back')"
        @click="goBack"
      >
        <ChevronLeftIcon :size="24" />
      </IconButton>
    </q-toolbar>
  </q-header>
</template>
<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronLeft as ChevronLeftIcon } from "lucide-vue-next";

export default defineComponent({
  name: "FullscreenHeader",
  components: { IconButton, ChevronLeftIcon },
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
