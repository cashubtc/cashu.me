<template>
  <div style="max-width: 1000px; margin: 0 auto">
    <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
      <q-list>
        <q-item v-for="invoice in paginatedInvoices" :key="invoice.id">
          <q-item-section
            side
            @click="showInvoiceDialog(invoice)"
            style="width: 140px"
            class="q-pr-none items-center"
          >
            <q-item-label class="text-weight-bold">
              <q-icon
                :name="invoice.amount >= 0 ? 'call_received' : 'call_made'"
                :color="
                  invoice.status === 'paid'
                    ? invoice.amount >= 0
                      ? 'green'
                      : 'red'
                    : ''
                "
                class="q-mr-xs"
                size="xs"
              />
              {{ formatCurrency(invoice.amount, invoice.unit) }}
            </q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label @click="showInvoiceDialog(invoice)">
              {{ $t("InvoiceTable.row.type_label") }}
              <q-tooltip>{{
                $t("InvoiceTable.row.type_tooltip_text")
              }}</q-tooltip>
            </q-item-label>
            <q-item-label caption>{{
              $t("InvoiceTable.row.date_label", {
                value: formattedDate(invoice.date),
              })
            }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-btn
              flat
              dense
              icon="sync"
              @click="
                invoice.amount > 0
                  ? checkInvoice(invoice.quote, true)
                  : checkOutgoingInvoice(invoice.quote, true)
              "
              class="cursor-pointer"
              v-if="invoice.status === 'pending'"
              style="position: absolute; right: 0"
              :aria-label="$t('InvoiceTable.actions.check_status.tooltip_text')"
              :title="$t('InvoiceTable.actions.check_status.tooltip_text')"
            >
              <q-tooltip>{{
                $t("InvoiceTable.actions.check_status.tooltip_text")
              }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
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
                ? 'InvoiceTable.actions.show_all.label'
                : 'InvoiceTable.actions.filter_pending.label'
            )
          "
          class="q-ml-sm q-px-md"
          size="sm"
        />
      </div>
      <div v-if="paginatedInvoices.length === 0" class="text-center q-mt-lg">
        <q-item-label caption class="text-primary">{{
          $t("InvoiceTable.empty_text")
        }}</q-item-label>
      </div>
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
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { shortenString } from "src/js/string-utils";
import { mapWritableState, mapActions } from "pinia";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useInvoiceHistoryStore } from "src/stores/invoiceHistory";
import { useInvoicesWorkerStore } from "src/stores/invoicesWorker";
import { formatDistanceToNow, parseISO } from "date-fns";

export default defineComponent({
  name: "InvoicesTable",
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
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    ...mapWritableState(useInvoiceHistoryStore, ["invoiceHistory"]),
    ...mapWritableState(useWalletStore, ["invoiceData", "payInvoiceData"]),
    maxPages() {
      return Math.ceil(this.invoiceHistory.length / this.pageSize);
    },
    paginatedInvoices() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      if (this.filterPending) {
        return this.invoiceHistory
          .filter((invoice) => invoice.status === "pending")
          .slice(start, end);
      }
      return this.invoiceHistory.slice().reverse().slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, [
      "checkInvoice",
      "mintOnPaid",
      "checkOutgoingInvoice",
    ]),
    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    showInvoiceDialog: async function (invoice) {
      this.invoiceData = invoice;
      this.showInvoiceDetails = true;
      if (invoice.status === "pending") {
        if (invoice.amount > 0) {
          try {
            await this.checkInvoice(invoice.quote, false, false);
          } catch (e) {
            this.mintOnPaid(invoice.quote, false, true, false);
          }
        } else {
          this.checkOutgoingInvoice(invoice.quote, true);
        }
      }
    },
    formattedDate(date_str) {
      const date = parseISO(date_str); // Convert string to date object
      return formatDistanceToNow(date, { addSuffix: false }); // "6 hours ago"
    },
  },
  created: function () {},
});
</script>
