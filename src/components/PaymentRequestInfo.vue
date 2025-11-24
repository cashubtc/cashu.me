<template>
  <div class="payment-request-info">
    <div class="row items-center no-wrap">
      <div class="icon-circle">
        <SendIcon :size="20" />
      </div>
      <div class="col q-ml-md">
        <div class="text-body1 text-weight-medium">
          {{ infoTitle }}
        </div>
        <div class="text-caption text-grey-6">
          {{ infoSubtitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";
import { Send as SendIcon } from "lucide-vue-next";

export default defineComponent({
  name: "PaymentRequestInfo",
  components: {
    SendIcon,
  },
  props: {
    request: {
      type: Object as PropType<PaymentRequest | undefined>,
      required: false,
      default: undefined,
    },
  },
  computed: {
    infoTitle(): string {
      const transport = this.transportLabel;
      if (transport) {
        return this.$t("PaymentRequestInfo.title_with_transport", {
          transport,
        }) as string;
      }
      return this.$t("PaymentRequestInfo.title") as string;
    },
    infoSubtitle(): string {
      const target = this.request
        ? this.getPaymentRequestTarget(this.request)
        : "";
      if (!target) {
        return this.$t("PaymentRequestInfo.subtitle_fallback") as string;
      }
      return this.$t("PaymentRequestInfo.subtitle", {
        target,
      }) as string;
    },
    transportLabel(): string {
      if (!this.request || !this.request.transport) {
        return "";
      }
      for (const transport of this.request.transport) {
        if (transport.type === PaymentRequestTransportType.NOSTR) {
          return "Nostr";
        }
        if (transport.type === PaymentRequestTransportType.POST) {
          return "HTTP";
        }
      }
      return "";
    },
  },
  methods: {
    getPaymentRequestTarget(request: PaymentRequest): string {
      for (const transport of request.transport) {
        if (transport.type === PaymentRequestTransportType.NOSTR) {
          if (!transport.target) {
            return "";
          }
          return `${transport.target.slice(0, 20)}..${transport.target.slice(
            -10
          )}`;
        }
        if (transport.type === PaymentRequestTransportType.POST) {
          try {
            const url = new URL(transport.target);
            return url.hostname;
          } catch (error) {
            console.error(
              `Invalid URL in transport.target: ${transport.target}`,
              error
            );
            return this.$t("PaymentRequestInfo.invalid_url") as string;
          }
        }
      }
      return "";
    },
  },
});
</script>

<style scoped>
.payment-request-info {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 12px;
  transition: background 0.2s ease;
}

.payment-request-info:active {
  background: rgba(255, 255, 255, 0.1);
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
