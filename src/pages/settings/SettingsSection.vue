<template>
  <div class="settings-section">
    <div v-if="title || caption" class="settings-section-header">
      <div v-if="title" class="settings-section-title">
        {{ title }}
        <slot name="badge" />
      </div>
      <AppCallout
        v-if="caption && warning"
        variant="warning"
        class="q-mt-sm"
        :text="caption"
      />
      <div v-else-if="caption" class="settings-section-caption">
        {{ caption }}
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
import AppCallout from "src/components/AppCallout.vue";

export default defineComponent({
  name: "SettingsSection",
  components: { AppCallout },
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
