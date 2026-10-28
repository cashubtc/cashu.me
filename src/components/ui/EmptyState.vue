<!-- The standard empty state (src/css/elements.scss .app-empty): an icon in a round
     slot, a title, one line of help and optional actions. Bare on the page by default. -->
<template>
  <div class="app-empty" :class="{ 'app-box': boxed }">
    <IconCircle :icon="icon" size="lg">
      <slot name="icon" />
    </IconCircle>
    <div v-if="title" class="app-empty__title">{{ title }}</div>
    <div v-if="text" class="app-empty__text">{{ text }}</div>
    <slot name="actions" />
  </div>
</template>

<script lang="ts">
import IconCircle from "src/components/ui/IconCircle.vue";
import { defineComponent, PropType, Component } from "vue";

export default defineComponent({
  name: "EmptyState",
  components: { IconCircle },
  props: {
    /** A lucide icon component, rendered at 26px. Use the icon slot for anything else. */
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    /** Adds the app-box surface around the empty state. */
    boxed: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
