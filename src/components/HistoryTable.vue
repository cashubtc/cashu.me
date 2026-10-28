<template>
  <div class="history-table">
    <!-- Loading: the rows themselves as skeletons, so the list doesn't move when it fills. -->
    <q-list v-if="skeleton" aria-hidden="true">
      <ActivityRow v-for="n in 5" :key="n" skeleton />
    </q-list>
    <!-- A wallet with no history at all gets the shared empty state, with nothing to filter. -->
    <EmptyState
      v-else-if="unifiedTransactions.length === 0"
      :icon="HistoryIcon"
      :boxed="false"
      :title="$t('HistoryTable.empty_text')"
      :text="$t('HistoryTable.empty_hint')"
      class="history-empty-state"
    />
    <template v-else>
      <q-list>
        <ActivityRow
          v-for="transaction in paginatedTransactions"
          :key="getTransactionKey(transaction)"
          data-testid="history-row"
          details-testid="history-details"
          :direction="transaction.amount >= 0 ? 'in' : 'out'"
          :label="getTransactionTitle(transaction)"
          :amount="
            (transaction.amount >= 0 ? '+' : '\u2212') +
            formatCurrency(Math.abs(transaction.amount), transaction.unit)
          "
          :pending="transaction.status === 'pending'"
          :caption="
            getDefaultLabel(transaction) +
            ' · ' +
            formattedDate(transaction.date)
          "
          caption-class="text-grey-6"
          @details-click="showTransactionDialog(transaction)"
        >
          <template #caption-end>
            <!-- Status, with the check action for pending rows -->
            <div
              v-if="transaction.status === 'pending'"
              class="row items-center no-wrap text-grey-6 text-caption"
            >
              <q-btn
                flat
                dense
                round
                data-testid="history-check"
                @click.stop="
                  transaction.longPressActive
                    ? handleLongPress(transaction)
                    : checkTransactionStatus(transaction)
                "
                @mousedown="startLongPress(transaction)"
                @mouseup="endLongPress(transaction)"
                @touchstart="startLongPress(transaction)"
                @touchend="endLongTap(transaction)"
                class="cursor-pointer history-check-btn"
                size="sm"
                :aria-label="
                  transaction.longPressActive
                    ? $t('HistoryTable.actions.receive.tooltip_text')
                    : $t('HistoryTable.actions.check_status.tooltip_text')
                "
              >
                <CircleArrowDownIcon
                  v-if="transaction.longPressActive"
                  :size="18"
                />
                <RefreshCwIcon v-else :size="18" />
                <q-tooltip>{{
                  transaction.longPressActive
                    ? $t("HistoryTable.actions.receive.tooltip_text")
                    : $t("HistoryTable.actions.check_status.tooltip_text")
                }}</q-tooltip>
              </q-btn>
            </div>
          </template>
        </ActivityRow>
        <!-- Nothing matches: one row-height message in the list. -->
        <div
          v-if="paginatedTransactions.length === 0"
          class="activity-row activity-row--placeholder history-empty row items-center justify-center"
        >
          <q-item-label caption>{{
            $t("HistoryTable.empty_text")
          }}</q-item-label>
        </div>
        <!-- Hold the list at a full page while paging or filtering, so the filters and
           pagination below never move. -->
        <div
          v-for="n in placeholderRowCount"
          :key="`placeholder-${n}`"
          class="activity-row activity-row--placeholder"
          aria-hidden="true"
        />
      </q-list>

      <!-- Filters sit under the list, above pagination (as on main). The list above keeps its
         full height while filtering, so these buttons never move. -->
      <div class="history-filters row justify-center items-center q-mt-md">
        <q-btn
          rounded
          :outline="!filterPending"
          :unelevated="filterPending"
          :aria-pressed="filterPending ? 'true' : 'false'"
          @click="filterPending = !filterPending"
          :color="filterPending ? 'primary' : undefined"
          class="q-px-md history-filter-btn"
        >
          <CheckIcon v-if="filterPending" :size="20" class="q-mr-sm" />
          {{
            $t(
              filterPending
                ? "HistoryTable.actions.show_all.label"
                : "HistoryTable.actions.filter_pending.label"
            )
          }}
        </q-btn>
        <q-btn
          v-if="filterPending"
          rounded
          outline
          @click="filterPendingEcash = !filterPendingEcash"
          :color="filterPendingEcash ? 'primary' : 'grey'"
          :label="$t('HistoryTable.actions.filter_ecash_only.label')"
          class="q-ml-sm q-px-md history-filter-btn"
        />
      </div>

      <!-- Pagination -->
      <div v-if="maxPages > 1" class="text-center q-mt-md">
        <div style="display: flex; justify-content: center">
          <q-pagination
            v-model="currentPage"
            :max="maxPages"
            :max-pages="5"
            direction-links
            :boundary-links="maxPages > 3"
            round
            flat
            active-design="unelevated"
            active-color="primary"
            size="md"
            @input="handlePageChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import * as _ from "underscore";
