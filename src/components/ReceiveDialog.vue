<template>
  <q-dialog
    v-model="showReceiveDialog"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="bg-grey-10 text-white full-width-card q-pb-lg">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn flat round dense v-close-popup class="q-ml-sm" color="primary">
          <XIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">{{ $t("ReceiveDialog.title") }}</span>
        </div>
        <q-btn
          flat
          round
          dense
          class="q-mr-sm"
          @click="showCamera"
          color="primary"
        >
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-btn
            class="full-width custom-btn"
            @click="toggleReceiveEcashDrawer"
          >
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <CoinsIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("ReceiveDialog.actions.ecash.label") }}
                </div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="showInvoiceCreateDialog">
            <div class="row items-center full-width">
              <div class="icon-background q-mr-md">
                <ZapIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("ReceiveDialog.actions.lightning.label") }}
                </div>
              </div>
            </div>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <ReceiveEcashDrawer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import ReceiveEcashDrawer from "src/components/ReceiveEcashDrawer.vue";
import { useMintsStore } from "src/stores/mints";
import {
  notifyError,
  notifySuccess,
  notify,
  notifyWarning,
} from "src/js/notify.ts";
import {
  X as XIcon,
  Coins as CoinsIcon,
  Zap as ZapIcon,
  Scan as ScanIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "ReceiveDialog",
  components: {
    XIcon,
    CoinsIcon,
    ZapIcon,
    ScanIcon,
    ReceiveEcashDrawer,
  },
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
    };
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "showReceiveDialog",
      "showReceiveEcashDrawer",
    ]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useWalletStore, ["invoiceData"]),
    ...mapState(useMintsStore, ["mints"]),
    canReceivePayments: function () {
      if (!this.mints.length) {
        return false;
      } else {
        return true;
      }
    },
  },
  methods: {
    toggleReceiveEcashDrawer: function () {
      this.showReceiveDialog = false;
      this.showReceiveTokens = false;
      this.showReceiveEcashDrawer = true;
    },
    showReceiveTokensDialog: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
      this.showReceiveDialog = false;
    },
    showInvoiceCreateDialog: async function () {
      if (!this.canReceivePayments) {
        notifyWarning(
          this.$i18n.t("ReceiveDialog.actions.lightning.error_no_mints")
        );
        this.showReceiveDialog = false;
        return;
      }
      console.log("##### showInvoiceCreateDialog");
      this.invoiceData.amount = "";
      this.invoiceData.bolt11 = "";
      this.invoiceData.hash = "";
      this.invoiceData.memo = "";
      this.showInvoiceDetails = true;
      this.showReceiveDialog = false;
    },
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.icon-background {
  background-color: $grey-10;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lucide {
  width: 24px;
  height: 24px;
}

.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
