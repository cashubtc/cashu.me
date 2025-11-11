<template>
  <q-dialog
    v-model="showReceiveDialog"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="drawer-card text-white full-width-card q-pb-lg">
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
          <div class="action-row" @click="toggleReceiveEcashDrawer">
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <CoinsIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveDialog.actions.ecash.label") }}
                </div>
              </div>
            </div>
          </div>

          <div class="action-row" @click="showInvoiceCreateDialog">
            <div class="row items-center no-wrap">
              <div class="icon-circle">
                <ZapIcon :size="24" />
              </div>
              <div class="col q-ml-md">
                <div class="text-body1 text-weight-medium">
                  {{ $t("ReceiveDialog.actions.lightning.label") }}
                </div>
              </div>
            </div>
          </div>
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
      "showCreateInvoiceDialog",
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
      this.showCreateInvoiceDialog = true;
      this.showReceiveDialog = false;
    },
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
  },
  created: function () {},
});
</script>

<style lang="scss" scoped>
::v-deep .q-dialog__backdrop {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4) !important;
}

.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.drawer-card {
  background: #1a1a1a;
}

.action-row {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
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

.lucide {
  width: 24px;
  height: 24px;
  color: white;
}

.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
