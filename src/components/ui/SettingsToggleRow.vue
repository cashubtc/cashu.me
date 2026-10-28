<!-- A settings row whose whole label toggles a switch on the end edge (q-item tag="label"),
     with an optional caption and an optional .app-badge after the title. -->
<template>
  <q-item tag="label" :disable="disable">
    <q-item-section>
      <q-item-label v-if="badge" class="label-with-badge">
        {{ label }}
        <span class="app-badge">{{ badge }}</span>
      </q-item-label>
      <q-item-label v-else>{{ label }}</q-item-label>
      <q-item-label v-if="caption" caption>{{ caption }}</q-item-label>
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
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "SettingsToggleRow",
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
