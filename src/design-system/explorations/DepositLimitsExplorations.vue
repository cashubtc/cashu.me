<!-- Dev-only exploration (owner item 21): seven alternatives (1-7) to the on-chain deposit
     limits notice, "Deposits outside {min}–{max} won't be credited." (0, OnchainDepositLimits),
     each shown in context on Receive on-chain. `screen` picks the amount step ("amount") or
     the reusable address QR ("address", where the notice ships today). Static demo data,
     no stores; copy from existing keys except where a variation notes new English words. -->
<template>
  <ExploreAmountScreen
    :title="$t('CreateInvoiceDialog.onchain_title')"
    :keypad="screen === 'amount'"
    :footer-disabled="screen === 'amount'"
    :footer-label="
      screen === 'amount'
        ? $t('CreateInvoiceDialog.create_address')
        : $t('CreateInvoiceDialog.create_new_address')
    "
    :class="`xd xd--v${variant}`"
  >
    <template #actions>
      <UnitToggle label="₿" />
    </template>

    <template #picker>
      <ExploreMintPicker>
        <!-- 3 Field hint: the limits are the mint's, so they hang under its picker as an
             outlined field's helper text does. -->
        <template v-if="variant === 3" #below>
          <div class="xd-hint">{{ message }}</div>
        </template>
      </ExploreMintPicker>
    </template>

    <template #under-picker>
      <!-- 2 Callout: the standard info callout, the first thing under the mint. -->
      <AppCallout v-if="variant === 2" variant="info" :text="message" />
      <!-- 6 Fact row: the range as a receipt fact (DetailRow), consequence left to the
           amount warning that appears once a typed amount is out of range. -->
      <div v-else-if="variant === 6" class="detail-table xd-facts">
        <DetailRow :icon="ArrowLeftRightIcon" label="Deposits">
          <bdi dir="ltr">{{ min }}–{{ max }}</bdi>
        </DetailRow>
      </div>
    </template>

    <!-- 7 Zero-state line: at ₿0 the fiat line has nothing to say, so the limits take its
         place; typing brings the fiat line back (and the amount warning, if out of range). -->
    <template v-if="variant === 7" #fiat>
      <div class="xd-zero">
        <InfoIcon :size="16" class="xd-zero__icon" aria-hidden="true" />{{
          message
        }}
      </div>
    </template>

    <template #under-amount>
      <template v-if="screen === 'amount'">
        <div v-if="variant === 0" class="xd-current q-mt-lg">
          <InfoIcon :size="13" class="xd-current__icon" />{{ message }}
        </div>
        <div
          v-else-if="variant === 4"
          class="xd-chips q-mt-lg"
          role="group"
          :aria-label="message"
        >
          <TonalChip
            >Min&nbsp;<bdi dir="ltr">{{ min }}</bdi></TonalChip
          >
          <TonalChip
            >Max&nbsp;<bdi dir="ltr">{{ max }}</bdi></TonalChip
          >
        </div>
        <div v-else-if="variant === 5" class="q-mt-lg">
          <div
            class="xd-meter"
            role="img"
            :aria-label="message"
            :style="{ '--xd-pos': '0%' }"
          >
            <span class="xd-meter__low" />
            <span class="xd-meter__ok" />
            <span class="xd-meter__mark" />
          </div>
          <div class="xd-meter__ends">
            <bdi dir="ltr">{{ min }}</bdi>
            <bdi dir="ltr">{{ max }}</bdi>
          </div>
        </div>
      </template>
    </template>

    <template v-if="screen === 'address'" #body>
      <div class="row justify-center full-width q-mt-lg q-mb-auto">
        <div class="col-12 xd-col">
          <div class="xd-qr">
            <QrBlock :value="`bitcoin:${address}`" />
          </div>
          <QrCopyLine :text="address" />
          <div v-if="[0, 7].includes(variant)" class="xd-current q-mt-md">
            <InfoIcon :size="13" class="xd-current__icon" />{{ message }}
          </div>
          <div
            v-else-if="variant === 4"
            class="xd-chips q-mt-md"
            role="group"
            :aria-label="message"
          >
            <TonalChip
              >Min&nbsp;<bdi dir="ltr">{{ min }}</bdi></TonalChip
            >
            <TonalChip
              >Max&nbsp;<bdi dir="ltr">{{ max }}</bdi></TonalChip
            >
          </div>
          <div v-else-if="variant === 5" class="q-mt-md">
            <div
              class="xd-meter xd-meter--plain"
              role="img"
              :aria-label="message"
            >
              <span class="xd-meter__low" />
              <span class="xd-meter__ok" />
            </div>
            <div class="xd-meter__ends">
              <bdi dir="ltr">{{ min }}</bdi>
              <bdi dir="ltr">{{ max }}</bdi>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 1 Footnote: the condition sits on the action it qualifies, start-aligned like a
         form's footnote. -->
    <template v-if="variant === 1" #above-button>
      <div class="xd-foot">
        <InfoIcon :size="16" class="xd-foot__icon" aria-hidden="true" />
        <span>{{ message }}</span>
      </div>
    </template>
  </ExploreAmountScreen>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from "vue";
