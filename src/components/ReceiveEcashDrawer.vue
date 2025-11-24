<template>
  <q-dialog
    v-model="showReceiveEcashDrawer"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="drawer-card text-white full-width-card q-pb-lg">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn flat round dense @click="goBack" class="q-ml-sm" color="primary">
          <ChevronLeftIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">{{ $t("ReceiveEcashDrawer.title") }}</span>
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
          <div class="action-row" @click="handlePasteBtn">
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <ClipboardIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveEcashDrawer.actions.paste.label") }}
                </div>
              </div>
            </div>
          </div>

          <div class="action-row" @click="showCamera">
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <ScanIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveEcashDrawer.actions.scan.label") }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="enablePaymentRequest"
            class="action-row"
            @click="handlePaymentRequestBtn"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <FileTextIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveEcashDrawer.actions.request.label") }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="showP2PkButtonInDrawer"
            class="action-row"
            @click="handleLockBtn"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <LockIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveEcashDrawer.actions.lock.label") }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="ndefSupported && showNfcButtonInDrawer"
            class="action-row"
            @click="handleNFCBtn"
          >
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <q-spinner v-if="scanningCard" size="sm" color="white" />
                <NfcIcon v-else :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveEcashDrawer.actions.nfc.label") }}
                  {{
                    scanningCard
                      ? $t("ReceiveEcashDrawer.actions.nfc.scanning_text")
                      : ""
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <P2PKDialog v-model="showP2PKDialog" />
  <PRDialog v-model="showPRDialog" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import { useSettingsStore } from "../stores/settings";
import token from "src/js/token";
import P2PKDialog from "./P2PKDialog.vue";
import PRDialog from "./PaymentRequestDialog.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
import {
  ChevronLeft as ChevronLeftIcon,
  Clipboard as ClipboardIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Nfc as NfcIcon,
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
    NfcIcon,
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
      "scanningCard",
      "watchClipboardPaste",
    ]),
    ...mapState(useUiStore, ["tickerShort", "ndefSupported"]),
    ...mapState(useMintsStore, [
      "activeProofs",
      "activeUnit",
      "addMintBlocking",
    ]),
    ...mapState(useSettingsStore, [
      "showNfcButtonInDrawer",
      "autoPasteEcashReceive",
    ]),
    ...mapWritableState(useUiStore, ["showReceiveEcashDrawer"]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    ...mapState(useCameraStore, ["hasCamera"]),
    ...mapState(useP2PKStore, ["p2pkKeys", "showP2PkButtonInDrawer"]),
    ...mapState(usePRStore, ["enablePaymentRequest"]),
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
      "pasteToParseDialog",
    ]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    isiOsSafari() {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const match =
        /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent);
      console.log(`User agent: ${userAgent}, is iOS Safari: ${match}`);
      return match;
    },
    handlePasteBtn: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
      this.showReceiveEcashDrawer = false;
      // if (!this.isiOsSafari()
      if (this.autoPasteEcashReceive) {
        this.watchClipboardPaste = true;
      }
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
      if (this.showPRDialog) {
        prStore.newPaymentRequest();
      }
      this.showReceiveEcashDrawer = false;
    },
    handleNFCBtn: function () {
      this.toggleScanner();
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
::v-deep .q-dialog__backdrop {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4) !important;
}

.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.drawer-card {
  background: #1a1a1a;
}

.action-row {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lucide {
  width: 24px;
  height: 24px;
  color: white;
}
</style>
