<!-- What a busy button shows (its #loading slot): the pending dots before the label, so a
     busy action keeps saying what it is doing instead of turning into a bare spinner. -->
<template>
  <span class="busy-label">
    <PendingDots class="on-left" />
    <slot />
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export default defineComponent({
  name: "BusyLabel",
  components: { PendingDots },
});
</script>

<style scoped>
.busy-label {
  align-items: center;
  display: inline-flex;
}
</style>
