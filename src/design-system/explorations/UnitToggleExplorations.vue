<!-- Dev-only exploration (owner item 26): seven alternatives (1-7) to the unit toggle (0, the
     header action it was, now ExploreHeaderUnit; variant 3 shipped as UnitToggle in round
     92), each in context on Receive Lightning ("receive", with the Invoice/Offer control) or Send ecash ("send",
     beside the lock action). The mint holds two units, ₿ (sat, shown as BTC elsewhere) and USD,
     the labels the stores give them. Static demo data, no stores. -->
<template>
  <ExploreAmountScreen
    :title="
      screen === 'send'
        ? $t('SendTokenDialog.title')
        : $t('InvoiceDetailDialog.title')
    "
    :footer-label="
      screen === 'send'
        ? $t('SendTokenDialog.actions.send.label')
        : $t('InvoiceDetailDialog.actions.create.label')
    "
    :class="`xu xu--v${variant}`"
  >
    <template #actions>
      <IconButton
        v-if="screen === 'send'"
        :label="$t('SendTokenDialog.actions.lock.label')"
      >
        <LockIcon :size="20" />
      </IconButton>
      <ExploreHeaderUnit v-if="variant === 0" :label="active.label" />
      <!-- 1 Header segmented: both units always visible, as a compact two-way switch. -->
      <div
        v-else-if="variant === 1"
        class="xu-seg xu-seg--header"
        role="radiogroup"
        :aria-label="$t('TokenInformation.unit')"
      >
        <button
          v-for="u in units"
          :key="u.value"
          type="button"
          role="radio"
          class="xu-seg__opt"
          :class="{ 'xu-seg__opt--on': u.value === unit }"
          :aria-checked="u.value === unit"
        >
          {{ u.label }}
        </button>
      </div>
    </template>

    <template #picker>
      <!-- 7 Paired fields: unit and mint are chosen together (balances are per mint and
           unit), so the unit is a second field of the picker's recipe beside it. -->
      <div v-if="variant === 7" class="xu-pair">
        <ExploreMintPicker class="xu-pair__mint" />
        <button
          type="button"
          class="xu-field"
          :aria-label="`${$t('TokenInformation.unit')}: ${active.label}`"
        >
          <span class="xu-field__label">{{ $t("TokenInformation.unit") }}</span>
          <span class="xu-field__value">{{ active.label }}</span>
          <ChevronDownIcon :size="18" class="xu-field__chevron" />
        </button>
      </div>
      <ExploreMintPicker v-else />
    </template>

    <template #under-picker>
      <div
        v-if="(screen === 'receive' && variant !== 4) || variant === 4"
        class="row justify-center no-wrap q-mt-sm xu-controls"
      >
        <SegmentedControl
          v-if="screen === 'receive' && variant !== 4"
          :model-value="false"
          :label="$t('CreateInvoiceDialog.format_label')"
          :options="formats"
        />
        <!-- 4 Request row: the unit joins Invoice/Offer as a second segmented control on
             one row, the two "what am I asking for" choices together. -->
        <template v-else-if="variant === 4">
          <div
            v-if="screen === 'receive'"
            class="xu-seg"
            role="radiogroup"
            :aria-label="$t('CreateInvoiceDialog.format_label')"
          >
            <button
              v-for="f in formats"
              :key="String(f.value)"
              type="button"
              role="radio"
              class="xu-seg__opt xu-seg__opt--wide"
              :class="{ 'xu-seg__opt--on': !f.value }"
              :aria-checked="!f.value"
            >
              {{ f.label }}
            </button>
          </div>
          <div
            class="xu-seg"
            role="radiogroup"
            :aria-label="$t('TokenInformation.unit')"
          >
            <button
              v-for="u in units"
              :key="u.value"
              type="button"
              role="radio"
              class="xu-seg__opt"
              :class="{ 'xu-seg__opt--on': u.value === unit }"
              :aria-checked="u.value === unit"
            >
              {{ u.label }}
            </button>
          </div>
        </template>
      </div>
    </template>

    <!-- 5 Unit tabs: text tabs over the amount, the active one underlined, like the wallet's
         tabs; the amount below reads in that unit. -->
    <template v-if="variant === 5" #above-amount>
      <div
        class="xu-tabs"
        role="tablist"
        :aria-label="$t('TokenInformation.unit')"
      >
        <button
          v-for="u in units"
          :key="u.value"
          type="button"
          role="tab"
          class="xu-tabs__tab"
          :class="{ 'xu-tabs__tab--on': u.value === unit }"
          :aria-selected="u.value === unit"
        >
          {{ u.code }}
        </button>
      </div>
    </template>

    <!-- 2 Amount glyph: the unit symbol in the amount is the control (a chevron under it),
         so what changes is exactly what you tap. -->
    <template v-if="variant === 2" #amount>
      <div class="amount-display text-weight-bold text-center xu-glyph-row">
        <button
          type="button"
          class="xu-glyph"
          :aria-label="`${$t('TokenInformation.unit')}: ${active.label}`"
        >
          <span>{{ active.label }}</span>
          <ChevronDownIcon :size="20" class="xu-glyph__chevron" />
        </button>
        <span>0</span>
      </div>
    </template>

    <!-- 3 Unit chip: a tonal chip on the amount's axis, under the fiat line. -->
    <template v-if="variant === 3" #under-amount>
      <div class="row justify-center q-mt-lg">
        <TonalChip
          :aria-label="`${$t('TokenInformation.unit')}: ${active.label}`"
        >
          {{ active.code }}
          <ChevronDownIcon :size="16" class="xu-chip__chevron" />
        </TonalChip>
      </div>
    </template>

    <!-- 6 Keypad key: the keypad's empty key switches the unit, where a calculator keeps
         its mode key. -->
    <template v-if="variant === 6" #keypad-start>
      <q-btn
        flat
        no-caps
        class="xu-key"
        :aria-label="`${$t('TokenInformation.unit')}: ${active.label}`"
      >
        <span class="xu-key__sym">{{ active.label }}</span>
        <ChevronDownIcon :size="16" class="xu-key__chevron" />
      </q-btn>
    </template>
  </ExploreAmountScreen>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  ChevronDown as ChevronDownIcon,
  Lock as LockIcon,
} from "lucide-vue-next";
import IconButton from "src/components/ui/IconButton.vue";
import SegmentedControl from "src/components/ui/SegmentedControl.vue";
import TonalChip from "src/components/ui/TonalChip.vue";
import ExploreHeaderUnit from "src/design-system/explorations/ExploreHeaderUnit.vue";
import ExploreAmountScreen from "src/design-system/explorations/ExploreAmountScreen.vue";
import ExploreMintPicker from "src/design-system/explorations/ExploreMintPicker.vue";

