<!-- Dev-only exploration (owner 2026-11-01): ten alternatives (1-10) to the history filter
     (0, what ships: chips and a count on the start edge, a filter icon on the end edge, a
     bottom sheet of single-choice groups). Each is shown on a static copy of the wallet home's
     lower half (balance, Receive/Send, the History tab and its rows) with the same in-memory
     payments, filtered to "pending ecash" where the variant has a filtered state.
     `?open=1` shows the variant's controls open. Static demo data, no stores; new English
     words are marked where a variant needs them. -->
<template>
  <div class="xh flow-surface column no-wrap" :class="`xh--v${variant}`">
    <div class="xh-top column items-center">
      <div class="xh-balance">₿2,289</div>
      <div class="xh-fiat text-app-muted">$1.83</div>
      <WalletActions class="xh-actions" />
    </div>

    <q-tabs
      :model-value="'history'"
      no-caps
      class="bg-transparent wallet-tabs"
      active-class="wallet-tab--active"
      indicator-color="primary"
    >
      <q-tab name="history" :label="$t('WalletPage.tabs.history.label')" />
      <q-tab name="mints" :label="$t('WalletPage.tabs.mints.label')" />
    </q-tabs>

    <div class="xh-panel">
      <!-- 9 Sub-tabs: All and Pending as a second, quieter tab row, the rest behind the icon. -->
      <div v-if="variant === 9" class="xh-toolbar">
        <SegmentedControl
          :model-value="f.status === 'pending' ? 'pending' : 'all'"
          :options="[
            { value: 'all', label: t('all') },
            { value: 'pending', label: $t('common.pending') },
          ]"
          label="Status"
        />
        <IconButton
          class="xh-end"
          :icon="ListFilterIcon"
          :label="t('title')"
          :class="{ 'xh-dot': f.type !== 'all' }"
        />
      </div>

      <!-- 2 Quick status: the common question as a segmented control, the rest in the sheet. -->
      <div v-else-if="variant === 2" class="xh-toolbar">
        <SegmentedControl
          block
          class="xh-grow"
          :model-value="f.status"
          :options="statusOptions"
          label="Status"
        />
        <IconButton
          :icon="ListFilterIcon"
          :label="t('title')"
          :class="{ 'xh-dot': f.type !== 'all' }"
        />
      </div>

      <!-- 3 Chip bar: every choice always visible as a scrolling row of toggle chips. -->
      <div v-else-if="variant === 3" class="xh-chipbar">
        <button
          v-for="c in chipBar"
          :key="c.key"
          type="button"
          class="xh-chip"
          :class="{ 'xh-chip--on': c.on }"
          :aria-pressed="c.on"
        >
          <CheckIcon v-if="c.on" :size="14" aria-hidden="true" />{{ c.label }}
        </button>
      </div>

      <!-- 4 Group dropdowns: Status ▾ Direction ▾ Type ▾, each naming its choice. -->
      <div v-else-if="variant === 4" class="xh-chipbar">
        <button
          v-for="g in groupButtons"
          :key="g.key"
          type="button"
          class="xh-chip"
          :class="{ 'xh-chip--on': g.on }"
        >
          {{ g.label }}
          <ChevronDownIcon :size="14" aria-hidden="true" />
        </button>
      </div>

      <!-- 5 Search: a field that also searches labels and memos (new behaviour), with the
           filter icon inside it; active filters as chips under it. -->
      <div v-else-if="variant === 5" class="xh-search-wrap">
        <q-input
          outlined
          dense
          class="xh-search"
          :model-value="''"
          placeholder="Search payments"
        >
          <template #prepend><SearchIcon :size="18" /></template>
          <template #append>
            <IconButton
              :icon="ListFilterIcon"
              :label="t('title')"
              class="xh-dot"
            />
          </template>
        </q-input>
        <div class="xh-chips">
          <span v-for="c in activeChips" :key="c" class="xh-chip xh-chip--on"
            >{{ c }} <XIcon :size="14"
          /></span>
        </div>
      </div>

      <!-- 8 Menu: the filter is the ⋯-style menu with radio items; the state is one line. -->
      <div v-else-if="variant === 8" class="xh-toolbar">
        <div class="xh-summary">
          {{ activeChips.join(" · ") }}
          <button type="button" class="xh-clear">
            <XIcon :size="14" aria-hidden="true" />
          </button>
        </div>
        <IconButton
          class="xh-end xh-dot"
          :icon="ListFilterIcon"
          :label="t('title')"
        />
      </div>

      <!-- 10 Sentence: what the list shows, in words, with Edit. -->
      <div v-else-if="variant === 10" class="xh-sentence">
        <span
          >Showing <b>pending ecash</b> ·
          {{ t("count", { shown: shown.length, total: all.length }) }}</span
        >
        <button type="button" class="xh-link">Edit</button>
      </div>

      <!-- 7 Panel: the groups open in place above the list instead of in a sheet. -->
      <template v-else-if="variant === 7">
        <div class="xh-toolbar">
          <div class="xh-chips xh-grow">
            <span v-for="c in activeChips" :key="c" class="xh-chip xh-chip--on"
              >{{ c }} <XIcon :size="14"
            /></span>
          </div>
          <IconButton
            class="xh-end"
            :icon="open ? ChevronUpIcon : ListFilterIcon"
            :label="t('title')"
          />
        </div>
        <div v-if="open" class="xh-inline-panel">
          <SegmentedControl
            block
            :model-value="f.status"
            :options="statusOptions"
            label="Status"
          />
          <SegmentedControl
            block
            :model-value="f.direction"
            :options="directionOptions"
            label="Direction"
          />
          <SegmentedControl
            block
            :model-value="f.type"
            :options="typeOptions"
            label="Type"
          />
        </div>
      </template>

      <!-- 0 current, 1 polish, 6 checklist sheet: chips and count, the icon at the end. -->
      <div v-else class="xh-toolbar">
        <div class="xh-chips xh-grow">
          <span v-for="c in activeChips" :key="c" class="xh-chip xh-chip--on"
            >{{ c }} <XIcon :size="14"
          /></span>
          <span v-if="variant !== 1" class="xh-count">{{
            t("count", { shown: shown.length, total: all.length })
          }}</span>
          <button v-else type="button" class="xh-link">
            {{ t("clear_all") }}
          </button>
        </div>
        <span class="xh-end xh-badge-wrap">
          <IconButton
            :icon="ListFilterIcon"
            :label="t('title')"
            :class="{ 'xh-dot': variant !== 1 }"
          />
          <span v-if="variant === 1" class="xh-badge">2</span>
        </span>
      </div>

      <q-list>
        <ActivityRow
          v-for="tx in shown"
          :key="tx.id"
          :direction="tx.amount >= 0 ? 'in' : 'out'"
          :label="tx.label"
          :amount="
            (tx.amount >= 0 ? '+' : '−') +
            '₿' +
            Math.abs(tx.amount).toLocaleString('en-US')
          "
          :pending="tx.status === 'pending'"
          :caption="[tx.kind, tx.when]"
          caption-class="text-app-muted"
        />
      </q-list>
    </div>

    <!-- The sheet (0, 1, 2, 5, 9 advanced; 6 as checklist rows). -->
    <BottomSheet
      v-if="open && [0, 1, 2, 5, 6, 9].includes(variant)"
      :model-value="true"
      :title="t('title')"
    >
      <div class="xh-sheet">
        <template v-if="variant === 6">
          <section v-for="g in sheetGroups" :key="g.label">
            <SectionDivider :label="g.label" />
            <div role="listbox" class="xh-options">
              <SheetOption
                v-for="o in g.options"
                :key="String(o.value)"
                :label="o.label"
                :selected="o.value === g.value"
              />
            </div>
          </section>
        </template>
        <template v-else>
          <section
            v-for="g in sheetGroups.filter(
              (g) => !(variant === 2 && g.key === 'status')
            )"
            :key="g.label"
          >
            <SectionDivider :label="g.label" />
            <SegmentedControl
              block
              :model-value="g.value"
              :options="g.options"
              :label="g.label"
            />
          </section>
        </template>
      </div>
      <template #actions>
        <div class="column full-width" style="gap: 8px">
          <q-btn unelevated rounded color="primary" class="full-width">{{
            t("show_results", { count: shown.length })
          }}</q-btn>
          <q-btn flat rounded class="full-width">{{ t("reset") }}</q-btn>
        </div>
      </template>
    </BottomSheet>

    <!-- 3, 4 and 8 open as the app's menu (a bottom sheet on a phone). -->
    <BottomSheet
      v-if="open && [4, 8].includes(variant)"
      :model-value="true"
      :title="variant === 4 ? $t('QuoteInformation.status') : t('title')"
    >
      <div class="xh-sheet">
        <template
          v-for="g in variant === 4 ? sheetGroups.slice(0, 1) : sheetGroups"
          :key="g.label"
        >
          <SectionDivider v-if="variant === 8" :label="g.label" />
          <div role="listbox" class="xh-options">
            <SheetOption
              v-for="o in g.options"
              :key="String(o.value)"
              :label="o.label"
              :selected="o.value === g.value"
            />
          </div>
        </template>
      </div>
    </BottomSheet>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import {
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ListFilter as ListFilterIcon,
  Search as SearchIcon,
  X as XIcon,
} from "lucide-vue-next";
import ActivityRow from "src/components/ActivityRow.vue";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import WalletActions from "src/components/WalletActions.vue";
import IconButton from "src/components/ui/IconButton.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import SegmentedControl from "src/components/ui/SegmentedControl.vue";
import {
  HISTORY_FILTER_LABEL_KEYS,
  matchesHistoryFilters,
  type HistoryFilters,
} from "src/js/history-filters";

