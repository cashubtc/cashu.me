<template>
  <q-dialog
    v-model="showPRDialog"
    maximized
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card v-if="showPRKData" class="q-pa-none qcard">
      <div
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        class="display-token-fullscreen"
      >
        <!-- Header: close, title and "New request" (a fresh, open request). -->
        <FullscreenDialogHeader
          :title="$t('PaymentRequestDialog.payment_request.caption')"
          balanced
        >
          <template #actions>
            <div class="row items-center no-wrap sheet-header-actions">
              <q-btn
                flat
                round
                class="app-icon-btn"
                data-testid="pr-new-request"
                :aria-label="
                  $t('PaymentRequestDialog.actions.new_request.label')
                "
                @click="newRequest"
              >
                <RefreshCwIcon :size="20" />
                <q-tooltip class="text-no-wrap">{{
                  $t("PaymentRequestDialog.actions.new_request.label")
                }}</q-tooltip>
              </q-btn>
            </div>
          </template>
        </FullscreenDialogHeader>

        <!-- Earlier requests: a pager under the title, only once there is more than one. -->
        <div
          v-if="ownRequestIndices.length > 1"
          class="row items-center justify-center no-wrap pr-pager"
        >
          <q-btn
            flat
            round
            icon="chevron_left"
            class="rtl-flip touch-target-44"
            color="grey"
            :aria-label="$t('PaymentRequestDialog.actions.previous.label')"
            @click="stepRequest(-1)"
          />
          <div class="pr-pager__label">{{ currentIndexDisplay }}</div>
          <q-btn
            flat
            round
            icon="chevron_right"
            class="rtl-flip touch-target-44"
            color="grey"
            :aria-label="$t('PaymentRequestDialog.actions.next.label')"
            @click="stepRequest(1)"
          />
        </div>

        <!-- Content -->
        <div class="content-area">
          <!-- The controls describe the request in the QR: amount, mint and unit are read back
               from it, and each change makes a new request (old ones keep working). A fixed
               amount leads as the hero above the QR; an open request keeps the QR first so it
               stays in view on short screens. -->
          <div
            class="pr-body column items-center"
            :class="{ 'pr-body--fixed': hasAmount }"
          >
            <template v-for="part in layout" :key="part">
              <div
                v-if="part === 'amount'"
                class="pr-amount column items-center"
                :class="hasAmount ? 'pr-amount--hero' : 'pr-amount--open'"
              >
                <div class="pr-overline">
                  {{
                    hasAmount || isEditingAmount
                      ? $t("PaymentRequestDialog.requesting")
                      : $t("PaymentRequestDialog.payer_chooses_amount")
                  }}
                </div>
                <div v-if="isEditingAmount" class="pr-amount-editor">
                  <q-input
                    ref="amountInput"
                    v-model="amountInputValue"
                    outlined
                    inputmode="decimal"
                    data-testid="pr-amount-input"
                    :label="`${$t(
                      'PaymentRequestDialog.inputs.amount.placeholder'
                    )} (${unitLabel(request.unit)})`"
                    :error="amountError"
                    @blur="commitAmount"
                    @keyup.enter="commitAmount"
                    @keyup.esc="isEditingAmount = false"
                  />
                </div>
                <div v-else-if="hasAmount" class="row items-center no-wrap">
                  <button
                    type="button"
                    class="pr-hero-amount"
                    data-testid="pr-amount"
                    @click="startEditingAmount"
                  >
                    {{ amountLabel }}
                  </button>
                  <q-btn
                    flat
                    round
                    class="app-icon-btn pr-amount-clear"
                    data-testid="pr-amount-clear"
                    :aria-label="
                      $t('PaymentRequestDialog.actions.remove_amount.label')
                    "
                    @click="applyChanges({ amount: undefined })"
                  >
                    <XIcon :size="20" />
                  </q-btn>
                </div>
                <q-btn
                  v-else
                  outline
                  rounded
                  no-caps
                  data-testid="pr-amount"
                  class="pr-add-amount"
                  @click="startEditingAmount"
                >
                  <PlusIcon :size="18" class="q-mr-xs" />
                  {{ $t("PaymentRequestDialog.actions.add_amount.label") }}
                </q-btn>

                <!-- Two or three units: a segmented control; more: the unit sheet. -->
                <q-btn-toggle
                  v-if="unitOptions.length > 1 && unitOptions.length <= 3"
                  :model-value="request.unit"
                  :options="
                    unitOptions.map((unit) => ({
                      label: unitLabel(unit),
                      value: unit,
                    }))
                  "
                  rounded
                  unelevated
                  no-caps
                  toggle-color="primary"
                  class="invoice-type-toggle pr-unit-toggle"
                  data-testid="pr-unit"
                  @update:model-value="chooseUnit"
                />
                <button
                  v-else-if="unitOptions.length > 3"
                  type="button"
                  class="mint-chip pr-unit-chip"
                  data-testid="pr-unit"
                  aria-haspopup="listbox"
                  :aria-expanded="showUnitSheet"
                  @click="showUnitSheet = true"
                >
                  <span class="mint-chip__name">{{
                    unitLabel(request.unit)
                  }}</span>
                  <ChevronDownIcon :size="16" class="mint-chip__icon" />
                </button>
              </div>

              <div v-else class="pr-qr-group">
                <QrBlock :value="showPRKData" />
                <!-- One muted line: the unit, and the mint (which opens the mint sheet). -->
                <div class="pr-meta row items-center justify-center no-wrap">
                  <span class="pr-meta__unit">{{
                    unitLabel(request.unit)
                  }}</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    class="pr-mint-link"
                    data-testid="pr-mint"
                    aria-haspopup="listbox"
                    :aria-expanded="showMintSheet"
                    @click="showMintSheet = true"
                  >
                    <span class="pr-mint-link__avatar" aria-hidden="true">
                      <img
                        v-if="requestMintIcon"
                        :src="requestMintIcon"
                        alt=""
                        class="pr-mint-icon"
                      />
                      <LandmarkIcon v-else :size="14" />
                    </span>
                    <span class="pr-mint-link__name">{{ mintLabel }}</span>
                    <ChevronDownIcon :size="16" />
                  </button>
                </div>
                <div class="pr-code row items-center justify-center no-wrap">
                  <span class="app-mono pr-code__text">{{ shortRequest }}</span>
                  <CopyButton
                    :value="showPRKData"
                    :label="
                      $t('PaymentRequestDialog.actions.copy_request.label')
                    "
                    class="touch-target-44"
                  />
                </div>
              </div>
            </template>

            <!-- Received payments summary and list -->
            <div v-if="currentPaymentRequest" class="pr-payments">
              <div class="row q-gutter-sm items-center q-mb-sm">
                <span
                  v-for="(total, unit) in totalsByUnit"
                  :key="unit"
                  class="app-badge"
                >
                  {{ $t("PaymentRequestDialog.received_total") }}:
                  <span class="q-ml-xs text-weight-medium">{{
                    formatCurrency(total, unit, true)
                  }}</span>
                </span>
              </div>
              <PaymentRequestPayments
                :payments="currentPayments"
                :page-size="3"
              />
            </div>
          </div>
        </div>

        <!-- Footer: Share (where the platform can) and Copy, an equal pair. -->
        <div class="bottom-panel">
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 q-px-md row no-wrap pr-foot"
              style="max-width: var(--app-column)"
            >
              <q-btn
                v-if="webShareSupported"
                outline
                rounded
                no-caps
                size="lg"
                class="pr-foot__btn"
                data-testid="pr-share"
                @click="onSharePRKData"
              >
                <ShareIcon :size="20" class="q-mr-sm" />
                {{ $t("PaymentRequestDialog.actions.share.label") }}
              </q-btn>
              <q-btn
                unelevated
                rounded
                no-caps
                size="lg"
                color="primary"
                class="pr-foot__btn"
                data-testid="pr-copy"
                @click="onCopyPRKData"
              >
                <CopyIcon :size="20" class="q-mr-sm" />
                {{ $t("PaymentRequestDialog.actions.copy.label") }}
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-card>
    <BottomSheet v-model="showMintSheet" :title="$t('ChooseMint.sheet_title')">
      <div role="listbox" class="pr-sheet-options">
        <SheetOption
          :label="$t('PaymentRequestDialog.actions.use_active_mint.label')"
          :selected="!requestMint"
          @select="chooseMint(undefined)"
        >
          <template #icon
            ><LandmarkIcon :size="20" class="mint-glyph"
          /></template>
        </SheetOption>
        <SheetOption
          v-for="mint in mints"
          :key="mint.url"
          :label="mint.nickname || shortUrl(mint.url)"
          :caption="mintUnits(mint).map(unitLabel).join(' · ')"
          :selected="requestMint === mint.url"
          @select="chooseMint(mint.url)"
        >
          <template #icon>
            <img
              v-if="mint.info?.icon_url"
              :src="mint.info.icon_url"
              alt=""
              class="pr-mint-icon"
            />
            <LandmarkIcon v-else :size="20" class="mint-glyph" />
          </template>
        </SheetOption>
      </div>
    </BottomSheet>
    <BottomSheet
      v-model="showUnitSheet"
      :title="$t('MintDetailsDialog.details.currency.label')"
    >
      <div role="listbox" class="pr-sheet-options">
        <SheetOption
          v-for="unit in unitOptions"
          :key="unit"
          :label="unitLabel(unit)"
          :selected="request.unit === unit"
          @select="chooseUnit(unit)"
        />
      </div>
    </BottomSheet>
  </q-dialog>
</template>

<script lang="ts">
import {
  ChevronDown as ChevronDownIcon,
  Copy as CopyIcon,
  Landmark as LandmarkIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Share as ShareIcon,
  X as XIcon,
} from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import QrBlock from "src/components/QrBlock.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import {
  decodePaymentRequest,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { nip19 } from "nostr-tools";

import { usePRStore } from "src/stores/payment-request";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useUiStore } from "src/stores/ui";
import { getShortUrl } from "src/js/wallet-helpers";
import { shortenString } from "src/js/string-utils";
import { notifyError } from "src/js/notify";
import BottomSheet from "src/components/BottomSheet.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import SheetOption from "src/components/SheetOption.vue";
import PaymentRequestPayments from "src/components/PaymentRequestPayments.vue";
// type hint for global mixin
declare const windowMixin: any;

type RequestFields = {
  amount?: number;
  unit: string;
  mints?: string[];
  description?: string;
};

const FIAT_UNITS = ["usd", "eur"];
const unitMultiplier = (unit: string) =>
  FIAT_UNITS.includes(unit.toLowerCase()) ? 100 : 1;

export default defineComponent({
  name: "PRDialog",
  mixins: [windowMixin],
  components: {
    ChevronDownIcon,
    CopyIcon,
    LandmarkIcon,
    PlusIcon,
    RefreshCwIcon,
    ShareIcon,
    XIcon,
    QrBlock,
    CopyButton,
    FullscreenDialogHeader,
    BottomSheet,
    SheetOption,
    PaymentRequestPayments,
  },
  data() {
    return {
      isEditingAmount: false,
      amountInputValue: "",
      amountError: false,
      showMintSheet: false,
      showUnitSheet: false,
    };
  },
  computed: {
    ...mapState(usePRStore, [
      "showPRKData",
      "ourPaymentRequests",
      "selectedPRIndex",
      "currentPaymentRequest",
    ]),
    ...mapState(useMintsStore, ["activeUnit", "mints"]),
    ...mapState(useNostrStore, ["seedSignerPublicKey"]),
    ...mapState(useUiStore, ["webShareSupported"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    // What the QR encodes; the only source for the amount, mint and unit shown.
    request(): RequestFields {
      try {
        const decoded = decodePaymentRequest(this.showPRKData);
        return {
          amount:
            decoded.amount !== undefined ? Number(decoded.amount) : undefined,
          unit: decoded.unit || this.activeUnit,
          mints: decoded.mints?.length ? decoded.mints : undefined,
          description: decoded.description,
        };
      } catch {
        return { unit: this.activeUnit };
      }
    },
    requestMint(): string | undefined {
      return this.request.mints?.[0];
    },
    requestMintIcon(): string | undefined {
      return this.mints.find((m: any) => m.url === this.requestMint)?.info
        ?.icon_url;
    },
    hasAmount(): boolean {
      return this.request.amount !== undefined;
    },
    // A fixed amount leads above the QR; an open request shows the QR first.
    layout(): string[] {
      return this.hasAmount ? ["amount", "qr"] : ["qr", "amount"];
    },
    amountLabel(): string {
      if (this.request.amount === undefined) return "";
      return this.formatCurrency(this.request.amount, this.request.unit, true);
    },
    shortRequest(): string {
      return shortenString(this.showPRKData, 14, 8) || this.showPRKData;
    },
    mintLabel(): string {
      const mints = this.request.mints;
      if (!mints) {
        return this.$t("PaymentRequestDialog.actions.use_active_mint.label");
      }
      const known = this.mints.find((m: any) => m.url === mints[0]);
      const name = known?.nickname || this.shortUrl(mints[0]);
      return mints.length > 1 ? `${name} +${mints.length - 1}` : name;
    },
    // Units the request can be in: the chosen mint's, or any of the wallet's mints'.
    unitOptions(): string[] {
      const mints = this.requestMint
        ? this.mints.filter((m: any) => m.url === this.requestMint)
        : this.mints;
      const units = new Set<string>(
        mints.flatMap((m: any) => this.mintUnits(m))
      );
      units.add(this.request.unit);
      return [...units].sort((a, b) =>
        a === "sat" ? -1 : b === "sat" ? 1 : a.localeCompare(b)
      );
    },
    // Requests this wallet receives on. Older versions also stored requests the user paid,
    // which carry someone else's address; those are never shown or copied here.
    ownRequestIndices(): number[] {
      return this.ourPaymentRequests
        .map((entry: any, index: number) => ({ entry, index }))
        .filter(({ entry }) => this.isOwnRequest(entry.encoded))
        .map(({ index }) => index);
    },
    currentIndexDisplay(): string {
      const own = this.ownRequestIndices;
      if (!own.length) return "0/0";
      const position = own.indexOf(this.selectedPRIndex as number);
      return this.$t("PaymentRequestDialog.request_index", {
        index: (position < 0 ? own.length - 1 : position) + 1,
        total: own.length,
      }) as string;
    },
    currentPayments(): any[] {
      const prStore = usePRStore();
      if (!this.currentPaymentRequest) return [];
      return prStore.getPaymentsForRequest(this.currentPaymentRequest.id);
    },
    totalsByUnit(): Record<string, number> {
      const totals: Record<string, number> = {};
      for (const p of this.currentPayments) {
        if (p.amount > 0) {
          totals[p.unit] = (totals[p.unit] ?? 0) + p.amount;
        }
      }
      return totals;
    },
  },
  watch: {
    showPRDialog: {
      handler(open: boolean) {
        if (open) this.showOwnRequest();
        else this.isEditingAmount = false;
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(usePRStore, ["createPaymentRequest", "selectRequestByIndex"]),
    shortUrl(url: string) {
      return getShortUrl(url);
    },
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
    isOwnRequest(encoded: string): boolean {
      if (!this.seedSignerPublicKey) return true;
      try {
        return (decodePaymentRequest(encoded).transport || []).some((t) => {
          if (t.type !== PaymentRequestTransportType.NOSTR) return false;
          const target = nip19.decode(t.target);
          return (
            target.type === "nprofile" &&
            target.data.pubkey === this.seedSignerPublicKey
          );
        });
      } catch {
        return false;
      }
    },
    showOwnRequest() {
      const own = this.ownRequestIndices;
      if (own.includes(this.selectedPRIndex as number)) {
        this.selectRequestByIndex(this.selectedPRIndex as number);
      } else if (own.length) {
        this.selectRequestByIndex(own[own.length - 1]);
      } else {
        this.newRequest();
      }
    },
    stepRequest(step: number) {
      const own = this.ownRequestIndices;
      if (own.length <= 1) return;
      const position = Math.max(0, own.indexOf(this.selectedPRIndex as number));
      this.selectRequestByIndex(
        own[(position + step + own.length) % own.length]
      );
    },
    // Every change is a new request with its own id: one already shared keeps working.
    applyChanges(changes: Partial<RequestFields>) {
      const next = { ...this.request, ...changes };
      try {
        this.createPaymentRequest(
          next.amount,
          next.description,
          next.mints?.[0],
          next.unit
        );
      } catch (error) {
        notifyError(String(error));
      }
    },
    // A fresh, open request: no amount, any mint, in the request's current unit.
    newRequest() {
      this.isEditingAmount = false;
      try {
        this.createPaymentRequest(
          undefined,
          undefined,
          undefined,
          this.request.unit
        );
      } catch (error) {
        notifyError(String(error));
      }
    },
    chooseMint(url: string | undefined) {
      this.showMintSheet = false;
      if (url === this.requestMint && (url || !this.request.mints)) return;
      const mint = this.mints.find((m: any) => m.url === url);
      const units = mint ? this.mintUnits(mint) : [];
      // Keep the unit (and so the amount) when the new mint has it; otherwise its own
      // first unit, without an amount in the old denomination.
      if (!mint || units.includes(this.request.unit)) {
        this.applyChanges({ mints: url ? [url] : undefined });
      } else {
        const unit = units.includes("sat") ? "sat" : units[0];
        this.applyChanges({ mints: [url as string], unit, amount: undefined });
      }
    },
    chooseUnit(unit: string) {
      this.showUnitSheet = false;
      if (unit === this.request.unit) return;
      this.applyChanges({ unit, amount: undefined });
    },
    startEditingAmount() {
      const { amount, unit } = this.request;
      this.amountInputValue =
        amount === undefined ? "" : String(amount / unitMultiplier(unit));
      this.amountError = false;
      this.isEditingAmount = true;
      this.$nextTick(() => {
        // Refs inside v-for (the amount block) come back as an array.
        const input = this.$refs.amountInput as any;
        (Array.isArray(input) ? input[0] : input)?.focus();
      });
    },
    commitAmount() {
      // Enter and the blur that follows both commit: only the first one counts.
      if (!this.isEditingAmount) return;
      const text = this.amountInputValue.trim().replace(",", ".");
      if (text === "") {
        this.isEditingAmount = false;
        if (this.request.amount !== undefined) {
          this.applyChanges({ amount: undefined });
        }
        return;
      }
      const multiplier = unitMultiplier(this.request.unit);
      const value = Number(text) * multiplier;
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
      if (baseUnits !== this.request.amount) {
        this.applyChanges({ amount: baseUnits });
      }
    },
    onCopyPRKData() {
      if (this.showPRKData) {
        (this as any).copyText(this.showPRKData);
      }
    },
    async onSharePRKData() {
      if (!this.showPRKData || !this.webShareSupported) return;
      try {
        await navigator.share({ text: this.showPRKData });
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Error sharing payment request:", error);
        }
      }
    },
  },
});
</script>

<style scoped>
.pr-body {
  gap: 16px;
  margin: 0 auto;
  max-width: var(--app-column);
  padding: 0 16px 16px;
  width: 100%;
}
.pr-amount {
  gap: 8px;
  width: 100%;
}
.pr-amount--hero {
  padding-top: 4px;
}
.pr-overline {
  color: var(--app-text-muted);
  font-size: 14px;
}
/* The hero amount reads as editable text: a dashed underline, no button chrome. The clear
   button hangs off its end so the figure itself stays centred. */
.pr-hero-amount {
  background: none;
  border: 0;
  border-block-end: 2px dashed var(--app-border-strong);
  color: var(--app-text);
  cursor: text;
  font: inherit;
  font-size: 40px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  min-height: 48px;
  padding: 0 2px;
}
.pr-amount-clear {
  color: var(--app-text-muted) !important;
  margin-inline-end: -44px;
}
.pr-add-amount {
  min-height: 44px;
}
.pr-amount-editor {
  width: 100%;
}
.pr-unit-toggle {
  margin-top: 4px;
}
.pr-unit-chip {
  min-height: 44px;
}
.pr-qr-group {
  width: 100%;
}
/* The QR gives up some height on short phones so the controls under it (the mint line, the
   amount and unit controls of an open request) stay above the footer. */
.pr-qr-group {
  --app-qr-size: clamp(200px, min(70vw, 34vh), 300px);
}
/* Under the QR: "BTC · mint", muted, the mint a quiet button that opens the mint sheet. */
.pr-meta {
  color: var(--app-text-muted);
  font-size: 14px;
  gap: 6px;
  margin-top: 8px;
  min-width: 0;
}
.pr-meta__unit {
  flex-shrink: 0;
}
.pr-mint-link {
  align-items: center;
  background: none;
  border: 0;
  border-radius: var(--app-radius-sm);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: 6px;
  min-height: 44px;
  min-width: 0;
  padding: 0 4px;
}
.pr-mint-link:hover {
  color: var(--app-text);
}
.pr-mint-link__avatar {
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  height: 18px;
  justify-content: center;
  width: 18px;
}
.pr-mint-link__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pr-code {
  gap: 4px;
}
.pr-code__text {
  color: var(--app-text-muted);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
/* The pager is quiet chrome under the title: muted "Request 2 of 3" between 44px arrows. */
.pr-pager {
  gap: 4px;
  margin-top: -8px;
  padding-bottom: 8px;
}
.pr-pager__label {
  color: var(--app-text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  min-width: 96px;
  text-align: center;
}
.mint-glyph {
  color: var(--app-text-muted);
}
.pr-mint-icon {
  border-radius: 50%;
  height: 100%;
  object-fit: cover;
  width: 100%;
}
</style>
