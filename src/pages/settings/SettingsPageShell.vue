<template>
  <div class="settings-sub-page bg-dark text-white q-pa-md">
    <div class="settings-view text-left">
      <div v-if="title" class="settings-page-header q-px-xs q-pt-sm q-pb-md">
        <div class="text-h5 text-weight-bold">{{ title }}</div>
        <div v-if="caption" class="text-caption text-grey-6 q-mt-xs">
          {{ caption }}
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsPageShell",
  props: {
    title: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
  },
});
</script>

<style>
.settings-sub-page {
  width: 100%;
}

.settings-view {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  overflow-x: hidden;
}

.settings-view,
.settings-view * {
  box-sizing: border-box;
  min-width: 0;
}

.settings-view .q-item,
.settings-view .q-item__section,
.settings-view .q-field,
.settings-view .q-btn,
.settings-view .q-btn__content {
  max-width: 100%;
}

.settings-view .q-item__label,
.settings-view .q-field__native,
.settings-view .q-field__input,
.settings-view .q-btn__content {
  overflow-wrap: anywhere;
}

.settings-view .q-btn__content {
  white-space: normal;
}

/* --- Shared settings design system --- */

/* A logical section: header + card */
.settings-section {
  margin-bottom: 24px;
}

.settings-section-header {
  padding: 0 6px;
  margin-bottom: 10px;
}

.settings-section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.settings-section-caption {
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
}

/* Card-style groups (settings menu, about page, section content) */
.settings-card,
.settings-menu-group {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 4px 0;
  overflow: hidden;
}

.settings-card .q-item {
  min-height: 56px;
  padding: 12px 16px;
}

.settings-card .q-item__label + .q-item__label {
  margin-top: 4px;
}

/* Rows that only hold a form control (input, select, picker) */
.settings-card .settings-control-item {
  padding-top: 8px;
  padding-bottom: 16px;
}

.settings-menu-item {
  min-height: 60px;
  padding: 10px 16px;
}

.settings-menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--q-primary);
}

.settings-menu-chevron {
  color: rgba(255, 255, 255, 0.35);
}
</style>
