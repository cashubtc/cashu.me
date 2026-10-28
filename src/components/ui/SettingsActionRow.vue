<!-- A tappable settings row: an optional leading icon, label and caption, and a glyph on the
     end edge (a chevron by default, a trash icon for danger rows; the side slot overrides it). -->
<template>
  <q-item clickable v-ripple @click="$emit('click', $event)">
    <q-item-section v-if="icon" avatar>
      <div class="settings-menu-icon">
        <component :is="icon" :size="20" />
      </div>
    </q-item-section>
    <q-item-section>
      <q-item-label :class="[labelClass, { 'text-negative': danger }]">{{
        label
      }}</q-item-label>
      <q-item-label v-if="caption" caption>{{ caption }}</q-item-label>
      <slot />
    </q-item-section>
    <q-item-section side>
      <slot name="side">
        <Trash2Icon
          v-if="danger"
          :size="18"
          class="text-negative"
          aria-hidden="true"
        />
        <q-icon v-else name="chevron_right" class="settings-menu-chevron" />
      </slot>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import { Trash2 as Trash2Icon } from "lucide-vue-next";

export default defineComponent({
  name: "SettingsActionRow",
  components: { Trash2Icon },
  props: {
    /** Optional leading icon (lucide component), the same slot as SettingsLinkRow. */
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: null,
    },
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
    // Destructive action: the label reads in the negative colour and ends with a trash icon,
    // so the danger is not shown by colour alone.
    danger: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
});
</script>
