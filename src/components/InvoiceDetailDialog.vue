<template>
  <q-dialog
    v-model="showInvoiceDetails"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card class="q-pa-none qcard">
      <div
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        class="display-token-fullscreen"
      >
        <!-- Header -->
        <div class="row items-center q-pa-md" style="position: relative">
          <q-btn
            v-close-popup
            flat
            round
            icon="close"
            color="grey"
            class="floating-close-btn"
          />
          <div class="col text-center fixed-title-height">
            <q-item-label
              overline
              class="q-mt-sm text-white"
              style="font-size: 1rem"
            >
              {{ $t("InvoiceDetailDialog.invoice.caption") }}
            </q-item-label>
          </div>
        </div>

        <!-- Content -->
        <div class="content-area">
          <q-card-section class="q-pa-none">
            <div v-if="invoiceData.bolt11" class="row justify-center q-mb-md">
              <div
                class="col-12 col-sm-11 col-md-8 q-px-md"
                style="max-width: 600px"
              >
                <a
                  class="text-secondary"
                  :href="'lightning:' + invoiceData.bolt11"
                >
                  <q-responsive :ratio="1" class="q-mx-none">
                    <vue-qrcode
                      :value="'lightning:' + invoiceData.bolt11.toUpperCase()"
                      :options="{ width: 400 }"
                      class="rounded-borders"
                      style="width: 100%"
                    >
                    </vue-qrcode>
                  </q-responsive>
                </a>
                <div style="height: 2px">
                  <q-linear-progress
                    v-if="runnerActive"
                    indeterminate
                    color="primary"
                  />
                </div>
              </div>
            </div>

            <q-card-section class="q-pa-sm">
              <div class="row justify-center q-pt-md">
                <q-item-label style="font-size: 28px" class="text-weight-bold">
                  <strong>{{ displayUnit }}</strong>
                </q-item-label>
              </div>
              <div
                v-if="invoiceData.amount > 0 && invoiceData.status === 'paid'"
                class="row justify-center"
              >
                <transition appear enter-active-class="animated tada">
                  <span class="q-mt-md text-bold" style="font-size: 28px">
                    <q-icon
                      name="check_circle"
                      size="1.8rem"
                      color="positive"
                      class="q-mr-sm q-mb-xs"
                    />{{ $t("InvoiceDetailDialog.invoice.status_paid_text") }}
                  </span>
                </transition>
              </div>
              <div
                v-if="invoiceData?.mintQuote"
                class="row justify-center q-pt-lg"
              >
                <div
                  class="col-12 col-sm-11 col-md-8 q-px-md"
                  style="max-width: 600px"
                >
                  <MintQuoteInformation
                    :mint-quote="invoiceData.mintQuote"
                    :invoice="invoiceData"
                    :mint-url="invoiceData.mint"
                    :show-amount="false"
                  />
                </div>
              </div>
              <div
                v-else-if="invoiceData?.meltQuote"
                class="row justify-center q-pt-lg"
              >
                <div
                  class="col-12 col-sm-11 col-md-8 q-px-md"
                  style="max-width: 600px"
                >
                  <MeltQuoteInformation
                    :melt-quote="invoiceData.meltQuote"
                    :invoice="invoiceData"
                    :mint-url="invoiceData.mint"
                    :history-paid-at="invoiceData.paidDate"
                    :show-amount="true"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card-section>
        </div>

        <!-- Bottom panel action -->
        <div class="bottom-panel">
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
                v-if="invoiceData.bolt11"
                class="full-width"
                unelevated
                size="lg"
                color="primary"
                rounded
                @click="onCopyBolt11"
              >
                {{ copyButtonLabel }}
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import { copyToClipboard } from "quasar";

import { useWalletStore } from "../stores/wallet";
import { useUiStore } from "../stores/ui";
import { useWorkersStore } from "../stores/workers";
import MeltQuoteInformation from "./MeltQuoteInformation.vue";
import MintQuoteInformation from "./MintQuoteInformation.vue";
// type hint for global mixin
declare const windowMixin: any;

export default defineComponent({
  name: "InvoiceDetailDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
    MeltQuoteInformation,
    MintQuoteInformation,
  },
  props: {},
  data: function () {
    return {
      copyButtonCopied: false,
      copyButtonTimeout: null as any,
    };
  },
  computed: {
    ...mapState(useWalletStore, ["invoiceData"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    displayUnit: function () {
      let display = (this as any).formatCurrency(
        this.invoiceData.amount,
        this.invoiceData.unit,
        true
      );
      return display;
    },
    runnerActive: function () {
      return this.invoiceWorkerRunning;
    },
    isSmallScreen() {
      return this.$q.screen.lt.sm;
    },
    copyButtonLabel: function () {
      if (this.copyButtonCopied) {
        return "Copied";
      }
      return this.$t("InvoiceDetailDialog.invoice.actions.copy.label");
    },
  },
  methods: {
    onCopyBolt11: async function () {
      if (this.invoiceData?.bolt11) {
        try {
          await copyToClipboard(this.invoiceData.bolt11);
          this.copyButtonCopied = true;
          // Clear any existing timeout
          if (this.copyButtonTimeout) {
            clearTimeout(this.copyButtonTimeout);
          }
          // Reset button label after 3 seconds
          this.copyButtonTimeout = setTimeout(() => {
            this.copyButtonCopied = false;
          }, 3000);
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
        }
      }
    },
  },
  beforeUnmount() {
    if (this.copyButtonTimeout) {
      clearTimeout(this.copyButtonTimeout);
    }
  },
});
</script>

<style scoped>
.display-token-fullscreen {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content-area {
  flex: 1;
  overflow-y: auto;
}
.floating-close-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
.fixed-title-height {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  position: sticky;
  bottom: 0;
  z-index: 2;
}
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
