<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <q-list>
      <q-item
        v-for="token in paginatedTokens"
        :key="token.id"
        clickable
        v-ripple
        @click="showTokenDialog(token.token)"
      >
        <q-item-section side>
          <q-item-label class="text-weight-bold">
            <q-icon
              :name="token.amount >= 0 ? 'call_received' : 'call_made'"
              :color="
                token.status === 'paid'
                  ? token.amount >= 0
                    ? 'green'
                    : 'red'
                  : ''
              "
              class="q-mr-xs"
            />
            {{ formatCurrency(token.amount, token.unit) }}</q-item-label
          >
        </q-item-section>

        <q-item-section class="q-ml-xl">
          <q-item-label>
            {{
              token.token.slice(0, 10) + "..." + token.token.slice(-8)
            }}</q-item-label
          >
          <q-item-label caption>{{ formattedDate(token.date) }}</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-btn
            flat
            dense
            icon="sync"
            @click="checkTokenSpendable(token.token)"
            class="cursor-pointer"
            v-if="token.status === 'pending'"
            style="position: absolute; right: 0"
          >
            <q-tooltip>Check status</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-if="paginatedTokens.length === 0" class="text-center q-mt-lg">
      <q-item-label caption class="text-primary">No history yet</q-item-label>
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
</template>
<script>
import { defineComponent } from "vue";
import { shortenString } from "src/js/string-utils";
import { formatDistanceToNow, parseISO } from "date-fns";

export default defineComponent({
  name: "HistoryTable",
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
    historyTokens: Array,
    showTokenDialog: Function,
    checkTokenSpendable: Function,
  },
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
      historyTable: {
        columns: [
          {
            name: "status",
            align: "left",
            label: "",
            field: "status",
            sortable: true,
          },
          {
            name: "amount",
            align: "left",
            label: "Amount",
            field: "amount",
            sortable: true,
          },
          {
            name: "date",
            align: "left",
            label: "Date",
            field: "date",
            sortable: true,
          },
          {
            name: "token",
            align: "left",
            label: "Token",
            field: "token",
            sortable: false,
          },
        ],
        pagination: {
          sortBy: "date",
          descending: true,
          rowsPerPage: 5,
        },
        filter: null,
      },
    };
  },
  computed: {
    maxPages() {
      return Math.ceil(this.historyTokens.length / this.pageSize);
    },
    paginatedTokens() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.historyTokens.slice().reverse().slice(start, end);
    },
  },
  methods: {
    formattedDate(date_str) {
      const date = parseISO(date_str); // Convert string to date object
      return formatDistanceToNow(date, { addSuffix: true }); // "6 hours ago"
    },
    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
  },
  created: function () {},
});
</script>
