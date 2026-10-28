<!-- A quiet secondary action as a tonal pill (src/css/elements.scss .tonal-chip): the tint
     fill with no edge, a leading glyph and a short label, 44px tall. QR speed and size,
     "Show QR code" on a mint. Pass the glyph in the `icon` slot. -->
<template>
  <q-btn unelevated rounded no-caps class="tonal-chip">
    <span v-if="$slots.icon" class="tonal-chip__icon" aria-hidden="true"
      ><slot name="icon"
    /></span>
    <slot />
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "TonalChip" });
</script>
