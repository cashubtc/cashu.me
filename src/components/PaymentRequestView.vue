<!-- The body of a payment request (PaymentRequestDialog adds the header, the pager row and
     New request), laid out like the Lightning and on-chain receive screens: the QR, the
     amount when there is one, then the detail table, where the request text is a copy row.
     The table's Amount, Unit and Mint rows are buttons: each opens its picker (the amount
     keypad or a typed field, the units, the mint sheet). Received payments follow, and Share
     and Copy sit in the footer. Everything shown is read back from the encoded request; every
     change is emitted as `change` and the owner makes a new request. -->
<template>
  <div class="pr-view column">
    <div class="content-area">
      <div class="pr-body column">
        <div class="qr-container">
          <QrBlock :value="request" />
        </div>

        <AmountHeadline v-if="hasAmount">{{ amountLabel }}</AmountHeadline>

        <div class="detail-table">
          <DetailRow
            action
            data-testid="pr-amount"
            :icon="BanknoteIcon"
            :label="$t('QuoteInformation.amount')"
            :value="
              hasAmount ? amountLabel : $t('PaymentRequestDialog.any_amount')
            "
            :placeholder="!hasAmount"
            :action-label="
              hasAmount
                ? `${$t('QuoteInformation.amount')}: ${amountLabel}`
                : $t('PaymentRequestDialog.actions.add_amount.label')
            "
            @click="openAmount"
          />
          <DetailRow
            :action="unitOptions.length > 1"
            data-testid="pr-unit"
            :icon="CoinsIcon"
            :label="$t('QuoteInformation.unit')"
            :value="unitCode(fields.unit)"
            @click="showUnitSheet = true"
            ><bdi dir="ltr">{{ unitCode(fields.unit) }}</bdi></DetailRow
          >
          <!-- The request text lives in the table, a copy row, like an invoice's. It shows the
               request's id: every encoded request starts and ends alike, so a shortened text
               looked unchanged after New request. -->
          <DetailRow
            data-testid="pr-request"
            :icon="ReceiptTextIcon"
            :label="$t('QuoteInformation.request')"
            :copy-value="request"
            ><bdi dir="ltr">{{
              fields.id ? `#${fields.id}` : shortRequest
            }}</bdi></DetailRow
          >
          <DetailRow
            action
            data-testid="pr-mint"
            :icon="MintIcon"
            :label="$t('QuoteInformation.mint')"
            :value="mintLabel"
            :placeholder="!requestMint"
            @click="showMintSheet = true"
          />
          <!-- The owner's last row (PaymentRequestDialog: the pager over earlier requests). -->
          <slot name="rows" />
        </div>

        <div v-if="payments.length" class="pr-payments">
          <div class="row q-gutter-sm items-center q-mb-sm">
            <AppBadge v-for="(total, unit) in totalsByUnit" :key="unit">
              {{ $t("PaymentRequestDialog.received_total") }}:
              <span class="q-ml-xs text-weight-medium">{{
                formatCurrency(total, unit, true)
              }}</span>
            </AppBadge>
          </div>
          <PaymentRequestPayments :payments="payments" :page-size="3" />
        </div>
      </div>
    </div>

    <!-- Footer: the owner's secondary action (New request) over Share (where the platform
         can) and Copy, an equal pair. -->
    <FlowFooter>
      <slot name="footer" />
      <div class="pr-foot row no-wrap">
        <q-btn
          v-if="webShareSupported"
          outline
          rounded
          class="full-width pr-foot__btn"
          data-testid="pr-share"
          @click="share"
        >
          {{ $t("PaymentRequestDialog.actions.share.label") }}
        </q-btn>
        <q-btn
          unelevated
          rounded
          color="primary"
          class="full-width pr-foot__btn"
          data-testid="pr-copy"
          @click="copy"
        >
          {{ $t("PaymentRequestDialog.actions.copy.label") }}
        </q-btn>
      </div>
    </FlowFooter>

    <!-- Amount: the app's keypad where the wallet uses it (and the request is in the wallet's
         unit), otherwise a typed field, which brings up the device's number pad. -->
    <BottomSheet
      v-model="showAmountSheet"
      :title="$t('QuoteInformation.amount')"
    >
      <template v-if="useKeypad">
        <AmountInputComponent
          v-model="keypadValue"
          :enabled="showAmountSheet"
          :show-fiat-conversion="false"
          @enter="commitAmount"
        />
        <AmountKeypadPanel v-model="keypadValue" @done="commitAmount" />
      </template>
      <q-input
        v-else
        ref="amountInput"
        v-model="amountInputValue"
        outlined
        autofocus
        inputmode="decimal"
        autocomplete="off"
        data-testid="pr-amount-input"
        :label="`${$t(
          'PaymentRequestDialog.inputs.amount.placeholder'
        )} (${unitQuantityWord(fields.unit)})`"
        :error="amountError"
        :error-message="amountErrorText"
        @update:model-value="amountError = false"
        @keydown.enter.prevent="commitAmount"
      />
      <template #actions>
        <div class="column full-width" style="gap: 8px">
          <q-btn
            unelevated
            rounded
            color="primary"
            class="full-width"
            data-testid="pr-amount-set"
            @click="commitAmount"
          >
            {{ $t("PaymentRequestDialog.actions.set_amount.label") }}
          </q-btn>
          <q-btn
            v-if="hasAmount"
            flat
            rounded
            class="full-width"
            data-testid="pr-amount-clear"
            @click="clearAmount"
          >
            {{ $t("PaymentRequestDialog.actions.remove_amount.label") }}
          </q-btn>
        </div>
      </template>
    </BottomSheet>

    <BottomSheet
      v-model="showUnitSheet"
      :title="$t('MintDetailsDialog.details.currency.label')"
    >
      <div role="listbox">
        <SheetOption
          v-for="unit in unitOptions"
          :key="unit"
          :label="unitCode(unit)"
          :selected="fields.unit === unit"
          @select="chooseUnit(unit)"
        >
          <template #label
            ><bdi dir="ltr">{{ unitCode(unit) }}</bdi></template
          >
        </SheetOption>
      </div>
    </BottomSheet>

    <!-- The standard mint picker's sheet, opened from the Mint row. -->
    <ChooseMint
      v-model:open="showMintSheet"
      sheet-only
      :label="$t('QuoteInformation.mint')"
      :any-label="$t('PaymentRequestDialog.actions.use_active_mint.label')"
      :model-value="requestMint || ''"
      :require-active-mint="false"
      dry-run
      @update:model-value="chooseMint"
    />
  </div>
</template>

<script lang="ts">
import FlowFooter from "src/components/ui/FlowFooter.vue";
import AmountHeadline from "src/components/ui/AmountHeadline.vue";
import {
  Banknote as BanknoteIcon,
  Coins as CoinsIcon,
  Building2 as MintIcon,
  ReceiptText as ReceiptTextIcon,
} from "lucide-vue-next";
import { defineComponent, type PropType } from "vue";
import { mapState } from "pinia";
import { useMintsStore } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";
import { useSettingsStore } from "src/stores/settings";
import { getShortUrl } from "src/js/wallet-helpers";
import { shortenString } from "src/js/string-utils";
import { unitCode, unitQuantityWord } from "src/js/format-currency";
import {
  requestFields,
  type RequestFields,
} from "src/js/payment-request-fields";
import QrBlock from "src/components/QrBlock.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import AmountInputComponent from "src/components/AmountInputComponent.vue";
import AmountKeypadPanel from "src/components/AmountKeypadPanel.vue";
import PaymentRequestPayments from "src/components/PaymentRequestPayments.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import DetailRow from "src/components/ui/DetailRow.vue";

declare const windowMixin: any;

const FIAT_UNITS = ["usd", "eur"];
const unitMultiplier = (unit: string) =>
  FIAT_UNITS.includes(unit.toLowerCase()) ? 100 : 1;

export default defineComponent({
  name: "PaymentRequestView",
  mixins: [windowMixin],
  components: {
    FlowFooter,
    AmountHeadline,
    AmountInputComponent,
    AmountKeypadPanel,
    AppBadge,
    BottomSheet,
    ChooseMint,
    DetailRow,
    PaymentRequestPayments,
    QrBlock,
    SheetOption,
  },
  props: {
    /** The encoded request (creqA…). */
    request: { type: String, required: true },
    /** Payments received on it, newest first. */
    payments: { type: Array as PropType<any[]>, default: () => [] },
  },
  emits: ["change"],
  setup() {
    return { BanknoteIcon, CoinsIcon, MintIcon, ReceiptTextIcon };
  },
  data() {
    return {
      showAmountSheet: false,
      showUnitSheet: false,
      showMintSheet: false,
      amountInputValue: "",
      // The keypad's value, in the unit's display units (₿ sats, dollars).
      keypadValue: null as number | null,
      amountError: false,
    };
  },
  computed: {
    ...mapState(useMintsStore, ["activeUnit", "mints"]),
    ...mapState(useUiStore, ["webShareSupported"]),
    ...mapState(useSettingsStore, ["useNumericKeyboard"]),
    fields(): RequestFields {
      return requestFields(this.request, this.activeUnit);
    },
    requestMint(): string | undefined {
      return this.fields.mints?.[0];
    },
    hasAmount(): boolean {
      return this.fields.amount !== undefined;
    },
    amountErrorText(): string {
      // The number's own unit: whole sats, not BTC (src/js/format-currency.ts).
      const unit = unitQuantityWord(this.fields.unit);
      return this.$t(
        unitMultiplier(this.fields.unit) === 1
          ? "CreateInvoiceDialog.amount_errors.positive_whole"
          : "CreateInvoiceDialog.amount_errors.positive_decimal",
        { unit }
      ) as string;
    },
    amountLabel(): string {
      if (this.fields.amount === undefined) return "";
      return this.formatCurrency(this.fields.amount, this.fields.unit, true);
    },
    // The app keypad drives the wallet's active unit, so it only edits a request in that unit.
    useKeypad(): boolean {
      return (
        Boolean(this.useNumericKeyboard) && this.fields.unit === this.activeUnit
      );
    },
    mintLabel(): string {
      const mints = this.fields.mints;
      if (!mints) {
        return this.$t(
          "PaymentRequestDialog.actions.use_active_mint.label"
        ) as string;
      }
      const known = this.mints.find((m: any) => m.url === mints[0]);
      const name = known?.nickname || getShortUrl(mints[0]);
      return mints.length > 1 ? `${name} +${mints.length - 1}` : name;
    },
    shortRequest(): string {
      return shortenString(this.request, 8, 8) || this.request;
    },
    // Units the request can be in: the chosen mint's, or any of the wallet's mints'.
    unitOptions(): string[] {
      const mints = this.requestMint
        ? this.mints.filter((m: any) => m.url === this.requestMint)
        : this.mints;
      const units = new Set<string>(
        mints.flatMap((m: any) => this.mintUnits(m))
      );
      units.add(this.fields.unit);
      return [...units].sort((a, b) =>
        a === "sat" ? -1 : b === "sat" ? 1 : a.localeCompare(b)
      );
    },
    totalsByUnit(): Record<string, number> {
      const totals: Record<string, number> = {};
      for (const p of this.payments) {
        if (p.amount > 0) totals[p.unit] = (totals[p.unit] ?? 0) + p.amount;
      }
      return totals;
    },
  },
  watch: {
    request() {
      this.amountError = false;
    },
  },
  methods: {
    unitCode,
    unitQuantityWord,
    mintUnits(mint: any): string[] {
      const keysets = mint.keysets || [];
      const active = keysets.filter((k: any) => k.active);
      return [
        ...new Set<string>(
          (active.length ? active : keysets).map((k: any) => k.unit)
        ),
      ];
    },
    emitChange(changes: Partial<RequestFields>) {
      this.$emit("change", { ...this.fields, ...changes });
    },
    chooseMint(url: string) {
      this.showMintSheet = false;
      const target = url || undefined;
      if (target === this.requestMint) return;
      const mint = this.mints.find((m: any) => m.url === target);
      const units = mint ? this.mintUnits(mint) : [];
      // Keep the unit (and so the amount) when the new mint has it; otherwise its own
      // first unit, without an amount in the old denomination.
      if (!mint || units.includes(this.fields.unit)) {
        this.emitChange({ mints: target ? [target] : undefined });
      } else {
        const unit = units.includes("sat") ? "sat" : units[0];
        this.emitChange({ mints: [target as string], unit, amount: undefined });
      }
    },
    chooseUnit(unit: string) {
      this.showUnitSheet = false;
      if (unit === this.fields.unit) return;
      this.emitChange({ unit, amount: undefined });
    },
    openAmount() {
      const { amount, unit } = this.fields;
      const display =
        amount === undefined ? null : amount / unitMultiplier(unit);
      this.amountInputValue = display === null ? "" : String(display);
      this.keypadValue = display;
      this.amountError = false;
      this.showAmountSheet = true;
    },
    clearAmount() {
      this.showAmountSheet = false;
      if (this.fields.amount !== undefined) {
        this.emitChange({ amount: undefined });
      }
    },
    commitAmount() {
      if (!this.showAmountSheet) return;
      const text = this.useKeypad
        ? String(this.keypadValue ?? "")
        : this.amountInputValue.trim().replace(",", ".");
      if (text === "" || (this.useKeypad && !this.keypadValue)) {
        this.clearAmount();
        return;
      }
      const value = Number(text) * unitMultiplier(this.fields.unit);
      const baseUnits = Math.round(value);
      // Amounts are whole base units (sats, cents): reject anything finer than that.
      if (
        !Number.isFinite(value) ||
        baseUnits <= 0 ||
        Math.abs(value - baseUnits) > 1e-6
      ) {
        this.amountError = true;
        return;
      }
      this.showAmountSheet = false;
      if (baseUnits !== this.fields.amount) {
        this.emitChange({ amount: baseUnits });
      }
    },
    copy() {
      if (!this.request) return;
      (this as any).copyText(this.request);
    },
    async share() {
      if (!this.request || !this.webShareSupported) return;
      try {
        await navigator.share({ text: this.request });
      } catch (error: any) {
        if (error?.name !== "AbortError") console.error(error);
      }
    },
  },
});
</script>

<style scoped>
.pr-view {
  flex: 1;
  min-height: 0;
}
.pr-body {
  gap: 16px;
  margin: 0 auto;
  max-width: var(--app-column);
  padding: 0 16px 16px;
  width: 100%;
}
/* The QR gives up some height on short phones so the table under it stays in view. */
.pr-body {
  --app-qr-size: clamp(200px, min(70vw, 34vh), 300px);
}
.pr-payments {
  width: 100%;
}
.pr-foot {
  gap: 10px;
}
.pr-foot__btn {
  flex: 1 1 0;
}
</style>
