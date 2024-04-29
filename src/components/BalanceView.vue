<template>
  <!-- <q-card class="q-my-md q-py-sm">
    <q-card-section class="q-mt-sm q-py-xs"> -->
  <div class="q-pt-xl q-pb-md">
    <q-carousel
      v-model="this.activeUnit"
      transition-prev="jump-up"
      transition-next="jump-up"
      swipeable
      animated
      height="5rem"
      control-color="primary"
      class="bg-transparent rounded-borders q-mb-lg q-mt-xl"
    >
      <!-- make a q-carousel-slide with v-for for all possible units -->
      <q-carousel-slide
        v-for="unit in balancesOptions"
        :key="unit.value"
        :name="unit.value"
        class="q-pt-sm"
      >
        <div class="row">
          <div class="col-12">
            <h3 class="q-my-none q-py-none" @click="activeUnit = toggleUnit()">
              <strong>
                {{ formatCurrency(getTotalBalance, activeUnit) }}
              </strong>
            </h3>
            <div v-if="bitcoinPrice">
              <strong v-if="this.activeUnit == 'sat'">
                {{
                  formatCurrency(
                    (bitcoinPrice / 100000000) * getTotalBalance,
                    "USD"
                  )
                }}
              </strong>
              <strong v-if="this.activeUnit == 'usd'">
                {{
                  formatCurrency(
                    (getTotalBalance / 100 / bitcoinPrice) * 100000000,
                    "sat"
                  )
                }}
              </strong>
              <q-tooltip>
                {{ formatCurrency(bitcoinPrice, "USD").slice(1) }}
                USD/BTC</q-tooltip
              >
            </div>
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
    <div class="row justify-center">
      <ToggleUnit class="q-mt-none q-mb-lg" />
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
    <!-- mint balance -->
    <div class="row q-mb-none" v-if="mints.length > 1">
      <div class="col-12">
        <!-- <q-icon
          name="account_balance"
          size="0.9rem"
          color="grey"
          class="q-mr-none q-mb-xs"
        /> -->
        <span class="q-my-none q-py-none text-weight-regular">
          Balance:
          <b>{{ formatCurrency(getActiveMintBalance, activeUnit) }} </b>
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
        Pending: {{ formatCurrency(pendingBalance, this.activeUnit) }}
        <q-tooltip>Check all pending tokens</q-tooltip>
      </q-btn>
    </div>
  </div>
  <!-- </q-card-section>
  </q-card> -->
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapState, mapWritableState } from "pinia";
import { useMintsStore } from "stores/mints";
import { useSettingsStore } from "stores/settings";
import { useTokensStore } from "stores/tokens";
import ToggleUnit from "components/ToggleUnit.vue";

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
  components: {
    ToggleUnit,
  },
  props: {
    checkPendingTokens: Function,
    setTab: Function,
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
      "activeBalance",
      "activeUnit",
      "activeMint",
    ]),
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapState(useSettingsStore, ["getBitcoinPrice"]),
    ...mapWritableState(useMintsStore, ["activeUnit"]),
    pendingBalance: function () {
      return -this.historyTokens
        .filter((t) => t.status == "pending")
        .filter((t) => t.unit == this.activeUnit)
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    balance: function () {
      return this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    balancesOptions: function () {
      const mint = this.activeMint();
      return Object.entries(mint.allBalances).map(([key, value]) => ({
        label: key,
        value: key,
      }));
    },
    allMintKeysets: function () {
      return [].concat(...this.mints.map((m) => m.keysets));
    },
    getTotalBalance: function () {
      return this.activeBalance;
    },
    getActiveMintBalance: function () {
      return this.activeProofs
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
      priceLabel: null,
    };
  },
  mounted() {
    const settingsStore = useSettingsStore();
    if (this.getBitcoinPrice) {
      this.fetchPrice();
    }
  },
  methods: {
    async fetchPrice() {
      try {
        this.bitcoinPrice = await fetchBitcoinPrice();
      } catch (e) {
        console.warn("Could not get Bitcoin price.");
      }
    },
    toggleUnit: function () {
      const units = this.activeMint().units;
      this.activeUnit =
        units[(units.indexOf(this.activeUnit) + 1) % units.length];
      return this.activeUnit;
    },
  },
});
</script>