export const historyFilterVariants = [
  "Current: chips + count, filter icon, segmented sheet",
  "Polish: count badge on the icon, Clear all instead of the count",
  "Quick status: segmented Status above the list, the rest in the sheet",
  "Chip bar: every choice as an always-visible toggle chip",
  "Group dropdowns: Status ▾ Direction ▾ Type ▾",
  "Search field with the filter inside it",
  "Checklist sheet: radio rows instead of segmented controls",
  "Inline panel: the groups open in place above the list",
  "Menu: radio menu, state as one summary line",
  "Sub-tabs: All / Pending, the rest behind the icon",
  "Sentence: 'Showing pending ecash · 2 of 9' with Edit",
];

const day = 86400000;
const now = Date.now();

export default defineComponent({
  name: "HistoryFilterExplorations",
  components: {
    ActivityRow,
    BottomSheet,
    CheckIcon,
    ChevronDownIcon,
    IconButton,
    SearchIcon,
    SectionDivider,
    SegmentedControl,
    SheetOption,
    WalletActions,
    XIcon,
  },
  props: {
    variant: { type: Number, default: 0 },
    screen: { type: String, default: "list" },
  },
  data() {
    return {
      ListFilterIcon: markRaw(ListFilterIcon),
      ChevronUpIcon: markRaw(ChevronUpIcon),
      all: [
        {
          id: 1,
          label: "Sending",
          amount: -500,
          status: "pending",
          type: "ecash",
          kind: "Ecash",
          when: "2 min ago",
        },
        {
          id: 2,
          label: "Received",
          amount: 2100,
          status: "paid",
          type: "lightning",
          kind: "Lightning",
          when: "1 h ago",
        },
        {
          id: 3,
          label: "Receiving",
          amount: 300,
          status: "pending",
          type: "ecash",
          kind: "Ecash",
          when: "3 h ago",
        },
        {
          id: 4,
          label: "Sent",
          amount: -40,
          status: "paid",
          type: "onchain",
          kind: "On-chain",
          when: "Yesterday",
        },
        {
          id: 5,
          label: "Paid",
          amount: -1000,
          status: "pending",
          type: "lightning",
          kind: "Lightning",
          when: "2 days ago",
        },
        {
          id: 6,
          label: "Received",
          amount: 5000,
          status: "paid",
          type: "ecash",
          kind: "Ecash",
          when: "3 days ago",
        },
        {
          id: 7,
          label: "Sent",
          amount: -2600,
          status: "paid",
          type: "ecash",
          kind: "Ecash",
          when: "5 days ago",
        },
        {
          id: 8,
          label: "Received",
          amount: 21,
          status: "paid",
          type: "lightning",
          kind: "Lightning",
          when: "1 week ago",
        },
        {
          id: 9,
          label: "Received",
          amount: 900,
          status: "paid",
          type: "onchain",
          kind: "On-chain",
          when: "2 weeks ago",
        },
      ].map((t, i) => ({ ...t, date: new Date(now - i * day).toISOString() })),
    };
  },
  computed: {
    open(): boolean {
      return this.$route.query.open === "1";
    },
    // The filtered state every variant shows: pending ecash (the old "Ecash only").
    f(): HistoryFilters {
      return {
        status: "pending",
        direction: "all",
        type: "ecash",
        mint: "all",
        unit: "all",
      };
    },
    shown(): any[] {
      return this.all.filter((t) => matchesHistoryFilters(t, this.f));
    },
    statusOptions() {
      return this.options("status");
    },
    directionOptions() {
      return this.options("direction");
    },
    typeOptions() {
      return this.options("type");
    },
    sheetGroups(): any[] {
      return [
        {
          key: "status",
          label: this.$t("QuoteInformation.status"),
          value: this.f.status,
          options: this.statusOptions,
        },
        {
          key: "direction",
          label: this.t("direction"),
          value: this.f.direction,
          options: this.directionOptions,
        },
        {
          key: "type",
          label: this.t("type"),
          value: this.f.type,
          options: this.typeOptions,
        },
      ];
    },
    activeChips(): string[] {
      return [
        this.$t("common.pending") as string,
        this.$t("HistoryTable.row.type_label") as string,
      ];
    },
    chipBar(): { key: string; label: string; on: boolean }[] {
      return [
        {
          key: "pending",
          label: this.$t("common.pending") as string,
          on: true,
        },
        { key: "in", label: this.t("received"), on: false },
        { key: "out", label: this.t("sent"), on: false },
        {
          key: "ecash",
          label: this.$t("HistoryTable.row.type_label") as string,
          on: true,
        },
        {
          key: "lightning",
          label: this.$t("InvoiceTable.row.type_label") as string,
          on: false,
        },
        {
          key: "onchain",
          label: this.$t("common.on_chain") as string,
          on: false,
        },
      ];
    },
    groupButtons(): { key: string; label: string; on: boolean }[] {
      return [
        { key: "status", label: this.$t("common.pending") as string, on: true },
        { key: "direction", label: this.t("direction"), on: false },
        {
          key: "type",
          label: this.$t("HistoryTable.row.type_label") as string,
          on: true,
        },
      ];
    },
  },
  methods: {
    t(key: string, args?: Record<string, unknown>): string {
      return this.$t(`HistoryTable.filters.${key}`, args ?? {}) as string;
    },
    options(group: keyof typeof HISTORY_FILTER_LABEL_KEYS) {
      return Object.entries(HISTORY_FILTER_LABEL_KEYS[group]).map(
        ([value, key]) => ({
          value,
          label: this.$t(key) as string,
        })
      );
    },
  },
});
</script>

