<!-- Segmented control explorations for the design system board: the board renders the current
     invoice-type toggle (0); this file renders seven whole alternative designs (1-7), each
     showing the same specimen (two options, three options, icons with labels, and a disabled
     control). Board-only: nothing in the app uses these until one is chosen. Each control is a
     radiogroup of buttons: arrow keys, Home and End move and select, the chosen button holds
     the tab stop. Built from the shared tokens only. -->
<template>
  <div class="xseg" :class="`xseg--v${variant}`">
    <div v-for="g in groups" :key="g.key" class="xseg-field">
      <div :id="`xseg-${variant}-${g.key}`" class="xseg-caption">
        {{ g.label }}
      </div>
      <div
        role="radiogroup"
        class="xseg-group"
        :class="{ 'xseg-group--disabled': g.disabled }"
        :aria-labelledby="`xseg-${variant}-${g.key}`"
        :aria-disabled="g.disabled || undefined"
        :style="{ '--n': g.options.length, '--i': selectedIndex(g) }"
        @keydown="onKey(g, $event)"
      >
        <span v-if="slides" class="xseg-thumb" aria-hidden="true" />
        <button
          v-for="o in g.options"
          :key="o.value"
          type="button"
          role="radio"
          class="xseg-seg"
          :class="{ 'xseg-seg--on': g.value === o.value }"
          :aria-checked="g.value === o.value ? 'true' : 'false'"
          :tabindex="g.value === o.value ? 0 : -1"
          :disabled="g.disabled"
          @click="g.value = o.value"
        >
          <!-- 4: a dot marks the chosen word -->
          <span v-if="variant === 4" class="xseg-dot" aria-hidden="true" />
          <!-- 3: the chosen chip trades its icon for a check -->
          <CheckIcon
            v-if="variant === 3 && g.value === o.value"
            :size="16"
            class="xseg-icon xseg-check"
          />
          <component
            :is="o.icon"
            v-else-if="o.icon"
            :size="variant === 5 ? 22 : 18"
            class="xseg-icon"
          />
          <span class="xseg-text">
            <span class="xseg-label">{{ o.label }}</span>
            <span v-if="variant === 5 && o.hint" class="xseg-hint">{{
              o.hint
            }}</span>
          </span>
          <!-- 5: a radio mark in the tile corner -->
          <span v-if="variant === 5" class="xseg-radio" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Component } from "vue";
import {
  Check as CheckIcon,
  Coins as CoinsIcon,
  Zap as ZapIcon,
} from "lucide-vue-next";

export const segmentedVariants = [
  "Current: filled pill segments",
  "Sliding thumb",
  "Underline tabs",
  "Outlined chips",
  "Ghost text with dot",
  "Choice tiles",
  "Primary sliding pill",
  "Split toolbar",
];

type Option = { value: string; label: string; hint?: string; icon?: Component };
type Group = {
  key: string;
  label: string;
  value: string;
  options: Option[];
  disabled?: boolean;
};

