<template>
  <q-dialog
    v-model="showInvoiceDetails"
    position="top"
    :maximized="$q.screen.lt.sm"
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-lg q-px-sm qcard q-card-top">
      <div v-if="invoiceData.bolt11" class="text-center q-mt-none q-pt-none">
        <a class="text-secondary" :href="'lightning:' + invoiceData.bolt11">
          <q-responsive :ratio="1" class="q-ma-none q-ma-none">
            <vue-qrcode
              :value="'lightning:' + invoiceData.bolt11.toUpperCase()"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
        </a>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label
                overline
                class="q-mb-sm q-pt-md text-white"
                style="font-size: 1rem"
                >{{ $t("InvoiceDetailDialog.invoice.caption") }}</q-item-label
              >
            </div>
            <div class="row justify-center q-py-md">
              <q-item-label style="font-size: 28px" class="text-weight-bold">
                <q-icon
                  :name="
                    invoiceData.amount >= 0 ? 'call_received' : 'call_made'
                  "
                  :color="
                    invoiceData.status === 'paid'
                      ? invoiceData.amount >= 0
                        ? 'green'
                        : 'red'
                      : ''
                  "
                  class="q-mr-sm"
                  size="sm"
                />

                <strong>{{ displayUnit }}</strong></q-item-label
              >
            </div>
            <div
              v-if="invoiceData && invoiceData.mint != undefined"
              class="row justify-center q-pt-sm"
            >
              <q-chip
                outline
                class="q-pa-md"
                style="height: 36px; font-family: monospace"
              >
                <q-icon name="account_balance" size="xs" class="q-mr-sm" />
                {{ shortUrl }}
              </q-chip>
            </div>
            <div
              v-if="invoiceData.amount > 0 && invoiceData.status === 'paid'"
              class="row justify-center"
            >
              <transition appear enter-active-class="animated tada">
                <span class="q-mt-lg text-h6">
                  <q-icon
                    name="check_circle"
                    size="1.5rem"
                    color="positive"
                    class="q-mr-sm q-mb-xs"
                  />{{ $t("InvoiceDetailDialog.invoice.status_paid_text") }}
                </span>
              </transition>
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            v-if="invoiceData.bolt11"
            class="q-mx-xs"
            size="md"
            flat
            @click="onCopyBolt11"
            >{{ $t("InvoiceDetailDialog.invoice.actions.copy.label") }}</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
            $t("InvoiceDetailDialog.invoice.actions.close.label")
          }}</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { getShortUrl } from "src/js/wallet-helpers";
import { useWorkersStore } from "src/stores/workers";
// type hint for global mixin
declare const windowMixin: any;

export default defineComponent({
  name: "InvoiceDetailDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
  },
  props: {},
  data: function () {
    return {};
  },
  computed: {
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    displayUnit: function () {
      let display = (this as any).formatCurrency(
        this.invoiceData.amount,
        this.invoiceData.unit,
        true
      );
      return display;
    },
    shortUrl: function () {
      return getShortUrl(this.invoiceData.mint);
    },
    runnerActive: function () {
      return this.invoiceWorkerRunning;
    },
    isSmallScreen() {
      return this.$q.screen.lt.sm;
    },
  },
  methods: {
    onCopyBolt11: function () {
      if (this.invoiceData?.bolt11) {
        (this as any).copyText(this.invoiceData.bolt11);
      }
    },
  },
});
</script>

<style scoped>
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
