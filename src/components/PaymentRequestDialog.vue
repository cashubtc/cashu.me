<template>
  <q-dialog
    v-model="showPRDialog"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card v-if="showPRKData" class="q-px-lg q-pt-md q-pb-md qcard">
      <div class="text-center q-mb-md q-mt-none q-pt-none">
        <q-responsive :ratio="1" class="q-mx-md q-mt-none q-pt-none">
          <vue-qrcode
            :value="showPRKData"
            :options="{ width: 340 }"
            class="rounded-borders"
          >
          </vue-qrcode>
        </q-responsive>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label
                overline
                class="q-mb-sm q-pt-md text-white"
                style="font-size: 1rem"
              >
                Payment Request</q-item-label
              >
            </div>
            <div class="row justify-center q-pt-sm">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                >Receive payments via Nostr</q-item-label
              >
            </div>
          </q-card-section>
        </div>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center q-pt-sm">
              <q-chip
                outline
                clickable
                class="q-pa-md q-py-md"
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
              <div @click="toggleUnit" class="q-mt-xs q-ml-sm">
                <ToggleUnit class="q-py-none" color="white" />
              </div>
            </div>
          </q-card-section>
        </div>
        <!-- New amount button and input field -->
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center q-pt-sm">
              <div v-if="!isEditingAmount">
                <q-btn color="primary" rounded @click="startEditingAmount">
                  <q-icon name="edit_note" size="xs" class="q-mr-sm" />
                  {{ amountLabel }}</q-btn
                >
              </div>
              <div v-else>
                <q-input
                  ref="amountInput"
                  v-model="amountInputValue"
                  type="number"
                  placeholder="Enter amount"
                  @blur="finishEditingAmount"
                  @keyup.enter="finishEditingAmount"
                ></q-input>
              </div>
            </div>
          </q-card-section>
        </div>
        <q-btn
          class="q-mx-xs q-px-md q-mt-lg"
          size="md"
          flat
          rounded
          dense
          @click="newRequest"
        >
          <q-icon name="refresh" class="q-pr-sm" size="xs" />
          New request</q-btn
        >
        <div class="row q-mt-lg">
          <q-btn class="q-mx-xs" size="md" flat @click="copyText(showPRKData)"
            >Copy</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { usePRStore } from "src/stores/payment-request";
import { useMintsStore } from "../stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "../stores/ui";
import ToggleUnit from "./ToggleUnit.vue";

export default defineComponent({
  name: "PRDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
    ToggleUnit,
  },
  data() {
    return {
      paymentRequestAmount: undefined,
      isEditingAmount: false,
      amountInputValue: "",
      amountLabelDefault: "Add amount",
      amountLabel: "Add amount",
      defaultAnyMint: "Any Mint",
      chosenMintUrl: undefined,
      memo: "",
    };
  },
  computed: {
    ...mapState(usePRStore, ["showPRKData"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeUnit",
      "activeUnitCurrencyMultiplyer",
    ]),
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
    getShortUrl(url) {
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
        if (this.$refs.amountInput) {
          this.$refs.amountInput.focus();
        }
      });
    },
    finishEditingAmount() {
      const amount = parseFloat(this.amountInputValue);
      if (isNaN(amount) || amount <= 0 || this.amountInputValue == "") {
        this.paymentRequestAmount = undefined;
        this.amountLabel = this.amountLabelDefault;
      } else {
        this.paymentRequestAmount = Math.floor(
          amount * this.activeUnitCurrencyMultiplyer
        );
        this.amountLabel = useUiStore().formatCurrency(
          Math.floor(amount * this.activeUnitCurrencyMultiplyer),
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
