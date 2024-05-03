<template>
  <q-dialog
    v-model="showSendTokens"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!--  enter send data -->
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
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div v-if="showLockInput" class="row items-center no-wrap">
              <div class="col-9">
                <q-input
                  v-model="p2pkInput"
                  label="P2PK public key"
                  outlined
                  clearable
                  @keyup.enter="lockTokens"
                ></q-input>
              </div>
              <div class="col-3">
                <q-btn
                  rounded
                  color="primary"
                  class="q-mx-md"
                  icon="add"
                  v-if="isValidPubkey(p2pkInput)"
                  @click="addPubkey(p2pkInput)"
                ></q-btn>
                <q-btn
                  align="center"
                  v-if="!p2pkInput"
                  icon="qr_code_scanner"
                  flat
                  outline
                  color="primary"
                  rounded
                  @click="showCamera"
                />
                <q-btn
                  align="center"
                  v-if="p2pkInput"
                  icon="close"
                  flat
                  outline
                  color="primary"
                  label="close"
                  rounded
                  @click="
                    p2pkInput = '';
                    showLockInput = false;
                  "
                />
              </div>
            </div>
          </transition>
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
            <div v-if="sendData.p2pkPubkey" class="row">
              <transition
                appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut"
              >
                <q-btn
                  rounded
                  flat
                  color="primary"
                  icon="lock"
                  @click="showLockInput = true"
                >
                </q-btn>
              </transition>
            </div>
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <q-btn
                v-if="sendData.amount > 0 && !showLockInput"
                :disable="sendData.p2pkPubkey == null || sendData.amount <= 0"
                color="primary"
                class="q-ml-md"
                outline
                rounded
                @click="showLockInput = true"
                ><q-icon size="xs" class="q-mr-xs" name="lock" /> Lock</q-btn
              >
            </transition>
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <q-chip
                v-if="canSpendOffline && !sendData.p2pkPubkey && !showLockInput"
                outline
                color="primary"
                icon="check"
                class="q-ml-auto"
              >
                Can send offline
              </q-chip>
            </transition>
          </div>
        </q-card-section>
      </div>

      <!-- show ecash details -->
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
              <q-btn
                class="q-mx-none"
                color="grey"
                icon="delete"
                size="md"
                @click="showDeleteDialog = true"
                flat
              >
                <q-tooltip>Delete Ecash</q-tooltip>
              </q-btn>
              <q-btn v-close-popup flat color="grey" class="q-ml-auto"
                >Close</q-btn
              >
            </div>
          </q-card-section>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
  <!-- popup dialog to confirm deletion activated by showDeleteDialog -->
  <q-dialog v-model="showDeleteDialog">
    <q-card class="q-pa-lg q-pt-md qcard">
      <q-card-section class="q-pa-none q-pt-md">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12">
            <span class="text-h6">Delete Ecash</span>
          </div>
        </div>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <div class="col-12">
            <q-item-label>
              Are you sure you want to delete this transaction from your
              history?
            </q-item-label>
          </div>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            @click="deleteThisToken"
            color="negative"
            rounded
            class="q-mr-sm"
            >Delete</q-btn
          >
          <q-btn v-close-popup rounded flat color="grey" class="q-ml-auto"
            >Cancel</q-btn
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- QR CODE SCANNER  -->
  <q-dialog v-model="camera.show">
    <QrcodeReader @decode="decodeQR" />
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
import { useCameraStore } from "src/stores/camera";

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
      showDeleteDialog: false,
      showLockInput: false,

      p2pkInput: "",

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
    ...mapWritableState(useCameraStore, ["camera", "hasCamera"]),
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
    ...mapActions(useWorkersStore, [
      "checkTokenSpendableWorker",
      "clearAllWorkers",
    ]),
    ...mapActions(useWalletStore, [
      "splitToSend",
      "sendToLock",
      "coinSelect",
      "spendableProofs",
    ]),
    ...mapActions(useProofsStore, [
      "serializeProofs",
      "getProofsMint",
      "serializeProofsV2",
    ]),
    ...mapActions(useTokensStore, [
      "addPendingToken",
      "setTokenPaid",
      "deleteToken",
    ]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    decodeQR: function (res) {
      this.camera.data = res;
      this.camera.show = false;
      // this.decodeRequest(res);
      this.sendData.p2pkPubkey = res;
      return;
      if (isValidPubkey(res)) {
        this.sendData.p2pkPubkey = res;
      } else {
        this.notifyError("No valid key");
      }
    },
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
    deleteThisToken: function () {
      this.deleteToken(this.sendData.tokensBase64);
      this.showSendTokens = false;
      this.showDeleteDialog = false;
      this.clearAllWorkers();
    },
    showQrScanner: function () {},
    isValidPubkey: function (pubkey) {
      return pubkey && pubkey.length == 66;
    },
    addPubkey: function (pubkey) {
      this.sendData.p2pkPubkey = pubkey;
    },
    lockTokens: async function () {
      let sendAmount = this.sendData.amount;
      // if unit is USD, multiply by 100
      if (this.activeUnit === "usd") {
        sendAmount = sendAmount * 100;
      }
      try {
        // keep firstProofs, send scndProofs and delete them (invalidate=true)
        let { _, sendProofs } = await this.sendToLock(
          this.activeProofs,
          sendAmount,
          this.sendData.p2pkPubkey
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
      } catch (error) {
        console.error(error);
      }
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
});
</script>
