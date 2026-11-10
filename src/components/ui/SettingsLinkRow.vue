<!-- A settings menu entry: tinted icon tile, title and caption, and a chevron (or an
     external-link glyph). Pass `to`, or `tag="a"` with `href`, through to the q-item. -->
<template>
  <q-item clickable v-ripple class="settings-menu-item">
    <q-item-section avatar>
      <div class="settings-menu-icon">
        <component :is="icon" :size="20" />
      </div>
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-medium">{{ label }}</q-item-label>
      <q-item-label caption
        ><slot name="caption"><CjkText :text="caption" /></slot
      ></q-item-label>
    </q-item-section>
    <RowValue :value="value" :external="external" />
  </q-item>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import { defineComponent, type Component, type PropType } from "vue";
import RowValue from "src/components/ui/RowValue.vue";

export default defineComponent({
  name: "SettingsLinkRow",
  components: { CjkText, RowValue },
  props: {
    /** The setting's current value, shown muted before the chevron. */
    value: { type: String, default: "" },
    icon: {
      type: [Object, Function] as PropType<Component>,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    // Opens outside the app: an external-link glyph instead of the chevron.
    external: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
