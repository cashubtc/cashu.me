<!-- One option of a single-choice settings list: a radio dot on the start edge (the theme
     colour when selected), label and caption in ink at their normal weight, and an optional
     side slot. Selection is the dot alone, the same in every list. Emits select when tapped. -->
<template>
  <q-item
    clickable
    class="settings-radio-row"
    :active="selected"
    :aria-checked="selected"
    role="radio"
    @click="$emit('select', $event)"
  >
    <q-item-section avatar :top="top || !!caption">
      <q-icon
        :color="selected ? 'primary' : 'grey'"
        :name="selected ? 'radio_button_checked' : 'radio_button_unchecked'"
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
  },
  emits: ["select"],
});
</script>

<style scoped>
/* The selected row keeps ink text; the dot carries the selection. */
.settings-radio-row {
  min-height: 48px;
  padding-block: 10px;
}
.settings-radio-row.q-item--active {
  color: inherit;
}
</style>
