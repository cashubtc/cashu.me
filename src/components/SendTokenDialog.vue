<template>
  <q-dialog v-model="showSendTokens" position="top">
    <q-card class="q-pa-lg q-pt-md qcard">
      <div v-if="!sendData.tokens">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12">
            <span class="text-subtitle1">Send ecash</span>
          </div>
        </div>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <div class="col-12">
            <ChooseMint :ticker-short="tickerShort" />
          </div>
        </div>

        <q-input
          filled
          dense
          type="number"
          v-model.number="sendData.amount"
          :label="'Amount (' + tickerShort + ') *'"
          mask="#"
          fill-mask="0"
          reverse-fill-mask
          autofocus
          class="q-mb-lg"
          @keyup.enter="sendTokens"
        ></q-input>
        <!-- <q-input
                filled
                dense
                v-model.trim="sendData.memo"
                label="Memo"
                ></q-input> -->
      </div>
      <div v-else class="text-center q-mb-md">
        <div class="text-center q-mb-md" v-if="qrCodeFragment">
          <q-responsive :ratio="1" class="q-mx-xs">
            <vue-qrcode
              :value="qrCodeFragment"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
        </div>
        <div class="q-pb-xs q-ba-none q-gutter-sm" v-if="showAnimatedQR">
          <q-btn
            flat
            style="font-size: 12px"
            color="primary"
            class="q-ma-none"
            @click="changeSpeed"
          >
            <q-icon name="speed" style="margin-right: 8px"></q-icon>
            Speed: {{ fragmentSpeedLabel }}
          </q-btn>
          <q-btn
            flat
            style="font-size: 12px"
            class="q-ma-none"
            color="primary"
            @click="changeSize"
          >
            <q-icon name="zoom_in" style="margin-right: 8px"></q-icon>
            Size: {{ fragmentLengthLabel }}
          </q-btn>
        </div>
        <div class="row">
          <div class="col-12">
            <q-input
              outlined
              dense
              readonly
              v-model="sendData.tokensBase64"
              label="Cashu token"
              type="textarea"
              class="q-mb-sm"
            ></q-input>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <TokenInformation
              :ticker-short="tickerShort"
              :proofs-to-show="sendData.tokens"
              :token-mint-url="getMint(decodeToken(sendData.tokensBase64))"
            />
          </div>
        </div>
      </div>
      <div class="row q-mt-lg">
        <q-btn
          v-if="!sendData.tokens"
          :disable="sendData.amount == null || sendData.amount <= 0"
          @click="sendTokens"
          color="primary"
          type="submit"
          >Send Tokens</q-btn
        >
        <!-- <q-btn v-else @click="burnTokens" outline color="grey"
                >Burn Tokens</q-btn
                > -->
        <div v-else>
          <q-btn
            class="q-mx-xs"
            color="primary"
            @click="copyText(sendData.tokensBase64)"
            >Copy token</q-btn
          >
          <q-btn
            class="q-mx-xs"
            color="primary"
            outline
            @click="copyText(baseURL + '?token=' + sendData.tokensBase64)"
            >Copy link</q-btn
          >
        </div>

        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useProofsStore } from "src/stores/proofs";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import token from "src/js/token";
import { Buffer } from "buffer";

import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";
import { UR, UREncoder } from "@gandlaf21/bc-ur";

