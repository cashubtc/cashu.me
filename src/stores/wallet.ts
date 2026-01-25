import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof, MintClass, Mint } from "./mints";
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
  meltQuoteInvoiceDataBolt12,
  meltInvoiceDataBolt12,
  meltBolt12,
} from "./walletBolt12";

import * as _ from "underscore";
import token from "src/js/token";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "src/js/notify";
import {
  CashuMint,
  CashuWallet,
  Proof,
  MintQuotePayload,
  MeltQuotePayload,
  MeltQuoteResponse,
  CheckStateEnum,
  MeltQuoteState,
  MintQuoteState,
  PaymentRequest,
  PaymentRequestTransportType,
  PaymentRequestTransport,
  decodePaymentRequest,
  ProofState,
  MintQuoteResponse,
} from "@cashu/cashu-ts";
import { hashToCurve } from "@cashu/crypto/modules/common";
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
  bolt11: string;
  quote: string;
  memo: string;
  type?: "bolt11" | "bolt12";
};

export type InvoiceHistory = Invoice & {
  date: string;
  status: "pending" | "paid";
  mint: string;
  unit: string;
  mintQuote?: MintQuoteResponse;
  meltQuote?: MeltQuoteResponse;
  label?: string; // Add label field for custom naming
  privKey?: string; // Private key, if the quote is locked
  paidDate?: string;
};

type KeysetCounter = {
  id: string;
  counter: number;
};

