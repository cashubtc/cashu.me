<template>
  <div class="q-pb-md">
    <!-- title that says choose a mint -->
    <div class="row q-mb-none" v-if="title.length">
      <div class="col-12">
        <span class="text-caption">{{ title }}</span>
      </div>
    </div>
    <div class="row q-mt-xs q-mb-none" v-if="activeMintUrl">
      <div class="col-12 cursor-pointer">
        <q-select
          outlined
          class="q-px-none"
          color="white"
          v-model="chosenMint"
          :options="chooseMintOptions()"
          option-value="url"
          option-label="shorturl"
          :rounded="rounded"
          :style="style"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label
                  class="text-body1 q-pt-xs"
                  :style="
                    activeMintUrl === scope.opt.url ? 'font-weight: bold' : ''
                  "
                  >{{ scope.opt.nickname || scope.opt.shorturl }}</q-item-label
                >
                <q-item-label
                  class="text-caption q-pb-xs"
                  style="font-family: monospace; font-size: 11px"
                >
                  {{ scope.opt.url }}</q-item-label
                >
                <div>
                  <q-badge
                    v-for="unit in scope.opt.units"
                    :key="unit"
                    :color="
                      scope.opt.url === activeMintUrl ? 'primary' : 'grey'
                    "
                    :label="formatCurrency(scope.opt.balances[unit], unit)"
                    class="q-mr-xs q-mb-xs"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </template>
          <template v-slot:prepend>
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
              class="q-ma-xs q-pa-sm text-weight-bold"
          /></template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "stores/mints";
import { MintClass } from "stores/mints";
import { title } from "process";

export default defineComponent({
  name: "ChooseMint",
  mixins: [windowMixin],
  props: {
    rounded: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Select a mint",
    },
    style: {
      type: String,
      default: "",
    },
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
      this.activeMintUrl = this.chosenMint.url;
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
    ...mapWritableState(useMintsStore, ["activeMintUrl"]),
    getBalance: function () {
      return this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
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
          nickname: m.nickname,
          url: m.url,
          shorturl: m.nickname || getShortUrl(m.url),
          balances: mint.allBalances,
          units: units,
        });
      }
      return options;
    },
  },
});
</script>
