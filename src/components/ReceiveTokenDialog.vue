<template>
  <q-dialog
    v-model="showReceiveTokens"
    position="top"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-down"
    transition-hide="slide-up"
    no-backdrop-dismiss
  >
    <q-card v-model="showReceiveTokens" class="q-pa-lg qcard q-card-top">
      <q-btn v-close-popup rounded flat color="grey" class="close-btn-position"
        >Close</q-btn
      >
      <div>
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-10">
            <span class="text-h6">Receive Ecash</span>
          </div>
        </div>
        <div></div>
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
          class="q-mx-sm"
          v-if="hasCamera && !receiveData.tokensBase64.length"
          @click="showCamera"
        >
          <q-icon name="qr_code_scanner" class="q-pr-sm" />Scan
        </q-btn>
        <q-btn
          unelevated
          dense
          class="q-mx-sm"
          v-if="!receiveData.tokensBase64.length && !ndefSupported"
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
      </div>
    </q-card>
  </q-dialog>
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
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    TokenInformation,
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
    tokenDecodesCorrectly: function () {
      return this.decodeToken(this.receiveData.tokensBase64) !== undefined;
    },
    knowThisMint: function () {
      const tokenJson = this.decodeToken(this.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        return false;
      }
      return this.knowThisMintOfTokenJson(tokenJson);
    },
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
    // handleLockBtn: function () {
    //   this.showP2PKDialog = !this.showP2PKDialog;
    //   if (!this.p2pkKeys.length || !this.showP2PKDialog) {
    //     this.generateKeypair();
    //   }
    //   this.showLastKey();
    // },
    // handlePaymentRequestBtn: function () {
    //   const prStore = usePRStore();
    //   this.showPRDialog = !this.showPRDialog;
    //   if (this.showPRDialog) {
    //     prStore.newPaymentRequest();
    //   }
    // },
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
      navigator.clipboard.readText().then((text) => {
        if (this.decodeToken(text)) {
          this.receiveData.tokensBase64 = text;
        } else {
          notifyWarning("Invalid token");
        }
      });
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

.q-card-top {
  border-top-left-radius: 0px !important;
  border-top-right-radius: 0px !important;
}
</style>
