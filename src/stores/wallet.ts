import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof, MintClass, StoredMint } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { useProofsStore } from "./proofs";
import { HistoryToken, useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useUiStore } from "src/stores/ui";
import { useP2PKStore } from "src/stores/p2pk";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { usePRStore } from "./payment-request";
import { useWorkersStore } from "./workers";
import { useInvoicesWorkerStore } from "./invoicesWorker";

import {
  requestMintBolt11,
  mintBolt11,
  meltQuoteInvoiceDataBolt11,
  meltQuoteBolt11,
  meltInvoiceDataBolt11,
  meltBolt11,
  checkInvoiceBolt11,
  checkOutgoingInvoiceBolt11,
  mintOnPaidBolt11,
  handleBolt11InvoiceBolt11,
} from "./walletBolt11";
import {
  requestMintBolt12,
  checkOfferAndMintBolt12,
  checkOutgoingInvoiceBolt12,
  meltQuoteInvoiceDataBolt12,
  meltInvoiceDataBolt12,
  meltBolt12,
  mintOnPaidBolt12,
} from "./walletBolt12";
import {
  requestMintOnchain,
  checkOnchainAndMint,
  checkOutgoingOnchain,
  meltQuoteInvoiceDataOnchain,
  meltInvoiceDataOnchain,
  meltOnchain,
  mintOnPaidOnchain,
} from "./walletOnchain";

import _ from "underscore";
import token from "src/js/token";
import { sumProofAmounts } from "src/js/proofs";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "src/js/notify";
import {
  Amount,
  Wallet,
  Proof,
  type ProofLike,
  MintQuoteBolt11Request,
  MeltQuoteBolt11Request,
  MintQuoteBolt11Response,
  MintQuoteBolt12Response,
  MintQuoteOnchainResponse,
  MeltQuoteBolt11Response,
  MeltQuoteBolt12Response,
  MeltQuoteOnchainResponse,
  CheckStateEnum,
  MeltQuoteState,
  MintQuoteState,
  PaymentRequest,
  PaymentRequestTransportType,
  PaymentRequestTransport,
  decodePaymentRequest,
  ProofState,
  KeyChain,
  type AmountLike,
  type CounterSource,
  createEphemeralCounterSource,
  OutputData,
  // ConsoleLogger,
} from "@cashu/cashu-ts";
// @ts-ignore
import * as bolt11Decoder from "light-bolt11-decoder";
import { bech32 } from "bech32";
import axios from "axios";
import { date } from "quasar";

// bip39 requires Buffer
// import { Buffer } from 'buffer';
// window.Buffer = Buffer;
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useSettingsStore } from "./settings";
import { usePriceStore } from "./price";
import { useI18n } from "vue-i18n";
import BOLT12Decoder from "bolt12-decoder";
import { ensureLightningMintActive } from "src/js/mint-lightning";
import {
  isLegacyRetailQR,
  translateLegacyQRToLightningAddress,
} from "src/js/legacy-qr";
import { onchainNetwork } from "src/js/onchain";
import { LightningMethod } from "src/stores/walletTypes";
// HACK: this is a workaround so that the catch block in the melt function does not throw an error when the user exits the app
// before the payment is completed. This is necessary because the catch block in the melt function would otherwise remove all
// quotes from the invoiceHistory and the user would not be able to pay the invoice again after reopening the app.
let isUnloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isUnloading = true;
  });
}

type Invoice = {
  amount: number;
  request: string;
  quote: string;
  memo: string;
  type?: LightningMethod;
};

// The app uses number-typed amounts (strategy b). These types represent
// cashu-ts quote responses with top-level Amount fields converted to number.
type AppMintQuote = Omit<
  MintQuoteBolt11Response | MintQuoteBolt12Response | MintQuoteOnchainResponse,
  "amount" | "amount_paid" | "amount_issued"
> & {
  amount: number | null;
  amount_paid?: number;
  amount_issued?: number;
};
type AppOnchainFeeOption = {
  fee_index: number;
  fee_reserve: number;
  estimated_blocks: number;
};
type AppMeltQuote = {
  quote: string;
  amount: number;
  fee_reserve: number;
  unit: string;
  state: MeltQuoteState;
  expiry: number;
  request: string;
  payment_preimage: string | null;
  fee_options?: AppOnchainFeeOption[];
  selected_fee_index?: number | null;
  outpoint?: string | null;
  change?: any[];
};

export type InvoiceHistory = Invoice & {
  date: string;
  status: "pending" | "paid";
  mint: string;
  unit: string;
  mintQuote?: AppMintQuote;
  meltQuote?: AppMeltQuote;
  label?: string;
  privKey?: string;
  paidDate?: string;
  meltOutputData?: any[];
  network?: string;
};

type KeysetCounter = {
  id: string;
  counter: number;
};

type MeltExecuteFn = (
  quote: AppMeltQuote,
  sendProofs: ProofLike[],
  opts: { keysetId: string }
) => Promise<{
  quote:
    | MeltQuoteBolt11Response
    | MeltQuoteBolt12Response
    | MeltQuoteOnchainResponse;
  change?: Proof[];
  outputData?: any[];
}>;

type CheckMeltQuoteFn = (quoteId: string) => Promise<
  {
    state: MeltQuoteState;
  } & (
    | MeltQuoteBolt11Response
    | MeltQuoteBolt12Response
    | MeltQuoteOnchainResponse
  )
>;

type CheckOutgoingMeltQuoteFn = (
  wallet: Wallet,
  quoteId: string
) => Promise<
  MeltQuoteBolt11Response | MeltQuoteBolt12Response | MeltQuoteOnchainResponse
>;

const receiveStore = useReceiveTokensStore();
const tokenStore = useTokensStore();
const proofsStore = useProofsStore();

function amountToNumber(value: AmountLike | undefined): number {
  if (value === undefined) return 0;
  return Amount.from(value).toNumber();
}
function normalizeMintQuote(
  quote:
    | MintQuoteBolt11Response
    | MintQuoteBolt12Response
    | MintQuoteOnchainResponse
): AppMintQuote {
  const amount = "amount" in quote ? quote.amount : null;
  const rest = { ...quote } as any;
  delete rest.amount;
  return {
    ...rest,
    amount: amount === null ? null : amountToNumber(amount),
    amount_paid:
      "amount_paid" in quote ? amountToNumber(quote.amount_paid) : undefined,
    amount_issued:
      "amount_issued" in quote
        ? amountToNumber(quote.amount_issued)
        : undefined,
  };
}
function normalizeMeltQuote(
  quote:
    | MeltQuoteBolt11Response
    | MeltQuoteBolt12Response
    | MeltQuoteOnchainResponse
): AppMeltQuote {
  const { change, ...rest } = quote;
  const normalized: AppMeltQuote = {
    ...rest,
    amount: amountToNumber(quote.amount),
    fee_reserve:
      "fee_reserve" in quote
        ? amountToNumber(quote.fee_reserve)
        : amountToNumber(
            quote.fee_options.find(
              (option) => option.fee_index === quote.selected_fee_index
            )?.fee_reserve ?? quote.fee_options[0]?.fee_reserve
          ),
    payment_preimage:
      "payment_preimage" in quote ? quote.payment_preimage : null,
  };
  if (change) normalized.change = change;
  if ("fee_options" in quote) {
    normalized.fee_options = quote.fee_options.map((option) => ({
      ...option,
      fee_reserve: amountToNumber(option.fee_reserve),
    }));
    normalized.selected_fee_index = quote.selected_fee_index;
    normalized.outpoint = quote.outpoint;
  }
  return normalized;
}

