<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <q-list>
      <q-item
        v-for="transaction in paginatedTransactions"
        :key="getTransactionKey(transaction)"
        clickable
        v-ripple
        class="q-px-md"
      >
        <!-- Amount Section -->
        <q-item-section
          side
          @click="showTransactionDialog(transaction)"
          style="width: 140px"
          class="q-pr-none items-center"
        >
          <q-item-label class="text-weight-bold">
            <q-icon
              :name="transaction.amount >= 0 ? 'call_received' : 'call_made'"
              :color="
                transaction.status === 'paid'
                  ? transaction.amount >= 0
                    ? 'green'
                    : 'red'
                  : ''
              "
              class="q-mr-xs"
              size="xs"
            />
            <span> {{ formatCurrency(transaction.amount, transaction.unit) }} </span>
          </q-item-label>
        </q-item-section>

        <!-- Transaction Details Section -->
        <q-item-section
          class="items-center q-pl-lg"
          @click="showTransactionDialog(transaction)"
          style="width: 300px"
        >
          <q-item-label class="row items-center">
            <!-- Transaction type icon -->
            <q-icon
              :name="getTransactionIcon(transaction)"
              :color="getTransactionIconColor(transaction)"
              size="sm"
              class="q-mr-sm"
            />
            <!-- Editable label -->
            <span
              v-if="!transaction.editingLabel"
              @dblclick="startEditingLabel(transaction)"
              class="cursor-pointer transaction-label"
              :title="$t('HistoryTable.label.edit_hint')"
            >
              {{ getTransactionLabel(transaction) }}
            </span>
            <q-input
              v-else
              v-model="transaction.tempLabel"
              @blur="finishEditingLabel(transaction)"
              @keyup.enter="finishEditingLabel(transaction)"
              @keyup.esc="cancelEditingLabel(transaction)"
              :placeholder="getDefaultLabel(transaction)"
              dense
              outlined
              autofocus
              style="max-width: 150px"
            />
          </q-item-label>
          <q-item-label caption>
            {{
              $t("HistoryTable.row.date_label", {
                value: formattedDate(transaction.date),
              })
            }}
          </q-item-label>
        </q-item-section>

        <!-- Actions Section -->
        <q-item-section side top>
          <q-btn
            flat
            dense
            icon="sync"
            @click="checkTransactionStatus(transaction)"
            class="cursor-pointer"
            v-if="transaction.status === 'pending'"
            style="position: absolute; right: 0"
          >
            <q-tooltip>{{
              $t("HistoryTable.actions.check_status.tooltip_text")
            }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="arrow_circle_down"
            @click="receiveToken(transaction.token)"
            class="cursor-pointer"
            v-if="isEcashTransaction(transaction) && transaction.status === 'pending' && transaction.amount > 0"
            style="position: absolute; right: 0"
          >
            <q-tooltip>{{
              $t("HistoryTable.actions.receive.tooltip_text")
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
<script>
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

export default defineComponent({
  name: "HistoryTable",
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
      filterPending: false,
    };
  },
  watch: {
    filterPending: function () {
      this.currentPage = 1;
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
    ...mapWritableState(useWalletStore, [
      "invoiceData",
      "payInvoiceData",
    ]),
    
    // Unified transactions combining both tokens and invoices
    unifiedTransactions() {
      const transactions = [];
      
      // Add token transactions (ecash)
      this.historyTokens.forEach(token => {
        transactions.push({
          ...token,
          type: 'ecash',
          id: `token-${token.token}`,
          label: token.label, // Use existing label or undefined
          editingLabel: false,
          tempLabel: '',
        });
      });
      
      // Add invoice transactions (lightning)
      this.invoiceHistory.forEach(invoice => {
        transactions.push({
          ...invoice,
          type: 'lightning',
          id: `invoice-${invoice.quote}`,
          label: invoice.label, // Use existing label or undefined
          editingLabel: false,
          tempLabel: '',
        });
      });
      
      // Sort by date (newest first)
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    maxPages() {
      return Math.ceil(this.unifiedTransactions.length / this.pageSize);
    },
    
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      
      if (this.filterPending) {
        return this.unifiedTransactions
          .filter((transaction) => transaction.status === "pending")
          .slice(start, end);
      }
      
      return this.unifiedTransactions.slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "checkTokenSpendable", 
      "checkInvoice", 
      "checkOutgoingInvoice"
    ]),
    
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
      return transaction.type === 'ecash';
    },
    
    isLightningTransaction(transaction) {
      return transaction.type === 'lightning';
    },
    
    getTransactionIcon(transaction) {
      return transaction.type === 'lightning' ? 'flash_on' : 'account_balance_wallet';
    },
    
    getTransactionIconColor(transaction) {
      return transaction.type === 'lightning' ? 'orange' : 'blue';
    },
    
    getDefaultLabel(transaction) {
      return transaction.type === 'lightning' ? 'Lightning' : 'Ecash';
    },
    
    getTransactionLabel(transaction) {
      return transaction.label || this.getDefaultLabel(transaction);
    },
    
    startEditingLabel(transaction) {
      transaction.editingLabel = true;
      transaction.tempLabel = transaction.label || this.getDefaultLabel(transaction);
    },
    
    finishEditingLabel(transaction) {
      if (transaction.tempLabel.trim()) {
        transaction.label = transaction.tempLabel.trim();
        this.saveTransactionLabel(transaction);
      } else {
        transaction.label = undefined; // Use default
      }
      transaction.editingLabel = false;
      transaction.tempLabel = '';
    },
    
    cancelEditingLabel(transaction) {
      transaction.editingLabel = false;
      transaction.tempLabel = '';
    },
    
    saveTransactionLabel(transaction) {
      // Save the label to the appropriate store
      if (transaction.type === 'ecash') {
        // Update token in historyTokens
        const tokenIndex = this.historyTokens.findIndex(t => t.token === transaction.token);
        if (tokenIndex !== -1) {
          this.historyTokens[tokenIndex].label = transaction.label;
        }
      } else if (transaction.type === 'lightning') {
        // Update invoice in invoiceHistory
        const invoiceIndex = this.invoiceHistory.findIndex(i => i.quote === transaction.quote);
        if (invoiceIndex !== -1) {
          this.invoiceHistory[invoiceIndex].label = transaction.label;
        }
      }
    },
    
    checkTransactionStatus(transaction) {
      if (transaction.type === 'ecash') {
        this.checkTokenSpendable(transaction);
      } else if (transaction.type === 'lightning') {
        if (transaction.amount > 0) {
          this.checkInvoice(transaction.quote, true);
        } else {
          this.checkOutgoingInvoice(transaction.quote, true);
        }
      }
    },
    
    showTransactionDialog(transaction) {
      if (transaction.type === 'ecash') {
        this.showTokenDialog(transaction);
      } else if (transaction.type === 'lightning') {
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
  },
  created: function () {},
});
</script>

<style scoped>
.transaction-label {
  border-radius: 4px;
  padding: 2px 6px;
  transition: background-color 0.2s ease;
}

.transaction-label:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
