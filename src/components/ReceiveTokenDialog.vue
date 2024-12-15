<template>
  <q-dialog
    v-model="showReceiveTokens"
    position="top"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-down"
    transition-hide="slide-up"
    no-backdrop-dismiss
    z-index="10000"
  >
    <q-card v-model="showReceiveTokens" class="q-pa-lg q-pt-md qcard">
      <q-btn v-close-popup rounded flat color="grey" class="close-btn-position"
        >Close</q-btn
      >
      <div>
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-10">
            <span class="text-h6">Receive Ecash</span>
          </div>
        </div>
        <div>
          <P2PKDialog v-model="showP2PKDialog" />
          <PRDialog v-model="showPRDialog" />
        </div>
        <q-input
          round
          outlined
          v-model="receiveData.tokensBase64"
          label="Paste Cashu token"
          type="textarea"
          autofocus
          class="q-mb-lg"
          @keyup.enter="receiveIfDecodes"
        >
          <template v-if="receiveData.tokensBase64" v-slot:append>
            <q-icon
              name="close"
              class="cursor-pointer"
              @click="receiveData.tokensBase64 = ''"
            />
          </template>
        </q-input>
      </div>
      <div
        class="row"
        v-if="receiveData.tokensBase64.length && tokenDecodesCorrectly"
      >
        <div class="col-12">
          <TokenInformation
            :encodedToken="receiveData.tokensBase64"
            :showAmount="true"
            :showMintCheck="true"
            :showP2PKCheck="true"
          />
        </div>
      </div>
      <div class="row q-mt-lg">
        <!-- if !tokenDecodesCorrectly, display error -->
        <q-btn
          v-if="receiveData.tokensBase64.length && !tokenDecodesCorrectly"
          disabled
          color="yellow"
          text-color="black"
          rounded
          unelevated
          class="q-mr-sm"
          label="Invalid token"
        ></q-btn>

        <q-btn
          @click="receiveIfDecodes"
          color="primary"
          rounded
          class="q-ml-xs q-mr-sm"
          v-if="tokenDecodesCorrectly"
          :disabled="addMintBlocking"
          :label="
            knowThisMint
              ? addMintBlocking
                ? 'Adding mint ...'
                : 'Receive'
              : 'Receive'
          "
        >
        </q-btn>
        <q-btn
          @click="addPendingTokenToHistory(receiveData.tokensBase64)"
          color="primary"
          rounded
          flat
          class="q-mr-sm"
          v-if="tokenDecodesCorrectly"
          >Later
          <q-tooltip>Add to history to receive later</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          dense
          class="q-mr-sm"
          v-if="canPasteFromClipboard && !receiveData.tokensBase64.length"
          @click="pasteToParseDialog"
        >
          <q-icon name="content_paste" class="q-pr-sm" />Paste</q-btn
        >
        <q-btn
          unelevated
          dense
          class="q-mr-sm"
          v-if="hasCamera && !receiveData.tokensBase64.length"
          @click="showCamera"
        >
          <q-icon name="qr_code_scanner" class="q-pr-sm" />Scan
        </q-btn>
        <q-btn
          unelevated
          dense
          class="q-mx-none"
          v-if="!receiveData.tokensBase64.length"
          @click="handleLockBtn"
        >
          <q-icon name="lock_outline" class="q-pr-sm" />Lock
        </q-btn>
      </div>
      <div
        v-if="
          !receiveData.tokensBase64.length &&
          (enablePaymentRequest || ndefSupported)
        "
        class="row q-mt-lg"
      >
        <!-- does require second row of buttons -->
        <q-btn
          unelevated
          dense
          class="q-mr-sm"
          v-if="!receiveData.tokensBase64.length && ndefSupported"
          :loading="scanningCard"
          :disabled="scanningCard"
          @click="toggleScanner"
        >
          <q-icon name="nfc" class="q-pr-sm" />
          <q-tooltip>{{
            ndefSupported ? "Read from NFC card" : "NDEF unsupported"
          }}</q-tooltip>
          <template v-slot:loading>
            <q-spinner @click="toggleScanner"> </q-spinner>
          </template>
          NFC
        </q-btn>
        <q-btn
          unelevated
          dense
          class="q-mr-sm"
          v-if="!receiveData.tokensBase64.length && enablePaymentRequest"
          @click="handlePaymentRequestBtn"
        >
          <q-icon name="move_to_inbox" class="q-pr-sm" />Request
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="showReceiveTokens"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
    no-backdrop-dismiss
  >
    <q-card class="bg-grey-10 text-white full-width-card">
      <q-card-section class="row items-center q-pb-none">
        <q-btn flat round dense @click="goBack" class="q-ml-sm">
          <ChevronLeftIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">Receive ecash</span>
        </div>
        <q-btn flat round dense @click="openCamera" class="q-mr-sm">
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-btn
            class="full-width custom-btn"
            @click="pasteToParseDialog"
            :disabled="!canPasteFromClipboard"
          >
            <div class="row items-center full-width">
              <div class="icon-background q-mr-sm">
                <ClipboardIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold">PASTE</div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="showRequestDialog">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-sm">
                <FileTextIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold">REQUEST</div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="handleLockBtn">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-sm">
                <LockIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold">LOCK</div>
              </div>
            </div>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <P2PKDialog v-model="showP2PKDialog" />
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
    ChevronLeftIcon,
    ClipboardIcon,
    FileTextIcon,
    LockIcon,
    ScanIcon,
    PRDialog,
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
    // TOKEN METHODS
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token) {
      return token.getMint(decoded_token);
    },
    handleLockBtn: function () {
      this.showP2PKDialog = !this.showP2PKDialog;
      if (!this.p2pkKeys.length || !this.showP2PKDialog) {
        this.generateKeypair();
      }
      this.showLastKey();
    },
    handlePaymentRequestBtn: function () {
      const prStore = usePRStore();
      this.showPRDialog = !this.showPRDialog;
      if (this.showPRDialog) {
        prStore.newPaymentRequest();
      }
    },
    tokenAlreadyInHistory: function (tokenStr) {
      const tokensStore = useTokensStore();
      return (
        tokensStore.historyTokens.find((t) => t.token === tokenStr) !==
        undefined
      );
    },
    addPendingTokenToHistory: function (token) {
      if (this.tokenAlreadyInHistory(token)) {
        this.notifySuccess("Ecash already in history");
        this.showReceiveTokens = false;
        return;
      }
      const tokensStore = useTokensStore();
      const decodedToken = tokensStore.decodeToken(token);
      // get amount from decodedToken.token.proofs[..].amount
      const amount = this.getProofs(decodedToken).reduce(
        (sum, el) => (sum += el.amount),
        0
      );

      tokensStore.addPendingToken({
        amount: amount,
        serializedProofs: token,
      });
      this.showReceiveTokens = false;
      // show success notification
      this.notifySuccess("Incoming payment added to history.");
    },
    pasteToParseDialog: function () {
      console.log("pasteToParseDialog");
      navigator.clipboard.readText().then((text) => {
        this.receiveData.tokensBase64 = text;
        // TODO: Implement token processing logic
      });
    },
    showRequestDialog: function () {
      console.log("Show request dialog");
      // TODO: Implement request dialog logic
    },
    openCamera: function () {
      this.closeCamera(); // Ensure any existing camera instance is closed
      this.showCamera();
      this.showReceiveTokens = false;
    },
    closeCamera() {
      this.camera.show = false;
      if (this.camera.previousComponent === "ReceiveTokenDialog") {
        this.showReceiveTokens = true;
      }
    },
    handleQrCodeDecode(result) {
      console.log("QR code decoded:", result);
      // Handle the decoded QR code result here
      this.closeCamera();
      // You might want to process the result here
    },
    goBack: function () {
      this.showReceiveTokens = false;
      this.showReceiveDialog = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.custom-btn {
  background: $grey-9;
  color: white;
  border-radius: 8px;
  height: 60px;
  box-shadow: none;
  font-size: 14px;
}

.full-width-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.q-dialog__inner--minimized > div {
  max-width: 600px;
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

.close-btn-position {
  position: absolute;
  right: 16px;
  bottom: 22px;
  z-index: 100;
}
</style>
