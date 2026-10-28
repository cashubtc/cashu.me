<template>
  <BottomSheet
    v-model="showReceiveEcashDrawer"
    :title="$t('ReceiveEcashDrawer.title')"
    :back="$t('ReceiveDialog.title')"
    @back="goBack"
  >
    <div>
      <div class="q-gutter-y-md">
        <div
          class="app-option-row"
          role="button"
          tabindex="0"
          data-testid="receive-ecash-paste"
          @click="handlePasteBtn"
          @keydown.enter.prevent="handlePasteBtn"
          @keydown.space.prevent="handlePasteBtn"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <ClipboardPasteIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("ReceiveEcashDrawer.actions.paste.label") }}
              </div>
            </div>
          </div>
        </div>

        <div class="app-option-row" @click="showCamera">
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <ScanIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("ReceiveEcashDrawer.actions.scan.label") }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="enablePaymentRequest"
          class="app-option-row"
          @click="handlePaymentRequestBtn"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <FileTextIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("ReceiveEcashDrawer.actions.request.label") }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showP2PkButtonInDrawer"
          class="app-option-row"
          @click="handleLockBtn"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <LockIcon :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
                {{ $t("ReceiveEcashDrawer.actions.lock.label") }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="ndefSupported && showNfcButtonInDrawer"
          class="app-option-row"
          @click="handleNFCBtn"
        >
          <div class="row items-center no-wrap">
            <div class="app-icon-circle">
              <q-spinner v-if="scanningCard" size="sm" />
              <NfcIcon v-else :size="24" />
            </div>
            <div class="col q-ml-md">
              <div class="app-option-row__label">
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
    </div>
  </BottomSheet>
  <P2PKDialog v-model="showP2PKDialog" />
  <PRDialog v-model="showPRDialog" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BottomSheet from "src/components/BottomSheet.vue";
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
  ClipboardPaste as ClipboardPasteIcon,
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
    BottomSheet,
    P2PKDialog,
    PRDialog,
    ClipboardPasteIcon,
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
