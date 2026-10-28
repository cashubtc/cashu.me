<!-- Transaction history explorations for the design system board: seven whole alternative
     designs (1-7) of the wallet's activity list. The board renders the current HistoryTable
     (0) itself. Every variation shows the same specimen (a settled receive, a pending send, a
     failed invoice and older rows), keeps direction visible on every row, and makes pending
     and failed read differently from settled. Board-only and built from the shared tokens. -->
<template>
  <div class="xh" :class="`xh--v${variant}`">
    <!-- 1 Dense ledger: one line per transaction, date column, right-aligned amounts. -->
    <template v-if="variant === 1">
      <div class="xh-head">
        <span class="xh-title">Activity</span>
        <div class="xh-textfilter" role="group" aria-label="Filter">
          <button
            v-for="f in filters"
            :key="f.value"
            type="button"
            class="xh-textfilter__btn"
            :aria-pressed="filter === f.value ? 'true' : 'false'"
            @click="filter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
      <div class="xh-ledger" role="table" aria-label="Activity">
        <div class="xh-ledger__cols" role="row">
          <span role="columnheader">Date</span>
          <span role="columnheader">Details</span>
          <span role="columnheader" class="xh-num">Amount</span>
        </div>
        <div
          v-for="t in rows"
          :key="t.id"
          class="xh-ledger__row"
          :class="[`is-${t.status}`, `is-${t.dir}`]"
          role="row"
          tabindex="0"
        >
          <span class="xh-ledger__date" role="cell">
            <span>{{ t.date }}</span>
            <span class="xh-ledger__time">{{ t.time }}</span>
          </span>
          <span class="xh-ledger__what" role="cell">
            <component
              :is="dirIcon(t)"
              :size="16"
              :stroke-width="2.25"
              class="xh-dir"
              :class="`xh-dir--${t.dir}`"
            />
            <span class="xh-ledger__label">{{ t.method }}</span>
            <span v-if="t.status !== 'settled'" class="xh-flag">
              <component :is="statusIcon(t)" :size="14" />
              {{ statusWord(t) }}
            </span>
          </span>
          <span class="xh-ledger__amt xh-num" role="cell" dir="ltr">
            {{ signed(t) }}
          </span>
        </div>
      </div>
      <div class="xh-ledger__foot">
        <span class="xh-muted">7 of 48</span>
        <q-btn flat no-caps class="xh-linkbtn">
          Older
          <ChevronDownIcon :size="16" class="q-ml-xs" />
        </q-btn>
      </div>
    </template>

    <!-- 2 Day groups: sticky day headers with the day's net; icon rows keep the direction
         disc, and pending rings the circle instead of replacing the arrow. -->
    <template v-else-if="variant === 2">
      <div class="xh-seg" role="group" aria-label="Filter">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="xh-seg__btn"
          :aria-pressed="filter === f.value ? 'true' : 'false'"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
      <div>
        <section v-for="g in groups" :key="g.day" class="xh-group">
          <div class="xh-group__head">
            <span>{{ g.day }}</span>
            <span v-if="g.net" class="xh-num" dir="ltr">{{ g.net }}</span>
          </div>
          <div
            v-for="t in g.items"
            :key="t.id"
            class="xh-irow"
            :class="[`is-${t.status}`, `is-${t.dir}`]"
            tabindex="0"
          >
            <span class="xh-avatar">
              <component :is="methodIcon(t)" :size="20" />
              <span class="xh-avatar__dir" :class="`xh-avatar__dir--${t.dir}`">
                <component :is="dirIcon(t)" :size="13" :stroke-width="2.75" />
              </span>
            </span>
            <span class="xh-irow__main">
              <span class="xh-irow__line">
                <span class="xh-irow__label">{{ verb(t) }}</span>
                <span class="xh-irow__amt xh-num" dir="ltr">{{
                  signed(t)
                }}</span>
              </span>
              <span class="xh-irow__line xh-irow__sub">
                <span>{{ t.method }} · {{ t.time }}</span>
                <span v-if="t.status !== 'settled'" class="xh-flag">
                  <component :is="statusIcon(t)" :size="14" />
                  {{ statusWord(t) }}
                </span>
              </span>
            </span>
          </div>
        </section>
      </div>
      <q-btn flat no-caps class="xh-linkbtn xh-seeall">
        See all activity
        <ChevronRightIcon :size="16" class="q-ml-xs xh-flip" />
      </q-btn>
    </template>

    <!-- 3 Card per transaction: the amount leads, with a status pill and a check action on
         the pending card. -->
    <template v-else-if="variant === 3">
      <div class="xh-head">
        <span class="xh-title">Recent activity</span>
        <q-btn flat round class="xh-iconbtn" aria-label="Filter">
          <ListFilterIcon :size="20" />
        </q-btn>
      </div>
      <article
        v-for="t in rows"
        :key="t.id"
        class="xh-card"
        :class="[`is-${t.status}`, `is-${t.dir}`]"
        tabindex="0"
      >
        <div class="xh-card__top">
          <span class="xh-card__dir" :class="`xh-card__dir--${t.dir}`">
            <component :is="dirIcon(t)" :size="16" :stroke-width="2.25" />
            {{ verb(t) }} · {{ t.method }}
          </span>
          <span
            v-if="t.status !== 'settled'"
            class="xh-pill"
            :class="`xh-pill--${t.status}`"
          >
            <component :is="statusIcon(t)" :size="14" />
            {{ statusWord(t) }}
          </span>
          <span v-else class="xh-muted">{{ t.day }}, {{ t.time }}</span>
        </div>
        <div class="xh-card__amt xh-num" dir="ltr">
          {{ signed(t) }}
          <span class="xh-card__fiat">≈ {{ fiat(t) }}</span>
        </div>
        <div class="xh-card__foot">
          <span class="xh-muted">{{ t.mint }}</span>
          <q-btn
            v-if="t.status === 'pending'"
            outline
            no-caps
            class="xh-checkbtn"
          >
            <RotateCwIcon :size="16" class="q-mr-xs" />
            Check
          </q-btn>
          <span v-else-if="t.status === 'failed'" class="xh-muted">
            {{ t.day }}, {{ t.time }}
          </span>
        </div>
      </article>
      <q-btn outline no-caps class="xh-fullbtn">See all activity</q-btn>
    </template>

    <!-- 4 Timeline: a vertical line with a node per transaction; the node holds the arrow,
         its ring carries the status, and the line runs dashed into a pending node. -->
    <template v-else-if="variant === 4">
      <div class="xh-head">
        <span class="xh-title">Timeline</span>
        <div class="xh-textfilter" role="group" aria-label="Filter">
          <button
            v-for="f in filters.slice(0, 2)"
            :key="f.value"
            type="button"
            class="xh-textfilter__btn"
            :aria-pressed="filter === f.value ? 'true' : 'false'"
            @click="filter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
      <ol class="xh-tl">
        <template v-for="g in groups" :key="g.day">
          <li class="xh-tl__day">{{ g.day }}</li>
          <li
            v-for="t in g.items"
            :key="t.id"
            class="xh-tl__item"
            :class="[`is-${t.status}`, `is-${t.dir}`]"
            tabindex="0"
          >
            <span class="xh-tl__node" :class="`xh-tl__node--${t.dir}`">
              <component :is="dirIcon(t)" :size="16" :stroke-width="2.5" />
            </span>
            <span class="xh-tl__body">
              <span class="xh-tl__line">
                <span class="xh-tl__label">{{
                  t.status === "failed"
                    ? `${t.method} invoice`
                    : `${verb(t)} ${t.method}`
                }}</span>
                <span class="xh-tl__amt xh-num" dir="ltr">{{ signed(t) }}</span>
              </span>
              <span class="xh-tl__line xh-tl__sub">
                <span>{{ t.time }} · {{ t.mint }}</span>
                <span v-if="t.status !== 'settled'" class="xh-flag">
                  {{ statusWord(t) }}
                </span>
              </span>
            </span>
          </li>
        </template>
        <li class="xh-tl__more">
          <q-btn flat no-caps class="xh-linkbtn">
            <span class="xh-tl__morenode"><ChevronDownIcon :size="16" /></span>
            Load earlier
          </q-btn>
        </li>
      </ol>
    </template>

    <!-- 5 Text only: two lines, no icons. Tense carries the state (Sent / Sending) and the
         sign carries direction; hairlines separate rows. -->
    <template v-else-if="variant === 5">
      <div class="xh-head">
        <span class="xh-title">Activity</span>
        <q-btn flat no-caps class="xh-linkbtn">
          {{ filter === "pending" ? "Pending" : "All" }}
          <ChevronDownIcon :size="16" class="q-ml-xs" />
        </q-btn>
      </div>
      <div
        v-for="t in rows"
        :key="t.id"
        class="xh-trow"
        :class="[`is-${t.status}`, `is-${t.dir}`]"
        tabindex="0"
      >
        <div class="xh-trow__line">
          <span class="xh-trow__verb">
            {{ tenseVerb(t) }}
          </span>
          <span class="xh-trow__amt xh-num" dir="ltr">{{ signed(t) }}</span>
        </div>
        <div class="xh-trow__line xh-trow__sub">
          <span>{{ t.method }} · {{ t.mint }} · {{ t.day }}</span>
          <span class="xh-trow__state">{{ textState(t) }}</span>
        </div>
      </div>
      <q-btn flat no-caps class="xh-linkbtn xh-seeall">Show 20 more</q-btn>
    </template>

    <!-- 6 Split columns: money in and money out side by side, each with its own total. -->
    <template v-else-if="variant === 6">
      <div class="xh-split">
        <section
          v-for="col in columns"
          :key="col.dir"
          class="xh-col"
          :class="`xh-col--${col.dir}`"
        >
          <header class="xh-col__head">
            <span class="xh-col__name">
              <component :is="col.icon" :size="16" :stroke-width="2.25" />
              {{ col.name }}
            </span>
            <span class="xh-col__total xh-num" dir="ltr">{{ col.total }}</span>
            <span class="xh-muted">since 10 Oct</span>
          </header>
          <div
            v-for="t in col.items"
            :key="t.id"
            class="xh-tile"
            :class="[`is-${t.status}`, `is-${t.dir}`]"
            tabindex="0"
          >
            <span class="xh-tile__amt xh-num" dir="ltr">{{ signed(t) }}</span>
            <span class="xh-tile__meta">
              <component :is="methodIcon(t)" :size="14" />
              {{ t.method }} · {{ t.day }}
            </span>
            <span
              v-if="t.status !== 'settled'"
              class="xh-pill"
              :class="`xh-pill--${t.status}`"
            >
              <component :is="statusIcon(t)" :size="14" />
              {{ statusWord(t) }}
            </span>
          </div>
        </section>
      </div>
      <q-btn flat no-caps class="xh-linkbtn xh-seeall">
        See all activity
        <ChevronRightIcon :size="16" class="q-ml-xs xh-flip" />
      </q-btn>
    </template>

    <!-- 7 Summary strip: in, out and pending totals over a diverging daily bar strip, then
         rows led by a direction disc with status pills, and a pager. -->
    <template v-else-if="variant === 7">
      <div class="xh-summary">
        <div class="xh-summary__totals">
          <span
            v-for="s in summary"
            :key="s.label"
            class="xh-summary__stat"
            :class="`xh-summary__stat--${s.key}`"
          >
            <span class="xh-summary__label">
              <span class="xh-swatch" />
              {{ s.label }}
            </span>
            <span class="xh-summary__value xh-num" dir="ltr">{{
              s.value
            }}</span>
          </span>
        </div>
        <div class="xh-bars" role="img" :aria-label="barsLabel">
          <span v-for="d in bars" :key="d.n" class="xh-bars__day">
            <span class="xh-bars__up">
              <span
                v-if="d.in"
                class="xh-bar xh-bar--in"
                :style="{ height: barH(d.in) }"
              />
            </span>
            <span class="xh-bars__down">
              <span
                v-if="d.out"
                class="xh-bar xh-bar--out"
                :style="{ height: barH(d.out) }"
              />
              <span
                v-if="d.pending"
                class="xh-bar xh-bar--pending"
                :style="{ height: barH(d.pending) }"
              />
            </span>
          </span>
        </div>
        <div class="xh-bars__axis">
          <span>10 Oct</span>
          <span>Today</span>
        </div>
      </div>
      <div class="xh-seg" role="group" aria-label="Filter">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="xh-seg__btn"
          :aria-pressed="filter === f.value ? 'true' : 'false'"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
      <div
        v-for="t in rows"
        :key="t.id"
        class="xh-drow"
        :class="[`is-${t.status}`, `is-${t.dir}`]"
        tabindex="0"
      >
        <span class="xh-disc" :class="`xh-disc--${t.dir}`">
          <component :is="dirIcon(t)" :size="20" :stroke-width="2.25" />
        </span>
        <span class="xh-drow__main">
          <span class="xh-drow__label">{{ verb(t) }}</span>
          <span class="xh-muted">{{ t.method }} · {{ t.day }}</span>
        </span>
        <span class="xh-drow__end">
          <span class="xh-drow__amt xh-num" dir="ltr">{{ signed(t) }}</span>
          <span
            v-if="t.status !== 'settled'"
            class="xh-pill"
            :class="`xh-pill--${t.status}`"
          >
            <component :is="statusIcon(t)" :size="14" />
            {{ statusWord(t) }}
          </span>
          <span v-else class="xh-muted">{{ t.time }}</span>
        </span>
      </div>
      <div class="xh-pager">
        <q-btn flat round class="xh-iconbtn" aria-label="Previous page" disable>
          <ChevronLeftIcon :size="20" class="xh-flip" />
        </q-btn>
        <span class="xh-muted">Page 1 of 7</span>
        <q-btn flat round class="xh-iconbtn" aria-label="Next page">
          <ChevronRightIcon :size="20" class="xh-flip" />
        </q-btn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type Component } from "vue";
