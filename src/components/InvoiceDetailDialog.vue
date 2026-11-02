<template>
  <FlowDialog v-model="showInvoiceDetails">
    <div class="display-token-fullscreen">
      <!-- Header -->
      <FullscreenDialogHeader :title="headerTitle" />

      <!-- Content: one stack with one gap (QR, deposit note, amount, table), so no two
           neighbours sit further apart than any others (owner 2026-11-01). What the payer
           pays, the invoice or address, is a copy row in the table. -->
      <div class="content-area">
        <FlowColumn class="q-px-md flow-stack">
          <PaymentStatus
            v-if="invoiceData.status === 'paid'"
            state="paid"
            class="q-pt-lg"
            :label="$t('InvoiceDetailDialog.invoice.status_paid_text')"
          />
          <div v-else-if="invoiceData.request">
            <div class="qr-container">
              <component
                :is="isOnchain ? 'div' : 'a'"
                class="text-secondary"
                :href="qrLink"
              >
                <QrBlock :value="qrValue" />
              </component>
            </div>
            <QrProgress :active="runnerActive" />
          </div>
          <OnchainDepositLimits
            v-if="
              isOnchain && invoiceData.request && invoiceData.status !== 'paid'
            "
            data-testid="deposit-limits-address"
            :mint-url="invoiceData.mint"
            :unit="invoiceData.unit"
          />
          <AmountHeadline v-if="invoiceData.amount">{{
            displayUnit
          }}</AmountHeadline>
          <MintQuoteInformation
            v-if="invoiceData?.mintQuote"
            hide-paid-status
            :mint-quote="invoiceData.mintQuote"
            :invoice="invoiceData"
            :mint-url="invoiceData.mint"
            :show-amount="!invoiceData.amount"
            :method="invoiceMethod"
            :refresh-trigger="metadataRefreshTrigger"
          />
          <MeltQuoteInformation
            v-else-if="invoiceData?.meltQuote"
            hide-paid-status
            :melt-quote="invoiceData.meltQuote"
            :invoice="invoiceData"
            :mint-url="invoiceData.mint"
            :history-paid-at="invoiceData.paidDate"
            :show-amount="!invoiceData.amount"
            :refresh-trigger="metadataRefreshTrigger"
          />
        </FlowColumn>
      </div>

      <!-- Bottom panel action -->
      <FlowFooter>
        <!-- Always rendered (disabled until the request arrives), so the footer never
               appears late and shifts the screen. -->
        <!-- Once paid there is nothing left to do, so copying is a secondary (outline)
               action; while waiting it is the screen's primary action. -->
        <q-btn
          :disable="!invoiceData.request"
          class="full-width"
          :unelevated="invoiceData.status !== 'paid'"
          :outline="invoiceData.status === 'paid'"
          :color="invoiceData.status === 'paid' ? undefined : 'primary'"
          rounded
          @click="onCopyBolt11"
        >
          {{ copyButtonLabel }}
        </q-btn>
      </FlowFooter>
    </div>
  </FlowDialog>
</template>
<script lang="ts">
import FlowColumn from "src/components/ui/FlowColumn.vue";
import PaymentStatus from "src/components/ui/PaymentStatus.vue";
import FlowDialog from "src/components/ui/FlowDialog.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import AmountHeadline from "src/components/ui/AmountHeadline.vue";
import { defineComponent } from "vue";
import { mapState, mapWritableState } from "pinia";
import QrBlock from "src/components/QrBlock.vue";
import QrProgress from "src/components/QrProgress.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import { copyToClipboard } from "quasar";
import { notifyCopied } from "src/js/notify";

import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useWorkersStore } from "src/stores/workers";
import MeltQuoteInformation from "src/components/MeltQuoteInformation.vue";
import MintQuoteInformation from "src/components/MintQuoteInformation.vue";
import OnchainDepositLimits from "src/components/OnchainDepositLimits.vue";
import { PaymentMethod } from "src/stores/walletTypes";
import { onchainDepositQrValue } from "src/js/onchain";
// type hint for global mixin
declare const windowMixin: any;

