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
        ><slot name="caption">{{ caption }}</slot></q-item-label
      >
    </q-item-section>
    <q-item-section side>
      <ArrowUpRightIcon
        v-if="external"
        :size="18"
        class="settings-menu-chevron"
      />
      <ChevronRightIcon v-else :size="18" class="settings-menu-chevron" />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import {
  ChevronRight as ChevronRightIcon,
  ArrowUpRight as ArrowUpRightIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "SettingsLinkRow",
  components: { ChevronRightIcon, ArrowUpRightIcon },
  props: {
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
