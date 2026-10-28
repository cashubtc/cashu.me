<template>
  <div class="q-pb-md">
    <!-- Main mint selector button -->
    <div
      class="row q-mt-xs q-mb-none"
      v-if="activeMintUrl || !requireActiveMint"
    >
      <div class="col-12 row">
        <!-- One mint field in two sizes (user direction, R46), both drawn like the outlined
             inputs: compact (with a label: label over the name, the balance at the end) for
             forms, and normal (no label: a 40px avatar, the name, the balance under it) for
             the wallet and the amount sheets. -->
        <button
          type="button"
          :data-testid="testId"
          class="mint-chip mint-chip--field"
          :class="{
            'mint-chip--card': !label,
            'mint-chip--empty': !chosenMint,
          }"
          :style="style"
          :role="label ? 'combobox' : undefined"
          :aria-label="label || undefined"
          aria-haspopup="listbox"
          :aria-expanded="showMintSheet"
          :disabled="disable"
          @click="showMintSheet = true"
        >
          <span class="mint-chip__avatar" aria-hidden="true">
            <q-img
              v-if="chosenMint?.iconUrl"
              :src="chosenMint.iconUrl"
              spinner-size="xs"
              class="full-height"
            >
              <template v-slot:error>
                <LandmarkIcon :size="20" class="mint-chip__icon" />
              </template>
            </q-img>
            <LandmarkIcon v-else :size="20" class="mint-chip__icon" />
          </span>
          <span class="mint-chip__field-text">
            <span v-if="label" class="mint-chip__label">{{ label }}</span>
            <span class="mint-chip__name ellipsis">{{
              chosenMint?.nickname ||
              chosenMint?.shorturl ||
              placeholder ||
              $t("ChooseMint.placeholder")
            }}</span>
            <span
              v-if="!label && showBalances && chosenMint"
              class="mint-chip__caption"
            >
              <span v-if="!chosenMint.errored"
                ><bdi dir="ltr">{{
                  formatCurrency(selectedMintBalance, activeUnit)
                }}</bdi>
                {{ $t("ChooseMint.available_text") }}</span
              >
              <span v-else class="text-negative">{{
                $t("ChooseMint.badge_mint_error_text")
              }}</span>
            </span>
          </span>
          <span
            v-if="label && showBalances && chosenMint"
            class="mint-chip__balance"
          >
            <bdi v-if="!chosenMint.errored" dir="ltr">{{
              formatCurrency(selectedMintBalance, activeUnit)
            }}</bdi>
            <span v-else class="text-negative">{{
              $t("ChooseMint.badge_mint_error_text")
            }}</span>
          </span>
          <ChevronDownIcon :size="20" class="mint-chip__icon" />
        </button>
      </div>
    </div>

    <!-- Bottom Sheet for Mint Selection -->
    <BottomSheet
      v-model="showMintSheet"
      :title="label || $t('ChooseMint.sheet_title')"
    >
      <div
        role="listbox"
        :aria-label="$t('ChooseMint.sheet_title')"
        class="mint-options"
      >
        <SheetOption
          v-for="mint in chooseMintOptions()"
          :key="mint.url"
          :label="mint.nickname || mint.shorturl"
          :selected="chosenMint?.url === mint.url"
          @select="selectMint(mint)"
        >
          <template #icon>
            <q-img
              v-if="mint.iconUrl"
              :src="mint.iconUrl"
              spinner-size="xs"
              class="full-height"
            >
              <template v-slot:error>
                <LandmarkIcon :size="20" class="mint-glyph" />
              </template>
            </q-img>
            <LandmarkIcon v-else :size="20" class="mint-glyph" />
          </template>
          <template v-if="showBalances" #caption>
            <span v-if="!mint.errored">
              <template v-for="(unit, i) in heldUnits(mint)" :key="unit">
                <template v-if="i > 0"> + </template>
                <bdi dir="ltr">{{
                  formatCurrency(mint.balances[unit], unit)
                }}</bdi>
              </template>
            </span>
            <span v-else class="text-negative">
              {{ $t("ChooseMint.badge_mint_error_text") }}
            </span>
          </template>
        </SheetOption>
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
import SheetOption from "src/components/SheetOption.vue";

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
    SheetOption,
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
    // Start (and stay) with no mint chosen until the user picks one, instead of falling back
    // to the first mint. Used by fields such as swap From/To.
    allowEmpty: {
      type: Boolean,
      default: false,
    },
    disable: {
      type: Boolean,
      default: false,
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
      if (this.allowEmpty) {
        this.applyChosenMint(null);
      } else if (options.length) {
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
/* Mint rows inside the shared BottomSheet use SheetOption. */
.mint-options {
  padding: 4px 16px 16px;
}
.mint-glyph {
  color: var(--app-text-muted);
}
</style>
