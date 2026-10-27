<template>
  <div class="q-pb-md">
    <!-- Main mint selector button -->
    <div
      class="row q-mt-xs q-mb-none"
      v-if="activeMintUrl || !requireActiveMint"
    >
      <div class="col-12 row" :class="label ? '' : 'justify-center'">
        <button
          type="button"
          :data-testid="testId"
          class="mint-chip"
          :class="{ 'mint-chip--field': !!label }"
          :style="style"
          @click="showMintSheet = true"
        >
          <q-avatar v-if="chosenMint?.iconUrl" size="20px">
            <q-img :src="chosenMint.iconUrl" spinner-size="xs" />
          </q-avatar>
          <LandmarkIcon v-else :size="16" class="mint-chip__icon" />
          <span v-if="label" class="mint-chip__field-text">
            <span class="mint-chip__label">{{ label }}</span>
            <span class="mint-chip__name">{{
              chosenMint?.nickname ||
              chosenMint?.shorturl ||
              placeholder ||
              $t("ChooseMint.placeholder")
            }}</span>
          </span>
          <span v-else class="mint-chip__name">
            {{
              chosenMint?.nickname ||
              chosenMint?.shorturl ||
              placeholder ||
              $t("ChooseMint.placeholder")
            }}
          </span>
          <template v-if="showBalances && chosenMint">
            <span class="mint-chip__dot" aria-hidden="true">·</span>
            <span v-if="!chosenMint.errored" class="mint-chip__balance">
              <bdi dir="ltr">{{
                formatCurrency(selectedMintBalance, activeUnit)
              }}</bdi>
              {{ $t("ChooseMint.available_text") }}
            </span>
            <span v-else class="text-negative">
              {{ $t("ChooseMint.badge_mint_error_text") }}
            </span>
          </template>
          <ChevronDownIcon :size="16" class="mint-chip__icon" />
        </button>
      </div>
    </div>

    <!-- Bottom Sheet for Mint Selection -->
    <BottomSheet v-model="showMintSheet" :title="$t('ChooseMint.sheet_title')">
      <div class="mint-options">
        <div
          v-for="mint in chooseMintOptions()"
          :key="mint.url"
          class="mint-option"
          :class="{ active: chosenMint?.url === mint.url }"
          @click="selectMint(mint)"
        >
          <div class="row items-center full-width no-wrap">
            <!-- Mint Icon -->
            <q-avatar size="48px" class="q-mr-md">
              <q-img
                v-if="mint.iconUrl"
                :src="mint.iconUrl"
                spinner-color="white"
                spinner-size="xs"
              >
                <template v-slot:error>
                  <div class="row items-center justify-center full-height">
                    <LandmarkIcon
                      :size="24"
                      class="text-app-muted mint-glyph"
                    />
                  </div>
                </template>
              </q-img>
              <LandmarkIcon
                v-else
                :size="24"
                class="text-app-muted mint-glyph"
              />
            </q-avatar>

            <!-- Mint Info -->
            <div class="col text-left">
              <div class="mint-option-name">
                {{ mint.nickname || mint.shorturl }}
              </div>
              <div v-if="showBalances" class="mint-option-balance">
                <span v-if="!mint.errored" class="text-grey-6">
                  <template v-for="(unit, i) in heldUnits(mint)" :key="unit">
                    <template v-if="i > 0"> + </template>
                    <bdi dir="ltr">{{
                      formatCurrency(mint.balances[unit], unit)
                    }}</bdi>
                  </template>
                </span>
                <span v-else class="text-red">
                  {{ $t("ChooseMint.badge_mint_error_text") }}
                </span>
              </div>
            </div>

            <!-- Selection Indicator -->
            <q-icon
              v-if="chosenMint?.url === mint.url"
              name="check_circle"
              color="primary"
              size="24px"
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  </div>
</template>

