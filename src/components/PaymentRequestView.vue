<!-- The body of a payment request (PaymentRequestDialog adds the header and the pager),
     in three blocks: the amount as the hero, edited in place on the same dashed line; the QR
     and its request text on one surface; then the request's settings on one shared width —
     the unit as a segmented control and the mint as the standard mint picker. Received
     payments follow, and Share and Copy sit in the footer. Everything shown is read back
     from the encoded request; every change is emitted as `change` and the owner makes a
     new request. -->
<template>
  <div class="pr-view column">
    <div class="content-area">
      <div class="pr-body column">
        <div class="pr-amount column items-center">
          <!-- The line above the figure says what it means, or what's wrong with an edit. -->
          <div
            class="pr-overline"
            :class="{ 'pr-overline--error': amountError }"
            :role="amountError ? 'alert' : undefined"
          >
            {{
              amountError
                ? amountErrorText
                : hasAmount || isEditingAmount
                ? $t("PaymentRequestDialog.requesting")
                : $t("PaymentRequestDialog.payer_chooses_amount")
            }}
          </div>
          <div class="pr-amount__line row items-center justify-center no-wrap">
            <!-- Editing keeps the figure where it is: same type, same dashed line. -->
            <label
              v-if="isEditingAmount"
              class="pr-hero-amount pr-hero-amount--editing"
              :class="{ 'pr-hero-amount--error': amountError }"
            >
              <span class="pr-hero-amount__symbol" aria-hidden="true">{{
                unitSymbol
              }}</span>
              <input
                ref="amountInput"
                v-model="amountInputValue"
                class="pr-hero-amount__input"
                data-testid="pr-amount-input"
                inputmode="decimal"
                autocomplete="off"
                placeholder="0"
                :aria-label="`${$t(
                  'PaymentRequestDialog.inputs.amount.placeholder'
                )} (${unitLabel(fields.unit)})`"
                :aria-invalid="amountError || undefined"
                :style="{ width: `${inputWidth}ch` }"
                @input="amountError = false"
                @blur="commitAmount"
                @keydown.enter.prevent="commitAmount"
                @keydown.esc.prevent="cancelAmount"
              />
            </label>
            <button
              v-else
              type="button"
              class="pr-hero-amount"
              :class="{ 'pr-hero-amount--empty': !hasAmount }"
              data-testid="pr-amount"
              @click="startEditingAmount"
            >
              {{
                hasAmount
                  ? amountLabel
                  : $t("PaymentRequestDialog.actions.add_amount.label")
              }}
            </button>
            <IconButton
              v-if="hasAmount && !isEditingAmount"
              :icon="XIcon"
              class="pr-amount-clear"
              data-testid="pr-amount-clear"
              :label="$t('PaymentRequestDialog.actions.remove_amount.label')"
              @click="emitChange({ amount: undefined })"
            />
          </div>
        </div>

        <!-- The request itself: the code and its text, as one object. -->
        <div class="pr-card">
          <QrBlock :value="request" />
          <div class="pr-code row items-center no-wrap">
            <span class="app-mono pr-code__text">{{ shortRequest }}</span>
            <CopyButton
              :value="request"
              :label="$t('PaymentRequestDialog.actions.copy_request.label')"
              class="touch-target-44 pr-code__copy"
            />
          </div>
        </div>

        <!-- The request's settings: what it is paid in, and into which mint. -->
        <div class="pr-settings column">
          <SegmentedControl
            v-if="unitOptions.length > 1 && unitOptions.length <= 4"
            block
            data-testid="pr-unit"
            :label="$t('MintDetailsDialog.details.currency.label')"
            :model-value="fields.unit"
            :options="
              unitOptions.map((unit) => ({
                label: unitLabel(unit),
                value: unit,
              }))
            "
            @update:model-value="chooseUnit"
          />
          <SheetSelect
            v-else-if="unitOptions.length > 4"
            data-testid="pr-unit"
            :label="$t('MintDetailsDialog.details.currency.label')"
            :model-value="fields.unit"
            :options="
              unitOptions.map((unit) => ({
                label: unitLabel(unit),
                value: unit,
              }))
            "
            @update:model-value="chooseUnit"
          />
          <ChooseMint
            test-id="pr-mint"
            :label="$t('QuoteInformation.mint')"
            :any-label="
              $t('PaymentRequestDialog.actions.use_active_mint.label')
            "
            :model-value="requestMint || ''"
            :show-balances="false"
            :require-active-mint="false"
            dry-run
            class="pr-mint"
            @update:model-value="chooseMint"
          />
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

    <!-- Footer: Share (where the platform can) and Copy, an equal pair. -->
    <div class="bottom-panel">
      <div class="pr-foot row no-wrap">
        <q-btn
          v-if="webShareSupported"
          outline
          rounded
          size="lg"
          class="pr-foot__btn"
          data-testid="pr-share"
          @click="share"
        >
          <ShareIcon :size="20" class="q-mr-sm" />
          {{ $t("PaymentRequestDialog.actions.share.label") }}
        </q-btn>
        <q-btn
          unelevated
          rounded
          size="lg"
          color="primary"
          class="pr-foot__btn"
          data-testid="pr-copy"
          @click="copy"
        >
          <CopyIcon :size="20" class="q-mr-sm" />
          {{ $t("PaymentRequestDialog.actions.copy.label") }}
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Copy as CopyIcon,
  Share as ShareIcon,
  X as XIcon,
} from "lucide-vue-next";
import { defineComponent, type PropType } from "vue";
import { mapState } from "pinia";
import { useMintsStore } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";
import { shortenString } from "src/js/string-utils";
import {
  requestFields,
  type RequestFields,
} from "src/js/payment-request-fields";
import QrBlock from "src/components/QrBlock.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import SheetSelect from "src/components/SheetSelect.vue";
import PaymentRequestPayments from "src/components/PaymentRequestPayments.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import IconButton from "src/components/ui/IconButton.vue";
import SegmentedControl from "src/components/ui/SegmentedControl.vue";

declare const windowMixin: any;

const FIAT_UNITS = ["usd", "eur"];
const unitMultiplier = (unit: string) =>
  FIAT_UNITS.includes(unit.toLowerCase()) ? 100 : 1;

export default defineComponent({
  name: "PaymentRequestView",
  mixins: [windowMixin],
  components: {
    AppBadge,
    ChooseMint,
    CopyButton,
    CopyIcon,
    IconButton,
    PaymentRequestPayments,
    QrBlock,
    SegmentedControl,
    ShareIcon,
    SheetSelect,
  },
  props: {
    /** The encoded request (creqA…). */
    request: { type: String, required: true },
    /** Payments received on it, newest first. */
    payments: { type: Array as PropType<any[]>, default: () => [] },
  },
  emits: ["change"],
  setup() {
    return { XIcon };
  },
  data() {
    return {
      isEditingAmount: false,
      amountInputValue: "",
      amountError: false,
    };
  },
  computed: {
    ...mapState(useMintsStore, ["activeUnit", "mints"]),
    ...mapState(useUiStore, ["webShareSupported"]),
    fields(): RequestFields {
      return requestFields(this.request, this.activeUnit);
    },
    requestMint(): string | undefined {
      return this.fields.mints?.[0];
    },
    hasAmount(): boolean {
      return this.fields.amount !== undefined;
    },
    // The currency mark beside the figure while it is being edited.
    unitSymbol(): string {
      const unit = this.fields.unit.toLowerCase();
      return { sat: "₿", usd: "$", eur: "€" }[unit] ?? `${unit.toUpperCase()} `;
    },
    // The input grows with what is typed, so the figure stays centred on its line.
    inputWidth(): number {
      // Tabular digits at this tracking are a little narrower than 1ch.
      return Math.max(1, this.amountInputValue.length) * 0.92 + 0.15;
    },
    amountErrorText(): string {
      // Base units by name: "sat" (the hero shows ₿, but amounts are whole sats).
      const unit =
        this.fields.unit === "sat" ? "sat" : this.fields.unit.toUpperCase();
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
    shortRequest(): string {
      return shortenString(this.request, 14, 8) || this.request;
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
      this.isEditingAmount = false;
      this.amountError = false;
    },
  },
  methods: {
    unitLabel(unit: string) {
      return unit === "sat" ? "BTC" : unit.toUpperCase();
    },
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
      if (unit === this.fields.unit) return;
      this.emitChange({ unit, amount: undefined });
    },
    startEditingAmount() {
      const { amount, unit } = this.fields;
      this.amountInputValue =
        amount === undefined ? "" : String(amount / unitMultiplier(unit));
      this.amountError = false;
      this.isEditingAmount = true;
      this.$nextTick(() => {
        const input = this.$refs.amountInput as HTMLInputElement | undefined;
        input?.focus();
        input?.select();
      });
    },
    cancelAmount() {
      this.amountError = false;
      this.isEditingAmount = false;
    },
    commitAmount() {
      // Enter and the blur that follows both commit: only the first one counts.
      if (!this.isEditingAmount) return;
      const text = this.amountInputValue.trim().replace(",", ".");
      if (text === "") {
        this.isEditingAmount = false;
        if (this.fields.amount !== undefined) {
          this.emitChange({ amount: undefined });
        }
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
      this.isEditingAmount = false;
      if (baseUnits !== this.fields.amount) {
        this.emitChange({ amount: baseUnits });
      }
    },
    copy() {
      if (this.request) (this as any).copyText(this.request);
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
/* Three blocks on the app column's 16px gutters, 20px apart. */
.pr-body {
  gap: 20px;
  margin: 0 auto;
  max-width: var(--app-column);
  padding: 4px 16px 16px;
  width: 100%;
}
.pr-amount {
  gap: 6px;
  width: 100%;
}
.pr-overline {
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 20px;
  min-height: 20px;
  text-align: center;
}
.pr-overline--error {
  color: var(--app-danger);
}
/* The clear button hangs off the figure's end, so the figure itself stays centred. */
.pr-amount__line {
  min-height: 52px;
}
/* The hero figure reads as editable text: a dashed underline, no button chrome. Shown,
   edited and empty, it keeps the same type and the same line, so tapping it never jumps. */
.pr-hero-amount {
  align-items: baseline;
  background: none;
  border: 0;
  border-block-end: 2px dashed var(--app-border-strong);
  color: var(--app-text);
  cursor: text;
  display: inline-flex;
  font: inherit;
  font-size: 40px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 48px;
  padding: 0 2px;
  white-space: nowrap;
}
.pr-hero-amount--empty {
  color: var(--app-text-muted);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.pr-hero-amount--editing {
  border-block-end-color: var(--q-primary);
  border-block-end-style: solid;
}
.pr-hero-amount--error {
  border-block-end-color: var(--app-danger);
}
.pr-hero-amount__input {
  background: none;
  border: 0;
  caret-color: var(--q-primary);
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  min-width: 1.4ch;
  outline: none;
  padding: 0;
  text-align: start;
}
.pr-hero-amount__input::placeholder {
  color: var(--app-text-subtle);
}
.pr-amount-clear {
  color: var(--app-text-muted) !important;
  margin-inline-end: -44px;
}
/* The QR and its request text as one surface; the QR gives up some height on short
   phones so the settings under it stay above the footer. */
.pr-card {
  --app-qr-size: clamp(184px, min(64vw, 30vh), 280px);
  align-items: center;
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-xl);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 16px 4px;
  width: 100%;
}
.pr-code {
  gap: 4px;
  justify-content: center;
  max-width: 100%;
  min-width: 0;
}
.pr-code__text {
  color: var(--app-text-muted);
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Unit and mint share one width, so their edges line up with the card above. */
.pr-settings {
  gap: 12px;
  width: 100%;
}
/* ChooseMint carries its own bottom padding for forms; here the stack's gap spaces it. */
.pr-mint {
  padding-bottom: 0 !important;
}
.pr-payments {
  width: 100%;
}
.pr-foot {
  gap: 10px;
  margin: 0 auto;
  max-width: var(--app-column);
  padding: 8px 16px 24px;
  width: 100%;
}
.pr-foot__btn {
  flex: 1 1 0;
}
@media (prefers-reduced-motion: no-preference) {
  .pr-hero-amount {
    transition: border-color 0.15s ease;
  }
}
</style>
