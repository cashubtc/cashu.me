<template>
  <div class="history-table">
    <!-- Loading: the filter row and the rows themselves as skeletons, so the list doesn't
         move when it fills (the 44px filter row arriving with the payments pushed every row
         down). -->
    <div v-if="skeleton" aria-hidden="true">
      <div class="history-toolbar">
        <IconButton
          class="history-filter-btn"
          :icon="ListFilterIcon"
          :label="$t('HistoryTable.filters.title')"
          disable
          tabindex="-1"
        />
      </div>
      <q-list>
        <ActivityRow v-for="n in 5" :key="n" skeleton />
      </q-list>
    </div>
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
      <!-- Filters: what is filtered, as removable chips that wrap, how many of all payments
           show, and Clear all once two are on; the filter button on the end opens the sheet.
           Nothing filtered, the button stands alone. Council 2026-11-01: the shipped row and
           its "Clear all" variant tied; both reviewers asked for this merge. -->
      <div class="history-toolbar">
        <div v-if="activeGroups.length" class="history-chips">
          <button
            v-for="group in activeGroups"
            :key="group"
            type="button"
            class="history-chip"
            data-testid="history-filter-chip"
            :aria-label="
              $t('HistoryTable.filters.remove', { label: chipLabel(group) })
            "
            @click="clearFilter(group)"
          >
            <span class="history-chip__label">{{ chipLabel(group) }}</span>
            <XIcon :size="14" aria-hidden="true" />
          </button>
          <span class="history-count">{{
            $t("HistoryTable.filters.count", {
              shown: filteredTransactions.length,
              total: unifiedTransactions.length,
            })
          }}</span>
          <button
            v-if="activeGroups.length >= 2"
            type="button"
            class="history-clear-all"
            data-testid="history-filter-clear-all"
            @click="clearAllFilters"
          >
            {{ $t("HistoryTable.filters.clear_all") }}
          </button>
        </div>
        <IconButton
          class="history-filter-btn"
          data-testid="history-filter"
          :icon="ListFilterIcon"
          :label="
            activeGroups.length
              ? $t('HistoryTable.filters.active', {
                  count: activeGroups.length,
                })
              : $t('HistoryTable.filters.title')
          "
          @click="showFilterSheet = true"
        />
      </div>
      <!-- Nothing matches: say so, and offer the way back (not "No history yet"). -->
      <EmptyState
        v-if="filteredTransactions.length === 0"
        :icon="ListFilterIcon"
        :boxed="false"
        :title="$t('HistoryTable.filters.empty_title')"
        class="history-empty-state"
        data-testid="history-filter-empty"
      >
        <template #actions>
          <q-btn
            outline
            rounded
            class="q-mt-md"
            data-testid="history-filter-clear"
            @click="clearAllFilters"
          >
            {{ $t("HistoryTable.filters.clear") }}
          </q-btn>
        </template>
      </EmptyState>
      <q-list v-else>
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
          :caption="[
            getDefaultLabel(transaction),
            transaction.unit && transaction.unit !== 'sat'
              ? unitCode(transaction.unit)
              : '',
            formattedDate(transaction.date),
          ]"
          caption-class="text-app-muted"
          @details-click="showTransactionDialog(transaction)"
        >
          <template #caption-end>
            <!-- Status, with the check action for pending rows -->
            <div
              v-if="transaction.status === 'pending'"
              class="row items-center no-wrap text-app-muted text-caption"
            >
              <!-- A labelled action ("Check status"), not a bare refresh glyph that read as
                   the wallet-wide refresh (council R68-R70). -->
              <q-btn
                flat
                dense
                rounded
                no-caps
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
                <RefreshCwIcon v-else :size="16" />
                <span class="history-check-btn__label">{{
                  transaction.longPressActive
                    ? $t("HistoryTable.actions.receive.tooltip_text")
                    : $t("HistoryTable.actions.check_status.tooltip_text")
                }}</span>
              </q-btn>
            </div>
          </template>
        </ActivityRow>
        <!-- Hold the list at a full page while paging or filtering, so the filters and
           pagination below never move. -->
        <div
          v-for="n in placeholderRowCount"
          :key="`placeholder-${n}`"
          class="activity-row activity-row--placeholder"
          aria-hidden="true"
        />
      </q-list>

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
      <HistoryFilterSheet
        v-model="showFilterSheet"
        :transactions="unifiedTransactions"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { unitCode } from "src/js/format-currency";
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
import IconButton from "src/components/ui/IconButton.vue";
import HistoryFilterSheet from "src/components/HistoryFilterSheet.vue";
import { useMintsStore } from "src/stores/mints";
import {
  activeFilterGroups,
  DEFAULT_HISTORY_FILTERS,
  HISTORY_FILTER_LABEL_KEYS,
  historyMintLabel,
  matchesHistoryFilters,
} from "src/js/history-filters";
import {
  CircleArrowDown as CircleArrowDownIcon,
  History as HistoryIcon,
  ListFilter as ListFilterIcon,
  RefreshCw as RefreshCwIcon,
  X as XIcon,
} from "lucide-vue-next";
import { PaymentMethod, UnifiedTransactionType } from "src/stores/walletTypes";
import { mintQuoteForHistoryInvoice } from "src/js/invoice-history";

