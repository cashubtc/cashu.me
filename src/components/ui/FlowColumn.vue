<!-- A flow's content column (src/css/elements.scss .flow-column): centred, full width up to
     the shared column width, with the 16px page inset. Classes and attributes land on the
     column itself, so `q-mb-sm`, `q-px-lg` or a v-if read as they would on the old inner div. -->
<template>
  <div class="flow-column">
    <div class="flow-column__inner" v-bind="$attrs"><slot /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "FlowColumn", inheritAttrs: false });
</script>
