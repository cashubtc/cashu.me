<!-- The history list's filters, in the standard bottom sheet: one single choice per group
     (status, direction, type, and mint and unit where the history holds more than one), each
     applied as it is chosen, with the live result count on the button that closes the sheet.
     The choices live in the ui store (historyFilters), so the list and its chips read the same
     state. `transactions` is the whole history: it gives the mint and unit options and the
     count. -->
<template>
  <BottomSheet
    :model-value="modelValue"
    :title="$t('HistoryTable.filters.title')"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="history-filter-sheet">
      <section>
        <SectionDivider :label="$t('QuoteInformation.status')" />
        <SegmentedControl
          v-model="historyFilters.status"
          block
          :label="$t('QuoteInformation.status')"
          :options="statusOptions"
        />
      </section>
      <section>
        <SectionDivider :label="$t('HistoryTable.filters.direction')" />
        <SegmentedControl
          v-model="historyFilters.direction"
          block
          :label="$t('HistoryTable.filters.direction')"
          :options="directionOptions"
        />
      </section>
      <section>
        <SectionDivider :label="$t('HistoryTable.filters.type')" />
        <SegmentedControl
          v-model="historyFilters.type"
          block
          :label="$t('HistoryTable.filters.type')"
          :options="typeOptions"
        />
      </section>
      <section v-if="unitOptions.length > 2">
        <SectionDivider :label="$t('QuoteInformation.unit')" />
        <SegmentedControl
          v-model="historyFilters.unit"
          block
          :label="$t('QuoteInformation.unit')"
          :options="unitOptions"
        />
      </section>
      <section v-if="mintOptions.length > 2">
        <SectionDivider :label="$t('QuoteInformation.mint')" />
        <div role="listbox" :aria-label="$t('QuoteInformation.mint')">
          <SheetOption
            v-for="option in mintOptions"
            :key="option.value"
            :label="option.label"
            :selected="historyFilters.mint === option.value"
            @select="historyFilters.mint = option.value"
          />
        </div>
      </section>
    </div>
    <template #actions>
      <div class="column full-width history-filter-actions">
        <q-btn
          unelevated
          rounded
          color="primary"
          class="full-width"
          data-testid="history-filter-apply"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t("HistoryTable.filters.show_results", { count: resultCount }) }}
        </q-btn>
        <q-btn
          v-if="active"
          flat
          rounded
          class="full-width"
          data-testid="history-filter-reset"
          @click="reset"
        >
          {{ $t("HistoryTable.filters.reset") }}
        </q-btn>
      </div>
    </template>
  </BottomSheet>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapState, mapWritableState } from "pinia";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import SegmentedControl, {
  type SegmentedOption,
} from "src/components/ui/SegmentedControl.vue";
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
} from "src/js/history-filters";

export default defineComponent({
  name: "HistoryFilterSheet",
  components: { BottomSheet, SheetOption, SectionDivider, SegmentedControl },
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
    statusOptions(): SegmentedOption[] {
      return this.fixedOptions("status");
    },
    directionOptions(): SegmentedOption[] {
      return this.fixedOptions("direction");
    },
    typeOptions(): SegmentedOption[] {
      return this.fixedOptions("type");
    },
    // Only the units and mints the history holds; "all" first.
    unitOptions(): SegmentedOption[] {
      const units = new Set(this.transactions.map((t) => t.unit || "sat"));
      return [
        { value: "all", label: this.$t("HistoryTable.filters.all") },
        ...[...units].map((unit) => ({ value: unit, label: unitCode(unit) })),
      ];
    },
    mintOptions(): { value: string; label: string }[] {
      const urls = new Set(
        this.transactions.map((t) => t.mint).filter(Boolean) as string[]
      );
      return [
        { value: "all", label: this.$t("HistoryTable.filters.all_mints") },
        ...[...urls].map((url) => ({ value: url, label: this.mintLabel(url) })),
      ];
    },
  },
  methods: {
    fixedOptions(
      group: keyof typeof HISTORY_FILTER_LABEL_KEYS
    ): SegmentedOption[] {
      return Object.entries(HISTORY_FILTER_LABEL_KEYS[group]).map(
        ([value, key]) => ({ value, label: this.$t(key) })
      );
    },
    mintLabel(url: string): string {
      return historyMintLabel(url, this.mints);
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
  padding-bottom: 8px;
}
.history-filter-actions {
  gap: 8px;
}
.history-filter-sheet :deep(.section-divider-block) {
  margin-bottom: 8px;
}
</style>
