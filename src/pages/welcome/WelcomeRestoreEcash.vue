<template>
  <WelcomeSlideScaffold
    class="restore-ecash-slide"
    :icon="ArchiveRestoreIcon"
    :title="$t('WelcomeRestoreEcash.title')"
    :text="$t('WelcomeRestoreEcash.text')"
  >
    <!-- Restore View Component -->
    <div class="restore-content">
      <RestoreView :onboarding="true" />
    </div>
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import { ArchiveRestore as ArchiveRestoreIcon } from "lucide-vue-next";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import RestoreView from "src/components/RestoreView.vue";
import { useWelcomeStore } from "src/stores/welcome";

export default {
  name: "WelcomeRestoreEcash",
  components: { WelcomeSlideScaffold, RestoreView },
  setup() {
    const welcome = useWelcomeStore();
    return { ArchiveRestoreIcon, welcome };
  },
};
</script>

<style scoped>
.restore-content {
  width: 100%;
}

/* Override RestoreView component padding to align with title */
.restore-content :deep(.q-px-xs) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.restore-content :deep(.q-list) {
  padding: 0 !important;
}

.restore-content :deep(.q-item) {
  padding: 0 !important;
}

.restore-content :deep(.q-item__section) {
  padding: 0 !important;
}
</style>
