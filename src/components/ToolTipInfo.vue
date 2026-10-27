<template>
  <!-- The standard info callout (src/css/elements.scss). -->
  <div class="app-callout app-callout--info">
    <q-icon name="info" size="18px" class="app-callout__icon" />
    <div class="app-callout__body app-callout__text">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ToolTipInfo",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
});
</script>
