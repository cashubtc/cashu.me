<!-- Dev-only exploration (owner 2026-11-01, "spacing and such looks bad here"): seven
     alternatives (1-7) to the receive QR block, the QR, its copyable address and (on-chain)
     the deposit-limits note, shown in context on Receive Lightning with an npub.cash address
     ("lightning") and on the reusable on-chain address ("onchain"). Variant 0 is what ships:
     the QR, the QrCopyLine pill 16px under it, the neutral callout 16px under that. Tokens and
     components are the shipped ones; only the arrangement changes. Static demo data. -->
<template>
  <ExploreAmountScreen
    :title="
      screen === 'onchain'
        ? $t('CreateInvoiceDialog.onchain_title')
        : $t('InvoiceDetailDialog.title')
    "
    :keypad="false"
    :footer-label="
      screen === 'onchain'
        ? $t('CreateInvoiceDialog.create_new_address')
        : $t('CreateInvoiceDialog.add_amount')
    "
    :class="`xq xq--v${variant}`"
  >
    <template #actions>
      <ExploreHeaderUnit label="₿" />
    </template>

    <template #body>
      <div class="xq-col q-mt-lg q-mb-auto">
        <!-- 6 Note first: the condition is read before the QR is scanned. -->
        <AppCallout
          v-if="limits && variant === 6"
          variant="neutral"
          :text="message"
        />

        <!-- 7 One receive card: QR, address and the note as one grouped surface. -->
        <div v-if="variant === 7" class="xq-card">
          <div class="xq-qr"><QrBlock :value="qrValue" /></div>
          <button type="button" class="xq-card__address" :title="address">
            <bdi dir="ltr">{{ shown }}</bdi>
            <CopyIcon :size="16" class="xq-muted" aria-hidden="true" />
          </button>
          <div v-if="limits" class="xq-card__note">
            <LightbulbIcon :size="16" class="xq-muted" aria-hidden="true" />
            <span>{{ message }}</span>
          </div>
        </div>

        <template v-else>
          <!-- 2 The address printed on the QR card, like a ticket stub. -->
          <div v-if="variant === 2" class="xq-ticket">
            <div class="xq-qr"><QrBlock :value="qrValue" /></div>
            <button type="button" class="xq-ticket__stub" :title="address">
              <bdi dir="ltr">{{ shown }}</bdi>
              <CopyIcon :size="16" aria-hidden="true" />
            </button>
          </div>
          <!-- 5 The pill overlaps the QR's bottom edge, one object. -->
          <div v-else-if="variant === 5" class="xq-overlap">
            <div class="xq-qr"><QrBlock :value="qrValue" /></div>
            <QrCopyLine class="xq-overlap__pill" :text="address" />
          </div>
          <div v-else class="xq-qr"><QrBlock :value="qrValue" /></div>

          <!-- 0 current / 1 polish / 6 note-first: the pill under the QR. -->
          <QrCopyLine
            v-if="[0, 1, 6].includes(variant)"
            :class="{ 'xq-pill--wide': variant === 1 }"
            :text="address"
          />
          <!-- 3 A read-only copy field, as Backup and NWC show keys. -->
          <CopyField
            v-else-if="variant === 3"
            class="xq-gap"
            :value="address"
            :label="addressLabel"
          />
          <!-- 4 A detail table: the address and the range as copy and fact rows. -->
          <div v-else-if="variant === 4" class="detail-table xq-gap">
            <DetailRow
              :icon="HashIcon"
              :label="addressLabel"
              :copy-value="address"
              ><bdi dir="ltr">{{ shown }}</bdi></DetailRow
            >
            <DetailRow
              v-if="limits"
              :icon="ArrowLeftRightIcon"
              :label="depositsLabel"
            >
              <bdi dir="ltr">{{ min }}–{{ max }}</bdi>
            </DetailRow>
          </div>

          <AppCallout
            v-if="limits && ![4, 6].includes(variant)"
            variant="neutral"
            class="xq-gap"
            :text="message"
          />
        </template>
      </div>
    </template>
  </ExploreAmountScreen>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from "vue";
