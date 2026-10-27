<template>
  <!-- The standard loading row: an avatar placeholder beside lines of text placeholders.
       Pass line widths, or put custom placeholders in the default slot to match a layout. -->
  <div class="app-skeleton-row" aria-hidden="true">
    <q-skeleton type="QAvatar" :size="avatar" />
    <div class="app-skeleton-row__lines">
      <slot>
        <q-skeleton
          v-for="(width, i) in lines"
          :key="i"
          type="rect"
          :width="width"
          height="12px"
        />
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "SkeletonRow",
  props: {
    avatar: { type: String, default: "36px" },
    lines: {
      type: Array as PropType<string[]>,
      default: () => ["60%", "40%"],
    },
  },
});
</script>
