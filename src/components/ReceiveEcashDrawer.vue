<template>
  <q-dialog
    v-model="showReceiveEcashDrawer"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="bg-grey-10 text-white full-width-card">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn flat round dense @click="goBack" class="q-ml-sm" color="primary">
          <ChevronLeftIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">Receive ecash</span>
        </div>
        <q-btn
          flat
          round
          dense
          @click="showCamera"
          class="q-mr-sm"
          color="primary"
        >
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-btn class="full-width custom-btn" @click="pasteToParseDialog">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <ClipboardIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">PASTE</div>
              </div>
            </div>
          </q-btn>

          <q-btn
            v-if="enablePaymentRequest"
            class="full-width custom-btn"
            @click="handlePaymentRequestBtn"
          >
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <FileTextIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">REQUEST</div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="handleLockBtn">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <LockIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">LOCK</div>
              </div>
            </div>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <P2PKDialog v-model="showP2PKDialog" />
  <PRDialog v-model="showPRDialog" />
</template>

<script>
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import token from "src/js/token";
import P2PKDialog from "./P2PKDialog.vue";
import PRDialog from "./PaymentRequestDialog.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
import {
  ChevronLeft as ChevronLeftIcon,
  Clipboard as ClipboardIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Scan as ScanIcon,
} from "lucide-vue-next";
// import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";
import { map } from "underscore";
import { notifyError, notifySuccess, notify } from "../js/notify";

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    P2PKDialog,
    PRDialog,
    ChevronLeftIcon,
    ClipboardIcon,
    FileTextIcon,
    LockIcon,
    ScanIcon,
  },
  data: function () {
    return {
      showP2PKDialog: false,
      ndefSupported: "NDEFReader" in globalThis,
    };
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
      "scanningCard",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, [
      "activeProofs",
      "activeUnit",
      "addMintBlocking",
    ]),
    ...mapWritableState(useUiStore, ["showReceiveEcashDrawer"]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    ...mapState(useCameraStore, ["hasCamera"]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    ...mapState(usePRStore, ["enablePaymentRequest"]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    ...mapWritableState(useUiStore, ["showReceiveDialog"]),
    ...mapState(useCameraStore, ["lastScannedResult"]),
  },
  methods: {
    ...mapActions(useWalletStore, ["redeem"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    ...mapActions(useTokensStore, ["addPendingToken"]),
    ...mapActions(useP2PKStore, [
      "getPrivateKeyForP2PKEncodedToken",
      "generateKeypair",
      "showLastKey",
    ]),
    ...mapActions(useMintsStore, ["addMint"]),
    ...mapActions(useReceiveTokensStore, [
      "receiveIfDecodes",
      "decodeToken",
      "knowThisMintOfTokenJson",
      "toggleScanner",
    ]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),

    pasteToParseDialog: function () {
      console.log("pasteToParseDialog");
      this.showReceiveTokens = true;
      navigator.clipboard.readText().then((text) => {
        if (this.decodeToken(text)) {
          this.receiveData.tokensBase64 = text;
        }
        this.showReceiveEcashDrawer = false;
        this.showReceiveTokens = true;
      });
    },
    handleLockBtn: function () {
      this.showP2PKDialog = !this.showP2PKDialog;
      if (!this.p2pkKeys.length || !this.showP2PKDialog) {
        this.generateKeypair();
      }
      this.showLastKey();
      this.showReceiveEcashDrawer = false;
    },
    handlePaymentRequestBtn: function () {
      const prStore = usePRStore();
      this.showPRDialog = !this.showPRDialog;
      console.log("handlePaymentRequestBtn", this.showPRDialog);
      if (this.showPRDialog) {
        prStore.newPaymentRequest();
      }
      this.showReceiveEcashDrawer = false;
    },
    handleQrCodeDecode(result) {
      console.log("QR code decoded:", result);
      // Handle the decoded QR code result here
      this.closeCamera();
      // You might want to process the result here
    },
    goBack: function () {
      this.showReceiveEcashDrawer = false;
      this.showReceiveDialog = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.full-width-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.q-dialog__inner--minimized > div {
  max-width: 600px;
}

.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
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
