<template>
  <div class="q-pa-md" style="max-width: 500px; margin: 0 auto">
    <q-list>
      <q-item v-for="token in paginatedTokens" :key="token.id">
        <q-item-section side>
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
            @click="showTokenDialog(token.token)"
          />
          <q-item-label caption class="text-weight-bold">{{
            formatCurrency(token.amount, token.unit)
          }}</q-item-label>
        </q-item-section>

        <q-item-section>
          <q-item-label @click="showTokenDialog(token.token)">{{
            token.token.slice(0, 8) + "..." + token.token.slice(-8)
          }}</q-item-label>
          <q-tooltip>Click to copy</q-tooltip>
          <q-item-label caption @click="showTokenDialog(token.token)">{{
            token.date
          }}</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <!-- <q-btn
            flat
            dense
            icon="settings_ethernet"
            @click="showTokenDialog(token.token)"
            v-if="token.status === 'pending'"
          >
            <q-tooltip>Pending</q-tooltip>
          </q-btn> -->
          <q-btn
            flat
            dense
            icon="sync"
            @click="checkTokenSpendable(token.token)"
            class="cursor-pointer"
            v-if="token.status === 'pending'"
          >
            <q-tooltip>Check status</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>

      <q-separator spaced inset v-if="!$last" />
    </q-list>
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
  <q-table
    dense
    flat
    :rows="historyTokens"
    :columns="historyTable.columns"
    no-data-label="There are no tokens here yet"
    :filter="historyTable.filter"
    :pagination="historyTable.pagination"
    v-if="false"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="status" :props="props">
          <div v-if="props.row.status == 'pending'">
            <q-icon
              @click="showTokenDialog(props.row.token)"
              name="settings_ethernet"
              color="grey"
            >
              <q-tooltip>Pending</q-tooltip>
            </q-icon>
            <q-icon
              name="sync"
              size="xs"
              color="grey"
              class="q-mr-xs cursor-pointer"
              @click="checkTokenSpendable(props.row.token)"
            >
              <q-tooltip>Check status</q-tooltip>
            </q-icon>
          </div>
          <div v-if="props.row.status === 'paid'">
            <q-icon
              v-if="props.row.amount > 0"
              name="call_received"
              color="green"
              ><q-tooltip>Received</q-tooltip></q-icon
            >
            <q-icon v-if="props.row.amount < 0" name="call_made" color="red"
              ><q-tooltip>Paid</q-tooltip></q-icon
            >
            <!-- <q-icon name="props.row.amount < 0 ? 'call_made' : 'call_received'" color="green"></q-icon> -->
          </div>
        </q-td>
        <q-td
          key="amount"
          :props="props"
          :class="props.row.amount > 0 ? 'text-green-13 text-weight-bold' : ''"
        >
          <div>{{ formatCurrency(props.row.amount, props.row.unit) }}</div>
        </q-td>
        <q-td key="date" :props="props">
          <div>{{ props.row.date }}</div>
        </q-td>
        <!-- <q-td key="memo" :props="props">
                            <div>{{props.row.memo}}</div>
                        </q-td> -->
        <q-td key="token" :props="props">
          <div @click="copyText(props.row.token)">
            {{
              props.row.token.slice(0, 8) +
              "..." +
              props.row.token.slice(
                props.row.token.length / 2,
                props.row.token.length / 2 + 10
              ) +
              "..." +
              props.row.token.slice(-8)
            }}
            <q-tooltip>Click to copy</q-tooltip>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script>
import { defineComponent } from "vue";
import { shortenString } from "src/js/string-utils";

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