import {
  ArrowLeftRight as ArrowLeftRightIcon,
  Copy as CopyIcon,
  Hash as HashIcon,
  Lightbulb as LightbulbIcon,
} from "lucide-vue-next";
import AppCallout from "src/components/AppCallout.vue";
import QrBlock from "src/components/QrBlock.vue";
import CopyField from "src/components/ui/CopyField.vue";
import DetailRow from "src/components/ui/DetailRow.vue";
import QrCopyLine, { middleShorten } from "src/components/ui/QrCopyLine.vue";
import { isolateLtr } from "src/js/format-currency";
import ExploreAmountScreen from "src/design-system/explorations/ExploreAmountScreen.vue";
import ExploreHeaderUnit from "src/design-system/explorations/ExploreHeaderUnit.vue";

export const qrReceiveVariants = [
  "Current: QR, pill 16px under it, callout 16px under that",
  "Polish: one column, the pill as wide as the QR",
  "Ticket: the address printed on the QR card",
  "Copy field: a read-only field with a copy button",
  "Table: address and range as detail rows",
  "Overlap: the pill straddles the QR's bottom edge",
  "Note first: the deposit range above the QR",
  "Receive card: QR, address and note as one surface",
];

export default defineComponent({
  name: "QrReceiveExplorations",
  components: {
    AppCallout,
    CopyField,
    CopyIcon,
    DetailRow,
    ExploreAmountScreen,
    ExploreHeaderUnit,
    LightbulbIcon,
    QrBlock,
    QrCopyLine,
  },
  props: {
    variant: { type: Number, default: 0 },
    screen: {
      type: String as PropType<"lightning" | "onchain">,
      default: "lightning",
    },
  },
  data() {
    return {
      ArrowLeftRightIcon: markRaw(ArrowLeftRightIcon),
      HashIcon: markRaw(HashIcon),
      min: "₿10,000",
      max: "₿5,000,000",
    };
  },
  computed: {
    limits(): boolean {
      return this.screen === "onchain";
    },
    address(): string {
      return this.limits
        ? "bc1qf6lr5r3qxy2kgdygjrsqtzq2n0yrf2493p8624cjwek0r"
        : "npub18875ua0xq02vsu9f7vzd06e8tsknvdeseequ0l34glkgxsudyhnsem37pe@npub.cash";
    },
    qrValue(): string {
      return this.limits ? `bitcoin:${this.address}` : this.address;
    },
    shown(): string {
      return middleShorten(this.address);
    },
    addressLabel(): string {
      return this.limits
        ? (this.$t("QuoteInformation.address") as string)
        : (this.$t("Settings.lightning_address.title") as string);
    },
    depositsLabel(): string {
      return "Deposits";
    },
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
.xq-col {
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  max-width: 400px;
  width: 100%;
}
.xq-qr {
  border-radius: var(--app-radius-md);
  margin-inline: auto;
  overflow: hidden;
  width: var(--app-qr-size);
}
.xq-gap {
  margin-top: 16px;
}
.xq-muted {
  color: var(--app-text-muted);
  flex-shrink: 0;
}
/* 1 Polish: the pill as wide as the QR, one column edge for QR, pill and note. */
.xq--v1 .xq-col {
  max-width: var(--app-qr-size);
}
.xq-pill--wide {
  justify-content: space-between;
  width: 100%;
}
/* 2 Ticket: the QR card grows a stub with the address on the card's own white. */
.xq-ticket {
  background: #fff;
  border-radius: var(--app-radius-lg);
  margin-inline: auto;
  overflow: hidden;
  width: var(--app-qr-size);
}
.xq-ticket .xq-qr {
  border-radius: 0;
}
.xq-ticket__stub {
  align-items: center;
  background: none;
  border: 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.18);
  color: #0a0a0a;
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  min-height: 44px;
  width: 100%;
}
/* 5 Overlap: the pill half over the QR's bottom edge. */
.xq-overlap {
  margin-inline: auto;
  padding-bottom: 20px;
  position: relative;
  width: var(--app-qr-size);
}
.xq-overlap__pill {
  background: var(--app-raised);
  bottom: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  inset-inline: 0;
  margin: 0 auto !important;
  position: absolute;
  width: max-content;
}
/* 6 Note first: the callout, 16px, then the QR. */
.xq--v6 .xq-qr {
  margin-top: 16px;
}
/* 7 One card on the group fill. */
.xq-card {
  background: var(--app-group-fill);
  border-radius: var(--app-radius-xl);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.xq-card__address {
  align-items: center;
  background: none;
  border: 0;
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  min-height: 32px;
}
.xq-card__note {
  border-top: 1px solid var(--app-border);
  color: var(--app-text-muted);
  display: flex;
  font-size: 14px;
  gap: 10px;
  line-height: 1.45;
  padding-top: 12px;
}
</style>
