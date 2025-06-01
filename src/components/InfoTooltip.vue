<template>
  <q-icon name="info_outline" color="grey">
    <q-tooltip>
      <slot>{{ text }}</slot>
    </q-tooltip>
  </q-icon>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "InfoTooltip",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
});
</script>