/** Re-wrap number amounts back to Amount for passing to cashu-ts APIs */
function toMeltQuote(
  quote: AppMeltQuote
): MeltQuoteBolt11Response | MeltQuoteBolt12Response {
  return {
    ...quote,
    amount: Amount.from(quote.amount),
    fee_reserve: Amount.from(quote.fee_reserve),
  };
}

/**
 * Convert WalletProofs to Proof[] with Amount for cashu-ts APIs that
 * require Proof[] (e.g. selectProofsToSend). Strips app-local fields
 * (`reserved`, `quote`) so the result is a clean Proof.
 */
function toProofs(proofs: WalletProof[]): Proof[] {
  return proofs.map(({ reserved, quote, amount, ...rest }) => ({
    ...rest,
    amount: Amount.from(amount),
  }));
}

export const useWalletStore = defineStore("wallet", {
  state: () => {
    const { t } = useI18n();
    return {
      t: t,
      mnemonic: useLocalStorage("cashu.mnemonic", ""),
      invoiceHistory: useLocalStorage(
        "cashu.invoiceHistory",
        [] as InvoiceHistory[]
      ),
      keysetCounters: useLocalStorage(
        "cashu.keysetCounters",
        [] as KeysetCounter[]
      ),
      oldMnemonicCounters: useLocalStorage(
        "cashu.oldMnemonicCounters",
        [] as { mnemonic: string; keysetCounters: KeysetCounter[] }[]
      ),
      sharedCounterSource: null as CounterSource | null,
      invoiceData: {} as InvoiceHistory,
      activeWebsocketConnections: 0,
      payInvoiceData: {
        blocking: false,
        paying: false,
        request: "",
        show: false,
        fee_paid: 0,
        meltQuote: {
          payload: {
            unit: "",
            request: "",
          } as MeltQuoteBolt11Request,
          response: {
            quote: "",
            amount: 0,
            fee_reserve: 0,
          } as AppMeltQuote,
          error: "",
        },
        invoice: {
          sat: 0,
          memo: "",
          request: "",
        } as {
          sat: number;
          memo: string;
          request: string;
          bolt12?: string;
        } | null,
        lnurlpay: {
          domain: "",
          callback: "",
          minSendable: 0,
          maxSendable: 0,
          metadata: {},
          successAction: {},
          routes: [],
          tag: "",
          lightningAddress: "",
        },
        lnurlauth: {},
        input: {
          request: "",
          amount: undefined,
          comment: "",
          quote: "",
        } as {
          request: string;
          amount: number | undefined;
          comment: string;
          quote: string;
        },
        paymentMethod: null as LightningMethod | null,
      },
    };
  },
  getters: {
    seed(): Uint8Array {
      return mnemonicToSeedSync(this.mnemonic);
    },
  },
  actions: {
    setMnemonicFromUser: function (mnemonic: string) {
      this.mnemonic = mnemonic.trim().toLowerCase(); // normalize
    },
    /**
     * Returns a fully initialised Wallet for the active mint.
     * Calls loadMint internally, so is safe for all wallet operations.
     */
    async activeWallet(updateKeysets: boolean = false): Promise<Wallet> {
      const mints = useMintsStore();
      return this.mintWallet(
        mints.activeMintUrl,
        mints.activeUnit,
        updateKeysets
      );
    },
    async mintWallet(
      url: string,
      unit: string,
      updateKeysets: boolean = false
    ): Promise<Wallet> {
      // short-lived wallet for mint operations
      // note: the unit of the wallet will be activeUnit by default,
      // overwrite wallet.unit if needed
      const mints = useMintsStore();
      let storedMint = mints.mints.find((m) => m.url === url);
      if (!storedMint) {
        throw new Error("mint not found");
      }
      // if updateKeysets is true and keysetsLastFetched is older than 1 hour, fetch the keysets for the mint
      const ONE_HOUR = 60 * 60 * 1000;
      const lastUpdated = storedMint.lastKeysetsUpdated
        ? new Date(storedMint.lastKeysetsUpdated).getTime()
        : 0;
      const mintNeedsUpdate =
        updateKeysets && lastUpdated < Date.now() - ONE_HOUR;
      if (mintNeedsUpdate) {
        console.log("updating mint info and keys for mint", storedMint.url);
        try {
          await mints.updateMintInfoAndKeys(storedMint);
          // Re-fetch mint after update to get fresh keysets
          storedMint = mints.mints.find((m) => m.url === url) ?? storedMint;
        } catch (error: any) {
          console.error("Failed to update mint info/keys:", error);
          // Continue with potentially stale keysets rather than failing
        }
      }
      return this.createWalletInstance(storedMint, url, unit);
    },
    // Synchronous wallet creation for non-critical operations (e.g., fee calculation display)
    // Use mintWallet() with updateKeysets=true for critical operations
    mintWalletSync(url: string, unit: string): Wallet {
      const mints = useMintsStore();
      const storedMint = mints.mints.find((m) => m.url === url);
      if (!storedMint) {
        throw new Error("mint not found");
      }
      return this.createWalletInstance(storedMint, url, unit);
    },
    getOrCreateCounterSource(): CounterSource {
      if (!this.sharedCounterSource) {
        const initial = Object.fromEntries(
          this.keysetCounters.map(({ id, counter }) => [id, counter])
        );
        this.sharedCounterSource = createEphemeralCounterSource(initial);
      }
      return this.sharedCounterSource;
    },
    syncCounterToStorage(keysetId: string, next: number) {
      const entry = this.keysetCounters.find((c) => c.id === keysetId);
      if (entry) {
        entry.counter = Math.max(entry.counter, next);
      } else {
        this.keysetCounters.push({ id: keysetId, counter: next });
      }
    },
    keysetCounter(id: string): number {
      return this.keysetCounters.find((c) => c.id === id)?.counter ?? 0;
    },
    async increaseKeysetCounter(id: string, by: number) {
      const next = this.keysetCounter(id) + by;
      const src = this.getOrCreateCounterSource();
      await src.advanceToAtLeast(id, next);
      this.syncCounterToStorage(id, next);
    },
    createWalletInstance(
      storedMint: StoredMint,
      url: string,
      unit: string
    ): Wallet {
      if (this.mnemonic == "") {
        this.mnemonic = generateMnemonic(wordlist);
      }
      const bip39seed = mnemonicToSeedSync(this.mnemonic);
      const wallet = new Wallet(url, {
        unit,
        bip39seed,
        counterSource: this.getOrCreateCounterSource(),
        // logger: new ConsoleLogger("debug"),
      });
      wallet.on.countersReserved(({ keysetId, next }) => {
        this.syncCounterToStorage(keysetId, next);
      });
      // Load the caches
      const keychainCache = KeyChain.mintToCacheDTO(
        url,
        storedMint.keysets,
        storedMint.keys
      );
      if (storedMint.info) {
        wallet.loadMintFromCache(storedMint.info, keychainCache);
      }
      return wallet;
    },
    mnemonicToSeedSync: function (mnemonic: string): Uint8Array {
      return mnemonicToSeedSync(mnemonic);
    },
    newMnemonic: function () {
      // store old mnemonic and keysetCounters
      const oldMnemonicCounters = this.oldMnemonicCounters;
      const keysetCounters = this.keysetCounters;
      oldMnemonicCounters.push({ mnemonic: this.mnemonic, keysetCounters });
      this.keysetCounters = [];
      this.sharedCounterSource = null; // force re-creation on next wallet init
      this.mnemonic = generateMnemonic(wordlist);
    },
    retryOnceOnSignedOutputs: async function <T>(
      keysetId: string,
      operation: () => Promise<T>
    ): Promise<T> {
      try {
        return await operation();
      } catch (error: any) {
        const handled = await this.handleOutputsHaveAlreadyBeenSignedError(
          keysetId,
          error
        );
        if (!handled) {
          throw error;
        }
        // Counter source is shared — the bump from handleOutputsHaveAlreadyBeenSignedError
        // is already visible to the wallet, so just retry.
        return await operation();
      }
    },
    getKeyset(
      mintUrl: string | null = null,
      unit: string | null = null
    ): string {
      unit = unit || useMintsStore().activeUnit;
      mintUrl = mintUrl || useMintsStore().activeMintUrl;
      const mint = useMintsStore().mints.find((m) => m.url === mintUrl);
      if (!mint) {
        throw new Error("mint not found");
      }
      const mintClass = new MintClass(mint);
      // const mintStore = useMintsStore();
      const keysets = mint.keysets;
      if (keysets == null || keysets.length == 0) {
        throw new Error("no keysets found.");
      }
      const unitKeysets = mintClass.unitKeysets(unit);
      if (unitKeysets == null || unitKeysets.length == 0) {
        console.error("no keysets found for unit", unit);
        throw new Error("no keysets found for unit");
      }
      // select the keyset id
      // const keyset_id = unitKeysets[0].id;
      // rules for selection:
      // - filter all keysets that are active=true
      // - order by id (whether it is hex or base64)
      // - order by input_fee_ppk (ascending) TODO: this is not implemented yet
      // - select the first one
      const activeKeysets = unitKeysets.filter((k) => k.active);
      const hexKeysets = activeKeysets.filter((k) => k.id.startsWith("00"));
      const base64Keysets = activeKeysets.filter((k) => !k.id.startsWith("00"));
      const sortedKeysets = hexKeysets.concat(base64Keysets);
      // const sortedKeysets = _.sortBy(activeKeysets, k => [k.id, k.input_fee_ppk])
      if (sortedKeysets.length == 0) {
        console.error("no active keysets found for unit", unit);
        throw new Error("no active keysets found for unit");
      }
      return sortedKeysets[0].id;
    },
    /**
     * Sets an invoice status to paid
     */
    setInvoicePaid(
      quoteId: string,
      updates?: { amount?: number; mintQuote?: any }
    ) {
      const invoice = this.invoiceHistory.find((i) => i.quote === quoteId);
      if (!invoice) return;
      invoice.status = "paid";
      invoice.paidDate = currentDateStr();
      if (updates?.amount) invoice.amount = updates.amount;
      if (updates?.mintQuote) invoice.mintQuote = updates.mintQuote;

      // Update invoiceData if it matches the paid invoice
      if (this.invoiceData.quote === quoteId) {
        this.invoiceData.status = "paid";
        this.invoiceData.paidDate = invoice.paidDate;
        if (updates?.amount) this.invoiceData.amount = updates.amount;
        if (updates?.mintQuote) this.invoiceData.mintQuote = updates.mintQuote;
      }
    },

    splitAmount: function (value: number) {
      // returns optimal 2^n split
      const chunks: Array<number> = [];
      for (let i = 0; i < 32; i++) {
        const mask: number = 1 << i;
        if ((value & mask) !== 0) {
          chunks.push(Math.pow(2, i));
        }
      }
      return chunks;
    },
    coinSelectSpendBase64: function (
      proofs: WalletProof[],
      amount: number
    ): WalletProof[] {
      const base64Proofs = proofs.filter((p) => !p.id.startsWith("00"));
      if (base64Proofs.length > 0) {
        base64Proofs.sort((a, b) => b.amount - a.amount);
        let sum = 0;
        const selectedProofs: WalletProof[] = [];
        for (let i = 0; i < base64Proofs.length; i++) {
          const proof = base64Proofs[i];
          sum += proof.amount;
          selectedProofs.push(proof);
          if (sum >= amount) {
            return selectedProofs;
          }
        }
        return [];
      }
      return [];
    },
    coinSelect: function (
      proofs: WalletProof[],
      wallet: Wallet,
      amount: number,
      includeFees: boolean = false
    ): WalletProof[] {
      if (sumProofAmounts(proofs) < amount) {
        // there are not enough proofs to pay the amount
        return [];
      }
      const { send: selectedProofs, keep: _ } = wallet.selectProofsToSend(
        toProofs(proofs),
        amount,
        includeFees
      );
      const selectedWalletProofs = selectedProofs.map((p) => {
        return {
          ...p,
          amount: amountToNumber(p.amount),
          reserved: false,
        } as WalletProof;
      });
      return selectedWalletProofs;
    },
    spendableProofs: function (
      proofs: WalletProof[],
      amount: number
    ): WalletProof[] {
      const proofsStore = useProofsStore();
      const spendableProofs = proofsStore.getUnreservedProofs(proofs);
      if (proofsStore.sumProofs(spendableProofs) < amount) {
        throw Error(this.t("wallet.notifications.balance_too_low"));
      }
      return spendableProofs;
    },
    getFeesForProofs: function (
      proofs: Array<Pick<ProofLike, "id">>,
      mintUrl?: string,
      unit?: string
    ): number {
      const mints = useMintsStore();
      const wallet = this.mintWalletSync(
        mintUrl ?? mints.activeMintUrl,
        unit ?? mints.activeUnit
      );
      return amountToNumber(wallet.getFeesForProofs(proofs));
    },
    sendToLock: async function (
      proofs: WalletProof[],
      wallet: Wallet,
      amount: number,
      receiverPubkey: string
    ) {
      const spendableProofs = this.spendableProofs(proofs, amount);
      const proofsToSend = this.coinSelect(
        spendableProofs,
        wallet,
        amount,
        true
      );
      const keysetId = this.getKeyset(wallet.mint.mintUrl, wallet.unit);
      const { keep: keepProofs, send: sendProofs } = await wallet.ops
        .send(amount, toProofs(proofsToSend))
        .keyset(keysetId)
        .asP2PK({ pubkey: receiverPubkey })
        .run();
      const proofsStore = useProofsStore();
      await proofsStore.removeProofs(proofsToSend);
      // note: we do not store sendProofs in the proofs store but
      // expect from the caller to store it in the history
      await proofsStore.addProofs(keepProofs);
      return { keepProofs, sendProofs };
    },
    send: async function (
      proofs: WalletProof[],
      wallet: Wallet,
      amount: number,
      invalidate: boolean = false,
      includeFees: boolean = false
    ): Promise<{ keepProofs: ProofLike[]; sendProofs: ProofLike[] }> {
      /*
      splits proofs so the user can keep firstProofs, send scndProofs.
      then sets scndProofs as reserved.

      if invalidate, scndProofs (the one to send) are invalidated
      */
      const proofsStore = useProofsStore();
      const uIStore = useUiStore();
      let proofsToSend: WalletProof[] = [];
      const keysetId = this.getKeyset(wallet.mint.mintUrl, wallet.unit);
      await uIStore.lockMutex();
      try {
        const spendableProofs = this.spendableProofs(proofs, amount);

        proofsToSend = this.coinSelect(
          spendableProofs,
          wallet,
          amount,
          includeFees
        );
        const totalAmount = sumProofAmounts(proofsToSend);
        const fees = includeFees
          ? wallet.getFeesForProofs(proofsToSend).toNumber()
          : 0;
        const targetAmount = amount + fees;

        let keepProofs: ProofLike[] = [];
        let sendProofs: ProofLike[] = [];

        if (totalAmount != targetAmount) {
          // we need to swap!
          // get a new wallet with potentially updated keysets / info
          const swapWallet = await this.mintWallet(
            wallet.mint.mintUrl,
            wallet.unit,
            true
          );
          proofsToSend = this.coinSelect(
            spendableProofs,
            swapWallet,
            targetAmount,
            true
          );
          ({ keep: keepProofs, send: sendProofs } =
            await this.retryOnceOnSignedOutputs(keysetId, async () =>
              swapWallet.ops
                .send(targetAmount, toProofs(proofsToSend))
                .asDeterministic()
                .keyset(keysetId)
                .proofsWeHave(spendableProofs)
                .run()
            ));
          await proofsStore.addProofs(keepProofs);
          await proofsStore.addProofs(sendProofs);

          // make sure we don't delete any proofs that were returned
          const proofsToSendNotReturned = proofsToSend
            .filter((p) => !sendProofs.find((s) => s.secret === p.secret))
            .filter((p) => !keepProofs.find((k) => k.secret === p.secret));
          await proofsStore.removeProofs(proofsToSendNotReturned);
        } else if (totalAmount == targetAmount) {
          keepProofs = [];
          sendProofs = proofsToSend;
        } else {
          throw new Error("could not split proofs.");
        }

        await proofsStore.setReserved(sendProofs, true);
        if (invalidate) {
          await proofsStore.removeProofs(sendProofs);
        }
        return { keepProofs, sendProofs };
      } catch (error: any) {
        await proofsStore.setReserved(proofsToSend, false);
        console.error(error);
        notifyApiError(error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
    },
    redeem: async function () {
      /*
      Receives a token that is prepared in the receiveToken – it is not yet in the history
      */
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const p2pkStore = useP2PKStore();
      const wasReceiveDialogVisible = receiveStore.showReceiveTokens;

      if (receiveStore.receiveData.tokensBase64.length == 0) {
        throw new Error("no tokens provided.");
      }
      const tokenJson = await token.decodeFull(
        receiveStore.receiveData.tokensBase64
      );
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      const proofs = token.getProofs(tokenJson);
      if (proofs.length == 0) {
        throw new Error("no proofs found.");
      }
      const inputAmount = sumProofAmounts(proofs);
      let fee = 0;
      const mintInToken = token.getMint(tokenJson);
      const unitInToken = token.getUnit(tokenJson);

      const historyToken = {
        amount: inputAmount,
        token: receiveStore.receiveData.tokensBase64,
        unit: unitInToken,
        mint: mintInToken,
        fee: fee,
      };
      const mintWallet = await this.mintWallet(
        historyToken.mint,
        historyToken.unit,
        true
      );
      const mint = mintStore.mints.find((m) => m.url === historyToken.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      await uIStore.lockMutex();
      try {
        // redeem
        const keysetId = this.getKeyset(historyToken.mint, historyToken.unit);
        const privkey = receiveStore.receiveData.p2pkPrivateKey;
        let proofs: Proof[];
        try {
          proofs = await this.retryOnceOnSignedOutputs(keysetId, async () =>
            mintWallet.ops
              .receive(receiveStore.receiveData.tokensBase64)
              .asDeterministic()
              .privkey(privkey)
              .proofsWeHave(mintStore.mintUnitProofs(mint, historyToken.unit))
              .run()
          );
          await proofsStore.addProofs(proofs);
        } catch (error: any) {
          console.error(error);
          throw new Error("Error receiving tokens: " + error);
        }

        p2pkStore.setPrivateKeyUsed(privkey);

        const outputAmount = proofsStore.sumProofs(proofs);

        // if token is already in history, set to paid, else add to history
        if (
          tokenStore.historyTokens.find(
            (t) =>
              t.token === receiveStore.receiveData.tokensBase64 && t.amount > 0
          )
        ) {
          tokenStore.setTokenPaid(receiveStore.receiveData.tokensBase64);
        } else {
          // if this is a self-sent token, we will find an outgoing token with the inverse amount
          if (
            tokenStore.historyTokens.find(
              (t) =>
                t.token === receiveStore.receiveData.tokensBase64 &&
                t.amount < 0
            )
          ) {
            tokenStore.setTokenPaid(receiveStore.receiveData.tokensBase64);
          }
          fee = inputAmount - outputAmount;
          historyToken.fee = fee;
          historyToken.amount = outputAmount;
          tokenStore.addPaidToken(historyToken);
        }
        useUiStore().vibrate();
        let message = this.t("wallet.notifications.received", {
          amount: uIStore.formatCurrency(outputAmount, historyToken.unit),
        });
        if (fee > 0) {
          message += this.t("wallet.notifications.fee", {
            fee: uIStore.formatCurrency(fee, historyToken.unit),
          });
        }
        notifySuccess(message);
        if (wasReceiveDialogVisible) {
          receiveStore.showReceiveTokens = false;
          uIStore.closeDialogs();
        }
      } catch (error: any) {
        console.error(error);
        notifyApiError(error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
      // }
    },

    // Minting and melting
    requestMint: requestMintBolt11,
    mint: mintBolt11,
    // Dispatch to Bolt11 or Bolt12 depending on parsed input
    meltQuoteInvoiceData: async function () {
      if (
        this.payInvoiceData?.invoice &&
        (this.payInvoiceData.invoice as any).onchain
      ) {
        return await meltQuoteInvoiceDataOnchain.call(this);
      } else if (
        this.payInvoiceData?.invoice &&
        (this.payInvoiceData.invoice as any).bolt12
      ) {
        return await meltQuoteInvoiceDataBolt12.call(this);
      } else {
        return await meltQuoteInvoiceDataBolt11.call(this);
      }
    },
    meltQuote: meltQuoteBolt11,
    meltInvoiceData: async function () {
      if (
        this.payInvoiceData?.invoice &&
        (this.payInvoiceData.invoice as any).onchain
      ) {
        return await meltInvoiceDataOnchain.call(this);
      } else if (
        this.payInvoiceData?.invoice &&
        (this.payInvoiceData.invoice as any).bolt12
      ) {
        return await meltInvoiceDataBolt12.call(this);
      } else {
        return await meltInvoiceDataBolt11.call(this);
      }
    },
    meltGeneric: async function (
      proofs: WalletProof[],
      quote: AppMeltQuote,
      mintWallet: Wallet,
      silent: boolean | undefined,
      executeCall: MeltExecuteFn,
      checkQuote: CheckMeltQuoteFn,
      method: LightningMethod = LightningMethod.Bolt11
    ) {
      const uIStore = useUiStore();
      this.payInvoiceData.paying = true;
      const proofsStore = useProofsStore();
      const amount = quote.amount + quote.fee_reserve;
      const keysetId = this.getKeyset(mintWallet.mint.mintUrl, mintWallet.unit);

      // start melt
      let sendProofs: ProofLike[] = [];
      try {
        const { sendProofs: _sendProofs } = await this.send(
          proofs,
          mintWallet,
          amount,
          false,
          true
        );
        sendProofs = _sendProofs;
        if (sendProofs.length == 0) {
          throw new Error("could not split proofs.");
        }
      } catch (error: any) {
        console.error(error);
        if (!silent) notifyApiError(error, "Payment failed");
        throw error;
      }

      await uIStore.lockMutex();
      try {
        await this.addOutgoingPendingInvoiceToHistory(
          quote,
          mintWallet.mint.mintUrl,
          mintWallet.unit,
          method
        );
        await proofsStore.setReserved(sendProofs, true, quote.quote);

        uIStore.triggerActivityOrb();

        uIStore.unlockMutex();
        let data;
        try {
          data = await this.retryOnceOnSignedOutputs(keysetId, () =>
            executeCall(quote, sendProofs, { keysetId })
          );
          // store melt quote in invoice history
          this.updateOutgoingInvoiceInHistory(normalizeMeltQuote(data.quote));
          if (data.outputData?.length) {
            this.setMeltOutputData(quote.quote, data.outputData);
          }
        } catch (error) {
          throw error;
        } finally {
          await uIStore.lockMutex();
        }

        if (data.quote.state != MeltQuoteState.PAID) {
          throw new Error("Invoice not paid.");
        }

        if (data.change != null) {
          await proofsStore.addProofs(data.change);
        }

        await proofsStore.removeProofs(sendProofs);

        const amount_paid = amount - proofsStore.sumProofs(data.change ?? []);
        useUiStore().vibrate();
        if (!silent) {
          notifySuccess(
            this.t("wallet.notifications.paid_lightning", {
              amount: uIStore.formatCurrency(amount_paid, mintWallet.unit),
            })
          );
        }

        this.updateOutgoingInvoiceInHistory(quote, {
          status: "paid",
          amount: -amount_paid,
        });

        this.payInvoiceData.invoice = { sat: 0, memo: "", request: "" };
        this.payInvoiceData.show = false;
        return data;
      } catch (error: any) {
        if (isUnloading) {
          throw error;
        }
        // get quote and check state
        const meltQuote = normalizeMeltQuote(await checkQuote(quote.quote));
        // store melt quote in invoice history
        this.updateOutgoingInvoiceInHistory(meltQuote);

        if (
          meltQuote.state == MeltQuoteState.PAID ||
          meltQuote.state == MeltQuoteState.PENDING
        ) {
          if (meltQuote.state == MeltQuoteState.PENDING) {
            this.payInvoiceData.meltQuote.error = this.t(
              "wallet.notifications.payment_pending_refresh"
            );
          }
          this.payInvoiceData.show = false;
          notify(this.t("wallet.notifications.payment_pending_refresh"));
          throw error;
        }
        // roll back proof management
        await proofsStore.setReserved(sendProofs, false);
        this.removeOutgoingInvoiceFromHistory(quote.quote);
        console.error(error);
        if (!silent) notifyApiError(error, "Payment failed");
        throw error;
      } finally {
        this.payInvoiceData.paying = false;
        uIStore.unlockMutex();
      }
    },
    melt: meltBolt11,

    // Alias functions for bolt11 compatibility
    requestMintBolt11: requestMintBolt11,
    mintBolt11: mintBolt11,
    meltQuoteInvoiceDataBolt11: meltQuoteInvoiceDataBolt11,
    meltQuoteBolt11: meltQuoteBolt11,
    meltInvoiceDataBolt11: meltInvoiceDataBolt11,
    meltBolt11: meltBolt11,
    // Bolt12 explicit aliases
    requestMintBolt12: requestMintBolt12,
    meltQuoteInvoiceDataBolt12: meltQuoteInvoiceDataBolt12,
    meltInvoiceDataBolt12: meltInvoiceDataBolt12,
    meltBolt12: meltBolt12,
    mintOnPaidBolt12: mintOnPaidBolt12,
    // On-chain explicit aliases
    requestMintOnchain: requestMintOnchain,
    meltQuoteInvoiceDataOnchain: meltQuoteInvoiceDataOnchain,
    meltInvoiceDataOnchain: meltInvoiceDataOnchain,
    meltOnchain: meltOnchain,
    mintOnPaidOnchain: mintOnPaidOnchain,
    // /check
    checkProofsSpendable: async function (
      proofs: WalletProof[],
      wallet: Wallet,
      update_history = false
    ) {
      /*
      checks with the mint whether an array of proofs is still
      spendable or already invalidated
      */
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const tokenStore = useTokensStore();
      if (proofs.length == 0) {
        return;
      }
      try {
        uIStore.triggerActivityOrb();
        const { spent: spentProofs } = await wallet.groupProofsByState(
          toProofs(proofs)
        );
        if (spentProofs.length) {
          await proofsStore.removeProofs(spentProofs);
          // update UI
          const serializedProofs = proofsStore.serializeProofs(spentProofs);
          if (serializedProofs == null) {
            throw new Error("could not serialize proofs.");
          }
          if (update_history) {
            tokenStore.addPaidToken({
              amount: -proofsStore.sumProofs(spentProofs),
              token: serializedProofs,
              unit: wallet.unit,
              mint: wallet.mint.mintUrl,
            });
          }
        }
        // return spent proofs
        return spentProofs;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error);
        throw error;
      }
    },
    checkTokenSpendable: async function (
      historyToken: HistoryToken,
      verbose: boolean = true
    ) {
      /*
      checks whether a base64-encoded token (from the history table) has been spent already.
      if it is spent, the appropraite entry in the history table is set to paid.
      */
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();
      const proofsStore = useProofsStore();

      const tokenJson = await token.decodeFull(historyToken.token);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      const proofs = token.getProofs(tokenJson);
      const mintWallet = await this.mintWallet(
        historyToken.mint,
        historyToken.unit
      );

      const mint = mintStore.mints.find((m) => m.url === historyToken.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      const spentProofs = await this.checkProofsSpendable(proofs, mintWallet);
      if (spentProofs != undefined && spentProofs.length == proofs.length) {
        // all proofs are spent, set token to paid
        tokenStore.setTokenPaid(historyToken.token);
      } else if (
        spentProofs != undefined &&
        spentProofs.length &&
        spentProofs.length < proofs.length
      ) {
        // not all proofs are spent, we remove the spent part of the token from the history
        const spentAmount = proofsStore.sumProofs(spentProofs);
        const serializedSpentProofs = proofsStore.serializeProofs(spentProofs);
        const unspentProofs = proofs.filter(
          (p) => !spentProofs.find((sp) => sp.secret === p.secret)
        );
        const unspentAmount = proofsStore.sumProofs(unspentProofs);
        const serializedUnspentProofs =
          proofsStore.serializeProofs(unspentProofs);

        if (serializedSpentProofs && serializedUnspentProofs) {
          const historyToken2 = tokenStore.editHistoryToken(
            historyToken.token,
            {
              newAmount: spentAmount,
              newStatus: "paid",
              newToken: serializedSpentProofs,
            }
          );
          // add all unspent proofs back to the history
          // QUICK: we use the historyToken object here because we don't know if the transaction is incoming or outgoing (we don't know the sign of the amount)
          if (historyToken2) {
            tokenStore.addPendingToken({
              amount: unspentAmount * Math.sign(historyToken2.amount),
              token: serializedUnspentProofs,
              unit: historyToken2.unit,
              mint: historyToken2.mint,
            });
          }
        }
      }
      if (spentProofs != undefined && spentProofs.length) {
        useUiStore().vibrate();
        const proofStore = useProofsStore();
        notifySuccess(
          this.t("wallet.notifications.sent", {
            amount: uIStore.formatCurrency(
              proofStore.sumProofs(spentProofs),
              historyToken.unit
            ),
          })
        );
      } else {
        console.log("### token not paid yet");
        if (verbose) {
          notify(this.t("wallet.notifications.token_still_pending"));
        }
        return false;
      }
      return spentProofs != undefined && spentProofs.length == proofs.length;
    },
    checkInvoiceBolt11: async function (
      quote: string,
      verbose = true,
      hideInvoiceDetailsOnMint = true
    ) {
      return await checkInvoiceBolt11.call(
        this,
        quote,
        verbose,
        hideInvoiceDetailsOnMint
      );
    },
    checkOutgoingInvoiceGeneric: async function (
      quote: string,
      verbose = true,
      checkQuote: CheckOutgoingMeltQuoteFn
    ) {
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const invoice = this.invoiceHistory.find((i) => i.quote === quote);
      if (!invoice) {
        throw new Error("invoice not found");
      }
      const mintWallet = await this.mintWallet(invoice.mint, invoice.unit);
      const mint = mintStore.mints.find((m: any) => m.url === invoice.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      const proofs = await proofsStore.getProofsForQuote(quote);
      try {
        // this is an outgoing invoice, we first do a getMintQuote to check if the invoice is paid
        const meltQuote = normalizeMeltQuote(
          await checkQuote(mintWallet, quote)
        );
        this.updateOutgoingInvoiceInHistory(meltQuote);
        if (meltQuote.state == MeltQuoteState.PENDING) {
          console.log("### mintQuote not paid yet");
          if (verbose) {
            notify(this.t("wallet.notifications.invoice_still_pending"));
          }
          throw new Error("invoice not paid yet.");
        } else if (meltQuote.state == MeltQuoteState.UNPAID) {
          await useProofsStore().setReserved(proofs, false);
          this.removeOutgoingInvoiceFromHistory(quote);
          useInvoicesWorkerStore().removeOutgoingInvoiceFromChecker?.(quote);
          notifyWarning(
            this.t("wallet.notifications.lightning_payment_failed")
          );
        } else if (meltQuote.state == MeltQuoteState.PAID) {
          const spentProofs = await this.checkProofsSpendable(
            proofs,
            mintWallet,
            true
          );
          if (spentProofs != undefined && spentProofs.length == proofs.length) {
            useUiStore().vibrate();
            notifySuccess(
              this.t("wallet.notifications.sent", {
                amount: uIStore.formatCurrency(
                  useProofsStore().sumProofs(proofs),
                  invoice.unit
                ),
              })
            );
          }
          this.setInvoicePaid(quote);
          useInvoicesWorkerStore().removeOutgoingInvoiceFromChecker?.(quote);
        }
      } catch (error: any) {
        if (verbose) {
          notifyApiError(error);
        }
        console.log("Could not check quote", invoice.quote, error);
        throw error;
      }
    },
    checkOutgoingInvoiceBolt11: async function (quote: string, verbose = true) {
      return await checkOutgoingInvoiceBolt11.call(this, quote, verbose);
    },
    checkOutgoingInvoiceBolt12: async function (quote: string, verbose = true) {
      return await checkOutgoingInvoiceBolt12.call(this, quote, verbose);
    },
    checkOutgoingOnchain: async function (quote: string, verbose = true) {
      return await checkOutgoingOnchain.call(this, quote, verbose);
    },
    checkOutgoingInvoice: async function (quote: string, verbose = true) {
      const invoice = this.invoiceHistory.find((i) => i.quote === quote);
      if (!invoice) {
        throw new Error("invoice not found");
      }
      if (invoice.type === LightningMethod.Onchain) {
        return await this.checkOutgoingOnchain(quote, verbose);
      }
      if (invoice.type === LightningMethod.Bolt12) {
        return await this.checkOutgoingInvoiceBolt12(quote, verbose);
      }
      return await this.checkOutgoingInvoiceBolt11(quote, verbose);
    },
    checkOfferAndMintBolt12: async function (
      quote: string,
      verbose = true,
      hideInvoiceDetailsOnMint = true
    ) {
      return await checkOfferAndMintBolt12.call(
        this,
        quote,
        verbose,
        hideInvoiceDetailsOnMint
      );
    },
    checkOnchainAndMint: async function (
      quote: string,
      verbose = true,
      hideInvoiceDetailsOnMint = true
    ) {
      return await checkOnchainAndMint.call(
        this,
        quote,
        verbose,
        hideInvoiceDetailsOnMint
      );
    },
    onTokenPaid: async function (historyToken: HistoryToken) {
      const sendTokensStore = useSendTokensStore();
      const uIStore = useUiStore();
      const tokenJson = await token.decodeFull(historyToken.token);
      const mintStore = useMintsStore();
      const settingsStore = useSettingsStore();
      if (!settingsStore.checkSentTokens) {
        console.log(
          "settingsStore.checkSentTokens is disabled, skipping token check"
        );
        return;
      }
      useInvoicesWorkerStore().addOutgoingTokenToChecker?.(
        historyToken.token,
        true
      );
      const mint = mintStore.mints.find((m) => m.url === historyToken.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      if (
        !settingsStore.useWebsockets ||
        !mint.info?.nuts[17]?.supported ||
        !mint.info?.nuts[17]?.supported.find(
          (s) =>
            s.method === LightningMethod.Bolt11 &&
            s.unit == historyToken.unit &&
            s.commands.indexOf("proof_state") != -1
        )
      ) {
        console.log(
          "Websockets not supported, kicking off token check worker."
        );
        useWorkersStore().checkTokenSpendableWorker(historyToken);
        return;
      }
      try {
        console.log("onTokenPaid kicking off websocket");
        if (tokenJson == undefined) {
          throw new Error("no tokens provided.");
        }
        const proofs = token.getProofs(tokenJson);
        this.activeWebsocketConnections++;
        uIStore.triggerActivityOrb();
        const wallet = await this.activeWallet();
        let isChecking = false;
        const unsub = await wallet.on.proofStateUpdates(
          toProofs(proofs),
          async (proofState: ProofState) => {
            console.log(`Websocket: proof state updated: ${proofState.state}`);
            if (proofState.state == CheckStateEnum.SPENT && !isChecking) {
              isChecking = true;
              try {
                const tokenSpent = await this.checkTokenSpendable(historyToken);
                if (tokenSpent) {
                  sendTokensStore.showSendTokens = false;
                  unsub();
                }
              } finally {
                isChecking = false;
              }
            }
          },
          async (error: any) => {
            console.error(error);
            notifyApiError(error);
            throw error;
          }
        );
      } catch (error) {
        console.error(
          "Error in websocket subscription. Starting invoices worker.",
          error
        );
        useWorkersStore().checkTokenSpendableWorker(historyToken);
      } finally {
        this.activeWebsocketConnections--;
      }
    },
    mintOnPaid: mintOnPaidBolt11,
    mintOnPaidBolt11: async function (
      quote: string,
      verbose = true,
      kickOffInvoiceChecker = true,
      hideInvoiceDetailsOnMint = true
    ) {
      return await mintOnPaidBolt11.call(
        this,
        quote,
        verbose,
        kickOffInvoiceChecker,
        hideInvoiceDetailsOnMint
      );
    },
    ////////////// UI HELPERS //////////////
    addOutgoingPendingInvoiceToHistory: async function (
      quote: AppMeltQuote,
      mint: string,
      unit: string,
      method: LightningMethod = LightningMethod.Bolt11
    ) {
      this.invoiceHistory.push({
        amount: -(quote.amount + quote.fee_reserve),
        request: this.payInvoiceData.input.request,
        quote: quote.quote,
        memo: "Outgoing invoice",
        date: currentDateStr(),
        status: "pending",
        mint: mint,
        unit: unit,
        meltQuote: quote,
        type: method,
        network:
          method === LightningMethod.Onchain
            ? onchainNetwork(this.payInvoiceData.input.request || quote.request)
            : undefined,
      });
      useInvoicesWorkerStore().addOutgoingInvoiceToChecker?.(quote.quote, true);
    },
    removeOutgoingInvoiceFromHistory: function (quote: string) {
      const index = this.invoiceHistory.findIndex((i) => i.quote === quote);
      if (index >= 0) {
        this.invoiceHistory.splice(index, 1);
      }
    },
    updateOutgoingInvoiceInHistory: function (
      quote: AppMeltQuote,
      options?: { status?: "pending" | "paid"; amount?: number }
    ) {
      this.invoiceHistory
        .filter((i) => i.quote === quote.quote)
        .forEach((i) => {
          if (options) {
            if (options.status) {
              i.status = options.status;
              if (options.status === "paid") {
                i.paidDate = currentDateStr();
              }
            }
            if (options.amount !== undefined) {
              i.amount = options.amount;
            }
          }
          i.meltQuote = quote;
          if (i.type === LightningMethod.Onchain && !i.network) {
            i.network = onchainNetwork(i.request || quote.request);
          }
        });
    },
    setMeltOutputData: function (quote: string, outputData: any[]) {
      const serialized = outputData.map((output) =>
        OutputData.serialize(output)
      );
      this.invoiceHistory
        .filter((i) => i.quote === quote)
        .forEach((i) => {
          i.meltOutputData = serialized;
        });
    },
    checkPendingTokens: async function (verbose: boolean = true) {
      const tokenStore = useTokensStore();
      const last_n = 5;
      let i = 0;
      // invert for loop
      for (const t of tokenStore.historyTokens.slice().reverse()) {
        if (i >= last_n) {
          break;
        }
        if (t.status === "pending" && t.amount < 0 && t.token) {
          console.log("### checkPendingTokens", t.token);
          this.checkTokenSpendable(t, verbose);
          i += 1;
        }
      }
    },
    handleBolt11InvoiceBolt11: async function () {
      return await handleBolt11InvoiceBolt11.call(this);
    },
    handleCashuToken: function () {
      this.payInvoiceData.show = false;
      receiveStore.showReceiveTokens = true;
    },
    handleP2PK: function (req: string) {
      const sendTokenStore = useSendTokensStore();
      sendTokenStore.sendData.p2pkPubkey = req;
      sendTokenStore.showSendTokens = true;
    },
    handlePaymentRequest: async function (req: string) {
      const prStore = usePRStore();
      await prStore.decodePaymentRequest(req);
    },
    handleBolt12Offer: async function (offer: string) {
      const mintStore = useMintsStore();
      this.payInvoiceData.show = true;
      this.payInvoiceData.input.amount = undefined;
      this.payInvoiceData.input.quote = "";
      this.payInvoiceData.meltQuote.error = "";
      this.payInvoiceData.meltQuote.response = {
        quote: "",
        amount: 0,
        fee_reserve: 0,
      };
      let decoded;
      try {
        decoded = BOLT12Decoder.decode(offer);
      } catch (e) {
        console.error("Failed to decode BOLT12 offer", e);
        notifyWarning(
          this.t("wallet.notifications.failed_to_decode_invoice"),
          undefined,
          3000
        );
        this.payInvoiceData.show = false;
        throw e;
      }

      const amountMsat = decoded.amount ? parseInt(decoded.amount) : 0;

      const cleanOffer = {
        request: offer,
        bolt12: offer,
        memo: decoded.description || "",
        msat: amountMsat,
        sat: Math.floor(amountMsat / 1000),
        fsat: amountMsat / 1000,
        description: decoded.description || "",
      } as any;

      const mintResult = await ensureLightningMintActive(
        mintStore.mints,
        mintStore.activeMintUrl,
        mintStore.activateMintUrl.bind(mintStore),
        LightningMethod.Bolt12
      );
      if (!mintResult.ok) {
        this.payInvoiceData.meltQuote.error = this.t(mintResult.errorKey);
        this.payInvoiceData.invoice = Object.freeze(cleanOffer);
        return;
      }

      this.payInvoiceData.invoice = Object.freeze(cleanOffer);
      if (cleanOffer.sat > 0) {
        // If offer has fixed amount, force it
        this.payInvoiceData.input.amount = cleanOffer.sat;
        await this.meltQuoteInvoiceData();
      }
    },
    isBitcoinAddress: function (value: string): boolean {
      const v = value.trim();
      return (
        /^(bc1|tb1|bcrt1)[a-z0-9]{20,90}$/i.test(v) ||
        /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(v) ||
        /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(v)
      );
    },
    handleOnchainAddress: async function (address: string) {
      const mintStore = useMintsStore();
      this.payInvoiceData.show = true;
      this.payInvoiceData.input.amount = undefined;
      this.payInvoiceData.input.quote = "";
      this.payInvoiceData.meltQuote.error = "";
      this.payInvoiceData.meltQuote.response = {
        quote: "",
        amount: 0,
        fee_reserve: 0,
      };

      const cleanAddress = {
        request: address,
        onchain: address,
        network: onchainNetwork(address),
        memo: "",
        msat: 0,
        sat: 0,
        fsat: 0,
        description: "",
      } as any;

      const mintResult = await ensureLightningMintActive(
        mintStore.mints,
        mintStore.activeMintUrl,
        mintStore.activateMintUrl.bind(mintStore),
        LightningMethod.Onchain,
        "melt"
      );
      if (!mintResult.ok) {
        this.payInvoiceData.meltQuote.error =
          "None of your mints support on-chain payments";
        this.payInvoiceData.invoice = Object.freeze(cleanAddress);
        return;
      }

      this.payInvoiceData.invoice = Object.freeze(cleanAddress);
    },
    decodeRequest: async function (req: string) {
      const p2pkStore = useP2PKStore();
      req = req.trim();
      this.payInvoiceData.input.request = req;
      if (
        req.toLowerCase().startsWith("lnbc") ||
        req.toLowerCase().startsWith("lntb") ||
        req.toLowerCase().startsWith("lntbs") ||
        req.toLowerCase().startsWith("lnbcrt")
      ) {
        this.payInvoiceData.input.request = req;
        await this.handleBolt11InvoiceBolt11();
      } else if (req.toLowerCase().startsWith("lightning:")) {
        const ln = req.slice(10);
        if (ln.toLowerCase().startsWith("lno1")) {
          await this.handleBolt12Offer(ln);
        } else {
          this.payInvoiceData.input.request = ln;
          await this.handleBolt11InvoiceBolt11();
        }
      } else if (req.toLowerCase().startsWith("bitcoin:")) {
        try {
          const url = new URL(
            req.replace(/^bitcoin:/i, "bitcoin://placeholder/")
          );
          const address = url.pathname.replace(/^\//, "");
          const creq = url.searchParams.get("creq");
          const lightning = url.searchParams.get("lightning");
          if (creq) {
            this.payInvoiceData.input.request = creq;
            await this.handlePaymentRequest(creq);
          } else if (lightning) {
            this.payInvoiceData.input.request = lightning;
            if (lightning.toLowerCase().startsWith("lno1")) {
              await this.handleBolt12Offer(lightning);
            } else if (lightning.toLowerCase().startsWith("lnurl1")) {
              await this.lnurlPayFirst(lightning);
            } else {
              await this.handleBolt11InvoiceBolt11();
            }
          } else if (address && this.isBitcoinAddress(address)) {
            this.payInvoiceData.input.request = address;
            await this.handleOnchainAddress(address);
          }
        } catch {
          const addressMatch = req.match(/^bitcoin:([^?]+)/i);
          const creqMatch = req.match(/[?&]creq=([^&]+)/i);
          const lightningMatch = req.match(/[?&]lightning=([^&]+)/i);
          if (creqMatch) {
            this.payInvoiceData.input.request = creqMatch[1];
            await this.handlePaymentRequest(creqMatch[1]);
          } else if (lightningMatch) {
            this.payInvoiceData.input.request = lightningMatch[1];
            const lm = lightningMatch[1];
            if (lm.toLowerCase().startsWith("lno1")) {
              await this.handleBolt12Offer(lm);
            } else {
              await this.handleBolt11InvoiceBolt11();
            }
          } else if (addressMatch && this.isBitcoinAddress(addressMatch[1])) {
            this.payInvoiceData.input.request = addressMatch[1];
            await this.handleOnchainAddress(addressMatch[1]);
          }
        }
      } else if (this.isBitcoinAddress(req)) {
        await this.handleOnchainAddress(req);
      } else if (req.toLowerCase().startsWith("lno1")) {
        await this.handleBolt12Offer(req);
      } else if (req.toLowerCase().startsWith("lnurl:")) {
        this.payInvoiceData.input.request = req.slice(6);
        await this.lnurlPayFirst(this.payInvoiceData.input.request);
      } else if (req.indexOf("lightning=lnurl1") !== -1) {
        this.payInvoiceData.input.request = req
          .split("lightning=")[1]
          .split("&")[0];
        await this.lnurlPayFirst(this.payInvoiceData.input.request);
      } else if (
        req.toLowerCase().startsWith("lnurl1") ||
        req.match(/[\w.+-~_]+@[\w.+-~_]/)
      ) {
        this.payInvoiceData.input.request = req;
        await this.lnurlPayFirst(this.payInvoiceData.input.request);
      } else if (req.startsWith("cashuA") || req.startsWith("cashuB")) {
        // parse cashu tokens from a pasted token
        receiveStore.receiveData.tokensBase64 = req;
        this.handleCashuToken();
      } else if (req.indexOf("token=cashu") !== -1) {
        // parse cashu tokens from a URL like https://example.com#token=cashu...
        const token = req.slice(req.indexOf("token=cashu") + 6);
        receiveStore.receiveData.tokensBase64 = token;
        this.handleCashuToken();
      } else if (p2pkStore.isValidPubkey(req)) {
        this.handleP2PK(req);
      } else if (req.startsWith("http")) {
        const mintStore = useMintsStore();
        mintStore.addMintData = { url: req, nickname: "" };
      } else if (
        req.toLowerCase().startsWith("creqa") ||
        req.toLowerCase().startsWith("creqb")
      ) {
        await this.handlePaymentRequest(req);
      } else if (isLegacyRetailQR(req)) {
        // Try to convert legacy retail QR code (EMV format) to Lightning Address
        const lightningAddress = translateLegacyQRToLightningAddress(req);
        if (lightningAddress) {
          // Process as Lightning Address (LNURL)
          this.payInvoiceData.input.request = lightningAddress;
          await this.lnurlPayFirst(lightningAddress);
        } else {
          // Not a supported merchant QR code
          notifyWarning(
            this.t("wallet.notifications.unsupported_legacy_qr"),
            this.t("wallet.notifications.legacy_qr_not_supported")
          );
        }
      }
      const uiStore = useUiStore();
      uiStore.closeDialogs();
    },
    lnurlPayFirst: async function (address: string) {
      let host;
      let data;
      if (address.split("@").length == 2) {
        const [user, lnaddresshost] = address.split("@");
        host = `https://${lnaddresshost}/.well-known/lnurlp/${user}`;
        const resp = await axios.get(host); // Moved it here: we don't want 2 potential calls
        data = resp.data;
      } else if (address.toLowerCase().slice(0, 6) === "lnurl1") {
        const decoded = bech32.decode(address, 20000);
        const words = bech32.fromWords(decoded.words);
        const uint8Array = new Uint8Array(words);
        host = new TextDecoder().decode(uint8Array);

        const resp = await axios.get(host);
        data = resp.data;
      }
      if (host == undefined) {
        notifyError(
          this.t("wallet.notifications.invalid_lnurl"),
          this.t("wallet.notifications.lnurl_error")
        );
        return;
      }
      if (data.tag == "payRequest") {
        this.payInvoiceData.lnurlpay = data;
        this.payInvoiceData.lnurlpay.domain = host
          .split("https://")[1]
          .split("/")[0];
        // Store lightning address if it was a lightning address (not a LNURL)
        if (address.split("@").length == 2) {
          this.payInvoiceData.lnurlpay.lightningAddress = address;
        } else {
          this.payInvoiceData.lnurlpay.lightningAddress = "";
        }
        if (
          this.payInvoiceData.lnurlpay.maxSendable ==
          this.payInvoiceData.lnurlpay.minSendable
        ) {
          this.payInvoiceData.input.amount =
            this.payInvoiceData.lnurlpay.maxSendable / 1000;
        }
        this.payInvoiceData.invoice = null;
        this.payInvoiceData.input = {
          request: "",
          amount: undefined,
          comment: "",
          quote: "",
        };
        this.payInvoiceData.show = true;
      }
    },
    lnurlPaySecond: async function () {
      const mintStore = useMintsStore();
      let amount = this.payInvoiceData.input.amount;
      if (amount == null) {
        notifyError(
          this.t("wallet.notifications.no_amount"),
          this.t("wallet.notifications.lnurl_error")
        );
        return;
      }
      if (this.payInvoiceData.lnurlpay == null) {
        notifyError(
          this.t("wallet.notifications.no_lnurl_data"),
          this.t("wallet.notifications.lnurl_error")
        );
        return;
      }
      if (
        this.payInvoiceData.lnurlpay.tag == "payRequest" &&
        this.payInvoiceData.lnurlpay.minSendable <= amount * 1000 &&
        this.payInvoiceData.lnurlpay.maxSendable >= amount * 1000
      ) {
        if (mintStore.activeUnit == "usd") {
          const priceUsd = usePriceStore().bitcoinPrice;
          if (priceUsd == 0) {
            notifyError(
              this.t("wallet.notifications.no_price_data"),
              this.t("wallet.notifications.lnurl_error")
            );
            return;
          }
          const satPrice = 1 / (priceUsd / 1e8);
          const usdAmount = amount;
          amount = Math.floor(usdAmount * satPrice);
        }
        const callback = this.payInvoiceData.lnurlpay.callback;
        const separator = callback.includes("?") ? "&" : "?";
        const { data } = await axios.get(
          `${callback}${separator}amount=${amount * 1000}`
        );
        // check http error
        if (data.status == "ERROR") {
          notifyError(data.reason, this.t("wallet.notifications.lnurl_error"));
          return;
        }
        await this.decodeRequest(data.pr);
      }
    },
    initializeMnemonic: function () {
      if (this.mnemonic == "") {
        this.mnemonic = generateMnemonic(wordlist);
      }
      return this.mnemonic;
    },
    async handleOutputsHaveAlreadyBeenSignedError(
      keysetId: string,
      error: any
    ) {
      if (error?.message?.includes("outputs have already been signed")) {
        console.warn(
          `[wallet] outputs already signed for keyset ${keysetId}, advancing counter and trying again`
        );
        const next = this.keysetCounter(keysetId) + 10;
        await this.getOrCreateCounterSource().advanceToAtLeast(keysetId, next);
        this.syncCounterToStorage(keysetId, next);
        notify(this.t("wallet.notifications.trying_again"));
        return true;
      }
      return false;
    },
  },
});