export default defineComponent({
  name: "InvoiceDetailDialog",
  mixins: [windowMixin],
  components: {
    FlowColumn,
    PaymentStatus,
    FlowDialog,
    FlowFooter,
    AmountHeadline,
    QrBlock,
    QrProgress,
    FullscreenDialogHeader,
    MeltQuoteInformation,
    MintQuoteInformation,
    OnchainDepositLimits,
  },
  props: {},
  data: function () {
    return {
      copyButtonCopied: false,
      copyButtonTimeout: null as any,
      metadataRefreshTrigger: 0,
    };
  },
  computed: {
    // A settled payment is titled by what happened (Sent, Received), as its history row is;
    // an open one by what it is (the invoice, the address).
    headerTitle(): string {
      if (this.invoiceData.status === "paid")
        return this.$t(
          (this.invoiceData.amount ?? 0) < 0
            ? "ActivityRow.sent"
            : "ActivityRow.received"
        );
      if (this.isBolt12) return "Lightning Bolt12";
      if (this.isOnchain) return this.$t("common.on_chain");
      return this.$t("InvoiceDetailDialog.invoice.caption");
    },
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    displayUnit: function () {
      const display = (this as any).formatCurrency(
        this.invoiceData.amount,
        this.invoiceData.unit,
        true
      );
      // Same true minus sign as the history list.
      return display.replace(/^(\u2066?)-\s*/, "$1\u2212");
    },
    runnerActive: function () {
      return this.invoiceWorkerRunning;
    },
    invoiceMethod(): PaymentMethod {
      const method =
        (this.invoiceData as any).method ||
        (this.invoiceData as any).paymentType ||
        (this.invoiceData as any).protocol ||
        this.invoiceData.type;
      return Object.values(PaymentMethod).includes(method)
        ? method
        : PaymentMethod.Bolt11;
    },
    copyButtonLabel: function () {
      if (this.copyButtonCopied) {
        return this.$t("common.copied");
      }
      return this.$t("InvoiceDetailDialog.invoice.actions.copy.label");
    },
    isBolt12(): boolean {
      return (
        this.invoiceData.type === PaymentMethod.Bolt12 ||
        this.invoiceData.type === PaymentMethod.Bolt12Subpayment ||
        (this.invoiceData as any).method === PaymentMethod.Bolt12 ||
        (this.invoiceData as any).method === PaymentMethod.Bolt12Subpayment
      );
    },
    isOnchain(): boolean {
      return (
        this.invoiceData.type === PaymentMethod.Onchain ||
        this.invoiceData.type === PaymentMethod.OnchainSubpayment
      );
    },
    qrValue(): string {
      return this.isOnchain
        ? onchainDepositQrValue(
            this.invoiceData.request,
            this.invoiceData.requestedAmount,
            this.invoiceData.unit
          )
        : "lightning:" + this.invoiceData.request.toUpperCase();
    },
    qrLink(): string | undefined {
      return this.isOnchain
        ? undefined
        : "lightning:" + this.invoiceData.request;
    },
  },
  watch: {
    showInvoiceDetails(val: boolean) {
      if (val) {
        this.metadataRefreshTrigger += 1;
      }
    },
  },
  methods: {
    onCopyBolt11: async function () {
      const request = this.invoiceData?.request;
      if (request) {
        try {
          await copyToClipboard(request);
          notifyCopied();
          this.copyButtonCopied = true;
          // Clear any existing timeout
          if (this.copyButtonTimeout) {
            clearTimeout(this.copyButtonTimeout);
          }
          // Reset button label after 3 seconds
          this.copyButtonTimeout = setTimeout(() => {
            this.copyButtonCopied = false;
          }, 3000);
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
        }
      }
    },
  },
  beforeUnmount() {
    if (this.copyButtonTimeout) {
      clearTimeout(this.copyButtonTimeout);
    }
  },
});
</script>

<style scoped>
/* QR Code with checkmark overlay */
.qr-container {
  position: relative;
  border-radius: var(--app-radius-md);
  overflow: hidden;
}
</style>
