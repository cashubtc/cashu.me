<template>
  <q-dialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    position="top"
    v-if="!camera.show"
    persistent
  >
    <q-card class="q-pa-lg q-pt-xl qcard">
      <div v-if="payInvoiceData.invoice">
        <h6 class="q-my-none">
          Pay {{ payInvoiceData.invoice.fsat }}
          {{ tickerShort }}
        </h6>
        <q-separator class="q-my-sm"></q-separator>
        <p class="text-wrap">
          <strong v-if="payInvoiceData.invoice.description"
            >Description:</strong
          >
          {{ payInvoiceData.invoice.description }}<br />
          <strong>Expire date:</strong> {{ payInvoiceData.invoice.expireDate
          }}<br />
          <strong>Hash:</strong> {{ payInvoiceData.invoice.hash }}
        </p>
        <div class="col-12">
          <ChooseMint :ticker-short="tickerShort" />
        </div>
        <div v-if="canPay" class="row q-mt-lg">
          <q-btn
            unelevated
            color="primary"
            :disabled="payInvoiceData.blocking"
            @click="melt"
            :label="!payInvoiceData.blocking ? 'Pay' : 'Paying...'"
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
      <!-- <div v-else-if="payInvoiceData.lnurlauth">

            <q-form @submit="authLnurl" class="q-gutter-md">
                <p class="q-my-none text-h6">
                Authenticate with <b>{{ payInvoiceData.lnurlauth.domain }}</b>?
                </p>
                <q-separator class="q-my-sm"></q-separator>
                <p>
                For every website and for every LNbits wallet, a new keypair
                will be deterministically generated so your identity can't be
                tied to your LNbits wallet or linked across websites. No other
                data will be shared with {{ payInvoiceData.lnurlauth.domain }}.
                </p>
                <p>
                Your public key for
                <b>{{ payInvoiceData.lnurlauth.domain }}</b> is:
                </p>
                <p class="q-mx-xl">
                <code class="text-wrap">
                    {{ payInvoiceData.lnurlauth.pubkey }}
                </code>
                </p>
                <div class="row q-mt-lg">
                <q-btn unelevated color="primary" type="submit">Login</q-btn>
                <q-btn v-close-popup flat color="grey" class="q-ml-auto"
                    >Cancel</q-btn
                >
                </div>
            </q-form>

            </div> -->
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
            <!-- <span v-if="payInvoiceData.lnurlpay.commentAllowed > 0">
                    <br />
                    and a {{payInvoiceData.lnurlpay.commentAllowed}}-char comment
                </span> -->
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
                v-model.number="payInvoiceData.data.amount"
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
                v-model="payInvoiceData.data.comment"
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
        <q-form v-if="!camera.show" @submit="decodeRequest" class="q-gutter-md">
          <q-input
            ref="pasteInput"
            filled
            dense
            v-model.trim="payInvoiceData.data.request"
            type="textarea"
            label="Enter a Lightning invoice, an LNURL, or a Lightning address"
          >
          </q-input>
          <div class="row q-mt-lg">
            <q-btn
              unelevated
              color="primary"
              :disable="payInvoiceData.data.request == ''"
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
  },
  methods: {
    ...mapActions(useWalletStore, ["melt", "decodeRequest", "lnurlPaySecond"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera", "hasCamera"]),
    canPay: function () {
      if (!this.payInvoiceData.invoice) return false;
      return this.payInvoiceData.invoice.sat <= this.balance;
    },
    closeParseDialog: function () {
      setTimeout(() => {
        clearInterval(this.payInvoiceData.paymentChecker);
      }, 10000);
    },
  },
  created: function () {},
});
</script>
