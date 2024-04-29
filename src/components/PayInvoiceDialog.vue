<template>
  <q-dialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    position="top"
    v-if="!camera.show"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg q-pt-xl qcard">
      <div v-if="payInvoiceData.invoice">
        <h6
          v-if="
            payInvoiceData.meltQuote.response &&
            payInvoiceData.meltQuote.response.amount > 0
          "
          class="q-my-none"
        >
          Pay
          {{
            formatCurrency(payInvoiceData.meltQuote.response.amount, activeUnit)
          }}
        </h6>
        <h6 v-else-if="payInvoiceData.meltQuote.error != ''" class="q-my-none">
          {{ payInvoiceData.meltQuote.error }}
        </h6>
        <h6 v-else class="q-my-none">Processing...</h6>
        <q-separator class="q-my-sm"></q-separator>
        <p class="text-wrap">
          <strong v-if="payInvoiceData.invoice.description">Memo:</strong>
          {{ payInvoiceData.invoice.description }}<br />
        </p>
        <div class="col-12">
          <ChooseMint :ticker-short="tickerShort" />
        </div>
        <div v-if="canPay" class="row q-mt-lg">
          <q-btn
            unelevated
            color="primary"
            :disabled="
              payInvoiceData.blocking || payInvoiceData.meltQuote.error != ''
            "
            @click="melt"
            :label="!payInvoiceData.blocking ? 'Pay' : 'Processing...'"
            ><q-spinner-tail
              v-if="payInvoiceData.blocking"
              color="white"
              size="1em"
          /></q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto"
            >Cancel</q-btn
          >
        </div>
        <div v-else class="row q-mt-lg">
          <q-btn unelevated disabled color="yellow" text-color="black"
            >Not enough funds!</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto"
            >Cancel</q-btn
          >
        </div>
      </div>
      <div v-else-if="payInvoiceData.lnurlpay">
        <q-form @submit="lnurlPaySecond" class="q-gutter-md">
          <p
            v-if="
              payInvoiceData.lnurlpay.maxSendable ==
              payInvoiceData.lnurlpay.minSendable
            "
            class="q-my-none text-h6 text-center"
          >
            <b>{{ payInvoiceData.domain }}</b> is requesting
            {{ payInvoiceData.lnurlpay.maxSendable / 1000 }}
            {{ tickerShort }}
          </p>
          <p v-else class="q-my-none text-h6 text-center">
            <b>{{
              payInvoiceData.lnurlpay.targetUser || payInvoiceData.domain
            }}</b>
            is requesting <br />
            between
            <b>{{ payInvoiceData.lnurlpay.minSendable / 1000 }}</b>
            and
            <b>{{ payInvoiceData.lnurlpay.maxSendable / 1000 }}</b>
            {{ tickerShort }}
          </p>
          <q-separator class="q-my-sm"></q-separator>
          <div class="row" v-if="payInvoiceData.lnurlpay.description">
            <p class="col text-justify text-italic">
              {{ payInvoiceData.lnurlpay.description }}
            </p>
            <p class="col-4 q-pl-md" v-if="payInvoiceData.lnurlpay.image">
              <q-img :src="payInvoiceData.lnurlpay.image" />
            </p>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                filled
                dense
                autofocus
                v-model.number="payInvoiceData.input.amount"
                type="number"
                :label="'Amount (' + tickerShort + ') *'"
                :min="payInvoiceData.lnurlpay.minSendable / 1000"
                :max="payInvoiceData.lnurlpay.maxSendable / 1000"
                :readonly="
                  payInvoiceData.lnurlpay.maxSendable ==
                  payInvoiceData.lnurlpay.minSendable
                "
              ></q-input>
            </div>
            <div
              class="col-8 q-pl-md"
              v-if="payInvoiceData.lnurlpay.commentAllowed > 0"
            >
              <q-input
                filled
                dense
                v-model="payInvoiceData.input.comment"
                _type="payInvoiceData.lnurlpay.commentAllowed > 64 ? 'textarea' : 'text'"
                label="Comment (optional)"
                :maxlength="payInvoiceData.lnurlpay.commentAllowed"
              ></q-input>
            </div>
          </div>
          <div class="row q-mt-lg">
            <q-btn unelevated color="primary" type="submit">Send</q-btn>
            <q-btn v-close-popup flat color="grey" class="q-ml-auto"
              >Cancel</q-btn
            >
          </div>
        </q-form>
      </div>
      <div v-else>
        <q-form
          v-if="!camera.show"
          @submit="decodeAndQuote(payInvoiceData.input.request)"
          class="q-gutter-md"
        >
          <q-input
            ref="pasteInput"
            round
            outlined
            v-model.trim="payInvoiceData.input.request"
            type="textarea"
            label="Lightning invoice or address"
            @keyup.enter="decodeAndQuote(payInvoiceData.input.request)"
          >
          </q-input>
          <div class="row q-mt-lg">
            <q-btn
              unelevated
              color="primary"
              :disable="payInvoiceData.input.request == ''"
              type="submit"
              >Enter</q-btn
            >
            <q-btn
              unelevated
              icon="photo_camera"
              class="q-mx-0"
              v-if="hasCamera"
              @click="showCamera"
            >
            </q-btn>
            <q-btn v-close-popup flat color="grey" class="q-ml-auto"
              >Close</q-btn
            >
          </div>
        </q-form>
        <!-- <div v-else>
            <q-responsive :ratio="1">
              <qrcode-stream
                @decode="decodeQR"
                class="rounded-borders"
              ></qrcode-stream>
            </q-responsive>
            <div class="row q-mt-lg">
              <q-btn @click="closeCamera" flat color="grey" class="q-ml-auto">
                Cancel
              </q-btn>
            </div>
          </div> -->
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useCameraStore } from "src/stores/camera";
import { useMintsStore } from "src/stores/mints";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "components/ChooseMint.vue";
// import * as bolt11Decoder from "light-bolt11-decoder";
import * as _ from "underscore";

export default defineComponent({
  name: "PayInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
  },
  props: {
    checkTokenSpendableWorker: Function,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapWritableState(useCameraStore, ["camera"]),
    ...mapState(useWalletStore, ["payInvoiceData"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
      "activeUnit",
      "activeBalance",
    ]),
  },
  methods: {
    ...mapActions(useWalletStore, [
      "melt",
      "meltQuote",
      "decodeRequest",
      "lnurlPaySecond",
    ]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera", "hasCamera"]),
    canPay: function () {
      if (!this.payInvoiceData.invoice) return false;
      return payInvoiceData.meltQuote.response.amount <= this.activeBalance;
    },
    closeParseDialog: function () {
      setTimeout(() => {
        clearInterval(this.payInvoiceData.paymentChecker);
      }, 10000);
    },
    decodeAndQuote: function (request) {
      this.decodeRequest(request);
    },
  },
  created: function () {},
});
</script>