import {
  ArrowDownLeft as ArrowDownLeftIcon,
  ArrowUpRight as ArrowUpRightIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CircleX as CircleXIcon,
  Clock as ClockIcon,
  Coins as CoinsIcon,
  ListFilter as ListFilterIcon,
  RotateCw as RotateCwIcon,
  Zap as ZapIcon,
} from "lucide-vue-next";

export const historyVariants = [
  "Current: icon rows, pager",
  "Dense ledger",
  "Day groups",
  "Card per payment",
  "Timeline",
  "Text only",
  "In and out columns",
  "Summary strip",
];

type Dir = "in" | "out";
type Status = "settled" | "pending" | "failed";
type Filter = "all" | "pending" | "in" | "out";
interface Tx {
  id: number;
  dir: Dir;
  method: "Lightning" | "Ecash";
  amount: number;
  status: Status;
  day: string;
  date: string;
  time: string;
  mint: string;
}

// 1 BTC = 100,000 USD in the test data, so ₿1 = $0.001.
const SPECIMEN: Tx[] = [
  {
    id: 1,
    dir: "in",
    method: "Lightning",
    amount: 5000,
    status: "settled",
    day: "Today",
    date: "28 Oct",
    time: "14:02",
    mint: "mint.example.com",
  },
  {
    id: 2,
    dir: "out",
    method: "Ecash",
    amount: 210,
    status: "pending",
    day: "Today",
    date: "28 Oct",
    time: "13:40",
    mint: "mint.example.com",
  },
  {
    id: 3,
    dir: "out",
    method: "Lightning",
    amount: 101,
    status: "settled",
    day: "Yesterday",
    date: "27 Oct",
    time: "18:15",
    mint: "mint.example.com",
  },
  {
    id: 4,
    dir: "in",
    method: "Ecash",
    amount: 500,
    status: "settled",
    day: "Yesterday",
    date: "27 Oct",
    time: "09:31",
    mint: "stable.example.com",
  },
  {
    id: 5,
    dir: "in",
    method: "Lightning",
    amount: 1000,
    status: "failed",
    day: "Monday",
    date: "26 Oct",
    time: "11:20",
    mint: "mint.example.com",
  },
  {
    id: 6,
    dir: "in",
    method: "Ecash",
    amount: 2289,
    status: "settled",
    day: "12 Oct",
    date: "12 Oct",
    time: "20:47",
    mint: "stable.example.com",
  },
  {
    id: 7,
    dir: "out",
    method: "Lightning",
    amount: 42,
    status: "settled",
    day: "10 Oct",
    date: "10 Oct",
    time: "08:05",
    mint: "mint.example.com",
  },
];

