import { defineStore } from "pinia";
import { MintClass, useMintsStore } from "src/stores/mints";
import type { StoredMint } from "src/stores/mints";
import { usePRStore } from "src/stores/payment-request";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { PaymentMethod } from "src/stores/walletTypes";
import { firstMintSupportingPaymentMethods } from "src/js/mint-payment-methods";
import {
  classifySendClipboard,
  startSendClipboardRead,
} from "src/js/send-clipboard";
import type {
  SendClipboardCandidate,
  SendClipboardKind,
} from "src/js/send-clipboard";

const SEND_PREPARATION_TIMEOUT_MS = 10_000;

type SendClipboardContext = {
  mintUrl: string;
  unit: string;
  tab: string;
};

function settleWithin<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Android-only "tap Send -> use what is in the clipboard" shortcut.
 *
 * The store reads the clipboard once per eligible tap, classifies it with the
 * pure classifier and, only for a recognised destination, opens the *existing*
 * send preview (Lightning address -> LNURL pay sheet, Bitcoin address ->
 * on-chain amount/quote sheet, `creq` -> ecash send sheet). It never starts a
 * payment: the user still confirms in the dialog that opens.
 *
 * Everything is cancellable: `generation` is bumped by `cancel()` (navigation,
 * another dialog, an explicit user action), and any asynchronous result may
 * only touch wallet state while it still owns the current generation.
 */
export type SendClipboardOutcome = SendClipboardKind | "cancelled" | null;

