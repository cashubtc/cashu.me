<template>
  <!-- <q-card class="q-my-md q-py-sm">
    <q-card-section class="q-mt-sm q-py-xs"> -->
  <div class="q-pt-xl q-pb-md">
    <transition
      appear
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeInDown"
      mode="out-in"
    >
      <div class="balance-carousel-shell q-mt-lg q-mb-xl text-primary">
        <transition
          appear
          enter-active-class="animated pulse"
          leave-active-class="animated fadeOut"
        >
          <q-spinner
            v-if="globalMutexLock"
            class="balance-lock-spinner"
            size="sm"
            color="primary"
          />
        </transition>
        <q-carousel
          v-model="activeUnit"
          transition-prev="slide-right"
          transition-next="slide-left"
          :swipeable="hasMultipleBalanceUnits"
          :animated="hasMultipleBalanceUnits"
          :height="$q.screen.width < 390 ? '118px' : '88px'"
          control-color="primary"
          class="balance-carousel bg-transparent rounded-borders"
          @mousedown.stop
          @mousemove.stop
          @mouseup.stop
          @touchstart.stop
          @touchmove.stop
          @touchend.stop
        >
          <q-carousel-slide
            v-for="unit in balanceUnits"
            :key="unit"
            :name="unit"
            class="balance-slide q-pt-none"
          >
            <div class="row full-width">
              <div class="col-12">
                <h3
                  class="balance-amount q-my-none q-py-none cursor-pointer"
                  @click="toggleHideBalance"
                >
                  <strong>
                    <AnimatedNumber
                      :value="totalBalanceForUnit(unit)"
                      :format="(val) => formatCurrency(val, unit)"
                      class="q-my-none q-py-none cursor-pointer"
                    />
                  </strong>
                </h3>
                <div class="balance-secondary-line q-mt-sm">
                  <strong v-if="showSecondaryBalance(unit)">
                    <AnimatedNumber
                      :value="secondaryBalanceValue(unit)"
                      :format="
                        (val) => formatCurrency(val, secondaryUnit(unit))
                      "
                    />
                    <q-tooltip>
                      1 BTC =
                      {{
                        formatCurrency(
                          bitcoinPriceForUnit(unit),
                          priceDisplayUnit(unit)
                        )
                      }}
                    </q-tooltip>
                  </strong>
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>
        <div
          class="balance-unit-dots"
          :class="{ 'balance-unit-dots--hidden': !hasMultipleBalanceUnits }"
          :aria-hidden="!hasMultipleBalanceUnits"
        >
          <button
            v-for="unit in balanceUnits"
            :key="unit"
            type="button"
            class="balance-unit-dot"
            :class="{ 'balance-unit-dot--active': activeUnit === unit }"
            :aria-label="`Show ${unitLabel(unit)} balance`"
            :aria-pressed="activeUnit === unit"
            :tabindex="hasMultipleBalanceUnits ? 0 : -1"
            @click="setActiveUnit(unit)"
          ></button>
        </div>
      </div>
    </transition>
    <div
      v-if="activeMint().mint.errored"
      class="row q-mt-md q-mb-none text-secondary"
    >
      <div class="col-12">
        <span class="text-red text-weight-bold">
          {{ $t("BalanceView.mintError.label") }}
          <q-icon name="error" class="q-ml-xs" size="xs" />
        </span>
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
  <!-- </q-card-section>
  </q-card> -->
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useMintsStore } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import { useTokensStore } from "src/stores/tokens";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { usePriceStore } from "src/stores/price";
import AnimatedNumber from "src/components/AnimatedNumber.vue";
import { sumProofAmounts } from "src/js/proofs";
import { useProofsStore } from "src/stores/proofs";

