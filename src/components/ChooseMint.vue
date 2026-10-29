<template>
  <div :class="{ 'q-pb-md': !sheetOnly }">
    <!-- Main mint selector button (none with sheetOnly: the owner opens the sheet) -->
    <div
      class="row q-mt-xs q-mb-none"
      v-if="!sheetOnly && (activeMintUrl || !requireActiveMint)"
    >
      <!-- One mint picker in two sizes (owner 2026-10-29, item 3): normal (the wallet) and
           dense (flows and forms) share 16px padding, 78px with a balance line; dense only
           lets a one-line picker drop to 56px. Both are the outlined
           field with a 40px avatar, the name with its balance under it, and the chevron as a
           real button on the end. A label sits over the name, like an outlined field's.
           The shell is a pointer target only; the chevron is the one keyboard stop. -->
      <div
        :data-testid="testId"
        class="col-12 mint-picker"
        :class="{
          'mint-picker--dense': dense,
          'mint-picker--empty': !chosenMint,
          'mint-picker--disabled': disable,
          'mint-picker--open': showMintSheet,
        }"
        :style="style"
        :aria-disabled="disable ? 'true' : undefined"
        @click="openSheet"
      >
        <IconCircle
          size="sm"
          class="mint-picker__avatar"
          aria-hidden="true"
          :src="chosenMint?.iconUrl"
        >
          <MintIcon :size="20" class="mint-glyph" />
        </IconCircle>
        <span class="mint-picker__text">
          <span v-if="label" :id="uid + '-label'" class="mint-picker__label">{{
            label
          }}</span>
          <span :id="uid + '-name'" class="mint-picker__name ellipsis">{{
            chosenName
          }}</span>
          <span
            v-if="showBalances && chosenMint"
            :id="uid + '-caption'"
            class="mint-picker__caption"
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
        <IconButton
          type="button"
          class="mint-picker__trigger"
          :data-testid="testId + '-trigger'"
          :label="triggerLabel"
          :disable="disable"
          aria-haspopup="listbox"
          :aria-expanded="showMintSheet ? 'true' : 'false'"
          :aria-controls="uid + '-options'"
          :aria-describedby="describedBy"
          @click.stop="openSheet"
        >
          <ChevronDownIcon
            :size="20"
            class="mint-picker__chevron"
            aria-hidden="true"
          />
        </IconButton>
      </div>
    </div>

    <!-- Bottom Sheet for Mint Selection -->
    <BottomSheet
      v-model="showMintSheet"
      :title="label || $t('ChooseMint.sheet_title')"
    >
      <div
        :id="uid + '-options'"
        role="listbox"
        :aria-label="$t('ChooseMint.sheet_title')"
        class="mint-options"
      >
        <SheetOption
          v-if="anyLabel"
          :label="anyLabel"
          :selected="!chosenMint"
          @select="selectAny"
        >
          <template #icon><MintIcon :size="20" class="mint-glyph" /></template>
        </SheetOption>
        <SheetOption
          v-for="mint in chooseMintOptions()"
          :key="mint.url"
          :label="mint.nickname || mint.shorturl"
          :selected="chosenMint?.url === mint.url"
          :icon-src="mint.iconUrl"
          @select="selectMint(mint)"
        >
          <template #icon>
            <MintIcon :size="20" class="mint-glyph" />
          </template>
          <template v-if="showBalances" #caption>
            <!-- One left-to-right run for the whole sum, so "₿500 + $25.00" keeps its order
                 in right-to-left locales (each amount alone was isolated, the sum wasn't). -->
            <bdi v-if="!mint.errored" dir="ltr">
              <template v-for="(unit, i) in heldUnits(mint)" :key="unit">
                <template v-if="i > 0"> + </template>
                {{ formatCurrency(mint.balances[unit], unit) }}
              </template>
            </bdi>
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
import IconCircle from "src/components/ui/IconCircle.vue";
import IconButton from "src/components/ui/IconButton.vue";
import {
  Building2 as MintIcon,
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

// Each picker's sheet gets its own listbox id: several pickers can be mounted at once
// (swap From and To, a dialog over the wallet).
let nextPickerId = 0;

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
    IconCircle,
    IconButton,
    MintIcon,
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
    // A one-line picker (no balance) may be 56px instead of 72px; nothing else changes.
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
    // Shown over the mint's name, like an outlined field's label. It names the field only:
    // the size comes from `dense`.
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
    // A first option meaning "no particular mint" (a payment request any mint can pay),
    // chosen by an empty value. Implies allowEmpty.
    anyLabel: {
      type: String,
      default: "",
    },
    // Only the sheet, opened by the owner through v-model:open (a detail row that changes the
    // mint, for example). The field isn't drawn.
    sheetOnly: {
      type: Boolean,
      default: false,
    },
    open: {
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
  emits: ["update:modelValue", "update:open"],
  data: function () {
    return {
      chosenMint: null as MintOption | null,
      showMintSheet: false,
      uid: `choose-mint-${++nextPickerId}`,
    };
  },
  mounted() {
    this.initializeChosenMint();
  },
  watch: {
    open(value: boolean) {
      this.showMintSheet = value;
    },
    showMintSheet(value: boolean) {
      if (value !== this.open) this.$emit("update:open", value);
    },
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
    chosenName(): string {
      return (
        this.chosenMint?.nickname ||
        this.chosenMint?.shorturl ||
        this.anyLabel ||
        this.placeholder ||
        this.$t("ChooseMint.placeholder")
      );
    },
    triggerLabel(): string {
      const mint = this.chosenMint?.nickname || this.chosenMint?.shorturl;
      return mint
        ? this.$t("ChooseMint.open_selector", { mint })
        : this.$t("ChooseMint.open_selector_empty");
    },
    // The field's label and the balance line, read after the button's name.
    describedBy(): string | undefined {
      const ids = [
        this.label ? `${this.uid}-label` : "",
        this.showBalances && this.chosenMint ? `${this.uid}-caption` : "",
      ].filter(Boolean);
      return ids.length ? ids.join(" ") : undefined;
    },
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
      // sat leads on every row so balances compare down the list.
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
      if (this.allowEmpty || this.anyLabel) {
        this.applyChosenMint(null);
      } else if (options.length) {
        this.applyChosenMint(options[0]);
      } else {
        this.applyChosenMint(null);
      }
    },
    openSheet() {
      if (this.disable) return;
      this.showMintSheet = true;
    },
    selectAny() {
      this.applyChosenMint(null);
      this.showMintSheet = false;
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
.mint-glyph {
  color: var(--app-text-muted);
}
</style>