export const useSendClipboardStore = defineStore("sendClipboard", {
  state: () => ({
    // True while clipboard preparation is in flight (duplicate-tap guard).
    reading: false,
    // Monotonic token identifying the current shortcut attempt.
    generation: 0,
  }),
  actions: {
    /** Invalidates any in-flight shortcut attempt. */
    cancel() {
      this.generation += 1;
      this.reading = false;
    },
    captureContext(): SendClipboardContext {
      const mints = useMintsStore();
      const ui = useUiStore() as any;
      return {
        mintUrl: mints.activeMintUrl as string,
        unit: mints.activeUnit as string,
        tab: ui.tab as string,
      };
    },
    isContextCurrent(
      generation: number,
      context: SendClipboardContext
    ): boolean {
      const mints = useMintsStore();
      const ui = useUiStore() as any;
      return Boolean(
        generation === this.generation &&
          mints.activeMintUrl === context.mintUrl &&
          mints.activeUnit === context.unit &&
          ui.tab === context.tab &&
          (typeof document === "undefined" ||
            document.visibilityState !== "hidden") &&
          !this.isBusy()
      );
    },
    /**
     * True when a payment/transfer is already being previewed or prepared.
     * The shortcut must never overwrite such state.
     */
    isBusy(): boolean {
      const wallet = useWalletStore() as any;
      const sendTokens = useSendTokensStore();
      const ui = useUiStore() as any;
      const payInvoiceData = wallet.payInvoiceData;
      return Boolean(
        payInvoiceData?.show ||
          payInvoiceData?.blocking ||
          payInvoiceData?.paying ||
          sendTokens.showSendTokens ||
          sendTokens.sendData.tokensBase64 ||
          ui.globalMutexLock
      );
    },
    /**
     * Clears leftover state from a previous send before a new preview opens,
     * so no stale invoice/LNURL/quote/amount/comment can be shown or paid.
     */
    resetPayInvoiceData(paymentMethod: PaymentMethod | null) {
      const wallet = useWalletStore() as any;
      const payInvoiceData = wallet.payInvoiceData;
      payInvoiceData.show = false;
      payInvoiceData.invoice = null;
      payInvoiceData.lnurlpay = null;
      payInvoiceData.lnurlauth = null;
      payInvoiceData.domain = "";
      payInvoiceData.paymentMethod = paymentMethod;
      payInvoiceData.fee_paid = 0;
      payInvoiceData.meltQuote.error = "";
      payInvoiceData.meltQuote.response = {
        quote: "",
        amount: 0,
        fee_reserve: 0,
      };
      payInvoiceData.input = {
        request: "",
        amount: undefined,
        externalAmount: false,
        comment: "",
        quote: "",
      };
    },
    /**
     * Entry point for the main Send button. Returns the destination kind that
     * was opened, or null when the caller should show the regular Send
     * chooser (non-Android platform, no/denied clipboard, unsupported
     * content, missing mint capability). "cancelled" means another action
     * superseded this attempt and the caller should leave the current UI alone.
     *
     * The clipboard read is started synchronously (before the first await) so
     * it still counts as happening inside the tap gesture.
     */
    async trySendFromClipboard(): Promise<SendClipboardOutcome> {
      if (this.reading) return "cancelled";
      if (this.isBusy()) return "cancelled";
      const read = startSendClipboardRead();
      if (!read) return null;
      const generation = ++this.generation;
      const context = this.captureContext();
      this.reading = true;
      try {
        const text = await read;
        if (!this.isContextCurrent(generation, context)) return "cancelled";
        const candidate = classifySendClipboard(text);
        if (!candidate) return null;
        return await this.openSendFlow(candidate, generation);
      } catch {
        return generation === this.generation ? null : "cancelled";
      } finally {
        if (generation === this.generation) {
          this.reading = false;
        }
      }
    },
    async openSendFlow(
      candidate: SendClipboardCandidate,
      generation: number
    ): Promise<SendClipboardOutcome> {
      if (candidate.kind === "lightningAddress") {
        return this.openLightningAddress(candidate.address, generation);
      }
      if (candidate.kind === "bitcoinAddress") {
        return this.openBitcoinAddress(candidate, generation);
      }
      return this.openPaymentRequest(candidate, generation);
    },
    async openLightningAddress(
      address: string,
      generation: number
    ): Promise<SendClipboardOutcome> {
      const mints = useMintsStore();
      const wallet = useWalletStore() as any;
      const context = this.captureContext();
      const targetMint = firstMintSupportingPaymentMethods(
        mints.mints as StoredMint[],
        mints.activeMintUrl as string,
        [PaymentMethod.Bolt11],
        "melt",
        "sat"
      );
      if (!targetMint) return null;
      const fetched = await settleWithin<{ host: string; data: any }>(
        wallet.fetchLnurlPayData(address),
        SEND_PREPARATION_TIMEOUT_MS
      );
      if (!this.isContextCurrent(generation, context)) return "cancelled";
      if (!fetched) return null;
      const selected = mints.selectMintUrl(targetMint.url, "sat");
      if (
        selected === false ||
        mints.activeMintUrl !== targetMint.url ||
        mints.activeUnit !== "sat"
      ) {
        return null;
      }
      this.resetPayInvoiceData(null);
      const applied = wallet.applyLnurlPayData(
        address,
        fetched.host,
        fetched.data
      );
      if (!applied) {
        this.resetPayInvoiceData(null);
        return null;
      }
      return "lightningAddress";
    },
    async openBitcoinAddress(
      candidate: Extract<SendClipboardCandidate, { kind: "bitcoinAddress" }>,
      generation: number
    ): Promise<SendClipboardOutcome> {
      const mints = useMintsStore();
      const wallet = useWalletStore() as any;
      const activeUnit = mints.activeUnit as string;
      if (candidate.amountSat != null && activeUnit !== "sat") return null;
      const targetMint = firstMintSupportingPaymentMethods(
        mints.mints as StoredMint[],
        mints.activeMintUrl as string,
        [PaymentMethod.Onchain],
        "melt",
        activeUnit
      );
      if (!targetMint) return null;
      if (generation !== this.generation || this.isBusy()) return "cancelled";
      const selected = mints.selectMintUrl(targetMint.url, activeUnit);
      if (
        selected === false ||
        mints.activeMintUrl !== targetMint.url ||
        mints.activeUnit !== activeUnit
      ) {
        return null;
      }
      this.resetPayInvoiceData(PaymentMethod.Onchain);
      wallet.applyOnchainAddress(candidate.address);
      wallet.payInvoiceData.paymentMethod = PaymentMethod.Onchain;
      if (candidate.amountSat != null) {
        wallet.payInvoiceData.input.amount = candidate.amountSat;
        wallet.payInvoiceData.input.externalAmount = true;
      }
      return "bitcoinAddress";
    },
    async openPaymentRequest(
      candidate: Extract<SendClipboardCandidate, { kind: "paymentRequest" }>,
      generation: number
    ): Promise<SendClipboardOutcome> {
      const mints = useMintsStore();
      const knownMints = mints.mints as StoredMint[];
      const requestedMints = (candidate.request.mints ?? []).filter(
        (url): url is string => Boolean(url)
      );
      const targetMintUrl = requestedMints.length
        ? requestedMints.find((url) => knownMints.some((m) => m.url === url))
        : (mints.activeMintUrl as string);
      if (!targetMintUrl) return null;
      const targetMint = knownMints.find((m) => m.url === targetMintUrl);
      if (!targetMint) return null;
      const targetUnit = candidate.unit || (mints.activeUnit as string);
      if (!new MintClass(targetMint).units.includes(targetUnit)) {
        return null;
      }
      if (generation !== this.generation || this.isBusy()) return "cancelled";
      const sendTokens = useSendTokensStore();
      sendTokens.showLockInput = false;
      sendTokens.clearSendData();
      await usePRStore().decodePaymentRequest(candidate.encoded, {
        remember: false,
      });
      return generation === this.generation ? "paymentRequest" : "cancelled";
    },
  },
});
