<template>
  <q-dialog
    v-model="showPRDialog"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card v-if="showPRKData" class="q-pa-none qcard">
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
              {{ $t("PaymentRequestDialog.payment_request.caption") }}
            </q-item-label>
          </div>
        </div>

        <!-- Content -->
        <div class="content-area">
          <q-card-section class="q-pa-none">
            <div v-if="showPRKData" class="row justify-center q-mb-md">
              <div
                class="col-12 col-sm-11 col-md-8 q-px-md"
                style="max-width: 600px"
              >
                <q-responsive :ratio="1" class="q-mx-none">
                  <vue-qrcode
                    :value="showPRKData"
                    :options="{ width: 400 }"
                    class="rounded-borders"
                    style="width: 100%"
                  >
                  </vue-qrcode>
                </q-responsive>
              </div>
            </div>

            <q-card-section class="q-pa-sm">
              <!-- Amount display/edit -->
              <div class="row justify-center q-pt-md">
                <div v-if="!isEditingAmount">
                  <q-btn
                    color="primary"
                    rounded
                    size="md"
                    @click="startEditingAmount"
                  >
                    <q-icon name="edit_note" size="xs" class="q-mr-sm" />
                    {{ amountLabel }}
                  </q-btn>
                </div>
                <div v-else class="col-12 col-sm-8 col-md-6">
                  <q-input
                    ref="amountInput"
                    v-model="amountInputValue"
                    type="number"
                    :placeholder="
                      $t('PaymentRequestDialog.inputs.amount.placeholder')
                    "
                    @blur="finishEditingAmount"
                    @keyup.enter="finishEditingAmount"
                  ></q-input>
                </div>
              </div>

              <!-- Mint selection and unit toggle -->
              <div class="row justify-center q-pt-md">
                <div class="row no-wrap items-center q-gutter-sm">
                  <q-chip
                    outline
                    clickable
                    class="q-pa-md"
                    :style="
                      chosenMintUrl == undefined
                        ? ''
                        : 'height: 36px; font-family: monospace'
                    "
                    @click="setActiveMintUrl"
                  >
                    <q-icon name="account_balance" size="xs" class="q-mr-sm" />
                    {{ getShortUrl(chosenMintUrl) }}
                  </q-chip>
                  <div @click="toggleUnit">
                    <ToggleUnit class="q-py-none" color="white" />
                  </div>
                </div>
              </div>

              <!-- New request button -->
              <div class="row justify-center q-pt-lg q-pb-md">
                <q-btn flat size="md" rounded @click="newRequest">
                  <q-icon name="refresh" class="q-pr-sm" size="xs" />
                  {{ $t("PaymentRequestDialog.actions.new_request.label") }}
                </q-btn>
              </div>
            </q-card-section>
          </q-card-section>
        </div>

        <!-- Bottom panel action -->
        <div class="bottom-panel">
          <div class="row justify-center q-pb-md q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <q-btn
                class="full-width"
                unelevated
                size="lg"
                color="primary"
                rounded
                @click="onCopyPRKData"
              >
                {{ $t("PaymentRequestDialog.actions.copy.label") }}
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

import { usePRStore } from "src/stores/payment-request";
import { useMintsStore } from "../stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "../stores/ui";
import ToggleUnit from "./ToggleUnit.vue";
// type hint for global mixin
declare const windowMixin: any;

export default defineComponent({
  name: "PRDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
    ToggleUnit,
  },
  data() {
    const amountLabelDefault = (this as any).$i18n.t(
      "PaymentRequestDialog.actions.add_amount.label"
    );
    return {
      paymentRequestAmount: undefined as number | undefined,
      isEditingAmount: false,
      amountInputValue: "",
      amountLabelDefault,
      amountLabel: amountLabelDefault,
      defaultAnyMint: (this as any).$i18n.t(
        "PaymentRequestDialog.actions.use_active_mint.label"
      ),
      chosenMintUrl: undefined as string | undefined,
      memo: "",
    };
  },
  computed: {
    ...mapState(usePRStore, ["showPRKData"]),
    ...mapState(useMintsStore, ["activeMintUrl", "activeUnit"]),
    activeUnitCurrencyMultiplyer() {
      return (useMintsStore() as any).activeUnitCurrencyMultiplyer;
    },
    ...mapWritableState(usePRStore, ["showPRDialog"]),
  },
  methods: {
    ...mapActions(usePRStore, ["newPaymentRequest"]),
    toggleUnit() {
      this.paymentRequestAmount = undefined;
      this.amountLabel = this.amountLabelDefault;
      this.newPaymentRequest(
        this.paymentRequestAmount,
        this.memo,
        this.chosenMintUrl
      );
    },
    newRequest() {
      this.newPaymentRequest(
        this.paymentRequestAmount,
        this.memo,
        this.chosenMintUrl
      );
    },
    getShortUrl(url: string | undefined) {
      if (!url) {
        return this.defaultAnyMint;
      }
      return getShortUrl(url);
    },
    setActiveMintUrl() {
      if (this.activeMintUrl == this.chosenMintUrl) {
        return;
      }
      this.chosenMintUrl = this.activeMintUrl;
      this.newPaymentRequest(
        this.paymentRequestAmount,
        this.memo,
        this.chosenMintUrl
      );
    },
    startEditingAmount() {
      this.isEditingAmount = true;
      this.$nextTick(() => {
        const input = this.$refs.amountInput as any;
        if (input) {
          input.focus();
        }
      });
    },
    onCopyPRKData() {
      if (this.showPRKData) {
        (this as any).copyText(this.showPRKData);
      }
    },
    finishEditingAmount() {
      const amount = parseFloat(this.amountInputValue);
      if (isNaN(amount) || amount <= 0 || this.amountInputValue == "") {
        this.paymentRequestAmount = undefined;
        this.amountLabel = this.amountLabelDefault;
      } else {
        this.paymentRequestAmount = amount * this.activeUnitCurrencyMultiplyer;
        this.amountLabel = useUiStore().formatCurrency(
          amount * this.activeUnitCurrencyMultiplyer,
          this.activeUnit
        );
      }
      this.newPaymentRequest(
        this.paymentRequestAmount,
        this.memo,
        this.chosenMintUrl
      );
      this.isEditingAmount = false;
      this.amountInputValue = "";
    },
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