export const unitToggleVariants = [
  "Current: header unit and chevron",
  "Header segmented",
  "Amount glyph",
  "Unit chip under the amount",
  "Request row with Invoice/Offer",
  "Unit tabs over the amount",
  "Keypad unit key",
  "Paired unit field",
];

export default defineComponent({
  name: "UnitToggleExplorations",
  components: {
    ChevronDownIcon,
    ExploreAmountScreen,
    ExploreMintPicker,
    IconButton,
    LockIcon,
    SegmentedControl,
    TonalChip,
    ExploreHeaderUnit,
  },
  props: {
    variant: { type: Number, default: 0 },
    screen: {
      type: String as PropType<"receive" | "send">,
      default: "receive",
    },
  },
  data() {
    return {
      unit: "sat",
      units: [
        { value: "sat", label: "₿", code: "BTC" },
        { value: "usd", label: "USD", code: "USD" },
      ],
    };
  },
  computed: {
    active(): { value: string; label: string; code: string } {
      return this.units.find((u) => u.value === this.unit) ?? this.units[0];
    },
    formats(): { label: string; value: boolean }[] {
      return [
        {
          label: this.$t("CreateInvoiceDialog.formats.bolt11") as string,
          value: false,
        },
        {
          label: this.$t("CreateInvoiceDialog.formats.bolt12") as string,
          value: true,
        },
      ];
    },
  },
});
</script>

