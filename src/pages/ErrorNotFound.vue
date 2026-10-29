<template>
  <q-page class="column">
    <!-- Under the full-screen layout, so the back button sits in the shared header inside the
         page column; the body is the shared blocking state (AlreadyRunning uses it too). -->
    <BlockingState
      class="col"
      :icon="SearchXIcon"
      :title="$t('ErrorNotFound.text')"
      :text="$t('ErrorNotFound.title')"
      :action="$t('ErrorNotFound.actions.home.label')"
      to="/"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SearchX as SearchXIcon } from "lucide-vue-next";
import BlockingState from "src/components/ui/BlockingState.vue";

export default defineComponent({
  name: "ErrorNotFound",
  components: { BlockingState },
  setup() {
    return { SearchXIcon };
  },
});
</script>
