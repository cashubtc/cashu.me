<template>
  <div class="settings-section">
    <div v-if="title || caption" class="settings-section-header">
      <div v-if="title" class="settings-section-title">
        {{ title }}
        <slot name="badge" />
      </div>
      <div v-if="caption" class="settings-section-caption">
        {{ caption }}
      </div>
    </div>
    <q-list class="settings-card">
      <slot />
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsSection",
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
