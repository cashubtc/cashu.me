<template>
  <div class="q-pb-md">
    <!-- mint url -->
    <div class="row q-mt-xs q-mb-none" v-if="activeMintUrl">
      <div class="col-12 cursor-pointer">
        <q-select
          borderless
          round
          class="q-px-md"
          color="white"
          v-model="chosenMint"
          :options="chooseMintOptions()"
          option-value="url"
          option-label="shorturl"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon
                  name="account_balance"
                  size="1.2rem"
                  color="grey"
                  class="q-pl-md"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body1 q-pa-md">{{
                  scope.opt.shorturl
                }}</q-item-label>
                <!-- <q-item-label caption></q-item-label> -->
              </q-item-section>
              <q-item-section side>
                <q-item-label>
                  <div v-for="unit in scope.opt.units" :key="unit">
                    <q-badge
                      color="primary"
                      :label="formatCurrency(scope.opt.balances[unit], unit)"
                      class="q-ma-xs q-pa-sm"
                      style="float: right"
                    />
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
          </template>
          <!-- <template v-slot:prepend>
            <q-icon
              name="account_balance"
              size="1.2rem"
              color="grey"
              class="q-mr-none q-mb-none"
            />
          </template>
          <template v-slot:append>
            <q-badge
              color="primary"
              :label="formatCurrency(getBalance, activeUnit)"
          /></template> -->
        </q-select>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
import { MintClass } from "stores/mints";
export default defineComponent({
  name: "ChooseMint",
  mixins: [windowMixin],
  props: {
    tickerShort: String,
  },
  data: function () {
    return {
      chosenMint: null,
    };
  },
  mounted() {
    this.chosenMint = {
      url: this.activeMintUrl,
      shorturl: getShortUrl(this.activeMintUrl),
    };
  },
  watch: {
    chosenMint: async function () {
      console.log("Mint chosen ", this.chosenMint);
      await this.activateMintUrl(this.chosenMint.url);
    },
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "proofs",
      "activeUnit",
    ]),
    balance: function () {
      return this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    allMintKeysets: function () {
      return [].concat(...this.mints.map((m) => m.keysets));
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
  methods: {
    ...mapActions(useMintsStore, ["activateMintUrl"]),
    chooseMintOptions: function () {
      let options = [];
      for (const [i, m] of Object.entries(this.mints)) {
        const all_units = m.keysets.map((r) => r.unit);
        const units = [...new Set(all_units)];
        const mint = new MintClass(m);
        options.push({
          url: m.url,
          shorturl: getShortUrl(m.url),
          balances: mint.allBalances,
          units: units,
        });
      }
      return options;
    },
  },
});
</script>
