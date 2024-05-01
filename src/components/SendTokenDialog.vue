<template>
  <q-dialog
    v-model="showSendTokens"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <div v-if="!sendData.tokens">
        <q-card-section class="q-pa-lg q-pt-md">
          <div class="row items-center no-wrap q-mb-sm">
            <div class="col-10">
              <span class="text-h6">Send ecash</span>
            </div>
            <div class="col-2">
              <ToggleUnit class="q-mt-md" />
            </div>
          </div>
          <div class="row items-center no-wrap q-my-sm q-py-none">
            <div class="col-12">
              <ChooseMint :ticker-short="tickerShort" />
            </div>
          </div>

          <q-input
            type="number"
            v-model.number="sendData.amount"
            :label="'Amount (' + tickerShort + ') *'"
            mask="#"
            fill-mask="0"
            reverse-fill-mask
            round
            outlined
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
          <div class="row q-mt-lg">
            <q-btn
              v-if="!sendData.tokens"
              :disable="sendData.amount == null || sendData.amount <= 0"
              @click="sendTokens"
              color="primary"
              rounded
              type="submit"
              >Send Ecash</q-btn
            >
            <q-chip
              v-if="canSpendOffline"
              outline
              color="primary"
              icon="check"
              class="q-ml-auto"
            >
              Can send offline
            </q-chip>
          </div>
        </q-card-section>
      </div>
      <div v-else class="text-center q-mb-xs">
        <q-card-section class="q-pa-none q-pt-md">
          <div class="text-center q-mb-md" v-if="qrCodeFragment">
            <q-responsive :ratio="1" class="q-mx-none">
              <vue-qrcode
                :value="qrCodeFragment"
                :options="{ width: 400 }"
                class="rounded-borders"
                @click="copyText(sendData.tokensBase64)"
              >
              </vue-qrcode>
            </q-responsive>
          </div>
          <div class="q-pb-xs q-ba-none q-gutter-sm" v-if="showAnimatedQR">
            <q-btn
              flat
              style="font-size: 12px"
              color="grey"
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
              color="grey"
              @click="changeSize"
            >
              <q-icon name="zoom_in" style="margin-right: 8px"></q-icon>
              Size: {{ fragmentLengthLabel }}
            </q-btn>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label overline class="q-mb-sm text-white"
                >Ecash</q-item-label
              >
            </div>
            <div class="row justify-center q-py-md">
              <q-item-label style="font-size: 28px" class="text-weight-bold">
                <q-spinner-dots
                  v-if="runnerActive"
                  color="primary"
                  size="0.8em"
                  class="q-mr-md"
                />
                <strong>{{ displayUnit }}</strong></q-item-label
              >
            </div>
            <div class="row justify-center q-pt-sm">
              <q-icon
                name="account_balance"
                size="0.95rem"
                color="grey"
                class="q-mr-sm"
              />
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                ><strong>{{ shortUrl }}</strong></q-item-label
              >
            </div>
            <div class="row q-mt-lg">
              <q-btn
                class="q-mx-xs"
                size="md"
                flat
                @click="copyText(sendData.tokensBase64)"
                >Copy</q-btn
              >
              <q-btn
                class="q-mx-none"
                color="grey"
                size="md"
                icon="link"
                flat
                @click="copyText(baseURL + '?token=' + sendData.tokensBase64)"
              />

              <q-btn v-close-popup flat color="grey" class="q-ml-auto"
                >Close</q-btn
              >
            </div>
          </q-card-section>
        </q-card-section>
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
import { getShortUrl } from "src/js/wallet-helpers";
import { useSettingsStore } from "src/stores/settings";
import { useWorkersStore } from "src/stores/workers";
import token from "src/js/token";
import { Buffer } from "buffer";

import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import ToggleUnit from "components/ToggleUnit.vue";
import { UR, UREncoder } from "@gandlaf21/bc-ur";

