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
          <q-icon
            name="history"
            size="1.5rem"
            color="grey"
            class="q-mr-none q-mb-xs cursor-pointer"
            @click="checkPendingTokens()"
          >
            <q-tooltip>Refresh pending</q-tooltip>
          </q-icon>

          <span
            class="text-weight-light cursor-pointer"
            @click="setTab('history')"
          >
            Pending: {{ formatSat(pendingBalance) }} {{ tickerShort }}
            <q-tooltip>Show history</q-tooltip>
          </span>
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
export default defineComponent({
  name: "BalanceView",
  mixins: [windowMixin],
  props: {
    tickerShort: String,
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
        .filter((p) => this.allMintKeysets.includes(p.id))
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
  methods: {},
});
</script>
