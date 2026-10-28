<template>
  <!-- The thin activity track under a cycling or polled QR; the track keeps its space when idle. -->
  <div class="qr-progress">
    <q-linear-progress
      v-if="active"
      indeterminate
      rounded
      size="2px"
      color="grey-7"
      track-color="transparent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "QrProgress",
  props: {
    active: { type: Boolean, default: false },
  },
});
</script>
