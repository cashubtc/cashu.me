<template>
  <div v-if="sendData.paymentRequest" class="q-pa-none q-ma-none q-mt-sm">
    <div class="q-mb-md text-center">
      <q-btn
        rounded
        dense
        color="primary"
        :class="['q-px-md', fullWidth ? 'full-width' : '']"
        :disable="disable || !sendData.paymentRequest"
        :loading="isLoading"
        @click="clickPaymentRequest"
      >
        <q-icon v-if="!isLoading" name="send" class="q-pr-xs" />
        <q-spinner-hourglass v-else size="1em" class="q-mr-md" />
        {{ resolvedLabel }}
      </q-btn>
    </div>
    <div v-if="showDetails && detailText" class="text-center">
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
        {{ detailText }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { usePRStore } from "src/stores/payment-request";
import { useUiStore } from "src/stores/ui";
import { notifyError } from "src/js/notify";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";

declare const windowMixin: any;

export default defineComponent({
  name: "SendPaymentRequest",
  mixins: [windowMixin],
  props: {
    buttonLabel: {
      type: String,
      default: "",
    },
    disable: {
      type: Boolean,
      default: false,
    },
    showDetails: {
      type: Boolean,
      default: true,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    prepareToken: {
      type: Function as PropType<() => Promise<string | undefined>>,
      default: null,
    },
  },
  emits: ["success"],
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
    ...mapState(useUiStore, ["globalMutexLock"]),
    isLoading(): boolean {
      return this.loading || this.globalMutexLock;
    },
    resolvedLabel(): string {
      if (this.buttonLabel) {
        return this.buttonLabel;
      }
      const transport = this.getPaymentRequestTransportType(
        this.sendData.paymentRequest
      );
      if (!transport) {
        return this.$t("SendPaymentRequest.actions.pay.label") as string;
      }
      return this.$t("SendPaymentRequest.actions.pay_via.label", {
        transport,
      }) as string;
    },
    detailText(): string {
      const target = this.getPaymentRequestTarget(this.sendData.paymentRequest);
      if (!target) {
        return "";
      }
      return this.$t("SendPaymentRequest.info.pay_to", {
        target,
      }) as string;
    },
  },
  methods: {
    ...mapActions(usePRStore, ["parseAndPayPaymentRequest"]),
    async clickPaymentRequest() {
      if (this.disable || !this.sendData.paymentRequest) {
        return;
      }
      this.loading = true;
      try {
        let tokenStr = this.sendData.tokensBase64;
        if (this.prepareToken) {
          const prepared = await this.prepareToken();
          if (prepared) {
            tokenStr = prepared;
          }
        }
        if (!tokenStr) {
          throw new Error("No ecash available for payment request.");
        }
        const success = await this.parseAndPayPaymentRequest(
          this.sendData.paymentRequest,
          tokenStr
        );
        if (success) {
          this.$emit("success");
        }
      } catch (error: any) {
        console.error("Error paying payment request:", error);
        notifyError(`${error?.message ?? error}`, "Could not pay request");
      } finally {
        this.loading = false;
      }
    },
    getPaymentRequestTransportType(request?: PaymentRequest) {
      if (!request || !request.transport) {
        return "";
      }
      const transports = request.transport;
      for (const transport of transports) {
        if (transport.type == PaymentRequestTransportType.NOSTR) {
          return "Nostr";
        }
        if (transport.type == PaymentRequestTransportType.POST) {
          return "HTTP";
        }
      }
      return "";
    },
    getPaymentRequestTarget(request?: PaymentRequest) {
      if (!request || !request.transport) {
        return "";
      }
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
            return this.$t("SendPaymentRequest.info.invalid_url") as string;
          }
        }
      }
      return "";
    },
  },
});
</script>
