<!-- The 44px ink icon button in headers and sheets (src/css/elements.scss .app-icon-btn):
     back, close, menu, refresh. Always labelled; `floating` pins it to the header's leading
     edge. Other q-btn props (loading, disable, v-close-popup) pass through. -->
<template>
  <q-btn
    flat
    round
    class="app-icon-btn"
    :class="{ 'floating-close-btn': floating }"
    :aria-label="label"
    v-close-popup="closePopup"
  >
    <slot>
      <component :is="icon" v-if="icon" :size="iconSize" />
    </slot>
    <q-tooltip v-if="tooltip" class="text-no-wrap">{{ label }}</q-tooltip>
    <template #loading>
      <slot name="loading"><PendingDots /></slot>
    </template>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export default defineComponent({
  name: "IconButton",
  components: { PendingDots },
  props: {
    /** The accessible name (and the tooltip, with `tooltip`). */
    label: { type: String, required: true },
    icon: { type: [Object, Function] as PropType<Component>, default: null },
    /** 24 for close and back, 20 for actions. */
    iconSize: { type: Number, default: 20 },
    floating: { type: Boolean, default: false },
    tooltip: { type: Boolean, default: false },
    /** Closes the dialog or sheet it sits in (v-close-popup on the button itself). */
    closePopup: { type: Boolean, default: false },
  },
});
</script>
