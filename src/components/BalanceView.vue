<template>
  <!-- <q-card class="q-my-md q-py-sm">
    <q-card-section class="q-mt-sm q-py-xs"> -->
  <div class="q-pt-xl q-pb-md">
    <div class="row justify-center q-pb-lg" style="height: 80px">
      <div v-if="globalMutexLock">
        <transition
          appear
          enter-active-class="animated pulse"
          leave-active-class="animated fadeOut"
        >
          <q-spinner class="q-mt-lg q-mb-none" size="lg" color="primary" />
        </transition>
      </div>
      <div v-else>
        <transition
          appear
          enter-active-class="animated pulse"
          leave-active-class="animated fadeOut"
        >
          <ToggleUnit class="q-mt-lg q-mb-none" />
        </transition>
      </div>
    </div>
    <transition
      appear
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeInDown"
      mode="out-in"
    >
      <q-carousel
        v-model="this.activeUnit"
        transition-prev="jump-up"
        transition-next="jump-up"
        swipeable
        animated
        :height="$q.screen.width < 390 ? '130px' : '80px'"
        control-color="primary"
        class="bg-transparent rounded-borders q-mb-xl q-mt-xl text-primary"
      >
        <!-- make a q-carousel-slide with v-for for all possible units -->
        <q-carousel-slide
          v-for="unit in balancesOptions"
          :key="unit.value"
          :name="unit.value"
          class="q-pt-none"
        >
          <div class="row">
            <div class="col-12">
              <h3
                class="q-my-none q-py-none cursor-pointer"
                @click="toggleHideBalance"
              >
                <strong>
                  <AnimatedNumber
                    :value="getTotalBalance"
                    :format="(val) => formatCurrency(val, activeUnit)"
                    class="q-my-none q-py-none cursor-pointer"
                  />
                </strong>
              </h3>
              <div v-if="bitcoinPrice" class="q-mt-sm">
                <strong v-if="this.activeUnit == 'sat'">
                  <AnimatedNumber
                    :value="
                      (currentCurrencyPrice / 100000000) * getTotalBalance
                    "
                    :format="(val) => formatCurrency(val, bitcoinPriceCurrency)"
                  />
                </strong>
                <strong
                  v-if="this.activeUnit == 'usd' || this.activeUnit == 'eur'"
                >
                  <AnimatedNumber
                    :value="
                      (getTotalBalance / 100 / currentCurrencyPrice) * 100000000
                    "
                    :format="(val) => formatCurrency(val, 'sat')"
                  />
                </strong>
                <q-tooltip>
                  1 BTC =
                  {{
                    formatCurrency(currentCurrencyPrice, bitcoinPriceCurrency)
                  }}
                </q-tooltip>
              </div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </transition>
    <div
      v-if="activeMint().mint.errored"
      class="row q-mt-md q-mb-none text-secondary"
    >
      <div class="col-12">
        <q-badge outline color="red" class="q-mr-xs q-mt-sm text-weight-bold">
          {{ $t("BalanceView.mintError.label") }}
          <q-icon name="error" class="q-ml-xs" />
        </q-badge>
      </div>
    </div>
    <!-- mint url -->
    <div class="row q-mt-md q-mb-none text-secondary" v-if="activeMintUrl">
      <div class="col-12 cursor-pointer">
        <span class="text-weight-light" @click="setTab('mints')">
          {{ $t("BalanceView.mintUrl.label") }}: <b>{{ activeMintLabel }}</b>
        </span>
      </div>
    </div>
    <!-- mint balance -->
    <div class="row q-mb-none text-secondary" v-if="mints.length > 1">
      <div class="col-12">
        <span class="q-my-none q-py-none text-weight-regular">
          {{ $t("BalanceView.mintBalance.label") }}:
          <b>
            <AnimatedNumber
              :value="getActiveBalance"
              :format="(val) => formatCurrency(val, activeUnit)"
              class="q-my-none q-py-none cursor-pointer"
            />
          </b>
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
        color="secondary"
        dense
        outline
        class="q-mx-none q-mt-xs q-pr-sm cursor-pointer"
        @click="checkPendingTokens()"
        ><q-icon name="history" size="1rem" class="q-mx-xs" />
        {{ $t("BalanceView.pending.label") }}:
        {{ formatCurrency(pendingBalance, this.activeUnit) }}
        <q-tooltip>{{ $t("BalanceView.pending.tooltip") }}</q-tooltip>
      </q-btn>
    </div>
  </div>
  <!-- </q-card-section>
  </q-card> -->
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useMintsStore } from "stores/mints";
import { useSettingsStore } from "stores/settings";
import { useTokensStore } from "stores/tokens";
import { useUiStore } from "stores/ui";
import { useWalletStore } from "stores/wallet";
import { usePriceStore } from "stores/price";
import ToggleUnit from "components/ToggleUnit.vue";
import AnimatedNumber from "components/AnimatedNumber.vue";
import axios from "axios";
import { map } from "underscore";

export default defineComponent({
  name: "BalanceView",
  mixins: [windowMixin],
  components: {
    ToggleUnit,
    AnimatedNumber,
  },
  props: {
    setTab: Function,
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "activeBalance",
      "mints",
      "totalUnitBalance",
      "activeUnit",
      "activeMint",
    ]),
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapState(useUiStore, ["globalMutexLock"]),
    ...mapState(usePriceStore, [
      "bitcoinPrice",
      "bitcoinPrices",
      "currentCurrencyPrice",
    ]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    ...mapWritableState(useMintsStore, ["activeUnit"]),
    ...mapWritableState(useUiStore, ["hideBalance", "lastBalanceCached"]),
    pendingBalance: function () {
      return -this.historyTokens
        .filter((t) => t.status == "pending")
        .filter((t) => t.unit == this.activeUnit)
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
      return this.totalUnitBalance;
    },
    getActiveBalance: function () {
      return this.activeBalance;
    },
    activeMintLabel: function () {
      const mintClass = this.activeMint();

      return (
        mintClass.mint.nickname ||
        mintClass.mint.info?.name ||
        getShortUrl(this.activeMintUrl)
      );
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
      priceLabel: null,
    };
  },
  mounted() {
    this.fetchBitcoinPrice();
  },
  methods: {
    ...mapActions(useWalletStore, ["checkPendingTokens"]),
    ...mapActions(usePriceStore, ["fetchBitcoinPrice"]),
    toggleUnit: function () {
      const units = this.activeMint().units;
      this.activeUnit =
        units[(units.indexOf(this.activeUnit) + 1) % units.length];
      return this.activeUnit;
    },
    toggleHideBalance() {
      this.hideBalance = !this.hideBalance;
    },
  },
});
</script>
<style scoped>
.animated.pulse {
  animation-duration: 0.5s;
}
.animated.fadeInDown {
  animation-duration: 0.3s;
}
</style>
