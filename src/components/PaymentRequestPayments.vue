<template>
  <div class="q-pa-none">
    <div v-if="payments.length === 0" class="text-center q-mt-sm">
      <q-item-label caption>
        {{ $t("PaymentRequestDialog.no_payments_yet") }}
      </q-item-label>
    </div>
    <q-list v-else>
      <q-item
        v-for="payment in paginatedPayments"
        :key="payment.id"
        clickable
        v-ripple
        class="q-py-sm activity-row"
        @click="showTokenDialog(payment)"
      >
        <q-item-section avatar class="q-pr-md" style="min-width: 40px">
          <q-avatar size="40px" class="activity-row__avatar">
            <CoinsIcon class="activity-row__icon" />
            <span
              class="activity-row__direction activity-row__direction--in"
              aria-hidden="true"
            >
              <ArrowDownLeftIcon :size="13" :stroke-width="2.75" />
            </span>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="row items-center justify-between">
            <div class="col text-left">
              <span class="activity-row__label">
                {{ payment.label || "Ecash" }}
              </span>
            </div>
            <div class="text-right">
              <div
                class="activity-row__amount activity-row__amount--in"
                dir="ltr"
              >
                +{{ formatCurrency(payment.amount, payment.unit) }}
              </div>
            </div>
          </q-item-label>
          <q-item-label caption class="q-mt-none">
            {{ formattedDate(payment.date) }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-if="maxPages > 1" class="text-center q-mt-sm">
      <q-pagination
        v-model="currentPage"
        :max="maxPages"
        :max-pages="5"
        direction-links
        boundary-links
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mapWritableState } from "pinia";
import { HistoryToken } from "src/stores/tokens";
import { formatDistanceToNow, parseISO } from "date-fns";
import token from "src/js/token";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import {
  ArrowDownLeft as ArrowDownLeftIcon,
  Coins as CoinsIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "PaymentRequestPayments",
  components: { ArrowDownLeftIcon, CoinsIcon },
  props: {
    payments: {
      type: Array as PropType<HistoryToken[]>,
      required: true,
      default: () => [],
    },
    pageSize: {
      type: Number,
      required: false,
      default: 3,
    },
  },
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, ["showSendTokens", "sendData"]),
    maxPages(): number {
      return Math.ceil(this.payments.length / this.pageSize) || 1;
    },
    paginatedPayments(): HistoryToken[] {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.payments.slice(start, end);
    },
  },
  methods: {
    formattedDate(date_str: string) {
      const date = parseISO(date_str);
      return formatDistanceToNow(date, { addSuffix: false });
    },
    formatCurrency(amount: number, unit: string) {
      // delegate to global mixin formatter if available
      try {
        // @ts-ignore
        return this.$root?.$?.appContext.config.globalProperties.formatCurrency
          ? // @ts-ignore
            this.$root.$.appContext.config.globalProperties.formatCurrency(
              amount,
              unit
            )
          : `${amount} ${unit}`;
      } catch {
        return `${amount} ${unit}`;
      }
    },
    showTokenDialog(historyToken: HistoryToken) {
      if (historyToken.token === undefined) {
        return;
      }
      const tokensBase64 = historyToken.token;
      const tokenObj = token.decodeMeta(tokensBase64);
      this.sendData.tokens = token.getProofs(tokenObj) as any;
      this.sendData.tokensBase64 = tokensBase64;
      this.sendData.paymentRequest = historyToken.paymentRequest;
      this.sendData.historyAmount = historyToken.amount;
      this.sendData.historyToken = historyToken as any;
      this.showSendTokens = true;
    },
  },
});
</script>
