<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <q-list>
      <q-item
        v-for="transaction in paginatedTransactions"
        :key="getTransactionKey(transaction)"
        clickable
        v-ripple
        class="q-px-md q-py-md"
      >
        <!-- Icon Section -->
        <q-item-section avatar class="q-pr-md" style="min-width: 40px">
          <q-avatar size="32px">
            <CoinsIcon
              v-if="isEcashTransaction(transaction)"
              class="transaction-icon"
            />
            <ZapIcon v-else class="transaction-icon" />
          </q-avatar>
        </q-item-section>

        <!-- Main Content Section -->
        <q-item-section @click="showTransactionDialog(transaction)">
          <q-item-label class="row items-center justify-between">
            <!-- Transaction Label -->
            <div class="col text-left">
              <span class="transaction-label text-weight-medium">
                {{ getTransactionLabel(transaction) }}
              </span>
            </div>

            <!-- Amount -->
            <div class="text-right">
              <div
                class="amount-text text-weight-bold"
                :class="{
                  'text-amount-positive':
                    transaction.amount >= 0 && transaction.status !== 'pending',
                  'text-grey-6': transaction.status === 'pending',
                }"
              >
                <span v-if="transaction.amount >= 0">+</span
                >{{ formatCurrency(transaction.amount, transaction.unit) }}
              </div>
            </div>
          </q-item-label>

          <q-item-label
            caption
            class="q-mt-none row items-center justify-between"
          >
            <!-- Date -->
            <div class="text-grey-6">
              {{
                $t("HistoryTable.row.date_label", {
                  value: formattedDate(transaction.date),
                })
              }}
            </div>

            <!-- Status or empty space for consistent height -->
            <div class="text-grey-6 text-caption">
              <span v-if="transaction.status === 'pending'">Pending</span>
              <span v-else>&nbsp;</span>
            </div>
          </q-item-label>
        </q-item-section>

        <!-- Actions Section -->
        <q-item-section side top style="min-width: 40px">
          <q-btn
            flat
            dense
            round
            :icon="transaction.longPressActive ? 'arrow_circle_down' : 'sync'"
            @click="
              transaction.longPressActive
                ? handleLongPress(transaction)
                : checkTransactionStatus(transaction)
            "
            @mousedown="startLongPress(transaction)"
            @mouseup="endLongPress(transaction)"
            @touchstart="startLongPress(transaction)"
            @touchend="endLongTap(transaction)"
            class="cursor-pointer"
            v-if="transaction.status === 'pending'"
            size="sm"
          >
            <q-tooltip>{{
              transaction.longPressActive
                ? $t("HistoryTable.actions.receive.tooltip_text")
                : $t("HistoryTable.actions.check_status.tooltip_text")
            }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Filter Controls -->
    <div class="text-center q-mt-lg">
      <q-btn
        rounded
        outline
        dense
        @click="filterPending = !filterPending"
        :color="filterPending ? 'primary' : 'grey'"
        :label="
          $t(
            filterPending
              ? 'HistoryTable.actions.show_all.label'
              : 'HistoryTable.actions.filter_pending.label'
          )
        "
        class="q-ml-sm q-px-md"
        size="sm"
      />
      <q-btn
        v-if="filterPending"
        rounded
        outline
        dense
        @click="filterPendingEcash = !filterPendingEcash"
        :color="filterPendingEcash ? 'primary' : 'grey'"
        label="Ecash Only"
        class="q-ml-sm q-px-md"
        size="sm"
      />
    </div>

    <!-- Empty State -->
    <div v-if="paginatedTransactions.length === 0" class="text-center q-mt-lg">
      <q-item-label caption class="text-primary">{{
        $t("HistoryTable.empty_text")
      }}</q-item-label>
    </div>

    <!-- Pagination -->
    <div v-else-if="maxPages > 1" class="text-center q-mt-lg">
      <div style="display: flex; justify-content: center">
        <q-pagination
          v-model="currentPage"
          :max="maxPages"
          :max-pages="5"
          direction-links
          boundary-links
          @input="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import * as _ from "underscore";
import { defineComponent } from "vue";
import { shortenString } from "src/js/string-utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useTokensStore } from "src/stores/tokens";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useUiStore } from "src/stores/ui";
import token from "../js/token";
import { notify } from "src/js/notify";
import { Coins as CoinsIcon, Zap as ZapIcon } from "lucide-vue-next";

export default defineComponent({
  name: "HistoryTable",
  components: {
    CoinsIcon,
    ZapIcon,
  },
  mixins: [windowMixin],
  props: {},
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
            transaction.status === "pending" && transaction.type === "ecash"
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

    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTransactions.slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "checkTokenSpendable",
      "checkInvoice",
      "checkOutgoingInvoice",
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

    formattedDate(date_str) {
      const date = parseISO(date_str);
      return formatDistanceToNow(date, { addSuffix: false });
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
      return transaction.type === "ecash";
    },

    isLightningTransaction(transaction) {
      return transaction.type === "lightning";
    },

    getTransactionIcon(transaction) {
      return transaction.type === "lightning"
        ? "flash_on"
        : "account_balance_wallet";
    },

    getTransactionIconColor(transaction) {
      return transaction.type === "lightning" ? "orange" : "blue";
    },

    getDefaultLabel(transaction) {
      return transaction.type === "lightning" ? "Lightning" : "Ecash";
    },

    getTransactionLabel(transaction) {
      return transaction.label || this.getDefaultLabel(transaction);
    },

    checkTransactionStatus(transaction) {
      if (transaction.type === "ecash") {
        // If it's an incoming ecash transaction, open receive dialog
        if (transaction.amount > 0) {
          this.receiveToken(transaction.token);
        } else {
          // For outgoing ecash transactions, check spendable status
          this.checkTokenSpendable(transaction);
        }
      } else if (transaction.type === "lightning") {
        if (transaction.amount > 0) {
          this.checkInvoice(transaction.quote, true);
        } else {
          this.checkOutgoingInvoice(transaction.quote, true);
        }
      }
    },

    showTransactionDialog(transaction) {
      if (transaction.type === "ecash") {
        // For pending incoming tokens, open receive dialog instead
        if (transaction.status === "pending" && transaction.amount > 0) {
          this.receiveToken(transaction.token);
        } else {
          this.showTokenDialog(transaction);
        }
      } else if (transaction.type === "lightning") {
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
      const tokenObj = token.decode(tokensBase64);
      this.sendData.tokens = token.getProofs(tokenObj);
      this.sendData.tokensBase64 = _.clone(tokensBase64);
      this.sendData.paymentRequest = historyToken.paymentRequest;
      this.sendData.historyAmount = historyToken.amount;
      this.sendData.historyToken = historyToken;
      this.showSendTokens = true;
    },

    showInvoiceDialog: async function (invoice) {
      this.invoiceData = invoice;
      this.showInvoiceDetails = true;
      if (invoice.status === "pending") {
        if (invoice.amount > 0) {
          try {
            await this.checkInvoice(invoice.quote, false, false);
          } catch (e) {
            // Handle error
          }
        } else {
          this.checkOutgoingInvoice(invoice.quote, true);
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
          type: "ecash",
          id: token.id,
          label: token.label,
        });
      });

      // Add invoice transactions (lightning)
      this.invoiceHistory.forEach((invoice) => {
        transactions.push({
          ...invoice,
          type: "lightning",
          id: `invoice-${invoice.quote}`,
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
.transaction-label {
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.transaction-label:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.transaction-icon {
  width: 20px;
  height: 20px;
  color: var(--q-primary);
}

.amount-text {
  font-size: 1rem;
  line-height: 1.2;
}

.text-amount-positive {
  color: hsl(120, 88%, 58%);
}
</style>