<style scoped>
.xh {
  min-height: 100vh;
}
.xh-top {
  padding: 56px 16px 24px;
}
.xh-balance {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.1;
}
.xh-fiat {
  font-size: 15px;
  margin: 4px 0 20px;
}
.xh-actions {
  width: 100%;
}
.xh-panel {
  margin: 0 auto;
  max-width: var(--app-column);
  padding: 8px 16px 24px;
  width: 100%;
}
.xh-toolbar {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  min-height: 44px;
}
.xh-grow {
  flex: 1;
  min-width: 0;
}
.xh-end {
  margin-inline-start: auto;
  margin-inline-end: -10px;
}
.xh-chips,
.xh-chipbar {
  align-items: center;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.xh-chipbar {
  margin-bottom: 8px;
  min-height: 44px;
}
.xh-chip {
  align-items: center;
  background: var(--app-tint);
  border: 1px solid transparent;
  border-radius: var(--app-radius-pill);
  color: var(--app-text);
  display: inline-flex;
  flex-shrink: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 4px;
  min-height: 32px;
  padding: 0 12px;
}
.xh--v3 .xh-chip:not(.xh-chip--on),
.xh--v4 .xh-chip:not(.xh-chip--on) {
  background: none;
  border-color: var(--app-field-edge);
  color: var(--app-text-muted);
}
.xh--v3 .xh-chip--on,
.xh--v4 .xh-chip--on {
  background: var(--q-primary);
  color: var(--app-on-primary);
}
.xh-count {
  color: var(--app-text-muted);
  font-size: 13px;
  padding-inline-start: 4px;
  white-space: nowrap;
}
.xh-link {
  background: none;
  border: 0;
  color: var(--app-text);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 0 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.xh-dot {
  position: relative;
}
.xh-dot::after {
  background: var(--q-primary);
  border-radius: 50%;
  content: "";
  height: 8px;
  inset-block-start: 9px;
  inset-inline-end: 9px;
  position: absolute;
  width: 8px;
}
.xh-badge-wrap {
  position: relative;
}
.xh-badge {
  align-items: center;
  background: var(--q-primary);
  border-radius: 9px;
  color: var(--app-on-primary);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  height: 18px;
  inset-block-start: 4px;
  inset-inline-end: -6px;
  justify-content: center;
  min-width: 18px;
  pointer-events: none;
  position: absolute;
}
.xh-search-wrap {
  margin-bottom: 8px;
}
.xh-search :deep(.q-field__append) .app-icon-btn {
  margin-inline-end: -8px;
}
.xh-search-wrap .xh-chips {
  margin-top: 8px;
}
.xh-summary {
  align-items: center;
  color: var(--app-text);
  display: inline-flex;
  font-size: 15px;
  font-weight: 600;
  gap: 6px;
}
.xh-clear {
  background: var(--app-tint);
  border: 0;
  border-radius: 50%;
  color: var(--app-text-muted);
  display: inline-flex;
  padding: 4px;
}
.xh-sentence {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin-bottom: 4px;
  min-height: 44px;
}
.xh-sentence b {
  color: var(--app-text);
  font-weight: 600;
}
.xh-inline-panel {
  background: var(--app-group-fill);
  border-radius: var(--app-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
}
.xh-sheet {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 8px;
}
.xh-sheet :deep(.section-divider-block) {
  margin-bottom: 8px;
}
</style>
