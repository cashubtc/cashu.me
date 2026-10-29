<!-- The label above a field or control (Rating, Review, Seed phrase): 15px semibold ink,
     8px above what it names. Pass `for` when it names a native input.
     Styles: src/css/elements.scss .field-label. -->
<template>
  <component
    :is="forId ? 'label' : 'div'"
    class="field-label"
    :for="forId || undefined"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FieldLabel",
  props: {
    /** The id of the input it labels; renders a <label for>. */
    forId: { type: String, default: "" },
  },
});
</script>
