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
      <div v-else class="text-center q-mb-lg">
        <div class="text-center q-mb-lg" v-if="sendData.tokens.length < 2">
          <q-responsive :ratio="1" class="q-mx-xl">
            <vue-qrcode
              :value="baseURL + '?token=' + sendData.tokensBase64"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
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

import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
import TokenInformation from "components/TokenInformation.vue";

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
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, ["showSendTokens"]),
    ...mapWritableState(useSendTokensStore, ["sendData"]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useMintsStore, ["activeProofs"]),
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
