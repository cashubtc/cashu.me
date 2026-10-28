<!-- The one "working on it" mark: three dots, for anything pending or busy (a button that is
     sending, a payment waiting to settle, a row that is checking). Never a ring or a pulse. -->
<template>
  <q-spinner-dots
    class="pending-dots"
    :size="size"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label || undefined"
    :role="label ? 'status' : undefined"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PendingDots",
  props: {
    size: { type: String, default: "20px" },
    /** Announced to screen readers when the dots are the only sign of progress. */
    label: { type: String, default: "" },
  },
});
</script>
