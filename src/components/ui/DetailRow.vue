<!-- A label/value row in quote, token, request and mint detail views: icon and muted name on
     the start edge, value on the end edge (styled by the global .detail-* rules in app.scss).
     Every row is a 44px box, 4px from the next in a .detail-table (one 48px pitch). Four kinds:
     - static (default): a plain fact;
     - `action`: the whole row is a button that changes the value (a chevron says it opens
       something; `busy` and `disabled` hold it);
     - `href`: the whole row is an external link, the value underlined and ending in the
       ExternalLink glyph in the text colour;
     - `copyValue`: the whole row copies that string, the value ending in a Copy glyph.
     A trailing glyph (chevron, external link, copy) sits inside the value and takes its colour:
     a set value's text colour, a placeholder's muted, a disabled row's subtle.
     Interactive rows tint their own box on hover and press (never a neighbour's) and bleed
     12px past the text, so the label and value stay on the table's edges. -->
<template>
  <component
    :is="href ? 'a' : action || copyValue ? 'button' : 'div'"
    class="detail-item"
    :class="{
      'detail-item--action': interactive,
      'detail-item--link': !!href,
      'detail-item--command': action && !chevron && !href && !copyValue,
    }"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :type="!href && interactive ? 'button' : undefined"
    :aria-label="
      !href && interactive
        ? actionLabel || `${label}: ${value || copyValue}`
        : undefined
    "
    :aria-busy="busy || undefined"
    :aria-disabled="busy || disabled || undefined"
    @click="onClick"
  >
    <div class="detail-label">
      <component :is="icon" v-if="icon" :size="20" class="detail-icon" />
      <span
        v-else-if="iconSrc"
        class="detail-icon detail-icon--mask"
        aria-hidden="true"
        :style="{ '--detail-icon-src': `url(${iconSrc})` }"
      />
      <div class="detail-name">{{ label }}</div>
    </div>
    <div
      class="detail-value"
      :class="[
        valueClass,
        {
          'detail-value--placeholder': placeholder,
          'detail-value--inline': interactive,
        },
      ]"
    >
      <span v-if="interactive" class="detail-value__text"
        ><slot>{{ value }}</slot></span
      >
      <slot v-else>{{ value }}</slot>
      <ExternalLinkIcon
        v-if="href"
        :size="16"
        class="detail-value__external"
        aria-hidden="true"
      />
      <component
        :is="copied ? CheckIcon : CopyIcon"
        v-else-if="copyValue"
        :size="16"
        class="detail-value__glyph"
        aria-hidden="true"
      />
      <ChevronRightIcon
        v-else-if="action && chevron && !disabled"
        :size="18"
        class="detail-item__chevron"
        aria-hidden="true"
      />
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import { copyText } from "src/js/copy";
import {
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
} from "lucide-vue-next";

const COPIED_MS = 1500;

