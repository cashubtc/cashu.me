<template>
  <q-dialog v-model="showInvoiceDetails" persistent position="top">
    <q-card class="q-pa-lg q-pt-md qcard"
      >lnurlPaySecond
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
        <!-- <q-input
                filled
                dense
                v-model.trim="invoiceData.memo"
                label="Memo"
                ></q-input> -->
      </div>
      <div v-else class="text-center q-mb-lg q-mt-none q-pt-none">
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
      </div>
      <div class="row q-mt-lg">
        <q-btn
          v-if="invoiceData.bolt11"
          @click="copyText(invoiceData.bolt11)"
          outline
          color="primary"
          >Copy invoice</q-btn
        >
        <q-btn
          v-else
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