export default defineComponent({
  name: "HistoryTable",
  props: {
    /** Show placeholder rows while the history is being read. */
    skeleton: { type: Boolean, default: false },
    /**
     * Show these payments instead of the wallet's (the design system board's in-memory
     * fixtures). The rows are inert: Check status and the details do nothing.
     */
    transactions: { type: Array, default: null },
  },
  components: {
    CircleArrowDownIcon,
    RefreshCwIcon,
    XIcon,
    ActivityRow,
    EmptyState,
    IconButton,
    HistoryFilterSheet,
  },
  setup() {
    return {
      HistoryIcon: markRaw(HistoryIcon),
      ListFilterIcon: markRaw(ListFilterIcon),
    };
  },
  mixins: [windowMixin],
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
      showFilterSheet: false,
      cachedUnifiedTransactions: [],
    };
  },
  watch: {
    historyFilters: {
      handler: function () {
        this.currentPage = 1;
      },
      deep: true,
    },
    // Watch for any changes in historyTokens (additions, updates, deletions)
    historyTokens: {
      handler: function () {
        this.updateUnifiedTransactions();
      },
      deep: true,
      immediate: true,
    },
    transactions: function () {
      this.updateUnifiedTransactions();
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
    ...mapWritableState(useUiStore, ["showInvoiceDetails", "historyFilters"]),
    ...mapState(useMintsStore, ["mints"]),
    ...mapWritableState(useWalletStore, ["invoiceData", "payInvoiceData"]),

    // Use cached unified transactions for better performance
    unifiedTransactions() {
      return this.cachedUnifiedTransactions;
    },

    // Filter transactions first, then paginate
    filteredTransactions() {
      return this.unifiedTransactions.filter((transaction) =>
        matchesHistoryFilters(transaction, this.historyFilters)
      );
    },

    activeGroups() {
      return activeFilterGroups(this.historyFilters);
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
    unitCode,
    chipLabel(group) {
      const value = this.historyFilters[group];
      if (group === "mint") return historyMintLabel(value, this.mints);
      if (group === "unit") return unitCode(value);
      return this.$t(HISTORY_FILTER_LABEL_KEYS[group][value]);
    },
    clearFilter(group) {
      this.historyFilters[group] = DEFAULT_HISTORY_FILTERS[group];
    },
    clearAllFilters() {
      this.historyFilters = { ...DEFAULT_HISTORY_FILTERS };
    },
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
      if (!this.transactions && this.isEcashTransaction(transaction)) {
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
      if (this.transactions) return;
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
      if (this.transactions) return;
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
      if (this.transactions) {
        this.cachedUnifiedTransactions = this.transactions;
        return;
      }
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

/* The filter row over the list: chips on the start edge, the filter button on the end
   edge, its glyph's ink on the list's 16px inset like every other trailing control. */
.history-toolbar {
  align-items: flex-start;
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  min-height: 44px;
}
/* The chips wrap rather than scroll, so every active filter stays in view (long German or
   Thai labels, a mint and a unit included); the row grows a line instead. */
.history-chips {
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  padding-block: 6px;
}
.history-clear-all {
  background: none;
  border: 0;
  border-radius: var(--app-radius-sm);
  color: var(--app-text);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  min-height: 32px;
  padding: 0 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.history-chip {
  align-items: center;
  background: var(--app-tint);
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text);
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 4px;
  min-height: 32px;
  padding: 0 10px 0 12px;
  transition: background 0.15s ease;
}
@media (hover: hover) {
  .history-chip:hover {
    background: var(--app-tint-strong);
  }
}
.history-chip:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}
.history-chip__label {
  max-width: 14em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-count {
  color: var(--app-text-muted);
  flex-shrink: 0;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  padding-inline-start: 4px;
  white-space: nowrap;
}
.history-filter-btn {
  margin-inline: auto -10px;
  position: relative;
}

.history-check-btn {
  color: var(--app-text-muted);
  font-size: 14px !important;
  font-weight: 500;
  /* The 44px target reaches a little past its row: it paints above the next row (whose fill
     hid its tint and ring, hover audit F3) and draws its ring inside. */
  margin-block: -10px;
  margin-inline-end: -8px;
  min-height: 44px;
  padding: 0 8px;
  position: relative;
  z-index: 1;
}
.history-check-btn:focus-visible {
  outline-offset: -2px !important;
}
.history-check-btn__label {
  margin-inline-start: 6px;
}
</style>
