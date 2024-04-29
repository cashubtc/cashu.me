<template>
  <q-dialog v-model="showReceiveDialog" position="bottom">
    <!-- two buttons in two lines with the labels "Ecash" and "Lightning" -->
    <q-card class="q-pb-lg q-pt-sm">
      <q-card-section class="">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12 text-center">
            <q-icon name="north_east" size="1.3rem" class="q-mb-sm q-pr-sm" />
            <span class="text-h5">Send</span>
          </div>
        </div>
      </q-card-section>
      <div class="row items-center text-center no-wrap q-mb-md">
        <div class="col-12">
          <q-btn
            outline
            rounded
            class="q-py-md q-px-xl"
            style="width: 85%"
            @click="showSendTokensDialog"
            >Ecash</q-btn
          >
        </div>
      </div>
      <div class="row items-center text-center no-wrap q-mb-md">
        <div class="col-12">
          <q-btn
            outline
            rounded
            class="q-py-md q-px-xl"
            style="width: 85%"
            @click="showParseDialog"
            :icon="$q.screen.width > 430 ? 'bolt' : undefined"
            >Lightning</q-btn
          >
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";

export default defineComponent({
  name: "SendDialog",
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
    };
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "tab",
      "showSendDialog",
      "showReceiveDialog",
    ]),
    ...mapWritableState(useWalletStore, [
      "invoiceHistory",
      "invoiceData",
      "payInvoiceData",
    ]),
    ...mapWritableState(useCameraStore, ["camera"]),
    ...mapWritableState(useSendTokensStore, ["showSendTokens", "sendData"]),
  },
  methods: {
    showParseDialog: function () {
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.input.comment = "";
      this.payInvoiceData.input.paymentChecker = null;
      this.camera.show = false;
      this.showSendDialog = false;
    },
    showSendTokensDialog: function () {
      console.log("##### showSendTokensDialog");
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.amount = "";
      this.sendData.memo = "";
      this.showSendDialog = false;
      this.showSendTokens = true;
    },
  },
  created: function () {},
});
</script>
