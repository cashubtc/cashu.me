<template>
  <OptionRow
    static
    class="payment-request-info"
    :label="infoTitle"
    :caption="infoSubtitle"
  >
    <template #icon><FileTextIcon :size="24" /></template>
  </OptionRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PaymentRequestTransportType } from "@cashu/cashu-ts";
import type { PaymentRequestData } from "src/stores/payment-request";
import { FileText as FileTextIcon } from "lucide-vue-next";
import OptionRow from "src/components/ui/OptionRow.vue";

export default defineComponent({
  name: "PaymentRequestInfo",
  components: {
    FileTextIcon,
    OptionRow,
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
