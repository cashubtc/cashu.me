<template>
  <div class="app-option-row payment-request-info">
    <div class="row items-center no-wrap">
      <div class="app-icon-circle">
        <SendIcon :size="20" />
      </div>
      <div class="col q-ml-md">
        <div class="app-option-row__label">
          {{ infoTitle }}
        </div>
        <div class="app-option-row__caption">
          {{ infoSubtitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PaymentRequestTransportType } from "@cashu/cashu-ts";
import type { PaymentRequestData } from "src/stores/payment-request";
import { Send as SendIcon } from "lucide-vue-next";

export default defineComponent({
  name: "PaymentRequestInfo",
  components: {
    SendIcon,
  },
  props: {
    request: {
      type: Object as PropType<PaymentRequestData | undefined>,
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
    getPaymentRequestTarget(request: PaymentRequestData): string {
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
  margin-top: 12px;
}
</style>
