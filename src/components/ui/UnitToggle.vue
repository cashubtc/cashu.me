<!-- The ecash unit switch, a trailing action of an amount screen's FullscreenDialogHeader
: the unit's code (BTC, USD, from unitCode) and a chevron, 44px,
     in the header ink (src/css/app.scss .sheet-unit-toggle). Named "Unit: Bitcoin, change", apart
     from the amount's ⇅ swap ("Enter amount in USD"), which stays with the amount. It follows the
     active mint and unit and renders nothing when the mint offers a single unit; `unit` and
     `units` stand in for the store on the design-system board. Emits `toggle`. -->
<template>
  <q-btn
    v-if="shownUnits.length > 1"
    flat
    rounded
    no-caps
    class="sheet-unit-toggle"
    :aria-label="$t('UnitToggle.label', { unit: unitName })"
    @click="$emit('toggle')"
  >
    <bdi dir="ltr">{{ code }}</bdi>
    <ChevronDownIcon
      :size="14"
      class="sheet-unit-toggle__chevron"
      aria-hidden="true"
    />
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapState } from "pinia";
import { ChevronDown as ChevronDownIcon } from "lucide-vue-next";
import { unitCode } from "src/js/format-currency";
import { MintClass, useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "UnitToggle",
  components: { ChevronDownIcon },
  props: {
    /** The active unit; defaults to the store's. */
    unit: { type: String, default: null },
    /** The units the mint offers; defaults to the active mint's. */
    units: { type: Array as PropType<string[]>, default: null },
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
            this.code
          ) ?? this.code
        );
      } catch {
        return this.code;
      }
    },
  },
});
</script>
