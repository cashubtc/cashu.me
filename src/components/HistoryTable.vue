<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <q-list>
      <q-item
        v-for="token in paginatedTokens"
        :key="token.id"
        clickable
        v-ripple
        class="q-px-md"
      >
        <q-item-section
          side
          @click="showTokenDialog(token)"
          style="width: 140px"
          class="q-pr-none items-center"
        >
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
              size="xs"
            />
            <span> {{ formatCurrency(token.amount, token.unit) }} </span>
          </q-item-label>
        </q-item-section>

        <q-item-section
          class="items-center q-pl-lg"
          @click="showTokenDialog(token)"
          style="width: 300px"
        >
          <q-item-label>
            <!-- {{
              token.token.slice(0, 10) + "..." + token.token.slice(-8)
            }} -->
            Ecash
          </q-item-label>
          <q-item-label caption
            >{{ formattedDate(token.date) }} ago</q-item-label
          >
        </q-item-section>

        <q-item-section side top>
          <q-btn
            flat
            dense
            icon="sync"
            @click="checkTokenSpendable(token)"
            class="cursor-pointer"
            v-if="token.status === 'pending' && token.amount < 0"
            style="position: absolute; right: 0"
          >
            <q-tooltip>Check status</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="arrow_circle_down"
            @click="receiveToken(token.token)"
            class="cursor-pointer"
            v-if="token.status === 'pending' && token.amount > 0"
            style="position: absolute; right: 0"
          >
            <q-tooltip>Receive</q-tooltip>
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
        :label="filterPending ? 'Show all' : 'Filter pending'"
        class="q-ml-sm q-px-md"
        size="sm"
      />
    </div>
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
import * as _ from "underscore";
import { defineComponent } from "vue";
import { shortenString } from "src/js/string-utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useTokensStore } from "src/stores/tokens";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useSendTokensStore } from "src/stores/sendTokensStore";
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
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
    maxPages() {
      return Math.ceil(this.historyTokens.length / this.pageSize);
    },
    paginatedTokens() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      if (this.filterPending) {
        return this.historyTokens
          .filter((historyToken) => historyToken.status === "pending")
          .slice()
          .reverse()
          .slice(start, end);
      }
      return this.historyTokens.slice().reverse().slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["checkTokenSpendable"]),
    formattedDate(date_str) {
      const date = parseISO(date_str); // Convert string to date object
      return formatDistanceToNow(date, { addSuffix: false }); // "6 hours ago"
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
    showTokenDialog: function (historyToken) {
      if (historyToken.token === undefined) {
        notify("Old token not found");
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
  },
  created: function () {},
});
</script>
