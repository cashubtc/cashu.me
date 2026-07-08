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
</style>
