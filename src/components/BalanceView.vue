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
        <div class="row q-mt-xs q-mb-none" v-if="mints.length > 1">
          <div class="col-12">
            <q-icon
              name="account_balance"
              size="xs"
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
              size="xs"
              color="grey"
              class="q-mr-none q-mb-none"
              @click="tabToSettings()"
            />
            <span class="text-weight-light" @click="tabToSettings()">
              Mint: <b>{{ getActiveMintUrlShort }}</b>
            </span>
          </div>
        </div>
      </div>
      <!-- pending -->
      <div class="row q-mt-xs q-mb-none" v-if="pendingBalance > 0">
        <div class="col-12">
          <q-icon
            name="history"
            size="xs"
            color="grey"
            class="q-mr-none q-mb-xs cursor-pointer"
            @click="checkPendingTokens()"
          />
          <span class="text-weight-light">
            Pending: {{ formatSat(pendingBalance) }} {{ tickerShort }}
          </span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
export default defineComponent({
  name: "BalanceView",
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
    pendingBalance: Number,
    checkPendingTokens: Function,
    tabToSettings: Function,
  },
  computed: {
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
