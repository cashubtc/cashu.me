<!-- One option of a single-choice settings list: a check/empty circle on the start edge,
     label and caption, and an optional side slot. Emits select when tapped. -->
<template>
  <q-item
    clickable
    :active="selected"
    :active-class="activeClass"
    @click="$emit('select', $event)"
  >
    <q-item-section avatar :top="top">
      <q-icon
        :color="selected ? 'primary' : 'grey'"
        :name="selected ? 'check_circle' : 'radio_button_unchecked'"
      />
    </q-item-section>
    <q-item-section style="word-break: break-word">
      <slot name="label">
        <q-item-label>{{ label }}</q-item-label>
      </slot>
      <q-item-label v-if="caption" caption>{{ caption }}</q-item-label>
      <slot />
    </q-item-section>
    <q-item-section v-if="$slots.side" side>
      <slot name="side" />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsRadioRow",
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    // Aligns the indicator with the first line when the row has several lines.
    top: {
      type: Boolean,
      default: false,
    },
    activeClass: {
      type: String,
      default: "text-weight-bold",
    },
  },
  emits: ["select"],
});
</script>
