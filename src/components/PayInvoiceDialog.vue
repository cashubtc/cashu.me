<template>
  <q-dialog
    v-model="payInvoiceData.show"
    @hide="closeParseDialog"
    position="top"
    v-if="!camera.show"
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
    // decodeRequest: function (r = null) {
    //   // set the argument as the data to parse
    //   if (typeof r == "string" && r != null) {
    //     this.payInvoiceData.data.request = r;
    //   }
    //   let reqtype = null;
    //   let req = null;
    //   // get request
    //   if (this.camera.data) {
    //     // get request from camera
    //     req = this.camera.data;
    //   } else if (this.payInvoiceData.data.request) {
    //     // get request from pay invoice dialog
    //     req = this.payInvoiceData.data.request;
    //   }

    //   if (req.toLowerCase().startsWith("lnbc")) {
    //     this.payInvoiceData.data.request = req;
    //     reqtype = "bolt11";
    //   } else if (req.toLowerCase().startsWith("lightning:")) {
    //     this.payInvoiceData.data.request = req.slice(10);
    //     reqtype = "bolt11";
    //   } else if (req.toLowerCase().startsWith("lnurl:")) {
    //     this.payInvoiceData.data.request = req.slice(6);
    //     reqtype = "lnurl";
    //   } else if (req.indexOf("lightning=lnurl1") !== -1) {
    //     this.payInvoiceData.data.request = req
    //       .split("lightning=")[1]
    //       .split("&")[0];
    //     reqtype = "lnurl";
    //   } else if (
    //     req.toLowerCase().startsWith("lnurl1") ||
    //     req.match(/[\w.+-~_]+@[\w.+-~_]/)
    //   ) {
    //     this.payInvoiceData.data.request = req;
    //     reqtype = "lnurl";
    //   } else if (req.indexOf("cashuA")) {
    //     // very dirty way of parsing cashu tokens from either a pasted token or a URL like https://host.com?token=eyJwcm
    //     this.receiveData.tokensBase64 = req.slice(req.indexOf("cashuA"));
    //     reqtype = "cashu";
    //   }

    //   if (reqtype == "bolt11") {
    //     console.log("#### QR CODE: BOLT11");
    //     this.payInvoiceData.show = true;
    //     let invoice;
    //     try {
    //       invoice = bolt11Decoder.decode(this.payInvoiceData.data.request);
    //     } catch (error) {
    //       this.notifyWarning("Failed to decode invoice", null, 3000);
    //       this.payInvoiceData.show = false;
    //       throw error;
    //     }

    //     // invoice.amount = invoice.sections[2] / 1000;
    //     // invoice.amount_msat = invoice.sections[2];
    //     let cleanInvoice = {};
    //     // let cleanInvoice = {
    //     //   msat: invoice.amount_msat,
    //     //   sat: invoice.amount,
    //     //   fsat: invoice.amount,
    //     // };
    //     // _.each(invoice.sections, (tag) => {
    //     //   console.log(tag);
    //     // });
    //     _.each(invoice.sections, (tag) => {
    //       if (_.isObject(tag) && _.has(tag, "name")) {
    //         if (tag.name === "amount") {
    //           cleanInvoice.msat = tag.value;
    //           cleanInvoice.sat = tag.value / 1000;
    //           cleanInvoice.fsat = cleanInvoice.sat;
    //         } else if (tag.name === "payment_hash") {
    //           cleanInvoice.hash = tag.value;
    //         } else if (tag.name === "description") {
    //           cleanInvoice.description = tag.value;
    //         } else if (tag.name === "timestamp") {
    //           cleanInvoice.timestamp = tag.value;
    //         } else if (tag.name === "expiry") {
    //           var expireDate = new Date(
    //             (cleanInvoice.timestamp + tag.value) * 1000
    //           );
    //           cleanInvoice.expireDate = date.formatDate(
    //             expireDate,
    //             "YYYY-MM-DDTHH:mm:ss.SSSZ"
    //           );
    //           cleanInvoice.expired = false; // TODO
    //         }
    //       }
    //     });

    //     this.payInvoiceData.invoice = Object.freeze(cleanInvoice);
    //   } else if (reqtype == "lnurl") {
    //     console.log("#### QR CODE: LNURL");
    //     this.lnurlPayFirst(this.payInvoiceData.data.request);
    //   } else if (reqtype == "cashu") {
    //     console.log("#### QR CODE: CASHU TOKEN");
    //     this.payInvoiceData.show = false;
    //     this.showReceiveTokens = true;
    //   }
    // },
    // lnurlPayFirst: async function (address) {
    //   var host;
    //   if (address.split("@").length == 2) {
    //     let [user, lnaddresshost] = address.split("@");
    //     host = `https://${lnaddresshost}/.well-known/lnurlp/${user}`;
    //   } else if (address.toLowerCase().slice(0, 6) === "lnurl1") {
    //     let host = Buffer.from(
    //       bech32.fromWords(bech32.decode(address, 20000).words)
    //     ).toString();
    //     var { data } = await axios.get(host);
    //     // const { data } = await LNbits.api.request(
    //     //   "POST",
    //     //   "/api/v1/payments/decode",
    //     //   "",
    //     //   {
    //     //     data: address,
    //     //   }
    //     // );
    //     host = data.domain;
    //   }
    //   var { data } = await axios.get(host);
    //   if (data.tag == "payRequest") {
    //     this.payInvoiceData.domain = host.split("https://")[1].split("/")[0];
    //     this.payInvoiceData.lnurlpay = data;
    //     if (
    //       this.payInvoiceData.lnurlpay.maxSendable ==
    //       this.payInvoiceData.lnurlpay.minSendable
    //     ) {
    //       this.payInvoiceData.data.amount =
    //         this.payInvoiceData.lnurlpay.maxSendable / 1000;
    //     }
    //     this.payInvoiceData.show = true;
    //   }
    // },
    // lnurlPaySecond: async function () {
    //   let amount = this.payInvoiceData.data.amount;
    //   if (
    //     this.payInvoiceData.lnurlpay.tag == "payRequest" &&
    //     this.payInvoiceData.lnurlpay.minSendable <=
    //       amount * 1000 <=
    //       this.payInvoiceData.lnurlpay.maxSendable
    //   ) {
    //     var { data } = await axios.get(
    //       `${this.payInvoiceData.lnurlpay.callback}?amount=${amount * 1000}`
    //     );
    //     console.log(data.pr);
    //     this.payInvoiceData.data.request = data.pr;
    //     this.decodeRequest();
    //   }
    // },
  },
  created: function () {},
});
</script>