const fmt = (n: number) => "₿" + Math.abs(n).toLocaleString("en-US");

export default defineComponent({
  name: "HistoryExplorations",
  components: {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ListFilterIcon,
    RotateCwIcon,
  },
  props: {
    variant: { type: Number, default: 0 },
  },
  data() {
    return {
      filter: "all" as Filter,
      filters: [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "in", label: "Received" },
        { value: "out", label: "Sent" },
      ] as { value: Filter; label: string }[],
      // Daily totals from 10 Oct to today (19 days), for the summary strip.
      bars: Array.from({ length: 19 }, (_, n) => ({
        n,
        in: { 2: 2289, 18: 5000, 17: 500 }[n] ?? 0,
        out: { 0: 42, 17: 101 }[n] ?? 0,
        pending: n === 18 ? 210 : 0,
      })),
    };
  },
  computed: {
    rows(): Tx[] {
      const f = this.filter;
      if (f === "all") return SPECIMEN;
      if (f === "pending")
        return SPECIMEN.filter((t) => t.status === "pending");
      return SPECIMEN.filter((t) => t.dir === f);
    },
    groups(): { day: string; net: string; items: Tx[] }[] {
      const out: { day: string; net: string; items: Tx[] }[] = [];
      for (const t of this.rows) {
        let g = out.find((x) => x.day === t.day);
        if (!g) out.push((g = { day: t.day, net: "", items: [] }));
        g.items.push(t);
      }
      for (const g of out) {
        const net = g.items
          .filter((t) => t.status === "settled")
          .reduce((s, t) => s + (t.dir === "in" ? t.amount : -t.amount), 0);
        g.net = net ? (net > 0 ? "+" : "−") + fmt(net) : "";
      }
      return out;
    },
    columns(): {
      dir: Dir;
      name: string;
      icon: Component;
      total: string;
      items: Tx[];
    }[] {
      return (["in", "out"] as Dir[]).map((dir) => {
        const items = SPECIMEN.filter((t) => t.dir === dir);
        const total = items
          .filter((t) => t.status === "settled")
          .reduce((s, t) => s + t.amount, 0);
        return {
          dir,
          name: dir === "in" ? "Received" : "Sent",
          icon: dir === "in" ? ArrowDownLeftIcon : ArrowUpRightIcon,
          total: fmt(total),
          items,
        };
      });
    },
    summary(): { key: string; label: string; value: string }[] {
      return [
        { key: "in", label: "Received", value: "+₿7,789" },
        { key: "out", label: "Sent", value: "−₿143" },
        { key: "pending", label: "Pending", value: "−₿210" },
      ];
    },
    barsLabel(): string {
      return "Daily activity since 10 Oct: received ₿7,789, sent ₿143, ₿210 pending.";
    },
  },
  methods: {
    signed(t: Tx): string {
      return (t.dir === "in" ? "+" : "−") + fmt(t.amount);
    },
    fiat(t: Tx): string {
      return "$" + (t.amount / 1000).toFixed(2);
    },
    dirIcon(t: Tx): Component {
      return t.dir === "in" ? ArrowDownLeftIcon : ArrowUpRightIcon;
    },
    methodIcon(t: Tx): Component {
      return t.method === "Lightning" ? ZapIcon : CoinsIcon;
    },
    statusIcon(t: Tx): Component {
      return t.status === "failed" ? CircleXIcon : ClockIcon;
    },
    statusWord(t: Tx): string {
      return t.status === "failed" ? "Expired" : "Pending";
    },
    verb(t: Tx): string {
      if (t.status === "failed") return "Invoice";
      return t.dir === "in" ? "Received" : "Sent";
    },
    // Text only: the tense says whether it has happened.
    tenseVerb(t: Tx): string {
      if (t.status === "pending")
        return t.dir === "in" ? "Receiving" : "Sending";
      if (t.status === "failed") return "Invoice expired";
      return this.verb(t);
    },
    textState(t: Tx): string {
      if (t.status === "pending") return "Not settled yet";
      if (t.status === "failed") return "Not received";
      return t.time;
    },
    barH(v: number): string {
      return `${Math.round(4 + 30 * Math.sqrt(v / 5000))}px`;
    },
  },
});
</script>

