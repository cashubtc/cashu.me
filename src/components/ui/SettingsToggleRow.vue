<!-- A settings row whose whole label toggles a switch on the end edge (q-item tag="label"),
     with an optional caption and an optional .app-badge after the title. -->
<template>
  <q-item tag="label" :class="{ 'settings-toggle-row--disabled': disable }">
    <q-item-section>
      <q-item-label v-if="badge" class="label-with-badge">
        {{ label }}
        <AppBadge>{{ badge }}</AppBadge>
      </q-item-label>
      <q-item-label v-else>{{ label }}</q-item-label>
      <q-item-label v-if="caption" caption
        ><CjkText :text="caption"
      /></q-item-label>
      <slot />
    </q-item-section>
    <q-item-section side>
      <q-toggle
        :model-value="modelValue"
        color="primary"
        :disable="disable"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "SettingsToggleRow",
  components: { CjkText, AppBadge },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    // Short tag shown after the title, e.g. "Beta".
    badge: {
      type: String,
      default: "",
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
});
</script>

<style scoped>
/* Disabled: the title fades with its switch, so the row reads as unavailable; the caption
   keeps caption contrast because it explains why. */
.settings-toggle-row--disabled {
  cursor: default;
  pointer-events: none;
}
.settings-toggle-row--disabled .q-item__label:not(.q-item__label--caption) {
  opacity: 0.5;
}
</style>
