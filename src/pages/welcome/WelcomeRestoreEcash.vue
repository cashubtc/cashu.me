<template>
  <div class="restore-ecash-slide">
    <!-- Main content area -->
    <div class="welcome-slide__content">
      <!-- Header Icon -->
      <div class="welcome-slide__icon">
        <div class="app-icon-circle app-icon-circle--xl">
          <q-icon name="restore" size="2.5em" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="welcome-slide__title">
        {{ $t("WelcomeRestoreEcash.title") }}
      </h1>

      <!-- Description -->
      <p class="welcome-slide__description">
        {{ $t("WelcomeRestoreEcash.text") }}
      </p>

      <!-- Restore View Component -->
      <div class="restore-content">
        <RestoreView :onboarding="true" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import RestoreView from "src/components/RestoreView.vue";
import { useWelcomeStore } from "src/stores/welcome";

export default {
  name: "WelcomeRestoreEcash",
  components: { RestoreView },
  setup() {
    const welcome = useWelcomeStore();
    return { welcome };
  },
};
</script>

<style scoped>
.restore-ecash-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--app-welcome-bg);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.restore-content {
  width: 100%;
  max-width: 500px;
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

/* Mobile adjustments */
@media (max-width: 600px) {
  .restore-ecash-slide {
    padding: 24px 16px 16px 16px;
  }

  .restore-content {
    width: 100%;
  }
}
</style>
