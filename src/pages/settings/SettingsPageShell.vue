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

<!-- Shared styles live in src/css/settings.scss -->