export default defineComponent({
  name: "SendTokenDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    ToggleUnit,
  },
  props: {},
  data: function () {
    return {
      baseURL: location.protocol + "//" + location.host + location.pathname,
      showAnimatedQR: false,
      qrCodeFragment: "",
      qrInterval: null,
      encoder: null,

      // parameters for animated QR
      currentFragmentLength: 150,
      fragmentLengthMedium: 100,
      fragmentLengthShort: 50,
      fragmentLengthLong: 150,
      fragmentLengthLabel: "L",

      currentFragmentInterval: 150,
      fragmentIntervalMedium: 250,
      fragmentIntervalFast: 150,
      framentInervalSlow: 500,
      fragmentSpeedLabel: "F",
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, ["showSendTokens"]),
    ...mapWritableState(useSendTokensStore, ["sendData"]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, ["activeProofs", "activeUnit", "activeMintUrl"]),
    ...mapState(useSettingsStore, ["checkSentTokens"]),
    ...mapState(useWorkersStore, ["tokenWorkerRunning"]),
    // TOKEN METHODS
    sumProofs: function () {
      let proofs = token.getProofs(token.decode(this.sendData.tokensBase64));
      return proofs.flat().reduce((sum, el) => (sum += el.amount), 0);
    },
    displayUnit: function () {
      let display = this.formatCurrency(this.sumProofs, this.tokenUnit);
      return display;
    },
    tokenUnit: function () {
      return token.getUnit(token.decode(this.sendData.tokensBase64));
    },
    tokenMintUrl: function () {
      let mint = token.getMint(token.decode(this.sendData.tokensBase64));
      return mint;
    },
    displayMemo: function () {
      return token.getMemo(token.decode(this.sendData.tokensBase64));
    },
    shortUrl: function () {
      return getShortUrl(this.tokenMintUrl);
    },
    decodedToken: function () {
      return token.decode(this.sendData.tokensBase64);
    },
    runnerActive: function () {
      return this.tokenWorkerRunning;
    },
    canSpendOffline: function () {
      if (!this.sendData.amount) {
        return false;
      }
      // check if entered amount is the same as the result of coinSelect(spendableProofs(activeProofs), amount)
      let spendableProofs = this.spendableProofs(this.activeProofs);
      let selectedProofs = this.coinSelect(
        spendableProofs,
        this.sendData.amount
      );
      const sumSelectedProofs = selectedProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
      return sumSelectedProofs == this.sendData.amount;
    },
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
        this.sendData.data = "";
        this.sendData.tokensBase64 = "";
      }
    },
  },
  methods: {
    ...mapActions(useWorkersStore, ["checkTokenSpendableWorker"]),
    ...mapActions(useWalletStore, [
      "splitToSend",
      "coinSelect",
      "spendableProofs",
    ]),
    ...mapActions(useProofsStore, [
      "serializeProofs",
      "getProofsMint",
      "serializeProofsV2",
    ]),
    ...mapActions(useTokensStore, ["addPendingToken", "setTokenPaid"]),
    decodeToken: function (encoded_token) {
      return token.decode(encoded_token);
    },
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getAmount: function (decoded_token) {
      return token.getAmount(decoded_token);
    },
    getUnit: function (decoded_token) {
      return token.getUnit(decoded_token);
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
        let sendAmount = this.sendData.amount;
        // if unit is USD, multiply by 100
        if (this.activeUnit === "usd") {
          sendAmount = sendAmount * 100;
        }
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        let { _, sendProofs } = await this.splitToSend(
          this.activeProofs,
          sendAmount,
          true
        );

        // update UI
        this.sendData.tokens = sendProofs;
        console.log("### this.sendData.tokens", this.sendData.tokens);

        this.sendData.tokensBase64 = this.serializeProofs(sendProofs);
        this.addPendingToken({
          amount: -this.sendData.amount,
          serializedProofs: this.sendData.tokensBase64,
          unit: this.activeUnit,
          mint: this.activeMintUrl,
        });

        if (!this.g.offline) {
          this.checkTokenSpendableWorker(this.sendData.tokensBase64);
        }

        // if (this.checkSentTokens) {
        //   console.log("### kick off checkTokenSpendableWorker");
        //   this.checkTokenSpendableWorker(this.sendData.tokensBase64);
        // }
      } catch (error) {
        console.error(error);
      }
    },
  },
  created: function () {},
});
</script>
