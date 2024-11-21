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
              <q-item-label overline class="q-mb-sm q-pt-md text-white">
                Payment Request</q-item-label
              >
            </div>
            <div class="row justify-center q-pt-sm">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                >Receive payments to this requests</q-item-label
              >
            </div>
          </q-card-section>
        </div>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center q-pt-sm">
              <q-chip outline class="q-pa-md q-py-md">
                <q-icon name="account_balance" size="xs" class="q-mr-xs" />
                {{ getShortUrl(activeMintUrl) }}
              </q-chip>
              <div @click="newRequest" class="q-ml-sm q-pt-xs">
                <ToggleUnit class="q-py-none" :balanceView="true" />
              </div>
            </div>
          </q-card-section>
        </div>
        <q-btn
          class="q-mx-xs q-px-md q-mt-md"
          size="md"
          color="primary"
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
import ToggleUnit from "./ToggleUnit.vue";

import { map } from "underscore";
export default defineComponent({
  name: "PRDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
    ToggleUnit,
  },
  data: function () {
    return {
      paymentRequestAmount: undefined,
    };
  },
  computed: {
    ...mapState(usePRStore, ["showPRKData"]),
    ...mapState(useMintsStore, ["activeMintUrl"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
  },
  methods: {
    ...mapActions(usePRStore, ["newPaymentRequest"]),
    newRequest() {
      this.newPaymentRequest(this.paymentRequestAmount);
    },
    getShortUrl(url) {
      return getShortUrl(url);
    },
  },
});
</script>