<style scoped>
.xh {
  --in: var(--app-success);
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  font-size: 14px;
  text-align: start;
  width: 100%;
}
.xh-num {
  font-variant-numeric: tabular-nums;
}
.xh-muted {
  color: var(--app-text-muted);
  font-size: 13px;
}
.xh-flip:dir(rtl) {
  transform: scaleX(-1);
}

/* Shared bits: list header, text filters, segment, link buttons, pills, flags. */
.xh-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 44px;
}
.xh-title {
  font-size: 16px;
  font-weight: 600;
}
.xh-textfilter {
  display: flex;
  gap: 2px;
}
.xh-textfilter__btn {
  background: none;
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  min-height: 40px;
  padding: 0 12px;
}
.xh-textfilter__btn[aria-pressed="true"] {
  background: var(--app-tint-strong);
  color: var(--app-text);
  font-weight: 600;
}
.xh-seg {
  background: var(--app-tint);
  border-radius: var(--app-radius-pill);
  display: flex;
  gap: 2px;
  padding: 2px;
}
.xh-seg__btn {
  background: none;
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  flex: 1;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  min-height: 40px;
}
.xh-seg__btn[aria-pressed="true"] {
  background: var(--app-raised);
  box-shadow: 0 0 0 1px var(--app-border);
  color: var(--app-text);
  font-weight: 600;
}
.xh-linkbtn {
  color: var(--app-text-muted);
  font-size: 14px;
  font-weight: 500;
  min-height: 44px;
}
.xh-seeall {
  align-self: center;
  margin-top: 8px;
}
.xh-iconbtn {
  color: var(--app-text-muted);
  height: 44px;
  min-height: 44px;
  width: 44px;
}
.xh-flag {
  align-items: center;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
  white-space: nowrap;
}
.is-pending .xh-flag {
  color: var(--app-warning);
}
.is-failed .xh-flag {
  color: var(--app-danger);
}
.xh-pill {
  align-items: center;
  border-radius: var(--app-radius-pill);
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
  line-height: 22px;
  padding: 0 8px;
  white-space: nowrap;
}
.xh-pill--pending {
  background: color-mix(in srgb, var(--app-warning) 16%, transparent);
  color: var(--app-warning);
}
.xh-pill--failed {
  background: color-mix(in srgb, var(--app-danger) 14%, transparent);
  color: var(--app-danger);
}
.xh-dir--in {
  color: var(--in);
}
.xh-dir--out {
  color: var(--app-text);
}

