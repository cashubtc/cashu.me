<!-- A section label centred between two hairlines, in small capitals (styled by the global
     .section-divider rules in app.scss). -->
<template>
  <div class="section-divider">
    <div class="divider-line"></div>
    <div class="divider-text">{{ label }}</div>
    <div class="divider-line"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SectionDivider",
  props: {
    label: {
      type: String,
      required: true,
    },
  },
});
</script>