<style scoped>
/* A compact segmented track on the SegmentedControl tokens: group fill, primary thumb,
   44px tall. */
.xu-seg {
  background: var(--app-group-fill);
  border-radius: var(--app-radius-pill);
  display: inline-flex;
  flex: none;
  padding: 3px;
}
.xu-seg__opt {
  background: none;
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 38px;
  min-width: 44px;
  padding: 0 10px;
  white-space: nowrap;
}
.xu-seg__opt--wide {
  padding: 0 16px;
}
.xu-seg__opt--on {
  background: var(--q-primary);
  color: var(--app-on-primary);
  font-weight: 600;
}
.xu-seg--header .xu-seg__opt {
  min-width: 40px;
  padding: 0 8px;
}
/* The header's actions are pinned to its end edge over the title's row; the wider switch
   takes that room from the title, which then wraps instead of running under it. */
.xu--v1 :deep(.sheet-column-header > .col) {
  padding-inline: 86px;
}
.xu-seg--header {
  margin-inline-end: 4px;
}
.xu-controls {
  gap: 8px;
}
/* 2 The unit glyph as a button inside the amount. */
.xu-glyph-row {
  align-items: flex-start;
  direction: ltr;
  display: flex;
  justify-content: center;
}
.xu-glyph {
  align-items: center;
  background: var(--app-tonal-fill);
  border: 0;
  border-radius: var(--app-radius-lg);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: 2px;
  line-height: inherit;
  margin-inline-end: 4px;
  padding: 0 6px 0 10px;
}
.xu-glyph__chevron {
  color: var(--app-text-muted);
}
.xu-chip__chevron {
  margin-inline-start: 4px;
  opacity: 0.72;
}
/* 5 Text tabs: muted labels, the active one in ink over a 2px ink underline. */
.xu-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}
.xu-tabs__tab {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  min-height: 44px;
  min-width: 64px;
  padding: 0 12px;
}
.xu-tabs__tab--on {
  border-bottom-color: var(--app-text);
  color: var(--app-text);
}
/* 6 The unit key: a tonal key among the digits. */
.xu-key {
  background: var(--app-tonal-fill);
  border-radius: var(--app-radius-md);
  color: var(--app-text);
  font-size: 1.25rem;
  font-weight: 600;
  min-height: 56px;
  padding: 12px 0;
}
.xu-key :deep(.q-btn__content) {
  flex-wrap: nowrap;
  gap: 2px;
}
.xu-key__chevron {
  opacity: 0.72;
}
/* 7 The unit field beside the mint picker, on the field recipe. */
.xu-pair {
  display: flex;
  gap: 8px;
}
.xu-pair__mint {
  flex: 1;
  min-width: 0;
}
/* At 320px the shared row leaves the caption one line, ellipsised like the name. */
.xu-pair__mint :deep(.mint-picker__caption) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xu-field {
  align-items: center;
  background: var(--app-field-fill);
  border: 1px solid var(--app-field-edge);
  border-radius: var(--app-radius-lg);
  color: var(--app-text);
  cursor: pointer;
  display: grid;
  flex: none;
  font: inherit;
  grid-template-areas: "label chevron" "value chevron";
  grid-template-columns: auto auto;
  height: 56px;
  margin-top: 4px;
  padding: 0 8px 0 12px;
  text-align: start;
  column-gap: 2px;
}
.xu-field__label {
  color: var(--app-text-muted);
  font-size: 12px;
  grid-area: label;
  line-height: 16px;
}
.xu-field__value {
  font-size: 16px;
  font-weight: 600;
  grid-area: value;
  line-height: 22px;
}
.xu-field__chevron {
  color: var(--app-text-muted);
  grid-area: chevron;
}
</style>
