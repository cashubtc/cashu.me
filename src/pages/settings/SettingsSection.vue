<template>
  <div class="settings-section">
    <div v-if="title || caption" class="settings-section-header">
      <div v-if="title" class="settings-section-title">
        {{ title }}
        <slot name="badge" />
      </div>
      <div
        v-if="caption"
        class="settings-section-caption"
        :class="{ 'settings-section-caption--warning': warning }"
      >
        <q-icon
          v-if="warning"
          name="warning_amber"
          size="18px"
          class="q-mr-sm"
        />
        <span>{{ caption }}</span>
      </div>
    </div>
    <!-- flat: a lone field sits on the page under its header, without a card around it. -->
    <div v-if="flat" class="settings-section-flat">
      <slot />
    </div>
    <q-list v-else class="settings-card">
      <slot />
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsSection",
  props: {
    flat: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    warning: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
