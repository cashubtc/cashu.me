<!-- A tappable settings row: label and caption, with a glyph on the end edge (a chevron by
     default; pass the side slot for an action glyph). Extra content goes in the default slot. -->
<template>
  <q-item clickable v-ripple @click="$emit('click', $event)">
    <q-item-section>
      <q-item-label :class="[labelClass, { 'text-negative': danger }]">{{
        label
      }}</q-item-label>
      <q-item-label v-if="caption" caption>{{ caption }}</q-item-label>
      <slot />
    </q-item-section>
    <q-item-section side>
      <slot name="side">
        <q-icon name="chevron_right" class="settings-menu-chevron" />
      </slot>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsActionRow",
  props: {
    label: {
      type: String,
      required: true,
    },
    /** Extra classes on the label (Backup's restore row keeps the regular weight). */
    labelClass: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    // Destructive action: the label reads in the negative colour.
    danger: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
});
</script>
