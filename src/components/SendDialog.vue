<template>
  <q-dialog
    v-model="showSendDialog"
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card :class="[cardClass, 'full-width-card q-pb-lg']">
      <q-card-section class="row items-center q-pb-sm">
        <q-btn
          flat
          round
          dense
          v-close-popup
          class="q-ml-sm"
          color="primary"
          :aria-label="$t('global.actions.close.label')"
          :title="$t('global.actions.close.label')"
        >
          <XIcon />
        </q-btn>
        <div class="col text-center">
          <span class="text-h6">{{ $t("SendDialog.title") }}</span>
        </div>
        <q-btn
          flat
          round
          dense
          class="q-mr-sm"
          @click="showCamera"
          color="primary"
          :aria-label="$t('global.actions.scan.label')"
          :title="$t('global.actions.scan.label')"
        >
          <ScanIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-btn class="full-width custom-btn" @click="showSendTokensDialog">
            <div class="row items-center full-width">
              <div
                class="icon-background q-mr-md"
                :style="{ backgroundColor: iconBgColor }"
              >
                <CoinsIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("SendDialog.actions.ecash.label") }}
                </div>
              </div>
            </div>
          </q-btn>

          <q-btn class="full-width custom-btn" @click="showParseDialog">
            <div class="row items-center full-width">
              <div
                class="icon-background q-mr-md"
                :style="{ backgroundColor: iconBgColor }"
              >
                <ZapIcon />
              </div>
              <div class="text-left">
                <div class="text-weight-bold custom-btn-text">
                  {{ $t("SendDialog.actions.lightning.label") }}
                </div>
              </div>
            </div>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { debug } from "src/js/logger";
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useInvoiceHistoryStore } from "src/stores/invoiceHistory";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useSettingsStore } from "../stores/settings";
import { useMintsStore } from "src/stores/mints";
import {
  X as XIcon,
  Banknote as BanknoteIcon,
  Zap as ZapIcon,
  Scan as ScanIcon,
  Coins as CoinsIcon,
} from "lucide-vue-next";
import { notifyWarning } from "src/js/notify";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";

export default defineComponent({
  name: "SendDialog",
  components: {
    XIcon,
    CoinsIcon,
    ZapIcon,
    ScanIcon,
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
    ...mapState(useMintsStore, ["mints"]),
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "tab",
      "showSendDialog",
      "showReceiveDialog",
    ]),
    ...mapWritableState(useInvoiceHistoryStore, ["invoiceHistory"]),
    ...mapWritableState(useWalletStore, ["invoiceData", "payInvoiceData"]),
    ...mapWritableState(useCameraStore, ["camera"]),
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
    canMakePayments: function () {
      if (!this.mints.length) {
        return false;
      } else {
        return true;
      }
    },
    cardClass: function () {
      return this.$q.dark.isActive
        ? "bg-gray-100 text-white"
        : "bg-white text-dark";
    },
    iconBgColor: function () {
      return this.$q.dark.isActive
        ? "var(--q-color-grey-10)"
        : "var(--q-color-grey-2)";
    },
  },
  methods: {
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    showParseDialog: function () {
      if (!this.canMakePayments) {
        notifyWarning(
          this.$i18n.t("SendDialog.actions.lightning.error_no_mints")
        );
        this.showSendDialog = false;
        return;
      }
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.input.comment = "";
      this.payInvoiceData.input.paymentChecker = null;
      this.camera.show = false;
      this.showSendDialog = false;
    },
    showSendTokensDialog: function () {
      debug("##### showSendTokensDialog");
      if (!this.canMakePayments) {
        notifyWarning(this.$i18n.t("SendDialog.actions.ecash.error_no_mints"));
        this.showSendDialog = false;
        return;
      }
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.amount = null;
      this.sendData.memo = "";
      this.sendData.p2pkPubkey = "";
      this.sendData.paymentRequest = undefined;
      this.sendData.bucketId = DEFAULT_BUCKET_ID;
      this.showSendDialog = false;
      this.showSendTokens = true;
      this.showLockInput = false;
    },
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
  background-color: var(--icon-bg-color);
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
</style>