<script lang="ts">
import {
  Landmark as LandmarkIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-vue-next";
import { defineComponent, type PropType } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "stores/mints";
import { MintClass } from "stores/mints";
import type { StoredMint } from "stores/mints";
import { i18n } from "../boot/i18n";
import { mintSupportsPaymentMethod } from "src/js/mint-payment-methods";
import { PaymentMethod } from "src/stores/walletTypes";
import BottomSheet from "./BottomSheet.vue";

declare const windowMixin: any;

type MintOption = {
  nickname?: string | null;
  url: string;
  shorturl: string | null;
  iconUrl?: string | null;
  balances: Record<string, number>;
  errored?: boolean;
  units: string[];
};

export default defineComponent({
  name: "ChooseMint",
  components: {
    LandmarkIcon,
    ChevronDownIcon,
    BottomSheet,
  },
  mixins: [windowMixin],
  props: {
    testId: {
      type: String,
      default: "choose-mint",
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: i18n.global.t("ChooseMint.title"),
    },
    style: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    // With a label, the picker renders as a full-width field (label over value), matching
    // the outlined inputs around it; without one it stays the compact pill.
    label: {
      type: String,
      default: "",
    },
    showBalances: {
      type: Boolean,
      default: true,
    },
    requireActiveMint: {
      type: Boolean,
      default: true,
    },
    dryRun: {
      type: Boolean,
      default: false,
    },
    excludeMint: {
      type: String,
      default: null,
    },
    // When provided, this will be used instead of activeMintUrl
    modelValue: {
      type: String,
      default: null,
    },
    filterPaymentMethod: {
      type: [String, Array] as PropType<PaymentMethod | PaymentMethod[] | null>,
      default: null,
    },
    filterMintOperation: {
      type: String as () => "mint" | "melt",
      default: "mint",
    },
  },
  emits: ["update:modelValue"],
  data: function () {
    return {
      chosenMint: null as MintOption | null,
      showMintSheet: false,
    };
  },
  mounted() {
    this.initializeChosenMint();
  },
  watch: {
    chosenMint: async function () {
      const selectedUrl = this.chosenMint?.url || "";
      if (this.dryRun || this.modelValue !== null) {
        this.$emit("update:modelValue", selectedUrl);
      }
      if (this.modelValue === null && !this.dryRun) {
        if (selectedUrl && selectedUrl !== this.activeMintUrl) {
          this.selectMintUrl(selectedUrl);
        }
      }
    },
    modelValue: {
      handler() {
        this.initializeChosenMint();
      },
      immediate: true,
    },
    activeMintUrl: {
      handler() {
        if (this.modelValue === null) {
          this.initializeChosenMint(true);
        }
      },
    },
    excludeMint() {
      this.initializeChosenMint();
    },
    filterPaymentMethod() {
      this.initializeChosenMint();
    },
    filterMintOperation() {
      this.initializeChosenMint();
    },
    activeUnit() {
      this.initializeChosenMint(true);
    },
  },
  computed: {
    ...mapState(useMintsStore, ["activeProofs", "mints", "activeUnit"]),
    ...mapWritableState(useMintsStore, ["activeMintUrl"]),
    selectedMintBalance(): number {
      const unit = this.activeUnit;
      if (!this.chosenMint || !unit) {
        return 0;
      }
      const balance = this.chosenMint.balances?.[unit];
      return typeof balance === "number" ? balance : 0;
    },
    filterPaymentMethods(): PaymentMethod[] {
      if (!this.filterPaymentMethod) {
        return [];
      }
      return Array.isArray(this.filterPaymentMethod)
        ? this.filterPaymentMethod
        : [this.filterPaymentMethod];
    },
  },
  methods: {
    // Units this mint holds a balance in; falls back to the first unit for an empty mint.
    heldUnits(mint: { units: string[]; balances: Record<string, number> }) {
      // sat leads on every row so balances compare down the list (R17).
      const units = [...mint.units].sort(
        (a, b) => Number(b === "sat") - Number(a === "sat")
      );
      const held = units.filter((unit) => (mint.balances[unit] ?? 0) > 0);
      return held.length ? held : units.slice(0, 1);
    },
    ...mapActions(useMintsStore, ["selectMintUrl"]),
    applyChosenMint(option: MintOption | null) {
      if (!option) {
        this.chosenMint = null;
        return;
      }
      this.chosenMint = {
        ...option,
        balances: { ...option.balances },
        units: [...option.units],
      };
    },
    initializeChosenMint(preferActiveMint = false) {
      const options = this.chooseMintOptions();
      const fallbackUrl =
        this.chosenMint?.url && this.chosenMint.url !== this.excludeMint
          ? this.chosenMint.url
          : "";
      let targetUrl =
        this.modelValue !== null
          ? this.modelValue
          : preferActiveMint
          ? this.activeMintUrl || fallbackUrl
          : fallbackUrl || this.activeMintUrl;
      if (targetUrl && targetUrl === this.excludeMint) {
        targetUrl = "";
      }
      if (targetUrl) {
        const matched = options.find(
          (option: MintOption) => option.url === targetUrl
        );
        if (matched) {
          this.applyChosenMint(matched);
          return;
        }
      }
      if (options.length) {
        this.applyChosenMint(options[0]);
      } else {
        this.applyChosenMint(null);
      }
    },
    selectMint(mint: MintOption) {
      if (this.excludeMint && mint.url === this.excludeMint) {
        return;
      }
      this.applyChosenMint(mint);
      this.showMintSheet = false;
    },
    chooseMintOptions: function () {
      const options: MintOption[] = [];
      const availableMints = Array.isArray(this.mints)
        ? (this.mints as StoredMint[])
        : [];
      for (const mintData of availableMints) {
        if (
          this.filterPaymentMethods.length &&
          !this.filterPaymentMethods.some((method) =>
            mintSupportsPaymentMethod(
              mintData,
              method,
              this.filterMintOperation,
              this.activeUnit
            )
          )
        ) {
          continue;
        }
        const all_units = mintData.keysets.map((r) => r.unit);
        const units = [...new Set(all_units)];
        const mint = new MintClass(mintData);
        if (!this.excludeMint || mint.mint.url !== this.excludeMint) {
          options.push({
            nickname: mint.mint.nickname || mint.mint.info?.name,
            url: mint.mint.url,
            shorturl: getShortUrl(mintData.url),
            iconUrl: mint.mint.info?.icon_url,
            balances: mint.allBalances,
            errored: mint.mint.errored,
            units: units,
          });
        }
      }
      return options;
    },
  },
});
</script>

<style lang="scss" scoped>
/* Mint options list inside the shared BottomSheet */
.mint-option {
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);

  &:hover {
    background: var(--app-tint-strong);
  }

  &.active {
    background: rgba(var(--q-primary-rgb), 0.2);
  }

  &:last-child {
    border-bottom: none;
  }
}

.body--light .mint-option:hover {
  background: rgba(0, 0, 0, 0.04);
}

.mint-option-name {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
}

.mint-option-balance {
  font-size: 14px;
  line-height: 1.3;
  margin-top: 4px;
}

.mint-chip--field {
  border-radius: 28px;
  justify-content: flex-start;
  min-height: 56px;
  padding: 8px 20px;
  text-align: start;
  width: 100%;
}
.mint-chip--field > :last-child {
  margin-inline-start: auto;
}
.mint-chip__field-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.mint-chip__label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}
</style>