export default defineComponent({
  name: "BalanceView",
  mixins: [windowMixin],
  components: {
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
    ...mapState(useProofsStore, ["proofs"]),
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
    balanceUnits: function () {
      const mint = this.activeMint();
      const nut4Methods = mint.mint.info?.nuts?.[4]?.methods || [];
      const nut5Methods = mint.mint.info?.nuts?.[5]?.methods || [];
      const advertisedUnits = [...nut4Methods, ...nut5Methods]
        .map((method) => method.unit)
        .filter(Boolean);
      const units = [...mint.units, ...advertisedUnits].filter(Boolean);
      const uniqueUnits = [...new Set(units)];
      if (!uniqueUnits.length) {
        return [this.activeUnit || "sat"];
      }
      return uniqueUnits.sort((a, b) => {
        if (a.toLowerCase() === "sat") return -1;
        if (b.toLowerCase() === "sat") return 1;
        return a.localeCompare(b);
      });
    },
    hasMultipleBalanceUnits: function () {
      return this.balanceUnits.length > 1;
    },
    balancesOptions: function () {
      return this.balanceUnits.map((unit) => ({
        label: this.unitLabel(unit),
        value: unit,
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
      return sumProofAmounts(this.activeProofs.flat());
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
  watch: {
    balanceUnits: {
      immediate: true,
      handler(units: string[]) {
        if (units.length && !units.includes(this.activeUnit)) {
          this.activeUnit = units[0];
        }
      },
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["checkPendingTokens"]),
    ...mapActions(usePriceStore, ["fetchBitcoinPrice"]),
    setActiveUnit(unit: string) {
      this.activeUnit = unit;
    },
    toggleUnit: function () {
      const units = this.activeMint().units;
      this.activeUnit =
        units[(units.indexOf(this.activeUnit) + 1) % units.length];
      return this.activeUnit;
    },
    toggleHideBalance() {
      this.hideBalance = !this.hideBalance;
    },
    unitLabel(unit: string) {
      const normalizedUnit = unit.toLowerCase();
      if (normalizedUnit === "sat") return "BTC";
      if (normalizedUnit === "msat") return "mSAT";
      return unit.toUpperCase();
    },
    totalBalanceForUnit(unit: string) {
      const normalizedUnit = unit.toLowerCase();
      const keysetIds = new Set(
        this.mints
          .flatMap((mint) => mint.keysets || [])
          .filter((keyset) => keyset.unit.toLowerCase() === normalizedUnit)
          .map((keyset) => keyset.id)
      );
      return sumProofAmounts(
        this.proofs.filter(
          (proof) => keysetIds.has(proof.id) && !proof.reserved
        )
      );
    },
    activeBalanceForUnit(unit: string) {
      return this.activeMint().unitBalance(unit);
    },
    isSatUnit(unit: string) {
      return unit.toLowerCase() === "sat";
    },
    isFiatUnit(unit: string) {
      return ["usd", "eur"].includes(unit.toLowerCase());
    },
    bitcoinPriceForUnit(unit: string) {
      if (this.isFiatUnit(unit)) {
        return (
          this.bitcoinPrices[unit.toUpperCase()] || this.currentCurrencyPrice
        );
      }
      return this.currentCurrencyPrice;
    },
    priceDisplayUnit(unit: string) {
      if (this.isFiatUnit(unit)) {
        return unit.toLowerCase();
      }
      return this.bitcoinPriceCurrency;
    },
    secondaryUnit(unit: string) {
      if (this.isSatUnit(unit)) {
        return this.bitcoinPriceCurrency;
      }
      return "sat";
    },
    showSecondaryBalance(unit: string) {
      return (
        Boolean(this.bitcoinPriceForUnit(unit)) &&
        (this.isSatUnit(unit) || this.isFiatUnit(unit))
      );
    },
    secondaryBalanceValue(unit: string) {
      const balance = this.totalBalanceForUnit(unit);
      const bitcoinPrice = this.bitcoinPriceForUnit(unit);
      if (!bitcoinPrice) return 0;
      if (this.isSatUnit(unit)) {
        return (bitcoinPrice / 100000000) * balance;
      }
      return (balance / 100 / bitcoinPrice) * 100000000;
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
.balance-carousel-shell {
  overflow-x: hidden;
  overscroll-behavior-x: contain;
  position: relative;
  touch-action: pan-y;
}
.balance-lock-spinner {
  left: 50%;
  position: absolute;
  top: -1.5rem;
  transform: translateX(-50%);
  z-index: 1;
}
.balance-carousel {
  overflow: hidden;
  overscroll-behavior-x: contain;
  touch-action: pan-y;
}
.balance-slide {
  align-items: flex-start;
  display: flex;
  justify-content: center;
}
.balance-amount {
  align-items: center;
  display: flex;
  justify-content: center;
  line-height: 1.05;
  min-height: 50px;
  white-space: nowrap;
}
.balance-secondary-line {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 24px;
}
.balance-unit-dots {
  align-items: center;
  display: flex;
  height: 18px;
  justify-content: center;
  min-height: 18px;
}
.balance-unit-dots--hidden {
  opacity: 0;
  pointer-events: none;
}
.balance-unit-dot {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--q-primary);
  cursor: pointer;
  display: flex;
  height: 18px;
  justify-content: center;
  opacity: 0.28;
  padding: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  width: 22px;
}
.balance-unit-dot::after {
  background: currentColor;
  border-radius: 50%;
  content: "";
  height: 7px;
  width: 7px;
}
.balance-unit-dot--active {
  opacity: 0.9;
  transform: scale(1.15);
}
.balance-unit-dot:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
</style>