export default defineComponent({
  name: "DetailRow",
  components: { ChevronRightIcon, ExternalLinkIcon },
  setup() {
    return { CheckIcon, CopyIcon };
  },
  props: {
    /** An action row's chevron; off when the row is a retry rather than a picker. */
    chevron: { type: Boolean, default: true },
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: null,
    },
    /** An image icon (nostr, X, Telegram), drawn as a mask in the icon colour; `icon` wins. */
    iconSrc: { type: String as PropType<string | null>, default: null },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number] as PropType<string | number>,
      default: "",
    },
    valueClass: {
      type: [String, Array, Object] as PropType<
        string | string[] | Record<string, boolean>
      >,
      default: "",
    },
    /** The whole row is an external link opened in a new tab. */
    href: {
      type: String as PropType<string | null>,
      default: null,
    },
    /** The whole row copies this string (emits `copied`). */
    copyValue: { type: String, default: "" },
    /** The toast after copying; defaults to "Copied". */
    copiedMessage: { type: String, default: "" },
    /** The row is a button that changes this value (emits `click`). */
    action: { type: Boolean, default: false },
    /** The button's accessible name; defaults to "Label: value". */
    actionLabel: { type: String, default: "" },
    /** The value is an unset default ("Any amount"): muted, like a placeholder. */
    placeholder: { type: Boolean, default: false },
    /** The action is running (the caller shows BusyLabel in the slot); taps are ignored. */
    busy: { type: Boolean, default: false },
    /** The action is unavailable: still focusable and announced, but taps are ignored. */
    disabled: { type: Boolean, default: false },
  },
  emits: ["click", "copied"],
  data() {
    return {
      copied: false,
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  computed: {
    interactive(): boolean {
      return Boolean(this.href || this.copyValue || this.action);
    },
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    onClick(event: MouseEvent) {
      if (!this.interactive) return;
      if (this.busy || this.disabled) {
        event.preventDefault();
        return;
      }
      if (this.href) return;
      if (this.copyValue) {
        this.copy();
        return;
      }
      this.$emit("click", event);
    },
    async copy() {
      if (!(await copyText(this.copyValue, this.copiedMessage || undefined)))
        return;
      this.copied = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.copied = false;
      }, COPIED_MS);
      this.$emit("copied", this.copyValue);
    },
  },
});
</script>

<style scoped>
/* An interactive row: a button or link in the same 44px box as a plain row, reaching 12px past
   the text on both sides, so the label and value stay on the table's edges. */
.detail-item--action {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  isolation: isolate;
  margin-inline: -12px;
  padding: 4px 12px;
  position: relative;
  text-align: start;
  text-decoration: none;
  width: calc(100% + 24px);
}
/* The tint is the row's own box: the 4px gap stays clear between two rows' tints. */
.detail-item--action::before {
  border-radius: var(--app-radius-md);
  content: "";
  inset: 0;
  position: absolute;
  z-index: -1;
  transition: background 0.15s ease;
}
@media (hover: hover) {
  .detail-item--action:not([aria-disabled="true"]):hover::before {
    background: var(--app-tint);
  }
}
.detail-item--action:not([aria-disabled="true"]):active::before {
  background: var(--app-tint-strong);
}
.detail-item--action[aria-busy="true"] {
  cursor: progress;
}
.detail-item--action[aria-disabled="true"]:not([aria-busy="true"]) {
  cursor: default;
}
.detail-item--action[aria-disabled="true"]:not([aria-busy="true"])
  .detail-value {
  color: var(--app-text-subtle);
}
.detail-item--action .detail-value {
  flex: 1;
  margin-inline-start: 12px;
  /* Fill the row, so every row's value (and its glyph) ends on the same edge. */
  max-width: none;
  min-width: 0;
  /* The chevron's box reaches 4px past the edge (its ink does not); keep that box unclipped. */
  overflow: visible;
}
/* A command row (a retry, no chevron): its one word never truncates; a long label wraps and
   the row grows instead. */
.detail-item--command .detail-label {
  min-width: 0;
}
.detail-item--command .detail-value {
  flex: 0 0 auto;
}
/* Link rows: the value is underlined. */
.detail-item--link .detail-value__text {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
/* Every trailing glyph takes the value's own colour. */
.detail-value__external,
.detail-value__glyph,
.detail-item__chevron {
  color: currentColor;
  flex-shrink: 0;
}
.detail-value--placeholder {
  color: var(--app-text-muted);
  font-weight: 400;
}
/* A picture icon takes the icon colour of every other row (the SVGs are a fixed grey). */
.detail-icon--mask {
  background: currentColor;
  display: inline-block;
  height: 20px;
  width: 20px;
  -webkit-mask: var(--detail-icon-src) center / contain no-repeat content-box;
  mask: var(--detail-icon-src) center / contain no-repeat content-box;
}
/* The chevron's ink sits 6px inside its 18px box; its edge lands on the table's 12px inset. */
.detail-item__chevron {
  margin-inline-end: -4px;
}
</style>
