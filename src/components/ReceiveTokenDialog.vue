<template>
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

          <q-btn
            class="full-width custom-btn"
            @click="showRequestDialog"
          >
            <div class="row items-center full-width">
              <div class="icon-background q-mr-sm">
                <FileTextIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold">REQUEST</div>
              </div>
            </div>
          </q-btn>

          <q-btn
            class="full-width custom-btn"
            @click="handleLockBtn"
          >
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
import token from "src/js/token";
import P2PKDialog from "./P2PKDialog.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
import { ChevronLeft as ChevronLeftIcon, Clipboard as ClipboardIcon, FileText as FileTextIcon, Lock as LockIcon, Scan as ScanIcon } from 'lucide-vue-next';

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
  },
  data: function () {
    return {
      showP2PKDialog: false,
    };
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, [
      "activeProofs",
      "activeUnit",
      "addMintBlocking",
    ]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapState(useCameraStore, ["hasCamera"]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    ...mapWritableState(useUiStore, ["showReceiveDialog"]),
    ...mapState(useCameraStore, ['lastScannedResult']),
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
    handleLockBtn: function () {
      this.showP2PKDialog = !this.showP2PKDialog;
      if (!this.p2pkKeys.length || !this.showP2PKDialog) {
        this.generateKeypair();
      }
      this.showLastKey();
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
      if (this.camera.previousComponent === 'ReceiveTokenDialog') {
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
</style>
