<!-- The tap-to-copy line under a QR code (on-chain address, Lightning address, payment
     request): the machine text, muted and centred, after a copy glyph that turns into a
     check once copied. The owner copies and sets `copied`; this only draws and reports taps. -->
<template>
  <button
    type="button"
    class="qr-copy-line app-mono app-mono--wrap"
    :aria-label="label || undefined"
    @click="$emit('copy')"
  >
    <CheckIcon v-if="copied" :size="16" class="qr-copy-line__icon" />
    <CopyIcon v-else :size="16" class="qr-copy-line__icon" />
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Check as CheckIcon, Copy as CopyIcon } from "lucide-vue-next";

export default defineComponent({
  name: "QrCopyLine",
  components: { CheckIcon, CopyIcon },
  props: {
    /** What is shown (may be shortened); the owner copies the full value. */
    text: { type: String, required: true },
    copied: { type: Boolean, default: false },
    /** Accessible name, e.g. "Copy request"; the text is read otherwise. */
    label: { type: String, default: "" },
  },
  emits: ["copy"],
});
</script>

<style scoped>
.qr-copy-line {
  background: none;
  border: 0;
  border-radius: var(--app-radius-sm);
  color: var(--app-text-muted);
  cursor: pointer;
  display: block;
  font-size: 13px;
  margin: 8px auto 0;
  max-width: 100%;
  padding: 4px 8px;
  text-align: center;
}
.qr-copy-line:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}
/* The glyph sits on the text's first line. */
.qr-copy-line__icon {
  margin-inline-end: 4px;
  vertical-align: -3px;
}
</style>