export default defineComponent({
  name: "SendTokenDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    TokenInformation,
  },
  props: {
    checkTokenSpendableWorker: Function,
  },
  data: function () {
    return {
      baseURL: location.protocol + "//" + location.host + location.pathname,
      showAnimatedQR: false,
      qrCodeFragment: "",
      qrInterval: null,
      encoder: null,

      // parameters for animated QR
      currentFragmentLength: 100,
      fragmentLengthMedium: 100,
      fragmentLengthShort: 50,
      fragmentLengthLong: 150,
      fragmentLengthLabel: "M",

      currentFragmentInterval: 250,
      fragmentIntervalMedium: 250,
      fragmentIntervalFast: 150,
      framentInervalSlow: 500,
      fragmentSpeedLabel: "M",
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, ["showSendTokens"]),
    ...mapWritableState(useSendTokensStore, ["sendData"]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, ["activeProofs"]),
  },
  watch: {
    "sendData.tokensBase64": function (val) {
      this.showAnimatedQR = false;
      if (!val.length) {
        // it's emptied
        return;
      }
      // check if token has more than one proof
      const tokenObj = token.decode(val);
      const proofs = tokenObj.token[0].proofs;
      if (!proofs.length) {
        // no proofs
        return;
      } else if (proofs.length <= 2) {
        // we can display a single QR code
        this.qrCodeFragment = val;
      } else {
        // we need to split the token into multiple QR codes
        this.showAnimatedQR = true;
        this.qrCodeFragment = "";
        this.startQrCodeLoop();
      }
    },
    showSendTokens: function (val) {
      if (val) {
        // this.startQrCodeLoop();
      } else {
        clearInterval(this.qrInterval);
      }
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["splitToSend"]),
    ...mapActions(useProofsStore, [
      "serializeProofs",
      "getProofsMint",
      "serializeProofsV2",
    ]),
    ...mapActions(useTokensStore, [
      "addPaidToken",
      "addPendingToken",
      "setTokenPaid",
    ]),
    // TOKEN METHODS
    decodeToken: function (encoded_token) {
      return token.decode(encoded_token);
    },
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token) {
      return token.getMint(decoded_token);
    },
    startQrCodeLoop: async function () {
      if (this.sendData.tokensBase64.length == 0) {
        return;
      }
      const messageBuffer = Buffer.from(this.sendData.tokensBase64);
      const ur = UR.fromBuffer(messageBuffer);
      const firstSeqNum = 0;
      this.encoder = new UREncoder(ur, this.currentFragmentLength, firstSeqNum);
      this.qrInterval = setInterval(() => {
        this.qrCodeFragment = this.encoder.nextPart();
      }, this.currentFragmentInterval);
    },
    updateQrCode: function () {
      this.qrCodeFragment = this.encoder.nextPart();
    },
    changeSpeed: function () {
      // cycle currentFragmentInterval between slow, medium and fast
      if (this.currentFragmentInterval == this.fragmentIntervalMedium) {
        this.currentFragmentInterval = this.framentInervalSlow;
        this.fragmentSpeedLabel = "S";
      } else if (this.currentFragmentInterval == this.framentInervalSlow) {
        this.currentFragmentInterval = this.fragmentIntervalFast;
        this.fragmentSpeedLabel = "F";
      } else {
        this.currentFragmentInterval = this.fragmentIntervalMedium;
        this.fragmentSpeedLabel = "M";
      }
      console.log(
        "### this.currentFragmentInterval",
        this.currentFragmentInterval
      );
      clearInterval(this.qrInterval);
      this.startQrCodeLoop();
    },
    changeSize: function () {
      // cycle currentFragmentLength between short, medium and long
      if (this.currentFragmentLength == this.fragmentLengthMedium) {
        this.currentFragmentLength = this.fragmentLengthShort;
        this.fragmentLengthLabel = "S";
      } else if (this.currentFragmentLength == this.fragmentLengthShort) {
        this.currentFragmentLength = this.fragmentLengthLong;
        this.fragmentLengthLabel = "L";
      } else {
        this.currentFragmentLength = this.fragmentLengthMedium;
        this.fragmentLengthLabel = "M";
      }
      console.log("### this.currentFragmentLength", this.currentFragmentLength);
      clearInterval(this.qrInterval);
      this.startQrCodeLoop();
    },
    sendTokens: async function () {
      /*
      calls splitToSend, displays token and kicks off the spendableWorker
      */
      try {
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        let { firstProofs, scndProofs } = await this.splitToSend(
          this.activeProofs,
          this.sendData.amount,
          true
        );

        // update UI
        this.sendData.tokens = scndProofs;
        console.log("### this.sendData.tokens", this.sendData.tokens);

        this.sendData.tokensBase64 = this.serializeProofs(scndProofs);
        this.addPendingToken({
          amount: -this.sendData.amount,
          serializedProofs: this.sendData.tokensBase64,
        });

        this.checkTokenSpendableWorker();
      } catch (error) {
        console.error(error);
      }
    },
  },
  created: function () {},
});
</script>
