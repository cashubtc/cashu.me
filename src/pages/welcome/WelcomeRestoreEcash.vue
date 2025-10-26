<template>
  <div class="restore-ecash-slide">
    <!-- Main content area -->
    <div class="content">
      <!-- Header Icon -->
      <div class="header-icon">
        <div class="icon-circle">
          <q-icon name="restore" size="2.5em" color="white" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="title">{{ $t("WelcomeRestoreEcash.title") }}</h1>

      <!-- Description -->
      <p class="description">
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
  background: var(--q-dark);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Left-aligned */
  text-align: left;
  flex: 1;
}

.header-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start; /* Left-aligned */
  align-items: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
  line-height: 1.2;
  text-align: left;
  width: 100%;
  max-width: 500px;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: left;
  width: 100%;
  max-width: 500px;
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
    padding: 30px 15px 15px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    margin-bottom: 28px;
  }

  .restore-content {
    width: 100%;
  }
}
</style>
