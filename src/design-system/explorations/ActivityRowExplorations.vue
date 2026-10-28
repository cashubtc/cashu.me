<!-- Activity row explorations for the design system board: seven whole alternative designs
     (1-7) of the single history row, each listing the same specimen as the board's current
     row (0, rendered by the board): settled, pending and expired Lightning and ecash rows.
     Every variation keeps direction on pending rows, marks pending as not final and an expired
     invoice as not received. Board-only: nothing in the app uses these until one is chosen
     and moved into ActivityRow. Built from the shared tokens only. -->
<template>
  <div class="xar" :class="`xar--v${variant}`">
    <div
      v-for="r in specimen"
      :key="r.date + r.amount"
      class="xar-row"
      :class="[
        `xar-row--${r.dir}`,
        `xar-row--${r.state}`,
        `xar-row--${r.method}`,
      ]"
      role="button"
      tabindex="0"
      :aria-label="ariaLabel(r)"
    >
      <!-- 1 Direction first: the disc carries the arrow, the verb leads, method is a caption. -->
      <template v-if="variant === 1">
        <span class="xar-disc">
          <XIcon v-if="r.state === 'expired'" :size="20" />
          <component :is="arrow(r)" v-else :size="20" />
        </span>
        <div class="xar-main">
          <div class="xar-label">{{ verb(r) }}</div>
          <div class="xar-caption">{{ methodName(r) }} · {{ r.date }}</div>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">{{ signed(r) }}</div>
          <div v-if="r.state !== 'done'" class="xar-caption xar-state">
            {{ r.state === "pending" ? "Pending" : "Not received" }}
          </div>
        </div>
      </template>

      <!-- 2 Verb and method: bare method glyph, "Received · Lightning"; tense says pending. -->
      <template v-else-if="variant === 2">
        <component :is="methodIcon(r)" :size="22" class="xar-glyph" />
        <div class="xar-main">
          <div class="xar-label">
            {{ verb(r)
            }}<span class="xar-label__method"> · {{ methodName(r) }}</span>
          </div>
          <div class="xar-caption">{{ r.date }}</div>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">
            <ClockIcon
              v-if="r.state === 'pending'"
              :size="14"
              class="xar-amount__clock"
            />{{ signed(r) }}
          </div>
        </div>
      </template>

      <!-- 3 Amount led: a large amount with its date under it; a small arrow and method lead. -->
      <template v-else-if="variant === 3">
        <span class="xar-mark">
          <XIcon v-if="r.state === 'expired'" :size="16" />
          <component :is="arrow(r)" v-else :size="16" />
        </span>
        <div class="xar-main">
          <div class="xar-label">{{ methodName(r) }}</div>
          <div class="xar-caption">{{ r.date }}</div>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">{{ signed(r) }}</div>
          <div class="xar-caption xar-state">
            <span v-if="r.state === 'pending'" class="xar-dot" />{{
              r.state === "done" ? verb(r) : stateName(r)
            }}
          </div>
        </div>
      </template>

      <!-- 4 Ledger: no icon; a fixed date column, the verb in its tense, the signed amount. -->
      <template v-else-if="variant === 4">
        <div class="xar-when">{{ r.date }}</div>
        <div class="xar-main">
          <div class="xar-label">{{ verb(r) }}</div>
          <div class="xar-caption">{{ methodName(r) }}</div>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">{{ signed(r) }}</div>
          <div v-if="r.state !== 'done'" class="xar-caption xar-state">
            {{ r.state === "pending" ? "Not final yet" : "Nothing received" }}
          </div>
        </div>
      </template>

      <!-- 5 Status pill: the method disc and direction badge stay; a pill names the state. -->
      <template v-else-if="variant === 5">
        <span class="xar-disc">
          <component :is="methodIcon(r)" :size="20" />
          <span v-if="r.state !== 'expired'" class="xar-badge">
            <component :is="arrow(r)" :size="12" :stroke-width="2.75" />
          </span>
        </span>
        <div class="xar-main">
          <div class="xar-label">
            <span>{{ methodName(r) }}</span>
            <span v-if="r.state !== 'done'" class="xar-pill">{{
              stateName(r)
            }}</span>
          </div>
          <div class="xar-caption">{{ r.date }}</div>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">{{ signed(r) }}</div>
        </div>
      </template>

      <!-- 6 Compact: one line, 56px; arrow, method, date and state inline, amount trailing. -->
      <template v-else-if="variant === 6">
        <component
          :is="r.state === 'expired' ? XIcon : arrow(r)"
          :size="20"
          class="xar-glyph"
        />
        <div class="xar-main xar-line">
          <span class="xar-label">{{ methodName(r) }}</span>
          <span class="xar-caption">{{ r.date }}</span>
          <span v-if="r.state !== 'done'" class="xar-caption xar-state">{{
            stateName(r)
          }}</span>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">{{ signed(r) }}</div>
        </div>
      </template>

      <!-- 7 Tinted disc: the disc's tone is the direction, its glyph the method; a small
           arrow before the amount repeats direction without colour. -->
      <template v-else>
        <span class="xar-disc">
          <component :is="methodIcon(r)" :size="20" />
        </span>
        <div class="xar-main">
          <div class="xar-label">{{ methodName(r) }}</div>
          <div class="xar-caption">
            {{ r.date
            }}<template v-if="r.state !== 'done'">
              · <span class="xar-state">{{ stateName(r) }}</span></template
            >
          </div>
        </div>
        <div class="xar-end">
          <div class="xar-amount" dir="ltr">
            <component
              :is="r.state === 'expired' ? XIcon : arrow(r)"
              :size="16"
              :stroke-width="2.5"
              class="xar-amount__arrow"
            />{{ signed(r) }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import {
  ArrowDownLeft as ArrowDownLeftIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Clock as ClockIcon,
  Coins as CoinsIcon,
  X as XIcon,
  Zap as ZapIcon,
} from "lucide-vue-next";

export const activityRowVariants = [
  "Current (was: method disc, direction badge; now ships V1)",
  "Direction disc, method caption",
  "Verb and method",
  "Amount led",
  "Ledger, no icon",
  "Status pill",
  "Compact single line",
  "Direction-tinted disc",
];

type Row = {
  method: "lightning" | "ecash";
  dir: "in" | "out";
  amount: string;
  date: string;
  state: "done" | "pending" | "expired";
};

export default defineComponent({
  name: "ActivityRowExplorations",
  components: { ClockIcon, XIcon },
  props: {
    variant: { type: Number, default: 0 },
  },
  data() {
    return {
      XIcon: markRaw(XIcon),
      specimen: [
        {
          method: "lightning",
          dir: "in",
          amount: "5,000",
          date: "Today, 14:02",
          state: "done",
        },
        {
          method: "ecash",
          dir: "out",
          amount: "210",
          date: "Today, 13:40",
          state: "pending",
        },
        {
          method: "lightning",
          dir: "out",
          amount: "101",
          date: "Yesterday",
          state: "done",
        },
        {
          method: "ecash",
          dir: "in",
          amount: "500",
          date: "Yesterday",
          state: "done",
        },
        {
          method: "lightning",
          dir: "in",
          amount: "1,000",
          date: "Mon",
          state: "expired",
        },
        {
          method: "lightning",
          dir: "in",
          amount: "2,289",
          date: "12 Oct",
          state: "done",
        },
        {
          method: "ecash",
          dir: "out",
          amount: "42",
          date: "10 Oct",
          state: "done",
        },
      ] as Row[],
    };
  },
  methods: {
    methodIcon(r: Row) {
      return r.method === "lightning" ? ZapIcon : CoinsIcon;
    },
    methodName(r: Row): string {
      return r.method === "lightning" ? "Lightning" : "Ecash";
    },
    arrow(r: Row) {
      return r.dir === "in" ? ArrowDownLeftIcon : ArrowUpRightIcon;
    },
    // The verb carries the tense: pending is still happening, expired never happened.
    verb(r: Row): string {
      if (r.state === "expired") return "Invoice expired";
      if (r.state === "pending")
        return r.dir === "in" ? "Receiving" : "Sending";
      return r.dir === "in" ? "Received" : "Sent";
    },
    stateName(r: Row): string {
      return r.state === "pending" ? "Pending" : "Expired";
    },
    // Expired invoices lose their sign: no money moved.
    signed(r: Row): string {
      if (r.state === "expired") return `₿${r.amount}`;
      return `${r.dir === "in" ? "+" : "−"}₿${r.amount}`;
    },
    ariaLabel(r: Row): string {
      return `${this.verb(r)}, ${this.methodName(r)}, ₿${r.amount}, ${r.date}`;
    },
  },
});
</script>

<style scoped>
.xar {
  display: flex;
  flex-direction: column;
  width: 100%;
}
/* Shared row: content on the column edges (the app's 16px gutter), a full-row press tint. */
.xar-row {
  --tone: var(--app-text);
  align-items: center;
  border-radius: var(--app-radius-lg);
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  gap: 14px;
  margin-inline: -12px;
  min-height: 64px;
  outline: none;
  padding: 10px 12px;
  text-align: start;
}
.xar-row--in.xar-row--done {
  --tone: var(--app-success);
}
.xar-row--pending {
  --tone: var(--app-warning);
}
.xar-row--expired {
  --tone: var(--app-text-muted);
}
@media (hover: hover) {
  .xar-row:hover {
    background: color-mix(
      in srgb,
      var(--app-text) calc(var(--app-hover-opacity) * 100%),
      transparent
    );
  }
}
.xar-row:focus-visible {
  box-shadow: inset 0 0 0 2px var(--q-primary);
}
.xar-main {
  flex: 1;
  min-width: 0;
}
.xar-label {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
}
.xar-caption {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.35;
}
.xar-end {
  flex-shrink: 0;
  text-align: end;
}
.xar-amount {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}
.xar-row--in.xar-row--done .xar-amount {
  color: var(--app-success);
}
/* Not final: secondary ink, normal weight. Expired: muted and struck, no sign. */
.xar-row--pending .xar-amount {
  color: var(--app-text-muted);
  font-weight: 500;
}
.xar-row--expired .xar-amount {
  color: var(--app-text-muted);
  font-weight: 500;
  text-decoration: line-through;
}
.xar-state {
  color: var(--app-warning);
  font-weight: 600;
}
.xar-row--expired .xar-state {
  color: var(--app-text-muted);
}
.xar-disc {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  position: relative;
  width: 40px;
}
.xar-glyph {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

/* 1 Direction disc: the arrow fills the disc, tinted by direction; pending gets a dashed
   ring around the same arrow, expired a plain cross. */
.xar--v1 .xar-row--in .xar-disc {
  background: color-mix(in srgb, var(--app-success) 18%, transparent);
  color: var(--app-success);
}
.xar--v1 .xar-row--pending .xar-disc {
  background: transparent;
  border: 2px dashed var(--app-warning);
  color: var(--app-text);
}
.xar--v1 .xar-row--expired .xar-disc {
  background: var(--app-tint);
  color: var(--app-text-muted);
}
.xar--v1 .xar-row--expired .xar-label {
  color: var(--app-text-muted);
}

/* 2 Verb and method: no disc; a quiet method glyph, the verb in ink with the method muted,
   the amount alone at the end. Pending reads "Sending" and gets a clock before the amount. */
.xar--v2 .xar-row {
  gap: 16px;
}
.xar--v2 .xar-glyph {
  color: var(--app-text);
}
.xar--v2 .xar-label__method {
  color: var(--app-text-muted);
  font-weight: 400;
}
.xar--v2 .xar-row--pending .xar-label {
  color: var(--app-warning);
}
.xar--v2 .xar-row--expired .xar-glyph,
.xar--v2 .xar-row--expired .xar-label {
  color: var(--app-text-muted);
}
.xar--v2 .xar-amount__clock {
  color: var(--app-warning);
  margin-inline-end: 6px;
  vertical-align: -2px;
}

/* 3 Amount led: a 20px amount is the row's headline with the outcome under it; a small
   outlined arrow mark and the method stay quiet on the start side. Taller, 72px. */
.xar--v3 .xar-row {
  gap: 12px;
  min-height: 72px;
}
.xar--v3 .xar-mark {
  align-items: center;
  border: 1.5px solid var(--app-border-strong);
  border-radius: 50%;
  color: var(--tone);
  display: inline-flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;
}
.xar--v3 .xar-row--done .xar-mark {
  color: var(--app-text);
}
.xar--v3 .xar-row--in.xar-row--done .xar-mark {
  border-color: color-mix(in srgb, var(--app-success) 50%, transparent);
  color: var(--app-success);
}
.xar--v3 .xar-row--pending .xar-mark {
  border-color: var(--app-warning);
  color: var(--app-text);
}
.xar--v3 .xar-label {
  color: var(--app-text-muted);
  font-size: 14px;
  font-weight: 400;
}
.xar--v3 .xar-amount {
  font-size: 20px;
}
.xar--v3 .xar-state {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  font-weight: 400;
  gap: 6px;
}
.xar--v3 .xar-row--pending .xar-state {
  color: var(--app-warning);
  font-weight: 600;
}
.xar--v3 .xar-dot {
  background: var(--app-warning);
  border-radius: 50%;
  height: 6px;
  width: 6px;
}

/* 4 Ledger: no icons; a fixed date column, hairlines between rows, the verb's tense and a
   plain-words note under the amount carry the state. */
.xar--v4 .xar-row {
  border-radius: 0;
  gap: 12px;
  min-height: 60px;
}
.xar--v4 .xar-row + .xar-row {
  border-top: 1px solid var(--app-border);
}
.xar--v4 .xar-when {
  color: var(--app-text-muted);
  flex-shrink: 0;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  width: 92px;
}
.xar--v4 .xar-row--pending .xar-label {
  font-style: italic;
}
.xar--v4 .xar-row--expired .xar-label {
  color: var(--app-text-muted);
}

/* 5 Status pill: the current disc and badge, but a tone pill names a pending or expired
   state beside the label; the badge always shows direction. */
.xar--v5 .xar-badge {
  align-items: center;
  background: var(--app-text);
  border: 2px solid var(--app-surface);
  border-radius: 50%;
  bottom: -5px;
  color: var(--app-surface);
  display: flex;
  height: 20px;
  inset-inline-end: -5px;
  justify-content: center;
  position: absolute;
  width: 20px;
}
.xar--v5 .xar-row--in .xar-badge {
  background: var(--app-success);
}
.xar--v5 .xar-row--expired .xar-disc {
  color: var(--app-text-muted);
}
.xar--v5 .xar-label {
  align-items: center;
  display: flex;
  gap: 8px;
}
.xar--v5 .xar-pill {
  background: color-mix(in srgb, var(--tone) 18%, transparent);
  border-radius: var(--app-radius-pill);
  color: var(--tone);
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  padding: 0 8px;
}
.xar--v5 .xar-row--pending .xar-pill {
  color: var(--app-text);
}
.xar--v5 .xar-row--expired .xar-pill {
  background: var(--app-tint-strong);
  color: var(--app-text-muted);
}

/* 6 Compact: one 56px line; the bare arrow leads, the date and state run inline after the
   method, the amount ends the line. */
.xar--v6 .xar-row {
  gap: 12px;
  min-height: 56px;
  padding-block: 6px;
}
.xar--v6 .xar-glyph {
  color: var(--tone);
}
.xar--v6 .xar-row--done .xar-glyph {
  color: var(--app-text);
}
.xar--v6 .xar-row--in.xar-row--done .xar-glyph {
  color: var(--app-success);
}
.xar--v6 .xar-row--pending .xar-glyph {
  color: var(--app-text);
}
.xar--v6 .xar-line {
  align-items: baseline;
  display: flex;
  gap: 8px;
  overflow: hidden;
  white-space: nowrap;
}
.xar--v6 .xar-line .xar-caption + .xar-caption::before {
  color: var(--app-text-muted);
  content: "·";
  font-weight: 400;
  margin-inline-end: 8px;
}
.xar--v6 .xar-row--expired .xar-label {
  color: var(--app-text-muted);
}

/* 7 Direction-tinted disc: the disc's tone is the direction (green in, neutral out), its glyph
   the method. Pending: an outlined dashed disc. Expired: an empty grey disc. */
.xar--v7 .xar-row--in .xar-disc {
  background: color-mix(in srgb, var(--app-success) 18%, transparent);
  color: var(--app-success);
}
.xar--v7 .xar-row--out .xar-disc {
  background: var(--app-tint-strong);
  color: var(--app-text);
}
.xar--v7 .xar-row--pending .xar-disc {
  background: transparent;
  border: 2px dashed var(--app-warning);
  color: var(--app-text);
}
.xar--v7 .xar-row--expired .xar-disc {
  background: var(--app-tint);
  color: var(--app-text-muted);
}
.xar--v7 .xar-row--expired .xar-label {
  color: var(--app-text-muted);
}
.xar--v7 .xar-amount__arrow {
  margin-inline-end: 4px;
  vertical-align: -2px;
}
</style>
