<template>
  <div v-if="sendData.paymentRequest" class="q-pa-none q-ma-none q-mt-sm">
    <div class="q-mb-md text-center">
      <q-btn
        v-if="getPaymentRequestTransportType(sendData.paymentRequest) !== 'NFC'"
        rounded
        dense
        color="primary"
        class="q-px-md"
        @click="clickPaymentRequest"
      >
        <q-icon v-if="!loading" name="send" class="q-pr-xs" />
        <q-spinner-hourglass v-else size="1em" class="q-mr-md" />
        Pay via {{ getPaymentRequestTransportType(sendData.paymentRequest) }}
      </q-btn>
      <q-btn
        v-if="
          ndefSupported &&
          getPaymentRequestTransportType(sendData.paymentRequest) === 'NFC'
        "
        :disabled="scanningCard"
        :loading="scanningCard"
        class="q-px-md"
        size="sm"
        @click="writeTokensToCard"
        flat
      >
        <q-icon name="send" class="q-pr-xs" />
        Pay via NFC
        <q-tooltip>{{
          ndefSupported ? "Flash to NFC terminal" : "NDEF unsupported"
        }}</q-tooltip>
        <template v-slot:loading>
          <q-spinner @click="closeCardScanner" />
        </template>
      </q-btn>
    </div>
    <div class="text-center">
      <span
        class="q-mt-md q-mb-md text-center"
        style="
          display: block;
          font-family: monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-width: 350px;
          margin: 0 auto;
          font-size: 13px;
        "
      >
        Pay to {{ getPaymentRequestTarget(sendData.paymentRequest) }}
      </span>
    </div>
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
import { useSettingsStore } from "src/stores/settings";

export default defineComponent({
  name: "SendPaymentRequest",
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      loading: false,
    };
  },
  watch: {},
  computed: {
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "showLockInput",
      "sendData",
    ]),
    ...mapState(useMintsStore, ["activeMintUrl", "mints"]),
    ...mapState(useSettingsStore, ["ndefSupported"]),
    ...mapState(useSendTokensStore, ["scanningCard"]),
  },
  methods: {
    ...mapActions(useP2PKStore, ["isLocked", "isLockedToUs"]),
    ...mapActions(usePRStore, ["parseAndPayPaymentRequest"]),
    ...mapActions(useSendTokensStore, [
      "writeTokensToCard",
      "closeCardScanner",
    ]),
    clickPaymentRequest: async function () {
      this.loading = true;
      try {
        await this.parseAndPayPaymentRequest(
          this.sendData.paymentRequest,
          this.sendData.tokensBase64
        );
      } catch (error) {
        console.error(error);
        notifyError("Error paying payment request");
      } finally {
        this.loading = false;
      }
    },
    getPaymentRequestTransportType: function (request) {
      if (!request || !request.transport) {
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
        if (transport.type == "ndef") {
          return "NFC";
        }
      }
    },
    getPaymentRequestTarget: function (request) {
      if (!request || !request.transport) {
        return "Unknown";
      }
      console.log(`### getPaymentRequestDestination: ${request}`);
      const transports = request.transport;
      for (const transport of transports) {
        if (transport.type == PaymentRequestTransportType.NOSTR) {
          return `${transport.target.slice(0, 20)}..${transport.target.slice(
            -10
          )}`;
        }
        if (transport.type == PaymentRequestTransportType.POST) {
          try {
            const url = new URL(transport.target);
            return url.hostname;
          } catch (error) {
            console.error(
              `Invalid URL in transport.target: ${transport.target}`,
              error
            );
            return "Invalid URL";
          }
        }
      }
    },
  },
});
</script>
