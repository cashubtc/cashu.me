<template>
  <AppCallout variant="info" :text="text" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppCallout from "src/components/AppCallout.vue";

export default defineComponent({
  name: "ToolTipInfo",
  components: { AppCallout },
  props: {
    text: {
      type: String,
      required: true,
    },
  },
});
</script>
