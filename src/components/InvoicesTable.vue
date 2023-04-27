<template>
  <q-table
    dense
    flat
    :rows="invoiceHistory"
    :columns="invoicesTable.columns"
    no-data-label="There are no invoices here yet"
    :filter="invoicesTable.filter"
    :pagination="invoicesTable.pagination"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="status" :props="props">
          <div v-if="props.row.status == 'pending'">
            <q-icon
              @click="showInvoiceInfoDialog(props.row)"
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
              @click="checkInvoice(props.row.hash, true)"
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
          :class="
            props.row.amount > 0 && props.row.status === 'paid'
              ? 'text-green-13 text-weight-bold'
              : ''
          "
        >
          <div>{{ formatSat(props.row.amount) }}</div>
        </q-td>

        <q-td key="date" :props="props">
          <div>{{ props.row.date }}</div>
        </q-td>
        <!-- <q-td key="memo" :props="props">
                            <div>{{props.row.memo}}</div>
                        </q-td> -->
        <q-td key="bolt11" :props="props">
          <div @click="copyText(props.row.bolt11)">
            {{ shortenString(props.row.bolt11) }}
            <q-tooltip>Click to copy</q-tooltip>
          </div>
        </q-td>
        <q-td key="hash" :props="props">
          <div @click="copyText(props.row.hash)">
            {{ props.row.hash }}
          </div>
        </q-td>
        <q-td key="mint" :props="props">
          <div>{{ props.row.mint }}</div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script>
import { defineComponent } from "vue";
import { shortenString } from "js/string-utils";

export default defineComponent({
  name: "InvoicesTable",
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
    invoiceHistory: Array,
    showInvoiceInfoDialog: Function,
    checkInvoice: Function,
  },
  data: function () {
    return {
      invoicesTable: {
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
          // {
          //   name: 'memo',
          //   align: 'left',
          //   label: 'Memo',
          //   field: 'memo',
          //   sortable: true
          // },
          {
            name: "bolt11",
            align: "left",
            label: "Payment request",
            field: "bolt11",
            sortable: false,
          },
          {
            name: "hash",
            align: "left",
            label: "Hash",
            field: "hash",
            sortable: false,
          },
          {
            name: "mint",
            align: "left",
            label: "Mint",
            field: "mint",
            sortable: true,
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
  methods: {
    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },
  },
  created: function () {},
});
</script>
