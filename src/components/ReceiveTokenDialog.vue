<template>
  <q-dialog
    v-model="showReceiveTokens"
    position="top"
    :maximized="$q.screen.lt.sm"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card v-model="showReceiveTokens" class="q-pa-lg qcard q-card-top">
      <q-btn v-close-popup rounded flat color="grey" class="close-btn-position"
        >Close</q-btn
      >
      <div>
        <div class="row items-center no-wrap q-mb-sm q-mb-sm q-py-lg">
          <div class="col-9">
            <span class="text-h6"
              >Receive
              {{
                tokenAmount && tokenUnit
                  ? formatCurrency(tokenAmount, tokenUnit)
                  : "Ecash"
              }}</span
            >
            <span
              v-if="
                tokenAmount && tokenUnit && tokenUnit == 'sat' && bitcoinPrice
              "
              class="q-ml-xs text-subtitle2 text-grey-6"
            >
              ({{
                formatCurrency(
                  (bitcoinPrice / 100000000) * tokenAmount,
                  "USD",
                  true
                )
              }})
            </span>
          </div>
        </div>
        <div class="relative-container">
          <q-input
            round
            outlined
            spellcheck="false"
            v-model="receiveData.tokensBase64"
            label="Paste Cashu token"
            type="textarea"
            autofocus
            class="q-mb-lg cashub-nowrap"
            @keyup.enter="receiveIfDecodes"
          >
            <q-icon
              v-if="receiveData.tokensBase64"
              color="dark"
              name="close"
              class="floating-button cursor-pointer"
              @click="receiveData.tokensBase64 = ''"
            />
          </q-input>
        </div>
      </div>
      <div class="row">
        <!-- if !tokenDecodesCorrectly, display error -->
        <q-btn
          v-if="receiveData.tokensBase64.length && !tokenDecodesCorrectly"
          disabled
          color="yellow"
          text-color="black"
          rounded
          unelevated
          class="q-ml-xs q-mr-sm"
          label="Invalid token"
        ></q-btn>

        <!-- EMPTY INPUT -->
        <div v-if="!receiveData.tokensBase64.length">
          <q-btn
            unelevated
            dense
            class="q-mr-sm"
            v-if="canPasteFromClipboard"
            @click="pasteToParseDialog(true)"
          >
            <q-icon name="content_paste" class="q-pr-sm" />Paste</q-btn
          >
          <q-btn
            unelevated
            dense
            class="q-mx-sm"
            v-if="hasCamera"
            @click="showCamera"
          >
            <ScanIcon size="1.5em" />
            <span class="q-pl-sm">Scan</span>
          </q-btn>
          <q-btn
            unelevated
            dense
            class="q-mx-sm"
            v-if="ndefSupported"
            :loading="scanningCard"
            :disabled="scanningCard"
            @click="toggleScanner"
          >
            <NfcIcon class="q-pr-xs" />
            <q-tooltip>{{
              ndefSupported ? "Read from NFC card" : "NDEF unsupported"
            }}</q-tooltip>
            <template v-slot:loading>
              <q-spinner @click="toggleScanner"> </q-spinner>
            </template>
            NFC
          </q-btn>
        </div>

        <!-- VALID TOKEN -->
        <div v-if="tokenDecodesCorrectly" class="q-mr-xl">
          <div class="row">
            <TokenInformation
              :encodedToken="receiveData.tokensBase64"
              :showAmount="true"
              :showMintCheck="true"
              :showP2PKCheck="true"
            />
          </div>
          <div class="row q-pt-md">
            <q-btn
              @click="receiveIfDecodes"
              color="primary"
              rounded
              class="q-ml-xs q-mr-sm"
              :disabled="addMintBlocking"
              :loading="swapBlocking"
              :label="
                knowThisMint
                  ? addMintBlocking
                    ? 'Adding mint ...'
                    : 'Receive'
                  : 'Receive'
              "
            >
              <template v-slot:loading>
                <q-spinner-hourglass />
              </template>
            </q-btn>
            <!-- swap to trusted mint -->
            <q-btn
              v-if="
                enableReceiveSwaps &&
                (!knowThisMint || true) &&
                activeMintUrl &&
                getMint(decodeToken(receiveData.tokensBase64)) != activeMintUrl
              "
              @click="handleSwapToTrustedMint"
              color="primary"
              rounded
              flat
              class="q-mr-none q-pr-sm"
            >
              <q-icon name="swap_horiz" class="q-pr-sm" />
              Swap
              <q-tooltip>Swap to a trusted mint</q-tooltip>
            </q-btn>
            <q-btn
              @click="addPendingTokenToHistory(receiveData.tokensBase64)"
              color="primary"
              rounded
              flat
              class="q-mr-none q-pr-sm"
              >Later
              <q-tooltip>Add to history to receive later</q-tooltip>
            </q-btn>
          </div>
        </div>
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
import { usePriceStore } from "src/stores/price";
import { useSwapStore } from "src/stores/swap";
import { useSettingsStore } from "src/stores/settings";
import token from "src/js/token";

import { mapActions, mapState, mapWritableState } from "pinia";
import {
  ChevronLeft as ChevronLeftIcon,
  Clipboard as ClipboardIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Scan as ScanIcon,
  Nfc as NfcIcon,
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
    NfcIcon,
    ScanIcon,
  },
  data: function () {
    return {
      showP2PKDialog: false,
      ndefSupported: "NDEFReader" in globalThis,
    };
  },
  watch: {
    watchClipboardPaste(val) {
      if (val) {
        this.$nextTick(() => {
          this.pasteToParseDialog();
          this.watchClipboardPaste = false;
        });
      }
    },
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "watchClipboardPaste",
      "receiveData",
      "scanningCard",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(usePriceStore, ["bitcoinPrice"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "activeUnit",
      "addMintBlocking",
    ]),
    ...mapState(useSettingsStore, ["enableReceiveSwaps"]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    ...mapState(useCameraStore, ["hasCamera"]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    ...mapState(usePRStore, ["enablePaymentRequest"]),
    ...mapState(useSwapStore, ["swapBlocking"]),
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
    tokenAmount: function () {
      if (!this.tokenDecodesCorrectly) {
        return 0;
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return this.getProofs(decodedToken).reduce(
        (sum, el) => (sum += el.amount),
        0
      );
    },
    tokenUnit: function () {
      if (!this.tokenDecodesCorrectly) {
        return "";
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return token.getUnit(decodedToken);
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
      "pasteToParseDialog",
    ]),
    // TOKEN METHODS
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token) {
      return token.getMint(decoded_token);
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
        token: token,
      });
      this.showReceiveTokens = false;
      // show success notification
      this.notifySuccess("Incoming payment added to history.");
    },
    handleSwapToTrustedMint: function () {
      const mint = useMintsStore().activeMint().mint;
      useReceiveTokensStore().meltTokenToMint(
        this.receiveData.tokensBase64,
        mint
      );
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

.cashub-nowrap {
  word-break: break-all;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  hyphens: none;
  font-size: 0.9em;
  font-family: monospace;
}

.relative-container {
  position: relative;
}

.floating-button {
  position: absolute;
  top: 10px;
  right: 0px;
  z-index: 100;
  padding: 1px;
  background-color: var(--q-primary);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
