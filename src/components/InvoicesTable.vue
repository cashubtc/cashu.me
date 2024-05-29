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
            <q-item-label @click="copyText(invoice.bolt11)">
              Lightning
              <q-tooltip>Click to copy</q-tooltip>
            </q-item-label>
            <q-item-label caption>{{
              formattedDate(invoice.date)
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
            >
              <q-tooltip>Check status</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="paginatedInvoices.length === 0" class="text-center q-mt-lg">
        <q-item-label caption class="text-primary"
          >No invoices yet</q-item-label
        >
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
import { formatDistanceToNow, parseISO } from "date-fns";

export default defineComponent({
  name: "InvoicesTable",
  mixins: [windowMixin],
  props: {},
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
    };
  },
  computed: {
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    ...mapWritableState(useWalletStore, [
      "invoiceHistory",
      "invoiceData",
      "payInvoiceData",
    ]),
    maxPages() {
      return Math.ceil(this.invoiceHistory.length / this.pageSize);
    },
    paginatedInvoices() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.invoiceHistory.slice().reverse().slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["checkInvoice", "checkOutgoingInvoice"]),
    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    showInvoiceDialog(invoice) {
      this.invoiceData = invoice;
      this.showInvoiceDetails = true;
      // this.tab("invoice");
    },
    formattedDate(date_str) {
      const date = parseISO(date_str); // Convert string to date object
      return formatDistanceToNow(date, { addSuffix: false }); // "6 hours ago"
    },
  },
  created: function () {},
});
</script>
