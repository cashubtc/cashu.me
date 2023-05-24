<template>
  <q-dialog v-model="showReceiveTokens" position="top">
    <q-card class="q-pa-lg q-pt-md qcard">
      <div>
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12">
            <span class="text-subtitle1">Receive Ecash</span>
          </div>
        </div>
        <q-input
          filled
          dense
          v-model="receiveData.tokensBase64"
          label="Enter Cashu token"
          type="textarea"
          autofocus
          class="q-mb-lg"
        ></q-input>
      </div>
      <div
        class="row"
        v-if="
          receiveData.tokensBase64.length &&
          decodeToken(receiveData.tokensBase64) != ''
        "
      >
        <div class="col-12">
          <TokenInformation
            :ticker-short="tickerShort"
            :proofs-to-show="getProofs(decodeToken(receiveData.tokensBase64))"
            :token-mint-url="getMint(decodeToken(receiveData.tokensBase64))"
          />
        </div>
      </div>
      <div class="row q-mt-lg">
        <q-btn
          @click="redeem"
          color="primary"
          :disabled="!decodeToken(receiveData.tokensBase64)"
          >Receive</q-btn
        >
        <q-btn
          unelevated
          icon="photo_camera"
          class="q-mx-0"
          v-if="hasCamera"
          @click="showCamera"
        ></q-btn>
        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
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
// import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";

import token from "src/js/token";

import { mapActions, mapState, mapWritableState } from "pinia";
// import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";

export default defineComponent({
  name: "SendTokenDialog",
  mixins: [windowMixin],
  components: {
    TokenInformation,
  },
  props: {
    checkTokenSpendableWorker: Function,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, ["activeProofs"]),
  },
  methods: {
    ...mapActions(useWalletStore, ["redeem"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera", "hasCamera"]),

    // ...mapActions(useWalletStore, ["splitToSend"]),
    // ...mapActions(useProofsStore, [
    //   "serializeProofs",
    //   "getProofsMint",
    //   "serializeProofsV2",
    // ]),
    // ...mapActions(useTokensStore, [
    //   "addPaidToken",
    //   "addPendingToken",
    //   "setTokenPaid",
    // ]),
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
