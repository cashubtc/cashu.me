<!-- A section label centred between two hairlines, in small capitals, with the section's
     one-line description under it when given (styled by the global .section-divider rules in
     app.scss). It owns its gap to the content below, so every section starts the same way. -->
<template>
  <div class="section-divider-block">
    <div v-if="label" class="section-divider">
      <div class="divider-line"></div>
      <div class="divider-text">{{ label }}</div>
      <div class="divider-line"></div>
    </div>
    <p v-if="caption" class="section-divider__caption">{{ caption }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SectionDivider",
  props: {
    /** Empty: the caption alone, where the page already titles the section. */
    label: {
      type: String,
      default: "",
    },
    /** One line under the label saying what the section does. */
    caption: {
      type: String,
      default: "",
    },
  },
});
</script>
