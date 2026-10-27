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
        <!-- Header -->
        <div class="row items-center q-pa-md sheet-column-header">
          <q-btn
            v-close-popup
            flat
            round
            icon="close"
            color="grey"
            class="floating-close-btn"
          />
          <div class="col text-center fixed-title-height">
            <q-item-label class="dialog-header">
              {{ $t("PaymentRequestDialog.payment_request.caption") }}
            </q-item-label>
          </div>
        </div>

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
          <q-card-section class="q-pa-none">
            <div v-if="showPRKData" class="row justify-center q-mb-md">
              <div class="col-12 q-px-md" style="max-width: var(--app-column)">
                <q-responsive :ratio="1" class="app-qr">
                  <vue-qrcode
                    :value="showPRKData"
                    :options="{ width: 400 }"
                    class="rounded-borders"
                    style="width: 100%"
                  >
                  </vue-qrcode>
                </q-responsive>
              </div>
            </div>

            <q-card-section class="q-pa-sm">
              <!-- The controls describe the request in the QR: amount, mint and unit are read
                   back from it, and each change makes a new request (old ones keep working). -->
              <div class="pr-controls column items-center q-pt-md">
                <div
                  v-if="!isEditingAmount"
                  class="row items-center no-wrap pr-amount-row"
                >
                  <q-btn
                    outline
                    rounded
                    no-caps
                    data-testid="pr-amount"
                    class="pr-amount-pill"
                    @click="startEditingAmount"
                  >
                    <q-icon name="edit_note" size="xs" class="q-mr-sm" />
                    {{ amountLabel }}
                  </q-btn>
                  <q-btn
                    v-if="request.amount !== undefined"
                    flat
                    round
                    class="touch-target-44"
                    data-testid="pr-amount-clear"
                    :aria-label="
                      $t('PaymentRequestDialog.actions.remove_amount.label')
                    "
                    @click="applyChanges({ amount: undefined })"
                  >
                    <XIcon :size="20" />
                  </q-btn>
                </div>
                <div v-else class="pr-amount-editor">
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

                <div class="row no-wrap items-center pr-chip-row">
                  <button
                    type="button"
                    class="mint-chip"
                    data-testid="pr-mint"
                    aria-haspopup="listbox"
                    :aria-expanded="showMintSheet"
                    @click="showMintSheet = true"
                  >
                    <span class="mint-chip__avatar" aria-hidden="true">
                      <img
                        v-if="requestMintIcon"
                        :src="requestMintIcon"
                        alt=""
                        class="pr-mint-icon"
                      />
                      <LandmarkIcon v-else :size="14" class="mint-chip__icon" />
                    </span>
                    <span class="mint-chip__name">{{ mintLabel }}</span>
                    <ChevronDownIcon :size="16" class="mint-chip__icon" />
                  </button>
                  <button
                    type="button"
                    class="mint-chip"
                    data-testid="pr-unit"
                    aria-haspopup="listbox"
                    :aria-expanded="showUnitSheet"
                    :disabled="unitOptions.length <= 1"
                    @click="showUnitSheet = true"
                  >
                    <span class="mint-chip__name">{{
                      unitLabel(request.unit)
                    }}</span>
                    <ChevronDownIcon
                      v-if="unitOptions.length > 1"
                      :size="16"
                      class="mint-chip__icon"
                    />
                  </button>
                </div>
              </div>

              <!-- Received payments summary and list -->
              <div
                class="row justify-center q-pt-md q-pb-md"
                v-if="currentPaymentRequest"
              >
                <div
                  class="col-12 q-px-md"
                  style="max-width: var(--app-column)"
                >
                  <div class="row q-gutter-sm items-center q-mb-sm">
                    <q-chip
                      outline
                      v-for="(total, unit) in totalsByUnit"
                      :key="unit"
                      color="primary"
                      text-color="primary"
                    >
                      {{ $t("PaymentRequestDialog.received_total") }}:
                      <span class="q-ml-xs text-weight-medium">{{
                        formatCurrency(total, unit, true)
                      }}</span>
                    </q-chip>
                  </div>
                  <PaymentRequestPayments
                    :payments="currentPayments"
                    :page-size="3"
                  />
                </div>
              </div>

              <!-- New request button -->
              <div class="row justify-center q-pt-sm q-pb-md">
                <q-btn
                  flat
                  size="md"
                  rounded
                  class="pr-new-request"
                  @click="newRequest"
                >
                  <q-icon name="refresh" class="q-mr-sm" size="xs" />
                  {{ $t("PaymentRequestDialog.actions.new_request.label") }}
                </q-btn>
              </div>
            </q-card-section>
          </q-card-section>
        </div>

        <!-- Bottom panel action -->
        <div class="bottom-panel">
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div class="col-12 q-px-md" style="max-width: var(--app-column)">
              <q-btn
                class="full-width"
                unelevated
                size="lg"
                color="primary"
                rounded
                @click="onCopyPRKData"
              >
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
  Landmark as LandmarkIcon,
  X as XIcon,
} from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import {
  decodePaymentRequest,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { nip19 } from "nostr-tools";

import { usePRStore } from "src/stores/payment-request";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { getShortUrl } from "src/js/wallet-helpers";
import { notifyError } from "src/js/notify";
import BottomSheet from "src/components/BottomSheet.vue";
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
    LandmarkIcon,
    XIcon,
    VueQrcode,
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
    amountLabel(): string {
      if (this.request.amount === undefined) {
        return this.$t("PaymentRequestDialog.actions.add_amount.label");
      }
      return this.formatCurrency(this.request.amount, this.request.unit, true);
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
        (this.$refs.amountInput as any)?.focus();
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
  },
});
</script>

<style scoped>
.pr-controls {
  gap: 12px;
}
.pr-amount-row {
  gap: 4px;
}
/* 44px targets for the pill and the text button (the measured tap-target floor). */
.pr-amount-pill,
.pr-new-request {
  min-height: 44px;
}
.pr-amount-editor {
  max-width: var(--app-column);
  padding: 0 16px;
  width: 100%;
}
.pr-chip-row {
  gap: 8px;
}
.pr-chip-row .mint-chip:disabled {
  cursor: default;
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
.pr-sheet-options {
  padding: 4px 16px 16px;
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
