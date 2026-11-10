<template>
  <BlockingState
    class="fullscreen"
    :icon="AppWindowIcon"
    :title="$t('AlreadyRunning.title')"
    :text="$t('AlreadyRunning.text')"
    :action="$t('AlreadyRunning.actions.retry.label')"
    to="/"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppWindow as AppWindowIcon } from "lucide-vue-next";
import BlockingState from "src/components/ui/BlockingState.vue";

export default defineComponent({
  name: "AlreadyRunning",
  components: { BlockingState },
  setup() {
    return { AppWindowIcon };
  },
});
</script>
