<template>
  <q-card class="q-my-md q-py-sm">
    <q-card-section class="q-mt-sm q-py-xs">
      <div>
        <div class="row">
          <div class="col-12">
            <h3 class="q-my-none q-py-none">
              <strong> {{ formatSat(getTotalBalance) }} </strong>
              {{ tickerShort }}
            </h3>
            <div v-if="bitcoinPrice">
              <strong>
                {{
                  formatCurrency(
                    (bitcoinPrice / 100000000) * getTotalBalance,
                    "USD"
                  ).slice(1)
                }}
              </strong>
              {{ tickerDollar }}
              <q-tooltip>
                {{
                  formatCurrency(bitcoinPrice, "USD").slice(1) +
                  " " +
                  tickerDollar
                }}/BTC</q-tooltip
              >
            </div>
          </div>
        </div>
        <!-- mint balance -->
        <div class="row q-mt-sm q-mb-none" v-if="mints.length > 1">
          <div class="col-12">
            <q-icon
              name="account_balance"
              size="0.9rem"
              color="grey"
              class="q-mr-none q-mb-xs"
            />
            <span class="q-my-none q-py-none text-weight-regular">
              Active mint:
              <b>{{ formatSat(getBalance) }} {{ tickerShort }} </b>
            </span>
            <!-- <q-knob
              :model-value="getBalance"
              :min="0"
              :max="getTotalBalance"
              show-value
              size="50px"
              :thickness="0.2"
              color="orange"
              class="q-ma-none q-pa-none q-mt-none q-pt-none"
            /> -->
          </div>
        </div>
        <!-- mint url -->
        <div class="row q-mt-xs q-mb-none" v-if="activeMintUrl">
          <div class="col-12 cursor-pointer">
            <q-icon
              name="link"
              size="1rem"
              color="grey"
              class="q-mr-none q-mb-none"
              @click="setTab('settings')"
            />
            <span class="text-weight-light" @click="setTab('settings')">
              Mint: <b>{{ getActiveMintUrlShort }}</b>
              <q-tooltip>Configure mint(s)</q-tooltip>
            </span>
          </div>
        </div>
      </div>
      <!-- pending -->
      <div class="row q-mt-xs q-mb-none" v-if="pendingBalance > 0">
        <div class="col-12">
          <q-btn
            name="history"
            size="sm"
            align="between"
            color="white"
            dense
            outline
            icon="refresh"
            class="q-mx-none q-mt-xs q-px-sm cursor-pointer"
            @click="checkPendingTokens()"
          >
            Pending: {{ formatSat(pendingBalance) }} {{ tickerShort }}
            <q-tooltip>Check all pending tokens</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import axios from "axios";

async function fetchBitcoinPrice() {
  var { data } = await axios.get(
    "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
  );
  return data.data.rates.USD;
}

export default defineComponent({
  name: "BalanceView",
  mixins: [windowMixin],
  props: {
    tickerShort: String,
    tickerDollar: String,
    pendingBalance: Number,
    checkPendingTokens: Function,
    setTab: Function,
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
    ]),
    balance: function () {
      return this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    allMintKeysets: function () {
      return [].concat(...this.mints.map((m) => m.keysets));
    },
    getTotalBalance: function () {
      return this.proofs
        .filter((p) =>
          this.mints
            .map((m) => m.keysets.map((k) => k.id))
            .flat()
            .includes(p.id)
        )
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    getActiveMintUrlShort: function () {
      return getShortUrl(this.activeMintUrl);
    },
    getBalance: function () {
      var balance = this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
      return balance;
    },
  },
  data() {
    return {
      bitcoinPrice: null,
    };
  },
  mounted() {
    this.fetchBitcoinPrice();
  },
  methods: {
    async fetchBitcoinPrice() {
      try {
        this.bitcoinPrice = await fetchBitcoinPrice();
      } catch (e) {
        console.warn("Could not get Bitcoin price.");
      }
    },
  },
});
</script>
