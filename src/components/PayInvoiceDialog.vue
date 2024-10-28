<template>
  <q-dialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    position="top"
    v-if="!camera.show"
    backdrop-filter="blur(2px) brightness(60%)"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-lg q-pt-xl qcard">
      <div v-if="payInvoiceData.invoice">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-10">
            <h6
              v-if="
                payInvoiceData.meltQuote.response &&
                payInvoiceData.meltQuote.response.amount > 0
              "
              class="q-my-none"
            >
              Pay
              {{
                formatCurrency(
                  payInvoiceData.meltQuote.response.amount,
                  activeUnit,
                  true
                )
              }}
            </h6>
            <h6
              v-else-if="payInvoiceData.meltQuote.error != ''"
              class="q-my-none"
            >
              {{ payInvoiceData.meltQuote.error }}
            </h6>
            <h6 v-else class="q-my-none">Processing...</h6>
          </div>
          <div class="col-2">
            <ToggleUnit class="q-mt-md" />
          </div>
        </div>
        <p class="text-wrap">
          <strong v-if="payInvoiceData.invoice.description">Memo:</strong>
          {{ payInvoiceData.invoice.description }}<br />
        </p>
        <div class="col-12">
          <ChooseMint :ticker-short="tickerShort" />
        </div>
        <div class="col-12">
          <MultinutPicker />
        </div>
        <div v-if="enoughActiveBalance" class="row q-mt-lg">
          <q-btn
            unelevated
            rounded
            color="primary"
            :disabled="
              payInvoiceData.blocking || payInvoiceData.meltQuote.error != ''
            "
            @click="melt"
            :label="
              payInvoiceData.meltQuote.error != ''
                ? 'Error'
                : !payInvoiceData.blocking
                ? 'Pay'
                : 'Processing...'
            "
            :loading="globalMutexLock && !payInvoiceData.blocking"
            class="q-px-lg"
          >
            <template v-slot:loading>
              <q-spinner-hourglass />
            </template>
          </q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
        <div v-else class="row q-mt-lg">
          <q-btn unelevated rounded disabled color="yellow" text-color="black"
            >Mint balance too low</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
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
            <b>{{ payInvoiceData.lnurlpay.domain }}</b> is requesting
            {{ payInvoiceData.lnurlpay.maxSendable / 1000 }}
            {{ tickerShort }}
          </p>
          <p v-else class="q-my-none text-h6 text-center">
            <b>{{
              payInvoiceData.lnurlpay.targetUser ||
              payInvoiceData.lnurlpay.domain
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
              >Close</q-btn
            >
          </div>
        </q-form>
      </div>
      <div v-else>
        <div class="row items-center no-wrap q-mb-xl">
          <div class="col-10">
            <span class="text-h6">Pay Lightning</span>
          </div>
        </div>
        <q-form
          v-if="!camera.show"
          @submit="decodeAndQuote(payInvoiceData.input.request)"
          class="q-gutter-md"
        >
          <q-input
            ref="parseDialogInput"
            round
            outlined
            v-model.trim="payInvoiceData.input.request"
            type="textarea"
            label="Lightning invoice or address"
            autofocus
            @keyup.enter="decodeAndQuote(payInvoiceData.input.request)"
          >
          </q-input>
          <div class="row q-mt-lg">
            <q-btn
              rounded
              color="primary"
              class="q-mr-sm"
              v-if="payInvoiceData.input.request != ''"
              type="submit"
              >Enter</q-btn
            >
            <q-btn
              unelevated
              dense
              v-if="canPasteFromClipboard && payInvoiceData.input.request == ''"
              @click="pasteToParseDialog"
              ><q-icon name="content_paste" class="q-pr-sm" />Paste</q-btn
            >
            <q-btn
              unelevated
              icon="qr_code_scanner"
              class="q-mx-0"
              v-if="hasCamera && payInvoiceData.input.request == ''"
              @click="showCamera"
            >
            </q-btn>
            <q-btn v-close-popup flat rounded color="grey" class="q-ml-auto"
              >Close</q-btn
            >
          </div>
        </q-form>
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
import ToggleUnit from "components/ToggleUnit.vue";

// import * as bolt11Decoder from "light-bolt11-decoder";
import * as _ from "underscore";
import MultinutPicker from "./MultinutPicker.vue";

export default defineComponent({
  name: "PayInvoiceDialog",
  mixins: [windowMixin],
  components: {
    ChooseMint,
    ToggleUnit,
    MultinutPicker,
  },
  props: {},
  data: function () {
    return {};
  },
  watch: {
    activeMintUrl: async function () {
      if (this.payInvoiceData.show) {
        await this.meltQuote();
      }
    },
    activeUnit: async function () {
      if (this.payInvoiceData.show) {
        await this.meltQuote();
      }
    },
  },
  computed: {
    ...mapState(useUiStore, ["tickerShort", "globalMutexLock"]),
    ...mapWritableState(useCameraStore, ["camera", "hasCamera"]),
    ...mapState(useWalletStore, ["payInvoiceData"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
      "activeUnit",
      "activeBalance",
      "activeMintBalance",
    ]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    enoughActiveBalance: function () {
      return (
        this.activeMintBalance() >=
        this.payInvoiceData.meltQuote.response.amount
      );
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "melt",
      "meltQuote",
      "decodeRequest",
      "lnurlPaySecond",
    ]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    canPay: function () {
      if (!this.payInvoiceData.invoice) return false;
      return payInvoiceData.meltQuote.response.amount <= this.activeBalance;
    },
    closeParseDialog: function () {
      setTimeout(() => {
        clearInterval(this.payInvoiceData.paymentChecker);
      }, 10000);
    },
    decodeAndQuote: async function (request) {
      await this.decodeRequest(request);
    },
    pasteToParseDialog: function () {
      console.log("pasteToParseDialog");
      navigator.clipboard.readText().then((text) => {
        this.payInvoiceData.input.request = text;
      });
    },
  },
  created: function () {},
});
</script>