/* Shared amount states: settled is full ink (in: success), pending drops to muted with a
   dotted underline (not counted yet), failed is struck through in subtle ink. */
.is-settled.is-in [class*="__amt"] {
  color: var(--in);
}
.is-pending [class*="__amt"] {
  color: var(--app-text-muted);
  text-decoration: underline dotted;
  text-decoration-color: var(--app-warning);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.is-failed [class*="__amt"] {
  color: var(--app-text-subtle);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

/* 1 Dense ledger */
.xh-ledger__cols,
.xh-ledger__row {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 64px 1fr auto;
}
.xh-ledger__cols {
  border-bottom: 1px solid var(--app-border-strong);
  color: var(--app-text-subtle);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 0;
}
.xh-ledger__row {
  border-bottom: 1px solid var(--app-border);
  min-height: 48px;
  padding: 4px 0;
}
.xh-ledger__date {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  line-height: 1.25;
}
.xh-ledger__time {
  color: var(--app-text-subtle);
  font-size: 12px;
}
.xh-ledger__what {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}
.xh-ledger__label {
  font-weight: 500;
}
.xh-ledger__amt {
  font-size: 15px;
  font-weight: 600;
  text-align: end;
}
.xh-ledger__foot {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

/* 2 Day groups */
.xh--v2 {
  gap: 8px;
}
.xh-group__head {
  align-items: center;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
  color: var(--app-text-muted);
  display: flex;
  font-size: 13px;
  font-weight: 600;
  justify-content: space-between;
  min-height: 36px;
  position: sticky;
  top: 0;
  z-index: 1;
}
.xh-irow {
  align-items: center;
  display: flex;
  gap: 16px;
  min-height: 64px;
}
.xh-avatar {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  position: relative;
  width: 40px;
}
.is-pending .xh-avatar {
  background: transparent;
  outline: 2px dashed var(--app-warning);
  outline-offset: -2px;
}
.is-failed .xh-avatar {
  background: var(--app-tint);
  color: var(--app-text-subtle);
}
.xh-avatar__dir {
  align-items: center;
  background: var(--app-text);
  border: 2px solid var(--app-surface);
  border-radius: 50%;
  bottom: -5px;
  color: var(--app-surface);
  display: flex;
  height: 22px;
  inset-inline-end: -5px;
  justify-content: center;
  position: absolute;
  width: 22px;
}
.xh-avatar__dir--in {
  background: var(--in);
}
.is-pending .xh-avatar__dir {
  background: var(--app-warning);
}
.is-failed .xh-avatar__dir {
  background: var(--app-danger);
}
.xh-irow__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.xh-irow__line {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
}
.xh-irow__label {
  font-size: 16px;
  font-weight: 500;
}
.xh-irow__amt {
  font-size: 16px;
  font-weight: 700;
}
.xh-irow__sub {
  color: var(--app-text-muted);
  font-size: 13px;
  min-height: 20px;
}

/* 3 Card per payment */
.xh--v3 {
  gap: 10px;
}
.xh-card {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
}
.xh-card.is-pending {
  border: 1.5px dashed color-mix(in srgb, var(--app-warning) 70%, transparent);
}
.xh-card.is-failed {
  background: transparent;
  border-color: var(--app-border);
}
.xh-card__top,
.xh-card__foot {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  min-height: 24px;
}
.xh-card__dir {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
}
.xh-card__dir svg {
  color: var(--app-text);
}
.xh-card__dir--in svg {
  color: var(--in);
}
.xh-card.is-failed .xh-card__dir svg {
  color: var(--app-text-subtle);
}
.xh-card__amt {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}
.xh-card__fiat {
  color: var(--app-text-subtle);
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  margin-inline-start: 6px;
  text-decoration: none;
}
.xh-checkbtn {
  border-radius: var(--app-radius-pill);
  font-size: 13px;
  min-height: 40px;
  padding: 0 14px;
}
.xh-fullbtn {
  border-radius: var(--app-radius-pill);
  font-weight: 600;
  margin-top: 4px;
  min-height: 52px;
}

/* 4 Timeline */
.xh-tl {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  position: relative;
}
.xh-tl::before {
  background: var(--app-border-strong);
  bottom: 22px;
  content: "";
  inset-inline-start: 15px;
  position: absolute;
  top: 8px;
  width: 2px;
}
.xh-tl__day {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 600;
  padding-block: 10px 6px;
  padding-inline: 48px 0;
  position: relative;
}
.xh-tl__day::before {
  background: var(--app-surface);
  border: 2px solid var(--app-border-strong);
  border-radius: 50%;
  content: "";
  height: 10px;
  inset-inline-start: 11px;
  position: absolute;
  top: 14px;
  width: 10px;
}
.xh-tl__item {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  min-height: 56px;
  padding: 4px 0 8px;
  position: relative;
}
.xh-tl__node {
  align-items: center;
  background: color-mix(in srgb, var(--app-text) 14%, var(--app-surface));
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--app-surface);
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  position: relative;
  width: 32px;
}
.xh-tl__node--in {
  background: color-mix(in srgb, var(--in) 18%, var(--app-surface));
  color: var(--in);
}
.is-pending .xh-tl__node {
  background: var(--app-surface);
  border: 2px dashed var(--app-warning);
  color: var(--app-warning);
}
.is-failed .xh-tl__node {
  background: var(--app-surface);
  border: 2px solid var(--app-danger);
  color: var(--app-danger);
}
/* The line runs dashed into a pending node: not there yet. */
.xh-tl__item.is-pending::before {
  border-inline-start: 2px dashed var(--app-warning);
  content: "";
  inset-inline-start: 15px;
  position: absolute;
  top: -12px;
  height: 16px;
}
.xh-tl__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding-top: 4px;
}
.xh-tl__line {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
}
.xh-tl__label {
  font-weight: 500;
}
.xh-tl__amt {
  font-weight: 700;
}
.xh-tl__sub {
  color: var(--app-text-muted);
  font-size: 13px;
}
.xh-tl__more .xh-linkbtn {
  margin-inline-start: -8px;
  padding-inline: 8px;
}
.xh-tl__morenode {
  align-items: center;
  background: var(--app-surface);
  border: 2px solid var(--app-border-strong);
  border-radius: 50%;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  margin-inline-end: 16px;
  width: 32px;
}

/* 5 Text only */
.xh-trow {
  border-bottom: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 0;
}
.xh-trow:first-of-type {
  border-top: 1px solid var(--app-border);
}
.xh-trow__line {
  align-items: baseline;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.xh-trow__verb {
  font-size: 16px;
  font-weight: 600;
}
.xh-trow__amt {
  font-size: 16px;
  font-weight: 600;
}
.xh-trow__sub {
  color: var(--app-text-muted);
  font-size: 13px;
}
.xh-trow.is-pending .xh-trow__verb,
.xh-trow.is-pending .xh-trow__state {
  color: var(--app-warning);
}
.xh-trow.is-failed .xh-trow__verb,
.xh-trow.is-failed .xh-trow__state {
  color: var(--app-danger);
}
.xh-trow__state {
  white-space: nowrap;
}

/* 6 In and out columns */
.xh-split {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}
.xh-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.xh-col__head {
  border-bottom: 2px solid var(--app-text);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
}
.xh-col--in .xh-col__head {
  border-bottom-color: var(--in);
}
.xh-col__name {
  align-items: center;
  display: inline-flex;
  font-size: 13px;
  font-weight: 600;
  gap: 6px;
}
.xh-col--in .xh-col__name svg {
  color: var(--in);
}
.xh-col__total {
  font-size: 20px;
  font-weight: 700;
}
.xh-tile {
  align-items: flex-start;
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
}
.xh-tile.is-pending {
  border: 1.5px dashed color-mix(in srgb, var(--app-warning) 70%, transparent);
}
.xh-tile.is-failed {
  background: transparent;
  border-color: var(--app-border);
}
.xh-tile__amt {
  font-size: 16px;
  font-weight: 700;
}
.xh-tile__meta {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  font-size: 13px;
  gap: 4px;
}

/* 7 Summary strip */
.xh--v7 {
  gap: 12px;
}
.xh-summary {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  padding: 14px 16px 10px;
}
.xh-summary__totals {
  display: flex;
  gap: 20px;
}
.xh-summary__stat {
  display: flex;
  flex-direction: column;
}
.xh-summary__label {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  font-size: 12px;
  gap: 6px;
}
.xh-swatch {
  background: var(--app-text);
  border-radius: 2px;
  height: 8px;
  width: 8px;
}
.xh-summary__stat--in .xh-swatch {
  background: var(--in);
}
.xh-summary__stat--pending .xh-swatch {
  background: transparent;
  border: 1.5px dashed var(--app-warning);
}
.xh-summary__value {
  font-size: 18px;
  font-weight: 700;
}
.xh-summary__stat--pending .xh-summary__value {
  color: var(--app-text-muted);
}
.xh-bars {
  background: linear-gradient(
      var(--app-border-strong),
      var(--app-border-strong)
    )
    0 36px / 100% 1px no-repeat;
  display: flex;
  gap: 4px;
  margin-top: 12px;
}
.xh-bars__day {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.xh-bars__up,
.xh-bars__down {
  display: flex;
  gap: 1px;
  height: 36px;
}
.xh-bars__up {
  align-items: flex-end;
}
.xh-bars__down {
  align-items: flex-start;
  height: 20px;
  padding-top: 1px;
}
.xh-bar {
  border-radius: 2px;
  flex: 1;
}
.xh-bar--in {
  background: var(--in);
  border-radius: 2px 2px 0 0;
}
.xh-bar--out {
  background: var(--app-text);
  border-radius: 0 0 2px 2px;
}
.xh-bar--pending {
  border: 1.5px dashed var(--app-warning);
  border-radius: 0 0 2px 2px;
  border-top: 0;
}
.xh-bars__axis {
  color: var(--app-text-subtle);
  display: flex;
  font-size: 12px;
  justify-content: space-between;
  margin-top: 4px;
}
.xh-drow {
  align-items: center;
  display: flex;
  gap: 14px;
  min-height: 60px;
}
.xh-disc {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  width: 40px;
}
.xh-disc--in {
  background: color-mix(in srgb, var(--in) 18%, var(--app-surface));
  color: var(--in);
}
.is-pending .xh-disc {
  background: color-mix(in srgb, var(--app-warning) 16%, var(--app-surface));
  color: var(--app-warning);
}
.is-failed .xh-disc {
  background: color-mix(in srgb, var(--app-danger) 14%, var(--app-surface));
  color: var(--app-danger);
}
.xh-drow__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.xh-drow__label {
  font-size: 16px;
  font-weight: 500;
}
.xh-drow__end {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.xh-drow__amt {
  font-size: 16px;
  font-weight: 700;
}
.xh-pager {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
