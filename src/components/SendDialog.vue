<template>
  <q-dialog
    v-model="showSendDialog"
    position="bottom"
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
    no-backdrop-dismiss
  >
    <q-card class="bg-grey-10 text-white q-px-lg q-pt-md q-pb-md qcard">
      <q-card-section class="row items-center q-pb-none">
        <q-btn flat round dense v-close-popup class="q-ml-sm">
          <XIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">Send</span>
        </div>
        <q-btn flat round dense class="q-mr-sm">
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-btn
            class="full-width custom-btn"
            @click="showSendTokensDialog"
          >
            <div class="row items-center full-width">
              <div class="icon-background q-mr-sm">
                <BanknoteIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold">ECASH</div>
              </div>
            </div>
          </q-btn>

          <q-btn
            class="full-width custom-btn"
            @click="showParseDialog"
          >
            <div class="row items-center full-width">
              <div class="icon-background q-mr-sm">
                <ZapIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold">LIGHTNING</div>
              </div>
            </div>
          </q-btn>
        </div>
      </q-card-section>
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
import { X as XIcon, Banknote as BanknoteIcon, Zap as ZapIcon, Scan as ScanIcon } from 'lucide-vue-next';

export default defineComponent({
  name: "SendDialog",
  components: {
    XIcon,
    BanknoteIcon,
    ZapIcon,
    ScanIcon,
  },
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
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
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
      this.sendData.amount = null;
      this.sendData.memo = "";
      this.sendData.p2pkPubkey = "";
      this.showSendDialog = false;
      this.showSendTokens = true;
      this.showLockInput = false;
    },
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
.custom-btn {
  background: $grey-9;
  color: white;
  border-radius: 8px;
  height: 60px;
  font-size: 14px;
}

.q-dialog__inner--minimized > div {
  max-width: 100%;
}

.q-dialog__inner > div {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.icon-background {
  background-color: $grey-10;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lucide {
  width: 24px;
  height: 24px;
}
</style>