import { defineComponent, markRaw } from "vue";
import { shortenString } from "src/js/string-utils";
import { parseISO } from "date-fns";
import { useTokensStore } from "src/stores/tokens";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useUiStore } from "src/stores/ui";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import token from "../js/token";
import { notify } from "src/js/notify";
import ActivityRow from "src/components/ActivityRow.vue";
import EmptyState from "src/components/ui/EmptyState.vue";
import {
  Check as CheckIcon,
  CircleArrowDown as CircleArrowDownIcon,
  History as HistoryIcon,
  RefreshCw as RefreshCwIcon,
} from "lucide-vue-next";
import { PaymentMethod, UnifiedTransactionType } from "src/stores/walletTypes";
import { mintQuoteForHistoryInvoice } from "src/js/invoice-history";

export default defineComponent({
  name: "HistoryTable",
  props: {
    /** Show placeholder rows while the history is being read. */
    skeleton: { type: Boolean, default: false },
  },
  components: {
    CircleArrowDownIcon,
    RefreshCwIcon,
    CheckIcon,
    ActivityRow,
    EmptyState,
  },
  setup() {
    return { HistoryIcon: markRaw(HistoryIcon) };
  },
  mixins: [windowMixin],
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
      filterPending: false,
      filterPendingEcash: false,
      cachedUnifiedTransactions: [],
    };
  },
  watch: {
    filterPending: function () {
      this.currentPage = 1;
      // Reset ecash filter when pending filter is turned off
      if (!this.filterPending) {
        this.filterPendingEcash = false;
      }
    },
    filterPendingEcash: function () {
      this.currentPage = 1;
    },
    // Watch for any changes in historyTokens (additions, updates, deletions)
    historyTokens: {
      handler: function () {
        this.updateUnifiedTransactions();
      },
      deep: true,
      immediate: true,
    },
    // Watch for any changes in invoiceHistory (additions, updates, deletions)
    invoiceHistory: {
      handler: function () {
        this.updateUnifiedTransactions();
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    relativeTime() {
      return new Intl.RelativeTimeFormat(this.$i18n.locale, {
        numeric: "auto",
        numberingSystem: "latn", // amounts use Latin digits in every locale
      });
    },
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapState(useWalletStore, ["invoiceHistory"]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    ...mapWritableState(useWalletStore, ["invoiceData", "payInvoiceData"]),

    // Use cached unified transactions for better performance
    unifiedTransactions() {
      return this.cachedUnifiedTransactions;
    },

    // Filter transactions first, then paginate
    filteredTransactions() {
      if (this.filterPendingEcash) {
        return this.unifiedTransactions.filter(
          (transaction) =>
            transaction.status === "pending" &&
            transaction.type === UnifiedTransactionType.Ecash
        );
      }
      if (this.filterPending) {
        return this.unifiedTransactions.filter(
          (transaction) => transaction.status === "pending"
        );
      }
      return this.unifiedTransactions;
    },

    maxPages() {
      return Math.ceil(this.filteredTransactions.length / this.pageSize);
    },

    placeholderRowCount() {
      // Pad to the height the unfiltered first page has, so filtering never shortens the list.
      const fullPage = Math.min(this.pageSize, this.unifiedTransactions.length);
      const shown = Math.max(1, this.paginatedTransactions.length);
      return Math.max(0, fullPage - shown);
    },

    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTransactions.slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "checkTokenSpendable",
      "checkInvoiceBolt11",
      "checkOutgoingInvoice",
      "checkOfferAndMintBolt12",
      "checkOnchainAndMint",
    ]),
    ...mapActions(useTransactionWorkerStore, [
      "addInvoiceToChecker",
      "addBolt12OfferToChecker",
      "addOutgoingInvoiceToChecker",
      "addOutgoingTokenToChecker",
    ]),

    handleLongPress(transaction) {
      console.debug("### handleLongPress called");
      if (this.isEcashTransaction(transaction)) {
        transaction.longPressActive = false;
        this.receiveToken(transaction.token);
      }
    },

    startLongPress(transaction) {
      if (this.isEcashTransaction(transaction)) {
        transaction.longPressActive = false;
        this.longPressTimeout = setTimeout(() => {
          transaction.longPressActive = true;
        }, 1000); // 1 second long press
      }
    },

    endLongPress(transaction) {
      console.debug("### endLongPress called");
      clearTimeout(this.longPressTimeout);
    },

    endLongTap(transaction) {
      console.debug("### endLongTap called");
      clearTimeout(this.longPressTimeout);
      if (transaction.longPressActive) {
        this.handleLongPress(transaction);
      }
    },

    // One locale-formatted phrase ("5 minutes ago", "منذ 5 دقائق", "5分钟前"), so the number,
    // unit and direction words never come from different languages.
    formattedDate(date_str) {
      const seconds = (parseISO(date_str).getTime() - Date.now()) / 1000;
      const steps = [
        ["second", 60],
        ["minute", 60],
        ["hour", 24],
        ["day", 30],
        ["month", 12],
      ];
      let value = seconds;
      for (const [unit, size] of steps) {
        if (Math.abs(value) < size) {
          return this.relativeTime.format(Math.round(value), unit);
        }
        value /= size;
      }
      return this.relativeTime.format(Math.round(value), "year");
    },

    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },

    handlePageChange(page) {
      this.currentPage = page;
    },

    receiveToken(tokenStr) {
      this.receiveData.tokensBase64 = tokenStr;
      this.showReceiveTokens = true;
    },

    getTransactionKey(transaction) {
      return transaction.id;
    },

    isEcashTransaction(transaction) {
      return transaction.type === UnifiedTransactionType.Ecash;
    },

    isLightningTransaction(transaction) {
      return transaction.type === UnifiedTransactionType.Lightning;
    },

    isOnchainTransaction(transaction) {
      return transaction.type === UnifiedTransactionType.Onchain;
    },

    getDefaultLabel(transaction) {
      if (transaction.type === UnifiedTransactionType.Onchain) {
        return this.$t("common.on_chain");
      }
      return transaction.type === UnifiedTransactionType.Lightning
        ? this.$t("InvoiceTable.row.type_label")
        : this.$t("HistoryTable.row.type_label");
    },

    // The row's title: the payment's own label, or what happened ("Received", "Sending").
    getTransactionTitle(transaction) {
      if (transaction.label) return transaction.label;
      const incoming = transaction.amount >= 0;
      const key =
        transaction.status === "pending"
          ? incoming
            ? "receiving"
            : "sending"
          : incoming
          ? "received"
          : "sent";
      return this.$t(`ActivityRow.${key}`);
    },

    checkTransactionStatus(transaction) {
      if (transaction.type === UnifiedTransactionType.Ecash) {
        // If it's an incoming ecash transaction, open receive dialog
        if (transaction.amount > 0) {
          this.receiveToken(transaction.token);
        } else {
          // For outgoing ecash transactions, check spendable status
          this.checkTokenSpendable(transaction);
        }
      } else if (transaction.type === UnifiedTransactionType.Onchain) {
        if (transaction.amount < 0) {
          this.checkOutgoingInvoice(transaction.quote, true);
        } else if (transaction.method === PaymentMethod.OnchainSubpayment) {
          this.checkOnchainAndMint(
            mintQuoteForHistoryInvoice(transaction),
            true
          );
        } else {
          this.checkOnchainAndMint(transaction.quote, true);
        }
      } else if (transaction.type === UnifiedTransactionType.Lightning) {
        const isBolt12 =
          transaction.method === PaymentMethod.Bolt12 ||
          transaction.method === PaymentMethod.Bolt12Subpayment;

        if (transaction.amount < 0) {
          this.checkOutgoingInvoice(transaction.quote, true);
        } else if (isBolt12) {
          this.checkOfferAndMintBolt12(
            mintQuoteForHistoryInvoice(transaction),
            true
          );
        } else if (transaction.amount > 0) {
          this.checkInvoiceBolt11(transaction.quote, true);
        }
      }
    },

    showTransactionDialog(transaction) {
      if (transaction.type === UnifiedTransactionType.Ecash) {
        // For pending incoming tokens, open receive dialog instead
        if (transaction.status === "pending" && transaction.amount > 0) {
          this.receiveToken(transaction.token);
        } else {
          this.showTokenDialog(transaction);
        }
      } else if (
        transaction.type === UnifiedTransactionType.Lightning ||
        transaction.type === UnifiedTransactionType.Onchain
      ) {
        this.showInvoiceDialog(transaction);
      }
    },

    showTokenDialog: function (historyToken) {
      if (historyToken.token === undefined) {
        notify(this.$i18n.t("HistoryTable.old_token_not_found_error_text"));
        return;
      }
      const tokensBase64 = historyToken.token;
      console.log("##### showTokenDialog");
      const tokenObj = token.decodeMeta(tokensBase64);
      this.sendData.tokens = token.getProofs(tokenObj);
      this.sendData.tokensBase64 = _.clone(tokensBase64);
      this.sendData.paymentRequest = historyToken.paymentRequest;
      this.sendData.historyAmount = historyToken.amount;
      this.sendData.historyToken = historyToken;
      if (historyToken.status === "pending" && historyToken.amount < 0) {
        this.addOutgoingTokenToChecker(tokensBase64, true);
      }
      this.showSendTokens = true;
    },

    showInvoiceDialog: async function (invoice) {
      this.invoiceData = invoice;
      this.showInvoiceDetails = true;
      if (invoice.status === "pending") {
        if (
          invoice.method === PaymentMethod.Onchain ||
          invoice.method === PaymentMethod.OnchainSubpayment
        ) {
          if (invoice.amount < 0) {
            this.checkOutgoingInvoice(invoice.quote, false);
          } else if (invoice.method === PaymentMethod.OnchainSubpayment) {
            this.checkOnchainAndMint(
              mintQuoteForHistoryInvoice(invoice),
              false,
              false
            );
          } else {
            this.checkOnchainAndMint(invoice.quote, false, false);
          }
          return;
        }
        const isBolt12 =
          invoice.method === PaymentMethod.Bolt12 ||
          invoice.method === PaymentMethod.Bolt12Subpayment;

        if (invoice.amount < 0) {
          this.addOutgoingInvoiceToChecker(invoice.quote, true);
          this.checkOutgoingInvoice(invoice.quote, true);
        } else if (isBolt12) {
          this.addBolt12OfferToChecker(
            mintQuoteForHistoryInvoice(invoice),
            true
          );
          this.checkOfferAndMintBolt12(
            mintQuoteForHistoryInvoice(invoice),
            false,
            false
          );
        } else if (invoice.amount > 0) {
          this.addInvoiceToChecker(invoice.quote, true);
          try {
            await this.checkInvoiceBolt11(invoice.quote, false, false);
          } catch (e) {
            // Handle error
          }
        }
      }
    },

    // Efficiently update and sort unified transactions only when needed
    updateUnifiedTransactions() {
      const transactions = [];

      // Add token transactions (ecash)
      this.historyTokens.forEach((token) => {
        transactions.push({
          ...token,
          type: UnifiedTransactionType.Ecash,
          id: token.id,
          label: token.label,
        });
      });

      // Add invoice transactions (lightning)
      this.invoiceHistory.forEach((invoice) => {
        const paymentMethod =
          invoice.method ||
          invoice.paymentType ||
          invoice.type ||
          PaymentMethod.Bolt11;
        transactions.push({
          ...invoice,
          type:
            paymentMethod === PaymentMethod.Onchain ||
            paymentMethod === PaymentMethod.OnchainSubpayment
              ? UnifiedTransactionType.Onchain
              : UnifiedTransactionType.Lightning,
          method: paymentMethod,
          id: invoice.id ? `payment-${invoice.id}` : `invoice-${invoice.quote}`,
          label: invoice.label,
        });
      });

      // Sort by date (newest first) and cache the result
      this.cachedUnifiedTransactions = transactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    },
  },
  created: function () {},
});
</script>

<style scoped>
.history-table {
  margin: 0 auto;
  max-width: 100%;
}

.history-empty .q-item__label {
  color: var(--app-text-muted);
}

/* Filters are toggle chips, not actions: a compact 36px pill, outlined when off and filled
   with a check when on (R20); the hit area still reaches 44px. */
.history-filter-btn {
  position: relative;
  font-size: 13px;
  min-height: 36px;
  padding: 0 14px;
  color: var(--app-text);
}
/* Secondary-control outline: muted, like the mint chip; full white is kept for focus. */
.history-filter-btn.q-btn--outline:before {
  border-color: var(--app-text-muted);
}
.history-filter-btn::after {
  content: "";
  position: absolute;
  inset: -4px 0;
}

.history-check-btn {
  margin-block: -13px;
  margin-inline: -14px -6px;
  min-height: 44px;
  min-width: 44px;
}
</style>
