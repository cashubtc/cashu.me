<template>
  <div class="row text-left q-py-none q-my-none" @click="clickPaymentRequest">
    <q-btn rounded dense color="primary" class="q-px-md"
      ><q-icon name="send" class="q-pr-xs" /> Pay via
      {{ getPaymentRequestTransportType(sendData.paymentRequest) }}
    </q-btn>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useP2PKStore } from "src/stores/p2pk";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { usePRStore } from "src/stores/payment-request";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";

export default defineComponent({
  name: "SendPaymentRequest",
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {};
  },
  watch: {},
  computed: {
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "showLockInput",
      "sendData",
    ]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
      "activeUnit",
      "addMintBlocking",
    ]),
  },
  methods: {
    ...mapActions(useP2PKStore, ["isLocked", "isLockedToUs"]),
    ...mapActions(usePRStore, ["parseAndPayPaymentRequest"]),
    clickPaymentRequest: function () {
      this.parseAndPayPaymentRequest(
        this.sendData.paymentRequest,
        this.sendData.tokensBase64
      );
    },
    getPaymentRequestTransportType: function (request) {
      if (!request) {
        return "Unknown";
      }
      console.log(`### getPaymentRequestTransportType: ${request}`);
      const transports = request.transport;
      for (const transport of transports) {
        if (transport.type == PaymentRequestTransportType.NOSTR) {
          return "Nostr";
        }
        if (transport.type == PaymentRequestTransportType.POST) {
          return "HTTP";
        }
      }
    },
  },
});
</script>
