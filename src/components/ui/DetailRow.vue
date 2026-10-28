<!-- A label/value row in quote, token and mint detail views: icon and muted name on the
     start edge, value on the end edge (styled by the global .detail-* rules in app.scss). -->
<template>
  <div class="detail-item">
    <div class="detail-label">
      <component :is="icon" v-if="icon" :size="20" class="detail-icon" />
      <div class="detail-name">{{ label }}</div>
    </div>
    <component
      :is="href ? 'a' : 'div'"
      class="detail-value"
      :class="valueClass"
      :href="href || undefined"
      :target="href ? '_blank' : undefined"
      @click="$emit('value-click', $event)"
    >
      <slot>{{ value }}</slot>
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";

export default defineComponent({
  name: "DetailRow",
  props: {
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: null,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number] as PropType<string | number>,
      default: "",
    },
    valueClass: {
      type: [String, Array, Object] as PropType<
        string | string[] | Record<string, boolean>
      >,
      default: "",
    },
    // When set, the value is an external link opened in a new tab.
    href: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["value-click"],
});
</script>