export default defineComponent({
  name: "SegmentedExplorations",
  components: { CheckIcon },
  props: {
    variant: { type: Number, default: 0 },
  },
  data() {
    return {
      groups: [
        {
          key: "type",
          label: "Invoice type",
          value: "bolt11",
          options: [
            { value: "bolt11", label: "Invoice", hint: "Pays once" },
            { value: "bolt12", label: "Offer", hint: "Reusable" },
          ],
        },
        {
          key: "theme",
          label: "Appearance",
          value: "system",
          options: [
            { value: "dark", label: "Dark", hint: "Always" },
            { value: "light", label: "Light", hint: "Always" },
            { value: "system", label: "System", hint: "Follows device" },
          ],
        },
        {
          key: "method",
          label: "Receive with",
          value: "lightning",
          options: [
            {
              value: "lightning",
              label: "Lightning",
              hint: "From any wallet",
              icon: markRaw(ZapIcon),
            },
            {
              value: "ecash",
              label: "Ecash",
              hint: "Paste a token",
              icon: markRaw(CoinsIcon),
            },
          ],
        },
        {
          key: "unit",
          label: "Unit (this mint only offers ₿)",
          value: "sat",
          disabled: true,
          options: [
            { value: "sat", label: "₿", hint: "Bitcoin" },
            { value: "usd", label: "USD", hint: "Dollars" },
          ],
        },
      ] as Group[],
    };
  },
  computed: {
    // Variations with one indicator that travels between segments.
    slides(): boolean {
      return [1, 2, 6].includes(this.variant);
    },
  },
  methods: {
    selectedIndex(g: Group): number {
      return Math.max(
        0,
        g.options.findIndex((o) => o.value === g.value)
      );
    },
    onKey(g: Group, e: KeyboardEvent) {
      if (g.disabled) return;
      const group = e.currentTarget as HTMLElement;
      const rtl = getComputedStyle(group).direction === "rtl";
      const last = g.options.length - 1;
      const i = this.selectedIndex(g);
      const step: Record<string, number> = {
        ArrowRight: rtl ? -1 : 1,
        ArrowLeft: rtl ? 1 : -1,
        ArrowDown: 1,
        ArrowUp: -1,
      };
      let next: number;
      if (e.key in step) next = (i + step[e.key] + last + 1) % (last + 1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      else return;
      e.preventDefault();
      g.value = g.options[next].value;
      const buttons = group.querySelectorAll<HTMLElement>('[role="radio"]');
      buttons[next]?.focus();
    },
  },
});
</script>

<style scoped>
.xseg {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
.xseg-caption {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}
.xseg-group {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  position: relative;
}
.xseg-seg {
  align-items: center;
  appearance: none;
  background: none;
  border: 0;
  border-radius: 0;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  gap: 8px;
  justify-content: center;
  min-height: 44px;
  min-width: 0;
  padding: 0 14px;
  position: relative;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;
  z-index: 1;
}
.xseg-seg:not(:disabled):hover {
  color: var(--app-text);
}
.xseg-seg--on {
  color: var(--app-text);
}
.xseg-seg:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
  z-index: 2;
}
.xseg-seg:disabled {
  cursor: default;
}
.xseg-group--disabled {
  opacity: 0.45;
}
.xseg-icon {
  flex-shrink: 0;
}
.xseg-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.xseg-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xseg-thumb {
  position: absolute;
  transition: inset-inline-start 0.22s cubic-bezier(0.3, 0.7, 0.4, 1),
    background-color 0.15s ease;
}
@media (prefers-reduced-motion: reduce) {
  .xseg-thumb,
  .xseg-seg {
    transition: none;
  }
}

/* 1 Sliding thumb: a tinted track; a raised neutral thumb slides under the chosen label.
   No brand colour, so it sits quietly inside forms. */
.xseg--v1 .xseg-group {
  background: var(--app-tint-strong);
  border-radius: var(--app-radius-lg);
  padding: 4px;
}
.xseg--v1 .xseg-seg {
  border-radius: var(--app-radius-md);
  min-height: 40px;
}
.xseg--v1 .xseg-thumb {
  background: var(--app-raised);
  border-radius: var(--app-radius-md);
  box-shadow: 0 0 0 1px var(--app-border-strong),
    0 1px 3px color-mix(in srgb, var(--app-text) 14%, transparent);
  height: calc(100% - 8px);
  inset-block-start: 4px;
  inset-inline-start: calc(4px + var(--i) * (100% - 8px) / var(--n));
  width: calc((100% - 8px) / var(--n));
}

/* 2 Underline tabs: no box; a hairline baseline and a 2px primary bar that slides. */
.xseg--v2 .xseg-group {
  border-bottom: 1px solid var(--app-border);
}
.xseg--v2 .xseg-seg {
  border-radius: var(--app-radius-sm) var(--app-radius-sm) 0 0;
  font-size: 15px;
}
.xseg--v2 .xseg-thumb {
  background: var(--q-primary);
  border-radius: 2px 2px 0 0;
  height: 3px;
  inset-block-end: -1px;
  inset-inline-start: calc(var(--i) * 100% / var(--n) + 16px);
  width: calc(100% / var(--n) - 32px);
  z-index: 2;
}

/* 3 Outlined chips: separate content-width pills; the chosen chip takes a primary edge,
   a faint primary fill and a check. Reads as a filter, wraps when labels grow. */
.xseg--v3 .xseg-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.xseg--v3 .xseg-seg {
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-pill);
  color: var(--app-text);
  font-weight: 500;
  gap: 6px;
  min-height: 40px;
  padding: 0 16px;
}
.xseg--v3 .xseg-seg--on {
  background: color-mix(in srgb, var(--q-primary) 14%, transparent);
  border-color: var(--q-primary);
  font-weight: 600;
  padding-inline-start: 12px;
}
.xseg--v3 .xseg-seg .xseg-icon {
  color: var(--app-text-muted);
}
.xseg--v3 .xseg-seg--on .xseg-icon {
  color: var(--app-text);
}

/* 4 Ghost text with dot: no container at all; muted words, the chosen one goes ink with a
   primary dot. The lightest weight, best inline in a header or under a title. */
