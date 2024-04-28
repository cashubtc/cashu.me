<template>
  <q-dialog v-model="showInvoiceDetails" position="top">
    <q-card class="q-px-lg q-pt-md qcard">
      <!-- invoice is not entered -->

      <div v-if="!invoiceData.bolt11">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12">
            <span class="text-subtitle1">Create a Lightning invoice</span>
          </div>
        </div>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <div class="col-12">
            <ChooseMint :ticker-short="tickerShort" />
          </div>
        </div>
        <q-input
          filled
          dense
          type="number"
          v-model.number="invoiceData.amount"
          :label="'Amount (' + tickerShort + ') *'"
          mask="#"
          fill-mask="0"
          reverse-fill-mask
          autofocus
          class="q-mb-lg"
          @keyup.enter="requestMintButton"
        ></q-input>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <q-btn
            color="primary"
            @click="requestMintButton"
            :disable="!(invoiceData.amount > 0) || createInvoiceButtonBlocked"
            :label="
              createInvoiceButtonBlocked
                ? 'Creating invoice...'
                : 'Create Invoice'
            "
            ><q-spinner-tail
              v-if="createInvoiceButtonBlocked"
              color="white"
              size="1em"
          /></q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>

      <!-- invoice is entered -->

      <div v-else class="text-center q-mb-md q-mt-none q-pt-none">
        <a class="text-secondary" :href="'lightning:' + invoiceData.bolt11">
          <q-responsive :ratio="1" class="q-mx-md q-mt-none q-pt-none">
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
              <q-item-label overline class="q-mb-sm q-pt-md text-white">
                Lightning invoice</q-item-label
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
              v-if="this.invoiceData.mint != undefined"
              class="row justify-center q-pt-sm"
            >
              <q-icon
                name="account_balance"
                size="0.95rem"
                color="grey"
                class="q-mr-sm"
              />
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                ><strong>{{ shortUrl }}</strong></q-item-label
              >
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            v-if="invoiceData.bolt11"
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(invoiceData.bolt11)"
            >Copy</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useWalletStore } from "src/stores/wallet";
import ChooseMint from "src/components/ChooseMint.vue";
import { useUiStore } from "src/stores/ui";
import { getShortUrl } from "src/js/wallet-helpers";

export default defineComponent({
  name: "InvoiceDetailDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    VueQrcode,
  },
  props: {
    invoiceCheckWorker: Function,
  },
  data: function () {
    return {
      createInvoiceButtonBlocked: false,
    };
  },
  computed: {
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapWritableState(useUiStore, ["showInvoiceDetails", "tickerShort"]),
    displayUnit: function () {
      let display = this.formatCurrency(
        this.invoiceData.amount,
        this.invoiceData.unit
      );
      return display;
    },
    shortUrl: function () {
      return getShortUrl(this.invoiceData.mint);
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["requestMint", "lnurlPaySecond"]),
    requestMintButton: async function () {
      try {
        this.createInvoiceButtonBlocked = true;
        await this.requestMint();
        await this.invoiceCheckWorker();
      } catch (e) {
        console.log("#### requestMintButton", e);
      } finally {
        this.createInvoiceButtonBlocked = false;
      }
    },
  },
});
</script>
