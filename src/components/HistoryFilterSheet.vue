<!-- The history list's filters, in the standard bottom sheet: one single choice per group
     (status, direction, type, and mint and unit where the history holds more than one), each
     applied as it is chosen, with the live result count on the button that closes the sheet.
     The choices live in the ui store (historyFilters), so the list and its chips read the same
     state. `transactions` is the whole history: it gives the mint and unit options and the
     count. -->
<!-- The history list's filters, in the standard bottom sheet: one choice per group (status,
     direction, type, and unit and mint where the history holds more than one). Nothing is
     marked until a filter is chosen; a choice applies as it is pressed and pressing it again
     clears it, so the sheet has no confirm button, only the live count. The choices live in
     the ui store (historyFilters), so the list and its chips read the same state.
     `transactions` is the whole history: it gives the mint and unit options and the count. -->
<template>
  <BottomSheet
    :model-value="modelValue"
    :title="$t('HistoryTable.filters.title')"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Always rendered, so the centred title keeps its place when Reset appears. -->
    <template #trailing>
      <button
        type="button"
        class="history-filter-reset"
        :class="{ 'history-filter-reset--hidden': !active }"
        :tabindex="active ? 0 : -1"
        :aria-hidden="!active"
        data-testid="history-filter-reset"
        @click="reset"
      >
        {{ $t("HistoryTable.filters.reset") }}
      </button>
    </template>
    <div class="history-filter-sheet">
      <section v-for="group in groups" :key="group.key">
        <SectionDivider align="start" :label="group.label" />
        <div
          class="history-filter-chips"
          role="group"
          :aria-label="group.label"
        >
          <FilterChip
            v-for="option in group.options"
            :key="option.value"
            :selected="historyFilters[group.key] === option.value"
            :data-testid="`history-filter-${group.key}-${option.value}`"
            @click="toggle(group.key, option.value)"
          >
            {{ option.label }}
          </FilterChip>
        </div>
      </section>
      <section v-if="mintOptions.length > 1">
        <SectionDivider align="start" :label="$t('QuoteInformation.mint')" />
        <div role="group" :aria-label="$t('QuoteInformation.mint')">
          <SheetOption
            v-for="option in mintOptions"
            :key="option.value"
            :label="option.label"
            :selected="historyFilters.mint === option.value"
            @select="toggle('mint', option.value)"
          />
        </div>
      </section>
      <p class="history-filter-count" aria-live="polite">
        {{
          $t("HistoryTable.filters.count", {
            shown: resultCount,
            total: transactions.length,
          })
        }}
      </p>
    </div>
  </BottomSheet>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapState, mapWritableState } from "pinia";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import FilterChip from "src/components/ui/FilterChip.vue";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { unitCode } from "src/js/format-currency";
import {
  activeFilterGroups,
  DEFAULT_HISTORY_FILTERS,
  HISTORY_FILTER_LABEL_KEYS,
  historyMintLabel,
  matchesHistoryFilters,
  type FilterableTransaction,
  type HistoryFilterGroup,
} from "src/js/history-filters";

type Choice = { value: string; label: string };

export default defineComponent({
  name: "HistoryFilterSheet",
  components: { BottomSheet, SheetOption, SectionDivider, FilterChip },
  props: {
    modelValue: { type: Boolean, default: false },
    transactions: {
      type: Array as PropType<FilterableTransaction[]>,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    ...mapWritableState(useUiStore, ["historyFilters"]),
    ...mapState(useMintsStore, ["mints"]),
    active(): boolean {
      return activeFilterGroups(this.historyFilters).length > 0;
    },
    resultCount(): number {
      return this.transactions.filter((t) =>
        matchesHistoryFilters(t, this.historyFilters)
      ).length;
    },
    // Every group's choices, without "all": no choice in a group is its "all".
    groups(): { key: HistoryFilterGroup; label: string; options: Choice[] }[] {
      const groups: {
        key: HistoryFilterGroup;
        label: string;
        options: Choice[];
      }[] = [
        {
          key: "status",
          label: this.$t("QuoteInformation.status"),
          options: this.fixedOptions("status"),
        },
        {
          key: "direction",
          label: this.$t("HistoryTable.filters.direction"),
          options: this.fixedOptions("direction"),
        },
        {
          key: "type",
          label: this.$t("HistoryTable.filters.type"),
          options: this.fixedOptions("type"),
        },
      ];
      // Only the units and mints the history holds.
      const units = new Set(this.transactions.map((t) => t.unit || "sat"));
      if (units.size > 1) {
        groups.push({
          key: "unit",
          label: this.$t("QuoteInformation.unit"),
          options: [...units].map((unit) => ({
            value: unit,
            label: unitCode(unit),
          })),
        });
      }
      return groups;
    },
    mintOptions(): Choice[] {
      const urls = new Set(
        this.transactions.map((t) => t.mint).filter(Boolean) as string[]
      );
      return [...urls].map((url) => ({
        value: url,
        label: historyMintLabel(url, this.mints),
      }));
    },
  },
  methods: {
    fixedOptions(group: keyof typeof HISTORY_FILTER_LABEL_KEYS): Choice[] {
      return Object.entries(HISTORY_FILTER_LABEL_KEYS[group]).map(
        ([value, key]) => ({ value, label: this.$t(key) })
      );
    },
    // One choice per group: a press chooses it, a press on the chosen one clears the group.
    toggle(group: HistoryFilterGroup, value: string) {
      (this.historyFilters as Record<string, string>)[group] =
        this.historyFilters[group] === value
          ? DEFAULT_HISTORY_FILTERS[group]
          : value;
    },
    reset() {
      this.historyFilters = { ...DEFAULT_HISTORY_FILTERS };
    },
  },
});
</script>

<style scoped>
.history-filter-sheet {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
/* A heading belongs to the choices under it: closer to them than to the group above. */
.history-filter-sheet :deep(.section-divider-block) {
  margin-bottom: 8px;
}
.history-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.history-filter-count {
  color: var(--app-text-muted);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  line-height: 20px;
  margin: 0;
  text-align: center;
}
.history-filter-reset {
  background: none;
  border: 0;
  border-radius: var(--app-radius-sm);
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 44px;
  padding: 0 8px;
}
.history-filter-reset--hidden {
  visibility: hidden;
}
.history-filter-reset:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}
@media (hover: hover) {
  .history-filter-reset:hover {
    color: var(--app-text);
  }
}
</style>
