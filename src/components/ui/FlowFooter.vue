<!-- The bottom of a full-screen flow: the main action pinned under the content, inside the
     app column with the shared 16px side and 24px bottom insets (plus the safe area). The
     `above` slot holds anything that sits on top of the action, such as the amount keypad. -->
<template>
  <div class="bottom-panel">
    <slot name="above" />
    <div class="flow-footer__bar">
      <div class="flow-footer__col">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FlowFooter",
});
</script>
