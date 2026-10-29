<!-- The ecash unit switch on an amount screen (council R92, item 26): a tonal chip under the
     amount and its fiat line, showing the unit's text code (BTC, USD) and a chevron, 44px tall
     (src/css/app.scss .unit-chip). Named "Unit: Bitcoin, change", apart from the ⇅ swap's
     "Enter amount in USD". It follows the active mint and unit and renders nothing when the
     mint offers a single unit; `unit` and `units` stand in for the store on the design-system
     board. `align="start"` lines it up under a start-aligned amount (Pay's quote). AmountInput
     places it itself (its `unit-toggle` prop). Emits `toggle`. -->
<template>
  <div
    v-if="shownUnits.length > 1"
    class="unit-chip-row"
    :class="{ 'unit-chip-row--start': align === 'start' }"
  >
    <TonalChip
      class="unit-chip"
      :aria-label="$t('UnitToggle.label', { unit: unitName })"
      @click="$emit('toggle')"
    >
      <span>{{ code }}</span>
      <ChevronDownIcon
        :size="16"
        class="unit-chip__chevron"
        aria-hidden="true"
      />
    </TonalChip>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapState } from "pinia";
import { ChevronDown as ChevronDownIcon } from "lucide-vue-next";
import TonalChip from "src/components/ui/TonalChip.vue";
import { unitCode } from "src/js/format-currency";
import { MintClass, useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "UnitToggle",
  components: { ChevronDownIcon, TonalChip },
  props: {
    /** The active unit; defaults to the store's. */
    unit: { type: String, default: null },
    /** The units the mint offers; defaults to the active mint's. */
    units: { type: Array as PropType<string[]>, default: null },
    align: { type: String as PropType<"center" | "start">, default: "center" },
  },
  emits: ["toggle"],
  computed: {
    ...mapState(useMintsStore, ["activeUnit", "activeMintUrl", "mints"]),
    shownUnit(): string {
      return this.unit ?? this.activeUnit ?? "sat";
    },
    shownUnits(): string[] {
      if (this.units) return this.units;
      const mint = this.mints.find((m) => m.url === this.activeMintUrl);
      return mint ? new MintClass(mint).units : [];
    },
    code(): string {
      return unitCode(this.shownUnit);
    },
    unitName(): string {
      const unit = this.shownUnit.toLowerCase();
      if (unit === "sat" || unit === "msat")
        return this.$t("UnitToggle.bitcoin") as string;
      try {
        return (
          new Intl.DisplayNames([this.$i18n.locale], { type: "currency" }).of(
            unit.toUpperCase()
          ) ?? this.code
        );
      } catch {
        return this.code;
      }
    },
  },
});
</script>