.xseg--v4 .xseg-group {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-inline-start: -12px;
}
.xseg--v4 .xseg-seg {
  border-radius: var(--app-radius-pill);
  font-size: 15px;
  font-weight: 500;
  min-height: 40px;
  padding: 0 12px;
}
.xseg--v4 .xseg-seg:not(:disabled):hover {
  background: var(--app-tint);
}
.xseg--v4 .xseg-seg--on {
  font-weight: 600;
}
.xseg--v4 .xseg-dot {
  background: var(--q-primary);
  border-radius: 50%;
  flex-shrink: 0;
  height: 6px;
  margin-inline-end: -2px;
  transform: scale(0);
  transition: transform 0.15s ease;
  width: 6px;
}
.xseg--v4 .xseg-seg--on .xseg-dot {
  transform: scale(1);
}
@media (prefers-reduced-motion: reduce) {
  .xseg--v4 .xseg-dot {
    transition: none;
  }
}

/* 5 Choice tiles: each option is a card with a one-line hint and a radio mark; the chosen
   tile takes a primary edge. Explains the choice, costs vertical space. */
.xseg--v5 .xseg-group {
  gap: 10px;
}
.xseg--v5 .xseg-seg {
  align-items: flex-start;
  background: var(--app-group-fill);
  border-radius: var(--app-radius-lg);
  box-shadow: inset 0 0 0 1px var(--app-border);
  color: var(--app-text);
  flex-direction: column;
  gap: 10px;
  justify-content: flex-start;
  min-height: 72px;
  padding: 14px 14px 12px;
  text-align: start;
}
.xseg--v5 .xseg-seg--on {
  box-shadow: inset 0 0 0 2px var(--q-primary);
}
.xseg--v5 .xseg-seg:focus-visible {
  box-shadow: inset 0 0 0 1px var(--app-border), var(--app-focus-ring);
}
.xseg--v5 .xseg-seg--on:focus-visible {
  box-shadow: inset 0 0 0 2px var(--q-primary), var(--app-focus-ring);
}
.xseg--v5 .xseg-text {
  gap: 2px;
  padding-inline-end: 22px;
  width: 100%;
}
.xseg--v5 .xseg-label {
  font-size: 15px;
}
.xseg--v5 .xseg-hint {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xseg--v5 .xseg-icon {
  color: var(--app-text-muted);
}
.xseg--v5 .xseg-seg--on .xseg-icon {
  color: var(--app-text);
}
.xseg--v5 .xseg-radio {
  border: 1.5px solid var(--app-border-strong);
  border-radius: 50%;
  height: 18px;
  inset-block-start: 14px;
  inset-inline-end: 14px;
  position: absolute;
  transition: border 0.15s ease;
  width: 18px;
}
.xseg--v5 .xseg-seg--on .xseg-radio {
  border: 5px solid var(--q-primary);
}

/* 6 Primary sliding pill: a quiet pill track; a primary thumb glides to the choice and the
   label flips to on-primary. The loudest option, for a screen's main mode switch. */
.xseg--v6 .xseg-group {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-pill);
  padding: 3px;
}
.xseg--v6 .xseg-seg {
  border-radius: var(--app-radius-pill);
  min-height: 40px;
}
.xseg--v6 .xseg-seg--on,
.xseg--v6 .xseg-seg--on:hover {
  color: var(--app-on-primary);
}
.xseg--v6 .xseg-thumb {
  background: var(--q-primary);
  border-radius: var(--app-radius-pill);
  height: calc(100% - 6px);
  inset-block-start: 3px;
  inset-inline-start: calc(3px + var(--i) * (100% - 6px) / var(--n));
  width: calc((100% - 6px) / var(--n));
}

/* 7 Split toolbar: square-cornered joined buttons with hairline dividers; the chosen one
   fills with tint. Compact and tool-like, matches dense settings rows. */
.xseg--v7 .xseg-group {
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
}
.xseg--v7 .xseg-seg {
  font-weight: 500;
  min-height: 40px;
}
.xseg--v7 .xseg-seg + .xseg-seg {
  border-inline-start: 1px solid var(--app-border-strong);
}
.xseg--v7 .xseg-seg:first-of-type {
  border-end-start-radius: calc(var(--app-radius-md) - 1px);
  border-start-start-radius: calc(var(--app-radius-md) - 1px);
}
.xseg--v7 .xseg-seg:last-of-type {
  border-end-end-radius: calc(var(--app-radius-md) - 1px);
  border-start-end-radius: calc(var(--app-radius-md) - 1px);
}
.xseg--v7 .xseg-seg:not(:disabled):hover {
  background: var(--app-tint);
}
.xseg--v7 .xseg-seg--on,
.xseg--v7 .xseg-seg--on:not(:disabled):hover {
  background: var(--app-tint-strong);
  font-weight: 600;
}
</style>
