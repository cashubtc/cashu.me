<!-- The tap-to-copy line under a QR code with no detail table (the Lightning address
     preview, a P2PK key; where a table follows, the text is a copy row in it): a quiet tonal
     pill, centred, holding the text on one line, shortened in the middle (a Lightning
     address keeps its whole domain), with the copy glyph after it that turns into a check
     once copied. The full text is its accessible name and tooltip. The owner copies and sets
     `copied`; this only draws and reports taps. -->
<template>
  <button
    type="button"
    class="qr-copy-line"
    :aria-label="label || text"
    :title="text"
    @click="$emit('copy')"
  >
    <!-- Machine text runs left to right in every locale (in Arabic the trailing "==" of a
         request jumped to its front). -->
    <bdi dir="ltr" class="qr-copy-line__text">{{ shown }}</bdi>
    <CheckIcon v-if="copied" :size="16" class="qr-copy-line__icon" />
    <CopyIcon v-else :size="16" class="qr-copy-line__icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Check as CheckIcon, Copy as CopyIcon } from "lucide-vue-next";

/** Long machine text, shortened in the middle; an address keeps its whole domain. */
export function middleShorten(text: string): string {
  const at = text.lastIndexOf("@");
  if (at > 0) {
    const user = text.slice(0, at);
    const head =
      user.length > 16 ? `${user.slice(0, 8)}…${user.slice(-4)}` : user;
    return `${head}${text.slice(at)}`;
  }
  return text.length > 26 ? `${text.slice(0, 12)}…${text.slice(-10)}` : text;
}

export default defineComponent({
  name: "QrCopyLine",
  components: { CheckIcon, CopyIcon },
  props: {
    /** The text, whole: it is shortened for display; the owner copies the full value. */
    text: { type: String, required: true },
    copied: { type: Boolean, default: false },
    /** Accessible name, e.g. "Copy request"; the text itself otherwise. */
    label: { type: String, default: "" },
  },
  emits: ["copy"],
  computed: {
    // One ellipsis character everywhere, whoever shortened the text.
    shown(): string {
      return middleShorten(this.text.replace("...", "…"));
    },
  },
});
</script>

<style scoped>
.qr-copy-line {
  align-items: center;
  background: var(--app-tint);
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  gap: 8px;
  /* It always sits under its QR: the stack's 16px gap above, the same as the note below. */
  margin: 16px auto 0;
  max-width: 100%;
  /* The 44px tap target. */
  min-height: 44px;
  padding: 0 14px 0 16px;
  transition: background 0.15s ease;
}
@media (hover: hover) {
  .qr-copy-line:hover {
    background: var(--app-tint-strong);
  }
}
.qr-copy-line:active {
  background: var(--app-tint-strong);
}
.qr-copy-line__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qr-copy-line__icon {
  color: var(--app-text-muted);
  flex-shrink: 0;
}
</style>