const receiveStore = useReceiveTokensStore();
const tokenStore = useTokensStore();
const proofsStore = useProofsStore();

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
      invoiceData: {} as InvoiceHistory,
      activeWebsocketConnections: 0,
      payInvoiceData: {
        blocking: false,
        paying: false,
        bolt11: "",
        show: false,
        fee_paid: 0,
        meltQuote: {
          payload: {
            unit: "",
            request: "",
          } as MeltQuotePayload,
          response: {
            quote: "",
            amount: 0,
            fee_reserve: 0,
          } as MeltQuoteResponse,
          error: "",
        },
        invoice: {
          sat: 0,
          memo: "",
          bolt11: "",
        } as { sat: number; memo: string; bolt11: string } | null,
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
      },
    };
  },
  getters: {
    wallet() {
      const mints = useMintsStore() as any;
      const mint = new CashuMint(mints.activeMintUrl);
      if (this.mnemonic == "") {
        this.mnemonic = generateMnemonic(wordlist);
      }
      const mnemonic: string = this.mnemonic;
      const bip39Seed = mnemonicToSeedSync(mnemonic);
      const wallet = new CashuWallet(mint, {
        keys: mints.activeKeys,
        keysets: mints.activeKeysets,
        mintInfo: mints.activeInfo,
        bip39seed: bip39Seed,
        unit: mints.activeUnit,
      });
      return wallet;
    },
    seed(): Uint8Array {
      return mnemonicToSeedSync(this.mnemonic);
    },
  },
  actions: {
    setMnemonicFromUser: function (mnemonic: string) {
      this.mnemonic = mnemonic;
    },
    async mintWallet(
      url: string,
      unit: string,
      updateKeysets: boolean = false
    ): Promise<CashuWallet> {
      // short-lived wallet for mint operations
      // note: the unit of the wallet will be activeUnit by default,
      // overwrite wallet.unit if needed
      const mints = useMintsStore() as any;
      let storedMint = mints.mints.find((m: any) => m.url === url);
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
          storedMint = mints.mints.find((m: any) => m.url === url);
        } catch (error: any) {
          console.error("Failed to update mint info/keys:", error);
          // Continue with potentially stale keysets rather than failing
        }
      }
      return this.createWalletInstance(storedMint, url, unit, mints);
    },
    // Synchronous wallet creation for non-critical operations (e.g., fee calculation display)
    // Use mintWallet() with updateKeysets=true for critical operations
    mintWalletSync(url: string, unit: string): CashuWallet {
      const mints = useMintsStore() as any;
      const storedMint = mints.mints.find((m: any) => m.url === url);
      if (!storedMint) {
        throw new Error("mint not found");
      }
      return this.createWalletInstance(storedMint, url, unit, mints);
    },
    createWalletInstance(
      storedMint: any,
      url: string,
      unit: string,
      mints: any
    ): CashuWallet {
      const unitKeysets = mints.mintUnitKeysets(storedMint, unit);
      const mint = new CashuMint(url);
      if (this.mnemonic == "") {
        this.mnemonic = generateMnemonic(wordlist);
      }
      const mnemonic: string = this.mnemonic;
      const bip39Seed = mnemonicToSeedSync(mnemonic);
      const wallet = new CashuWallet(mint, {
        keys: storedMint.keys,
        keysets: unitKeysets,
        mintInfo: storedMint.info,
        bip39seed: bip39Seed,
        unit: unit,
      });
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
      this.mnemonic = generateMnemonic(wordlist);
    },
    keysetCounter: function (id: string) {
      const keysetCounter = this.keysetCounters.find((c) => c.id === id);
      if (keysetCounter) {
        return keysetCounter.counter;
      } else {
        this.keysetCounters.push({ id, counter: 1 });
        return 1;
      }
    },
    increaseKeysetCounter: function (id: string, by: number) {
      const keysetCounter = this.keysetCounters.find((c) => c.id === id);
      if (keysetCounter) {
        keysetCounter.counter += by;
      } else {
        const newCounter = { id, counter: by } as KeysetCounter;
        this.keysetCounters.push(newCounter);
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
      const keyset_id = sortedKeysets[0].id;
      // const keys = mint.keys.find((k) => k.id === keyset_id);
      // if (keys) {
      //   this.wallet.keys = keys;
      // }
      return keyset_id;
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
      wallet: CashuWallet,
      amount: number,
      includeFees: boolean = false
    ): WalletProof[] {
      if (proofs.reduce((s, t) => (s += t.amount), 0) < amount) {
        // there are not enough proofs to pay the amount
        return [];
      }
      const { send: selectedProofs, keep: _ } = wallet.selectProofsToSend(
        proofs,
        amount,
        includeFees
      );
      const selectedWalletProofs = selectedProofs.map((p) => {
        return { ...p, reserved: false } as WalletProof;
      });
      return selectedWalletProofs;
    },
    spendableProofs: function (
      proofs: WalletProof[],
      amount: number
    ): WalletProof[] {
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const spendableProofs = proofsStore.getUnreservedProofs(proofs);
      if (proofsStore.sumProofs(spendableProofs) < amount) {
        throw Error(this.t("wallet.notifications.balance_too_low"));
      }
      return spendableProofs;
    },
    getFeesForProofs: function (proofs: Proof[]): number {
      return this.wallet.getFeesForProofs(proofs);
    },
    sendToLock: async function (
      proofs: WalletProof[],
      wallet: CashuWallet,
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
      const { keep: keepProofs, send: sendProofs } = await wallet.send(
        amount,
        proofsToSend,
        { keysetId, pubkey: receiverPubkey }
      );
      const proofsStore = useProofsStore();
      await proofsStore.removeProofs(proofsToSend);
      // note: we do not store sendProofs in the proofs store but
      // expect from the caller to store it in the history
      await proofsStore.addProofs(keepProofs);
      return { keepProofs, sendProofs };
    },
    send: async function (
      proofs: WalletProof[],
      wallet: CashuWallet,
      amount: number,
      invalidate: boolean = false,
      includeFees: boolean = false
    ): Promise<{ keepProofs: Proof[]; sendProofs: Proof[] }> {
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
        const totalAmount = proofsToSend.reduce((s, t) => (s += t.amount), 0);
        const fees = includeFees ? wallet.getFeesForProofs(proofsToSend) : 0;
        const targetAmount = amount + fees;

        let keepProofs: Proof[] = [];
        let sendProofs: Proof[] = [];

        if (totalAmount != targetAmount) {
          // we need to swap!
          // get a new wallet with potentially updated keysets / info
          const swapWallet = await this.mintWallet(
            wallet.mint.mintUrl,
            wallet.unit,
            true
          );
          const counter = this.keysetCounter(keysetId);
          proofsToSend = this.coinSelect(
            spendableProofs,
            swapWallet,
            targetAmount,
            true
          );
          ({ keep: keepProofs, send: sendProofs } = await swapWallet.send(
            targetAmount,
            proofsToSend,
            { counter, keysetId, proofsWeHave: spendableProofs }
          ));
          this.increaseKeysetCounter(
            keysetId,
            keepProofs.length + sendProofs.length
          );
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
        this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
    },
    /**
     *
     *
     * @param {array} proofs
     */
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
      const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      const proofs = token.getProofs(tokenJson);
      if (proofs.length == 0) {
        throw new Error("no proofs found.");
      }
      const inputAmount = proofs.reduce((s, t) => (s += t.amount), 0);
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
        const counter = this.keysetCounter(keysetId);
        const privkey = receiveStore.receiveData.p2pkPrivateKey;
        let proofs: Proof[];
        try {
          proofs = await mintWallet.receive(
            receiveStore.receiveData.tokensBase64,
            {
              counter,
              privkey,
              proofsWeHave: mintStore.mintUnitProofs(mint, historyToken.unit),
            }
          );
          await proofsStore.addProofs(proofs);
          this.increaseKeysetCounter(keysetId, proofs.length);
        } catch (error: any) {
          console.error(error);
          this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
          throw new Error("Error receiving tokens: " + error);
        }

        p2pkStore.setPrivateKeyUsed(privkey);

        const outputAmount = proofs.reduce((s, t) => (s += t.amount), 0);

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
          const _historyId = tokenStore.addPaidToken(historyToken as any);
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
        (this.payInvoiceData.invoice as any).bolt12
      ) {
        return await meltInvoiceDataBolt12.call(this);
      } else {
        return await meltInvoiceDataBolt11.call(this);
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
    // /check
    checkProofsSpendable: async function (
      proofs: Proof[],
      wallet: CashuWallet,
      update_history = false
    ) {
      /*
      checks with the mint whether an array of proofs is still
      spendable or already invalidated
      */
      const mintStore = useMintsStore();
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const tokenStore = useTokensStore();
      if (proofs.length == 0) {
        return;
      }
      const enc = new TextEncoder();
      try {
        uIStore.triggerActivityOrb();
        const proofStates = await wallet.checkProofsStates(proofs);
        const spentProofsStates = proofStates.filter(
          (p) => p.state == CheckStateEnum.SPENT
        );
        const spentProofs = proofs.filter((p) =>
          spentProofsStates.find(
            (s) => s.Y == hashToCurve(enc.encode(p.secret)).toHex(true)
          )
        );
        if (spentProofs.length) {
          await proofsStore.removeProofs(spentProofs);
          // update UI
          const serializedProofs = proofsStore.serializeProofs(spentProofs);
          if (serializedProofs == null) {
            throw new Error("could not serialize proofs.");
          }
          if (update_history) {
            const _historyId = tokenStore.addPaidToken({
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

      const tokenJson = token.decode(historyToken.token);
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
      return true;
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
    checkOutgoingInvoiceBolt11: async function (quote: string, verbose = true) {
      return await checkOutgoingInvoiceBolt11.call(this, quote, verbose);
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
    onTokenPaid: async function (historyToken: HistoryToken) {
      const sendTokensStore = useSendTokensStore();
      const uIStore = useUiStore();
      const tokenJson = token.decode(historyToken.token);
      const mintStore = useMintsStore();
      const settingsStore = useSettingsStore();
      if (!settingsStore.checkSentTokens) {
        console.log(
          "settingsStore.checkSentTokens is disabled, skipping token check"
        );
        return;
      }
      const mint = mintStore.mints.find((m) => m.url === historyToken.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      if (
        !settingsStore.useWebsockets ||
        !mint.info?.nuts[17]?.supported ||
        !mint.info?.nuts[17]?.supported.find(
          (s) =>
            s.method == "bolt11" &&
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
        const oneProof = [proofs[0]];
        this.activeWebsocketConnections++;
        uIStore.triggerActivityOrb();
        const unsub = await this.wallet.onProofStateUpdates(
          oneProof,
          async (proofState: ProofState) => {
            console.log(`Websocket: proof state updated: ${proofState.state}`);
            if (proofState.state == CheckStateEnum.SPENT) {
              const tokenSpent = await this.checkTokenSpendable(historyToken);
              if (tokenSpent) {
                sendTokensStore.showSendTokens = false;
                unsub();
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
      quote: MeltQuoteResponse,
      mint: string,
      unit: string
    ) {
      this.invoiceHistory.push({
        amount: -(quote.amount + quote.fee_reserve),
        bolt11: this.payInvoiceData.input.request,
        quote: quote.quote,
        memo: "Outgoing invoice",
        date: currentDateStr(),
        status: "pending",
        mint: mint,
        unit: unit,
        meltQuote: quote,
      });
    },
    removeOutgoingInvoiceFromHistory: function (quote: string) {
      const index = this.invoiceHistory.findIndex((i) => i.quote === quote);
      if (index >= 0) {
        this.invoiceHistory.splice(index, 1);
      }
    },
    updateOutgoingInvoiceInHistory: function (
      quote: MeltQuoteResponse,
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
            if (options.amount) {
              i.amount = options.amount;
            }
            i.meltQuote = quote;
          }
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
      this.payInvoiceData.show = true;
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
        bolt12: offer,
        memo: decoded.description || "",
        msat: amountMsat,
        sat: Math.floor(amountMsat / 1000),
        fsat: amountMsat / 1000,
        description: decoded.description || "",
      } as any;
      this.payInvoiceData.invoice = Object.freeze(cleanOffer);
      if (
        cleanOffer.sat > 0 ||
        (this.payInvoiceData.input.amount &&
          this.payInvoiceData.input.amount > 0)
      ) {
        // If offer has fixed amount, force it
        if (cleanOffer.sat > 0) {
          this.payInvoiceData.input.amount = cleanOffer.sat;
        }
        await this.meltQuoteInvoiceData();
      }
    },
    decodeRequest: async function (req: string) {
      const p2pkStore = useP2PKStore();
      req = req.trim();
      this.payInvoiceData.input.request = req;
      if (req.toLowerCase().startsWith("lnbc")) {
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
      } else if (req.startsWith("bitcoin:")) {
        const lightningInvoice = req.match(/lightning=([^&]+)/);
        if (lightningInvoice) {
          const ln = lightningInvoice[1];
          if (ln.toLowerCase().startsWith("lno1")) {
            await this.handleBolt12Offer(ln);
          } else {
            this.payInvoiceData.input.request = ln;
            await this.handleBolt11InvoiceBolt11();
          }
        }
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
      } else if (req.startsWith("creqA")) {
        await this.handlePaymentRequest(req);
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
    handleOutputsHaveAlreadyBeenSignedError: function (
      keysetId: string,
      error: any
    ) {
      if (error.message.includes("outputs have already been signed")) {
        this.increaseKeysetCounter(keysetId, 10);
        notify(this.t("wallet.notifications.please_try_again"));
        return true;
      }
      return false;
    },
  },
});
