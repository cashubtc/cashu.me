<template>
  <q-dialog
    v-model="showReceiveTokens"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-lg q-pt-md qcard">
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
          class="q-mr-none"
          v-if="!receiveData.tokensBase64.length"
          @click="handleLockBtn"
        >
          <q-icon name="lock_outline" class="q-pr-sm" />Lock
        </q-btn>
        <q-btn
          unelevated
          dense
          class="q-mx-sm"
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
          v-if="!enablePaymentRequest"
          v-close-popup
          rounded
          flat
          color="grey"
          class="q-ml-auto"
          >Close</q-btn
        >
      </div>
      <div
        v-if="!receiveData.tokensBase64.length && enablePaymentRequest"
        class="row q-mt-lg"
      >
        <q-btn
          unelevated
          dense
          class="q-mr-sm"
          @click="handlePaymentRequestBtn"
        >
          <q-icon name="move_to_inbox" class="q-pr-sm" />Payment Request
        </q-btn>
        <q-btn
          v-if="enablePaymentRequest"
          v-close-popup
          rounded
          flat
          color="grey"
          class="q-ml-auto"
          >Close</q-btn
        >
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
// import { useProofsStore } from "src/stores/proofs";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import token from "src/js/token";
import P2PKDialog from "./P2PKDialog.vue";
import PRDialog from "./PaymentRequestDialog.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
// import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";
import { map } from "underscore";
import { notifyError, notifySuccess, notify } from "../js/notify";

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    TokenInformation,
    P2PKDialog,
    PRDialog,
  },
  props: {},
  data: function () {
    return {
      showP2PKDialog: false,
      ndefSupported: "NDEFReader" in globalThis,
      scanningCard: false,
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
    ]),
    toggleScanner: function () {
      if (this.scanningCard === false) {
        try {
          this.ndef = new window.NDEFReader();
          this.controller = new AbortController();
          const signal = this.controller.signal;
          this.ndef
            .scan({ signal })
            .then(() => {
              console.log("> Scan started");

              this.ndef.addEventListener("readingerror", () => {
                console.error("Cannot read data from the NFC tag.");
                notifyError("Cannot read data from the NFC tag.");
                this.controller.abort();
                this.scanningCard = false;
              });

              this.ndef.addEventListener(
                "reading",
                ({ message, serialNumber }) => {
                  try {
                    const record = message.records[0];
                    const recordType = record.recordType;
                    switch (recordType) {
                      case "text":
                        const text = new TextDecoder().decode(record.data);
                        if (!text.startsWith("cashu")) {
                          throw new Error(
                            "text does not contain a cashu token"
                          );
                        }
                        this.receiveData.tokensBase64 = text;
                        break;
                      case "url":
                        const url = new TextDecoder().decode(record.data);
                        const i = url.indexOf("#token=cashu");
                        if (i === -1) {
                          throw new Error("URL does not contain a cashu token");
                        }
                        this.receiveData.tokensBase64 = url.substring(i + 7);
                        break;
                      case "mime":
                        if (record.mediaType !== "application/octet-stream") {
                          throw new Error("binary data expected");
                        }
                        const data = new Uint8Array(record.data.buffer);
                        const prefix = String.fromCharCode(...data.slice(0, 4));
                        if (prefix !== "craw") {
                          throw new Error(
                            "binary data does not contain a cashu token"
                          );
                        }
                        // TODO: decode the binary token from data
                        throw new Error(
                          "binary token parsing not implemented yet"
                        );
                        break;
                      default:
                        throw new Error(`unsupported recordType ${recordType}`);
                    }
                    const tokenJson = token.decode(
                      this.receiveData.tokensBase64
                    );
                    if (tokenJson == undefined) {
                      throw new Error("unreadable token");
                    }
                    if (!this.knowThisMintOfTokenJson(tokenJson)) {
                      this.addMint({ url: token.getMint(tokenJson) });
                    }
                    this.redeem();
                  } catch (err) {
                    console.error(`Something went wrong! ${err}`);
                    notifyError(`Something went wrong! ${err}`);
                  }
                  this.controller.abort();
                  this.scanningCard = false;
                }
              );
              this.scanningCard = true;
            })
            .catch((error) => {
              console.error(`NFC error: ${error.message}`);
              notifyError(`NFC error: ${error.message}`);
            });
        } catch (error) {
          console.error(`NFC error: ${error.message}`);
          notifyError(`NFC error: ${error.message}`);
        }
      } else {
        this.controller.abort();
        this.scanningCard = false;
      }
    },
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
      });
    },
  },
  created: function () {},
});
</script>