import {
  ArrowLeftRight as ArrowLeftRightIcon,
  Info as InfoIcon,
} from "lucide-vue-next";
import AppCallout from "src/components/AppCallout.vue";
import QrBlock from "src/components/QrBlock.vue";
import DetailRow from "src/components/ui/DetailRow.vue";
import QrCopyLine from "src/components/ui/QrCopyLine.vue";
import TonalChip from "src/components/ui/TonalChip.vue";
import UnitToggle from "src/components/ui/UnitToggle.vue";
import { isolateLtr } from "src/js/format-currency";
import ExploreAmountScreen from "src/design-system/explorations/ExploreAmountScreen.vue";
import ExploreMintPicker from "src/design-system/explorations/ExploreMintPicker.vue";

export const depositLimitsVariants = [
  "Current: centred muted caption",
  "Footnote on the action",
  "Info callout under the mint",
  "Mint picker hint",
  "Min and max chips",
  "Range meter",
  "Deposits fact row",
  "Zero-state line",
];

export default defineComponent({
  name: "DepositLimitsExplorations",
  components: {
    AppCallout,
    DetailRow,
    ExploreAmountScreen,
    ExploreMintPicker,
    InfoIcon,
    QrBlock,
    QrCopyLine,
    TonalChip,
    UnitToggle,
  },
  props: {
    variant: { type: Number, default: 0 },
    screen: {
      type: String as PropType<"amount" | "address">,
      default: "amount",
    },
  },
  data() {
    return {
      ArrowLeftRightIcon: markRaw(ArrowLeftRightIcon),
      min: "₿10,000",
      max: "₿2,000,000",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    };
  },
  computed: {
    message(): string {
      return this.$t("CreateInvoiceDialog.deposit_limits.outside", {
        min: isolateLtr(this.min),
        max: isolateLtr(this.max),
      }) as string;
    },
  },
});
</script>

<style scoped>
/* 0 Current (OnchainDepositLimits): centred caption, inline info glyph. */
.xd-current {
  color: var(--app-text-muted);
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
  text-wrap: balance;
}
.xd-current__icon {
  margin-inline-end: 6px;
  vertical-align: -2px;
}
.xd-col {
  max-width: 400px;
}
.xd-qr {
  border-radius: var(--app-radius-md);
  overflow: hidden;
}
/* 1 Footnote above the action, on the footer's 16px inset. */
.xd-foot {
  align-items: flex-start;
  color: var(--app-text-muted);
  display: flex;
  font-size: 13px;
  gap: 8px;
  line-height: 18px;
  margin: 0 auto 4px;
  max-width: var(--app-column);
  padding: 0 16px;
}
.xd-foot__icon {
  flex: none;
  margin-top: 1px;
}
/* 3 Helper text under the picker, inset to the field's text like a field hint. */
.xd-hint {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 16px;
  margin-top: 6px;
  padding-inline: 16px;
}
/* 4 Two tonal chips that fill the amount. */
.xd-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
/* 5 Meter: a short below-minimum stub, the accepted span, and the amount's mark. */
.xd-meter {
  display: flex;
  height: 6px;
  margin: 0 auto;
  max-width: 260px;
  position: relative;
}
.xd-meter__low {
  border-end-start-radius: var(--app-radius-pill);
  border-start-start-radius: var(--app-radius-pill);
  background: var(--app-field-edge);
  width: 12%;
}
.xd-meter__ok {
  background: color-mix(in srgb, var(--app-text) 56%, transparent);
  border-end-end-radius: var(--app-radius-pill);
  border-start-end-radius: var(--app-radius-pill);
  flex: 1;
  margin-inline-start: 2px;
}
.xd-meter__mark {
  background: var(--app-surface);
  border: 2px solid var(--app-text);
  border-radius: 50%;
  height: 14px;
  inset-inline-start: var(--xd-pos);
  position: absolute;
  top: -4px;
  width: 14px;
}
.xd-meter__ends {
  color: var(--app-text-muted);
  display: flex;
  font-size: 12px;
  justify-content: space-between;
  line-height: 16px;
  margin: 8px auto 0;
  max-width: 260px;
  padding-inline-start: calc(12% - 8px);
}
/* 6 One detail row under the picker. */
.xd-facts {
  margin-top: -4px;
}
/* 7 The limits in the fiat line's place. */
.xd-zero {
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 20px;
  margin: 22px auto 0;
  max-width: 300px;
  text-align: center;
  text-wrap: balance;
}
.xd-zero__icon {
  margin-inline-end: 6px;
  vertical-align: -3px;
}
</style>
