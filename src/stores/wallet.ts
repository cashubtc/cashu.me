import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useUiStore } from "src/stores/ui";
import { useP2PKStore } from "src/stores/p2pk";
import { useSendTokensStore } from "src/stores/sendTokensStore";

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
  CheckStatePayload,
  MeltQuotePayload,
  MeltQuoteResponse,
  generateNewMnemonic,
  deriveSeedFromMnemonic,
  AmountPreference,
  CheckStateEnum,
  getDecodedToken,
  Token,
  MeltQuoteState,
  MintQuoteState,
} from "@cashu/cashu-ts";
import { hashToCurve } from "@cashu/crypto/modules/common";
import * as bolt11Decoder from "light-bolt11-decoder";
import { bech32 } from "bech32";
import axios from "axios";
import { date } from "quasar";
import { splitAmount } from "@cashu/cashu-ts/dist/lib/es5/utils";

// HACK: this is a workaround so that the catch block in the melt function does not throw an error when the user exits the app
// before the payment is completed. This is necessary because the catch block in the melt function would otherwise remove all
// quotes from the invoiceHistory and the user would not be able to pay the invoice again after reopening the app.
let isUnloading = false;
window.addEventListener("beforeunload", () => {
  isUnloading = true;
});

type Invoice = {
  amount: number;
  bolt11: string;
  quote: string;
  memo: string;
};

type InvoiceHistory = Invoice & {
  date: string;
  status: "pending" | "paid";
  mint: string;
  unit?: string;
  token?: string;
};

type KeysetCounter = {
  id: string;
  counter: number;
};

const receiveStore = useReceiveTokensStore();
const tokenStore = useTokensStore();

export const useWalletStore = defineStore("wallet", {
  state: () => {
    return {
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
      payInvoiceData: {
        blocking: false,
        bolt11: "",
        show: false,
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
        },
        lnurlauth: {},
        input: {
          request: "",
          amount: null,
          comment: "",
          quote: "",
        } as {
          request: string;
          amount: number | null;
          comment: string;
          quote: string;
        },
      },
    };
  },
  getters: {
    wallet() {
      const mints = useMintsStore();
      const mint = new CashuMint(mints.activeMintUrl);
      if (this.mnemonic == "") {
        this.mnemonic = generateNewMnemonic();
      }
      const mnemonic: string = this.mnemonic;
      const wallet = new CashuWallet(mint, {
        mnemonicOrSeed: mnemonic,
        unit: mints.activeUnit,
      });
      return wallet;
    },
    seed(): Uint8Array {
      return deriveSeedFromMnemonic(this.mnemonic);
    },
  },
  actions: {
    newMnemonic: function () {
      // store old mnemonic and keysetCounters
      const oldMnemonicCounters = this.oldMnemonicCounters;
      const keysetCounters = this.keysetCounters;
      oldMnemonicCounters.push({ mnemonic: this.mnemonic, keysetCounters });
      this.keysetCounters = [];
      this.mnemonic = generateNewMnemonic();
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
        console.log("### increaseKeysetCounter", keysetCounter);
      } else {
        const newCounter = { id, counter: by } as KeysetCounter;
        this.keysetCounters.push(newCounter);
        console.log("### new keyset counter", keysetCounter);
      }
    },
    getKeyset(): string {
      const mintStore = useMintsStore();
      const keysets = mintStore.activeMint().keysets;
      if (keysets == null || keysets.length == 0) {
        throw new Error("no keysets found.");
      }
      const unitKeysets = mintStore
        .activeMint()
        .unitKeysets(mintStore.activeUnit);
      if (unitKeysets == null || unitKeysets.length == 0) {
        console.error("no keysets found for unit", mintStore.activeUnit);
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
        console.error("no active keysets found for unit", mintStore.activeUnit);
        throw new Error("no active keysets found for unit");
      }
      const keyset_id = sortedKeysets[0].id;
      const keys = mintStore
        .activeMint()
        .mint.keys.find((k) => k.id === keyset_id);
      if (keys) {
        this.wallet.keys = keys;
      }
      return keyset_id;
    },
    /**
     * Sets an invoice status to paid
     */
    setInvoicePaid(quoteId: string) {
      const invoice = this.invoiceHistory.find((i) => i.quote === quoteId);
      if (!invoice) return;
      invoice.status = "paid";
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
    outputAmountSelect: function (amount: number, target = 3) {
      // This function produces an amount split for outputs based on the current coins we have.
      // Its objective is to fill up the wallet so that it reaches `target` coins of each amount.
      // The coins we currently have are are this.activeProofs
      const mintStore = useMintsStore();
      const amountsWeHave = mintStore.activeProofs.map((p) => p.amount);
      /*
      # NOTE: Do not assume 2^n here. This is not a general case.
      */
      // calculate until 2^64
      const allPossibleAmounts = Array.from({ length: 64 }, (_, i) => 2 ** i);
      const amountsWeWantLL = allPossibleAmounts.map((a) => {
        const count = Math.max(
          0,
          target - amountsWeHave.filter((x) => x === a).length
        );
        return Array(count).fill(a);
      });
      const amountsWeWant = amountsWeWantLL.flat().sort((a, b) => a - b);

      let amounts: number[] = [];
      while (
        amounts.reduce((s, t) => (s += t), 0) < amount &&
        amountsWeWant.length
      ) {
        if (amounts.reduce((s, t) => (s += t), 0) + amountsWeWant[0] > amount) {
          break;
        }
        amounts.push(amountsWeWant.shift() as number);
      }
      const remainingAmount = amount - amounts.reduce((s, t) => (s += t), 0);
      if (remainingAmount > 0) {
        console.log("remaining amount", remainingAmount);
        // amount_split is the optimal 2^n split: splitAmount
        amounts = amounts.concat(this.splitAmount(remainingAmount));
      }
      if (amounts.reduce((s, t) => (s += t), 0) != amount) {
        throw new Error(`Amounts do not sum to ${amount}.`);
      }

      // make array of AmountPreference types which have a unique `amount` and its `count`
      const amountsWithCount: AmountPreference[] = [];
      amounts.forEach((a) => {
        const existing = amountsWithCount.find((ac) => ac.amount === a);
        if (existing) {
          existing.count += 1;
        } else {
          amountsWithCount.push({ amount: a, count: 1 });
        }
      });

      return amountsWithCount;
    },
    coinSelectSpendBase64: function (
      proofs: WalletProof[],
      amount: number
    ): WalletProof[] {
      const base64Proofs = proofs.filter((p) => !p.id.startsWith("00"));
      if (base64Proofs.length > 0) {
        base64Proofs.sort((a, b) => b.amount - a.amount);
        let sum = 0;
        let selectedProofs: WalletProof[] = [];
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
    coinSelect: function (proofs: WalletProof[], amount: number) {
      if (proofs.reduce((s, t) => (s += t.amount), 0) < amount) {
        // there are not enough proofs to pay the amount
        return [];
      }

      // override: if there are proofs with a base64 id, use them
      const base64Proofs = this.coinSelectSpendBase64(proofs, amount);
      if (
        base64Proofs.length > 0 &&
        base64Proofs.reduce((s, t) => (s += t.amount), 0) >= amount
      ) {
        return base64Proofs;
      }

      // sort proofs by amount ascending
      proofs = proofs.slice().sort((a, b) => a.amount - b.amount);
      // remember next bigger proof as a fallback
      const nextBigger = proofs.find((p) => p.amount > amount);

      // go through smaller proofs until sum is bigger than amount
      const smallerProofs = proofs.filter((p) => p.amount <= amount);
      // sort by amount descending
      smallerProofs.sort((a, b) => b.amount - a.amount);

      let selectedProofs: WalletProof[] = [];

      if (smallerProofs.length == 0 && nextBigger) {
        // if there are no smaller proofs, take the next bigger proof as a fallback
        return [nextBigger];
      } else if (smallerProofs.length == 0 && !nextBigger) {
        // no proofs available
        return [];
      }

      // recursively select the largest proof of smallerProofs, subtract the amount from the remainder
      // and call coinSelect again with the remainder and the rest of the smallerProofs (without the largest proof)
      let remainder = amount;
      selectedProofs = [smallerProofs[0]];
      remainder -= smallerProofs[0].amount;
      if (remainder > 0) {
        selectedProofs = selectedProofs.concat(
          this.coinSelect(smallerProofs.slice(1), remainder)
        );
      }
      let sum = selectedProofs.reduce((s, t) => (s += t.amount), 0);

      // if sum of selectedProofs is smaller than amount, take next bigger proof instead as a fallback
      if (sum < amount && nextBigger) {
        selectedProofs = [nextBigger];
      }

      // console.log("### selected amounts", "sum", selectedProofs.reduce((s, t) => (s += t.amount), 0), selectedProofs.map(p => p.amount));
      return selectedProofs;
    },
    spendableProofs: function (proofs: WalletProof[], amount: number) {
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const spendableProofs = proofsStore.getUnreservedProofs(proofs);
      if (proofsStore.sumProofs(spendableProofs) < amount) {
        const balance = mintStore.activeMintBalance();
        const unit = mintStore.activeUnit;
        notifyWarning(
          "Balance is too low",
          `${uIStore.formatCurrency(
            balance,
            unit
          )} is not enough to pay ${uIStore.formatCurrency(amount, unit)}.`
        );
        throw Error("Balance too low");
      }
      return spendableProofs;
    },
    sendToLock: async function (
      proofs: WalletProof[],
      amount: number,
      receiverPubkey: string
    ) {
      const spendableProofs = this.spendableProofs(proofs, amount);
      const proofsToSplit = this.coinSelect(spendableProofs, amount);
      const { returnChange: keepProofs, send: sendProofs } =
        await this.wallet.send(amount, proofsToSplit, {
          pubkey: receiverPubkey,
        });
      const mintStore = useMintsStore();
      // note: we do not store sendProofs in the proofs store but
      // expect from the caller to store it in the history
      mintStore.addProofs(keepProofs);
      mintStore.removeProofs(proofsToSplit);
      return { keepProofs, sendProofs };
    },
    splitToSend: async function (
      proofs: WalletProof[],
      amount: number,
      invalidate: boolean = false
    ): Promise<{ keepProofs: Proof[]; sendProofs: Proof[] }> {
      /*
      splits proofs so the user can keep firstProofs, send scndProofs.
      then sets scndProofs as reserved.

      if invalidate, scndProofs (the one to send) are invalidated
      */
      const mintStore = useMintsStore();
      const proofsStore = useProofsStore();
      const uIStore = useUiStore();
      let proofsToSplit: WalletProof[] = [];
      const keysetId = this.getKeyset();
      await uIStore.lockMutex();
      try {
        const spendableProofs = this.spendableProofs(proofs, amount);
        proofsToSplit = this.coinSelect(spendableProofs, amount);
        const totalAmount = proofsToSplit.reduce((s, t) => (s += t.amount), 0);
        proofsStore.setReserved(proofsToSplit, true);
        let keepProofs: Proof[] = [];
        let sendProofs: Proof[] = [];
        if (totalAmount != amount) {
          const counter = this.keysetCounter(keysetId);
          ({ returnChange: keepProofs, send: sendProofs } =
            await this.wallet.send(amount, proofsToSplit, { counter }));
          this.increaseKeysetCounter(
            keysetId,
            keepProofs.length + sendProofs.length
          );

          mintStore.removeProofs(proofsToSplit);

          mintStore.addProofs(keepProofs);
          mintStore.addProofs(sendProofs);
        } else if (totalAmount == amount) {
          keepProofs = [];
          sendProofs = proofsToSplit.map((p) => {
            return {
              amount: p.amount,
              secret: p.secret,
              C: p.C,
              id: p.id,
            };
          });
        } else {
          throw new Error("could not split proofs.");
        }

        if (invalidate) {
          mintStore.removeProofs(sendProofs);
        }

        return { keepProofs, sendProofs };
      } catch (error: any) {
        proofsStore.setReserved(proofsToSplit, false);
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
      uses split to receive new tokens.
      */
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const p2pkStore = useP2PKStore();

      receiveStore.showReceiveTokens = false;
      console.log("### receive tokens", receiveStore.receiveData.tokensBase64);

      if (receiveStore.receiveData.tokensBase64.length == 0) {
        throw new Error("no tokens provided.");
      }
      const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      let proofs = token.getProofs(tokenJson);

      // activate the mint and the unit
      await mintStore.activateMintUrl(
        token.getMint(tokenJson),
        false,
        false,
        tokenJson.unit
      );

      const amount = proofs.reduce((s, t) => (s += t.amount), 0);
      await uIStore.lockMutex();
      try {
        // redeem
        const keysetId = this.getKeyset();
        const counter = this.keysetCounter(keysetId);
        const preference = this.outputAmountSelect(amount);
        const privkey = receiveStore.receiveData.p2pkPrivateKey;
        const decodedToken = getDecodedToken(
          receiveStore.receiveData.tokensBase64
        );
        let tokenCts: Token;
        let proofs: Proof[];
        try {
          proofs = await this.wallet.receive(
            receiveStore.receiveData.tokensBase64,
            { counter, preference, privkey }
          );
          this.increaseKeysetCounter(keysetId, proofs.length);
        } catch (error: any) {
          console.error(error);
          this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
          throw new Error("Error receiving tokens: " + error);
        }
        // const proofs: Proof[] = tokenCts.token.map(t => t.proofs).flat();

        p2pkStore.setPrivateKeyUsed(privkey);

        mintStore.removeProofs(proofs);
        // gather all token.token[i].proofs
        mintStore.addProofs(proofs);

        // if token is already in history, set to paid, else add to history
        if (
          tokenStore.historyTokens.find(
            (t) => t.token === receiveStore.receiveData.tokensBase64
          )
        ) {
          tokenStore.setTokenPaid(receiveStore.receiveData.tokensBase64);
        } else {
          tokenStore.addPaidToken({
            amount,
            serializedProofs: receiveStore.receiveData.tokensBase64,
            unit: mintStore.activeUnit,
            mint: mintStore.activeMintUrl,
          });
        }

        if (!!window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess(
          "Received " + uIStore.formatCurrency(amount, mintStore.activeUnit)
        );
      } catch (error: any) {
        console.error(error);
        notifyApiError(error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
      // }
    },

    // /mint
    /**
     * Ask the mint to generate an invoice for the given amount
     * Upon paying the request, the mint will credit the wallet with
     * cashu tokens
     */
    requestMint: async function (amount?: number) {
      const mintStore = useMintsStore();
      const uIStore = useUiStore();

      if (amount) {
        this.invoiceData.amount = amount;
      }
      await uIStore.lockMutex();
      try {
        // create MintQuotePayload(this.invoiceData.amount) payload
        const payload: MintQuotePayload = {
          amount: this.invoiceData.amount,
          unit: mintStore.activeUnit,
        };
        const data = await mintStore.activeMint().api.createMintQuote(payload);
        this.invoiceData.bolt11 = data.request;
        this.invoiceData.quote = data.quote;
        this.invoiceData.date = currentDateStr();
        this.invoiceData.status = "pending";
        this.invoiceData.mint = mintStore.activeMintUrl;
        this.invoiceData.unit = mintStore.activeUnit;
        this.invoiceHistory.push({
          ...this.invoiceData,
        });
        return data;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error, "Could not request mint");
      } finally {
        uIStore.unlockMutex();
      }
    },
    mint: async function (
      amount: number,
      hash: string,
      verbose: boolean = true
    ) {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();
      const uIStore = useUiStore();
      const keysetId = this.getKeyset();
      await uIStore.lockMutex();
      try {
        // first we check if the mint quote is paid
        const mintQuote = await mintStore.activeMint().api.checkMintQuote(hash);
        console.log("### mintQuote", mintQuote);
        if (mintQuote.state != MintQuoteState.PAID) {
          console.log("### mintQuote not paid yet");
          if (verbose) {
            notify("Invoice still pending");
          }
          throw new Error("invoice not paid yet.");
        }
        const counter = this.keysetCounter(keysetId);
        const preference = this.outputAmountSelect(amount);
        console.log("### preference", preference);
        const { proofs } = await this.wallet.mintTokens(amount, hash, {
          keysetId,
          counter,
          preference: preference,
        });
        this.increaseKeysetCounter(keysetId, proofs.length);

        // const proofs = await this.mintApi(split, hash, verbose);
        if (!proofs.length) {
          throw "could not mint";
        }
        mintStore.addProofs(proofs);

        // update UI
        await this.setInvoicePaid(hash);
        const serializedProofs = proofsStore.serializeProofs(proofs);
        if (serializedProofs == null) {
          throw new Error("could not serialize proofs.");
        }
        tokenStore.addPaidToken({
          amount,
          serializedProofs: serializedProofs,
          unit: mintStore.activeUnit,
          mint: mintStore.activeMintUrl,
        });

        return proofs;
      } catch (error: any) {
        console.error(error);
        if (verbose) {
          notifyApiError(error);
        }
        this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
    },
    // get a melt quote
    meltQuote: async function () {
      const uIStore = useUiStore();
      // throw an error if this.payInvoiceData.blocking is true
      if (this.payInvoiceData.blocking) {
        throw new Error("already processing an melt quote.");
      }
      this.payInvoiceData.blocking = true;
      this.payInvoiceData.meltQuote.error = "";
      await uIStore.lockMutex();
      try {
        const mintStore = useMintsStore();
        if (this.payInvoiceData.input.request == "") {
          throw new Error("no invoice provided.");
        }
        const payload: MeltQuotePayload = {
          unit: mintStore.activeUnit,
          request: this.payInvoiceData.input.request,
        };
        this.payInvoiceData.meltQuote.payload = payload;
        const data = await mintStore.activeMint().api.createMeltQuote(payload);
        mintStore.assertMintError(data);
        this.payInvoiceData.meltQuote.response = data;
        console.log("#### meltQuote", payload, " response:", data);
        this.payInvoiceData.blocking = false;
        return data;
      } catch (error: any) {
        this.payInvoiceData.blocking = false;
        this.payInvoiceData.meltQuote.error = error;
        console.error(error);
        notifyApiError(error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
    },
    melt: async function () {
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();

      // throw an error if this.payInvoiceData.blocking is true
      if (this.payInvoiceData.blocking) {
        throw new Error("already processing an invoice.");
      }
      console.log("#### pay lightning");
      if (this.payInvoiceData.invoice == null) {
        throw new Error("no invoice provided.");
      }
      const invoice = this.payInvoiceData.invoice.bolt11;
      // throw an error if the invoice is already in invoiceHistory
      if (
        this.invoiceHistory.find(
          (i) => i.bolt11 === invoice && i.amount < 0 && i.status === "paid"
        )
      ) {
        notifyError("Invoice already paid.");
        throw new Error("invoice already paid.");
      }

      const amount_invoice = this.payInvoiceData.invoice.sat;
      const quote = this.payInvoiceData.meltQuote.response;
      if (quote == null) {
        throw new Error("no quote found.");
      }
      const amount = quote.amount + quote.fee_reserve;

      console.log(
        "#### amount invoice",
        amount_invoice,
        "amount with fees",
        amount
      );
      let countChangeOutputs = 0;
      const keysetId = this.getKeyset();
      let keysetCounterIncrease = 0;

      // get right amount of proofs to send
      const { keepProofs, sendProofs } = await this.splitToSend(
        mintStore.activeMint().unitProofs(mintStore.activeUnit),
        amount
      );
      if (sendProofs.length == 0) {
        throw new Error("could not split proofs.");
      }
      // start melt
      await uIStore.lockMutex();
      try {
        // proof management
        const serializedSendProofs = proofsStore.serializeProofs(sendProofs);
        if (serializedSendProofs == null) {
          throw new Error("could not serialize proofs.");
        }
        proofsStore.setReserved(sendProofs, true);
        await this.addOutgoingPendingInvoiceToHistory(
          quote,
          serializedSendProofs
        );

        // NUT-08 blank outputs for change
        const counter = this.keysetCounter(keysetId);

        // QUIRK: we increase the keyset counter by sendProofs and the maximum number of possible change outputs
        // this way, in case the user exits the app before payLnInvoice is completed, the returned change outputs won't cause a "outputs already signed" error
        // if the payment fails, we decrease the counter again
        this.increaseKeysetCounter(keysetId, sendProofs.length);
        if (quote.fee_reserve > 0) {
          countChangeOutputs = Math.ceil(Math.log2(quote.fee_reserve)) || 1;
          this.increaseKeysetCounter(keysetId, countChangeOutputs);
          keysetCounterIncrease += countChangeOutputs;
        }

        // NOTE: if the user exits the app while we're in the API call, JS will emit an error that we would catch below!
        // We have to handle that case in the catch block below
        const data = await this.wallet.payLnInvoice(
          invoice,
          sendProofs,
          quote,
          { keysetId, counter }
        );

        if (data.isPaid != true) {
          throw new Error("Invoice not paid.");
        }
        let amount_paid = amount - proofsStore.sumProofs(data.change);
        if (!!window.navigator.vibrate) navigator.vibrate(200);

        notifySuccess(
          "Paid " +
            uIStore.formatCurrency(amount_paid, mintStore.activeUnit) +
            " via Lightning"
        );
        console.log("#### pay lightning: token paid");
        // delete spent tokens from db
        mintStore.removeProofs(sendProofs);

        // NUT-08 get change
        if (data.change != null) {
          const changeProofs = data.change;
          console.log(
            "## Received change: " + proofsStore.sumProofs(changeProofs)
          );
          mintStore.addProofs(changeProofs);
        }

        tokenStore.addPaidToken({
          amount: -amount_paid,
          serializedProofs: serializedSendProofs,
          unit: mintStore.activeUnit,
          mint: mintStore.activeMintUrl,
        });

        this.updateInvoiceInHistory(quote, {
          status: "paid",
          amount: -amount_paid,
        });

        this.payInvoiceData.invoice = { sat: 0, memo: "", bolt11: "" };
        this.payInvoiceData.show = false;
        return data;
      } catch (error: any) {
        if (isUnloading) {
          // NOTE: An error is thrown when the user exits the app while the payment is in progress.
          // do not handle the error if the user exits the app
          throw error;
        }
        // get quote and check state
        const mintQuote = await mintStore
          .activeMint()
          .api.checkMeltQuote(quote.quote);
        if (
          mintQuote.state == MeltQuoteState.PAID ||
          mintQuote.state == MeltQuoteState.PENDING
        ) {
          console.log(
            "### melt: error, but quote is paid or pending. not rolling back."
          );
          throw error;
        }
        // roll back proof management and keyset counter
        proofsStore.setReserved(sendProofs, false);
        this.increaseKeysetCounter(keysetId, -keysetCounterIncrease);
        this.removeOutgoingInvoiceFromHistory(quote.quote);

        console.error(error);
        this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
        notifyApiError(error, "Payment failed");
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
    },
    getProofState: async function (proofs: Proof[]) {
      const mintStore = useMintsStore();
      const enc = new TextEncoder();
      const Ys = proofs.map((p) =>
        hashToCurve(enc.encode(p.secret)).toHex(true)
      );
      const payload = { Ys: Ys };
      const { states } = await new CashuMint(mintStore.activeMintUrl).check(
        payload
      );
      return states;
    },
    // /check
    checkProofsSpendable: async function (
      proofs: Proof[],
      update_history = false
    ) {
      /*
      checks with the mint whether an array of proofs is still
      spendable or already invalidated
      */
      const mintStore = useMintsStore();
      const proofsStore = useProofsStore();
      const tokenStore = useTokensStore();
      if (proofs.length == 0) {
        return;
      }
      const enc = new TextEncoder();
      const payload: CheckStatePayload = {
        // Ys is hashToCurve of the secret of proofs
        Ys: proofs.map((p) => hashToCurve(enc.encode(p.secret)).toHex(true)),
      };
      try {
        const spentProofs = await this.wallet.checkProofsSpent(proofs);
        // const data = await mintStore.activeMint().api.check(payload);
        // mintStore.assertMintError(data);
        if (spentProofs.length) {
          mintStore.removeProofs(spentProofs);

          // update UI
          const serializedProofs = proofsStore.serializeProofs(spentProofs);
          if (serializedProofs == null) {
            throw new Error("could not serialize proofs.");
          }
          if (update_history) {
            tokenStore.addPaidToken({
              amount: -proofsStore.sumProofs(spentProofs),
              serializedProofs: serializedProofs,
              unit: mintStore.activeUnit,
              mint: mintStore.activeMintUrl,
            });
          }
        }
        // return unspent proofs
        return spentProofs;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error);
        throw error;
      }
    },
    checkTokenSpendable: async function (
      tokenStr: string,
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

      const tokenJson = token.decode(tokenStr);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      const proofs = token.getProofs(tokenJson);

      // activate the mint
      const mintInToken = token.getMint(tokenJson);
      await mintStore.activateMintUrl(mintInToken);

      const spentProofs = await this.checkProofsSpendable(proofs);
      if (spentProofs != undefined && spentProofs.length == proofs.length) {
        // all proofs are spent, set token to paid
        tokenStore.setTokenPaid(tokenStr);
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
          const historyToken = tokenStore.editHistoryToken(tokenStr, {
            newAmount: spentAmount,
            newStatus: "paid",
            newToken: serializedSpentProofs,
          });
          // add all unspent proofs back to the history
          // QUICK: we use the historyToken object here because we don't know if the transaction is incoming or outgoing (we don't know the sign of the amount)
          if (historyToken) {
            tokenStore.addPendingToken({
              amount: unspentAmount * Math.sign(historyToken.amount),
              serializedProofs: serializedUnspentProofs,
              unit: historyToken.unit,
              mint: historyToken.mint,
            });
          }
        }
      }
      if (spentProofs != undefined && spentProofs.length) {
        if (!!window.navigator.vibrate) navigator.vibrate(200);
        const proofStore = useProofsStore();
        notifySuccess(
          "Sent " +
            uIStore.formatCurrency(
              proofStore.sumProofs(spentProofs),
              mintStore.activeUnit
            )
        );
      } else {
        console.log("### token not paid yet");
        if (verbose) {
          notify("Token still pending");
        }
        return false;
      }
      return true;
    },
    checkInvoice: async function (quote: string, verbose = true) {
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      console.log("### checkInvoice.quote", quote);
      const invoice = this.invoiceHistory.find((i) => i.quote === quote);
      if (!invoice) {
        throw new Error("invoice not found");
      }
      try {
        // activate the mint
        await mintStore.activateMintUrl(
          invoice.mint,
          false,
          false,
          invoice.unit
        );

        const proofs = await this.mint(invoice.amount, invoice.quote, verbose);
        if (!!window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess(
          "Received " +
            uIStore.formatCurrency(invoice.amount, mintStore.activeUnit) +
            " via Lightning"
        );
        return proofs;
      } catch (error) {
        if (verbose) {
          notify("Invoice still pending");
        }
        console.log("Invoice still pending", invoice.quote);
        throw error;
      }
    },
    checkOutgoingInvoice: async function (quote: string, verbose = true) {
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const invoice = this.invoiceHistory.find((i) => i.quote === quote);
      if (!invoice) {
        throw new Error("invoice not found");
      }
      try {
        await mintStore.activateMintUrl(
          invoice.mint,
          false,
          false,
          invoice.unit
        );
        // this is an outgoing invoice, we first do a getMintQuote to check if the invoice is paid
        const mintQuote = await mintStore
          .activeMint()
          .api.checkMeltQuote(quote);
        console.log("### mintQuote", mintQuote);
        if (mintQuote.state != MeltQuoteState.PAID) {
          console.log("### mintQuote not paid yet");
          if (invoice.token) {
            const tokenJson = token.decode(invoice.token);
            if (tokenJson == undefined) {
              throw new Error("no tokens provided.");
            }
            let proofs = token.getProofs(tokenJson);
            if (proofs.length == 0) {
              throw new Error("no proofs found.");
            }
            const states = await this.getProofState(proofs);
            // if all proofs are CheckStateEnum.PENDING, we notify that the invoice is still pending
            if (states.every((s) => s.state === CheckStateEnum.PENDING)) {
              if (verbose) {
                notify("Invoice still pending");
              }
              throw new Error("invoice not paid yet.");
            }
            // if all proofs are CheckStateEnum.UNSPENT, we assume that the payment failed and we unset the proofs as reserved
            // and remove the invoice from the history
            if (states.every((s) => s.state === CheckStateEnum.UNSPENT)) {
              useProofsStore().setReserved(proofs, false);
              this.removeOutgoingInvoiceFromHistory(quote);
              notifyWarning("Lightning payment failed");
            }
            //
          } else {
            throw new Error("no token in invoice.");
          }
        } else {
          // if the invoice is paid, we check if all proofs are spent and if so, we invalidate them and set the invoice state in the history to "paid"
          if (invoice.token) {
            const tokenJson = token.decode(invoice.token);
            if (tokenJson == undefined) {
              throw new Error("no tokens provided.");
            }
            let proofs = token.getProofs(tokenJson);
            if (proofs.length == 0) {
              throw new Error("no proofs found.");
            }
            const spentProofs = await this.checkProofsSpendable(proofs, true);
            if (
              spentProofs != undefined &&
              spentProofs.length == proofs.length
            ) {
              if (!!window.navigator.vibrate) navigator.vibrate(200);
              notifySuccess(
                "Sent " +
                  uIStore.formatCurrency(
                    useProofsStore().sumProofs(spentProofs),
                    mintStore.activeUnit
                  )
              );
            }
            // set invoice in history to paid
            this.setInvoicePaid(quote);
          }
        }
      } catch (error: any) {
        if (verbose) {
          notifyApiError(error);
        }
        console.log("Could not check quote", invoice.quote, error);
        throw error;
      }
    },
    ////////////// UI HELPERS //////////////
    addOutgoingPendingInvoiceToHistory: function (
      quote: MeltQuoteResponse,
      serlializedToken?: string
    ) {
      const mintStore = useMintsStore();
      this.invoiceHistory.push({
        amount: -(quote.amount + quote.fee_reserve),
        bolt11: this.payInvoiceData.input.request,
        quote: quote.quote,
        memo: "Outgoing invoice",
        date: currentDateStr(),
        status: "pending",
        mint: mintStore.activeMintUrl,
        token: serlializedToken,
      });
    },
    removeOutgoingInvoiceFromHistory: function (quote: string) {
      const index = this.invoiceHistory.findIndex((i) => i.quote === quote);
      if (index >= 0) {
        this.invoiceHistory.splice(index, 1);
      }
    },
    updateInvoiceInHistory: function (
      quote: MeltQuoteResponse,
      options?: { status?: "pending" | "paid"; amount?: number }
    ) {
      this.invoiceHistory
        .filter((i) => i.quote === quote.quote)
        .forEach((i) => {
          if (options) {
            if (options.status) {
              i.status = options.status;
            }
            if (options.amount) {
              i.amount = options.amount;
            }
          }
        });
    },
    // checkPendingInvoices: async function (verbose: boolean = true) {
    //   const last_n = 10;
    //   let i = 0;
    //   for (const invoice of this.invoiceHistory.slice().reverse()) {
    //     if (i >= last_n) {
    //       break;
    //     }
    //     if (invoice.status === "pending" && invoice.amount > 0) {
    //       console.log("### checkPendingInvoices", invoice.quote)
    //       try {
    //         await this.checkInvoice(invoice.quote, verbose);
    //       } catch (error) {
    //         console.log(`${invoice.quote} still pending`);
    //         throw error;
    //       }
    //     }
    //     i += 1;
    //   }
    // },
    checkPendingTokens: async function (verbose: boolean = true) {
      const tokenStore = useTokensStore();
      const last_n = 5;
      let i = 0;
      // invert for loop
      for (const t of tokenStore.historyTokens.slice().reverse()) {
        if (i >= last_n) {
          break;
        }
        if (t.status === "pending" && t.amount < 0) {
          console.log("### checkPendingTokens", t.token);
          this.checkTokenSpendable(t.token, verbose);
          i += 1;
        }
      }
    },
    handleBolt11Invoice: async function () {
      this.payInvoiceData.show = true;
      let invoice;
      try {
        invoice = bolt11Decoder.decode(this.payInvoiceData.input.request);
      } catch (error) {
        notifyWarning("Failed to decode invoice", undefined, 3000);
        this.payInvoiceData.show = false;
        throw error;
      }
      let cleanInvoice = {
        bolt11: invoice.paymentRequest,
        memo: "",
        msat: 0,
        sat: 0,
        fsat: 0,
        hash: "",
        description: "",
        timestamp: 0,
        expireDate: "",
        expired: false,
      };
      _.each(invoice.sections, (tag) => {
        if (_.isObject(tag) && _.has(tag, "name")) {
          if (tag.name === "amount") {
            cleanInvoice.msat = tag.value;
            cleanInvoice.sat = tag.value / 1000;
            cleanInvoice.fsat = cleanInvoice.sat;
          } else if (tag.name === "payment_hash") {
            cleanInvoice.hash = tag.value;
          } else if (tag.name === "description") {
            cleanInvoice.description = tag.value;
          } else if (tag.name === "timestamp") {
            cleanInvoice.timestamp = tag.value;
          } else if (tag.name === "expiry") {
            var expireDate = new Date(
              (cleanInvoice.timestamp + tag.value) * 1000
            );
            cleanInvoice.expireDate = date.formatDate(
              expireDate,
              "YYYY-MM-DDTHH:mm:ss.SSSZ"
            );
            cleanInvoice.expired = false; // TODO
          }
        }
      });

      this.payInvoiceData.invoice = Object.freeze(cleanInvoice);
      // get quote for this request
      await this.meltQuote();
    },
    handleCashuToken: function () {
      this.payInvoiceData.show = false;
      receiveStore.showReceiveTokens = true;
    },
    handleP2PK: function (req: string) {
      const sendTokenStore = useSendTokensStore();
      sendTokenStore.sendData.p2pkPubkey = req;
      sendTokenStore.showSendTokens = true;
      sendTokenStore.showLockInput = true;
    },
    decodeRequest: async function (req: string) {
      const p2pkStore = useP2PKStore();
      this.payInvoiceData.input.request = req;
      if (req.toLowerCase().startsWith("lnbc")) {
        this.payInvoiceData.input.request = req;
        await this.handleBolt11Invoice();
      } else if (req.toLowerCase().startsWith("lightning:")) {
        this.payInvoiceData.input.request = req.slice(10);
        await this.handleBolt11Invoice();
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
      } else if (req.indexOf("cashuA") !== -1) {
        // very dirty way of parsing cashu tokens from either a pasted token or a URL like https://host.com?token=eyJwcm
        receiveStore.receiveData.tokensBase64 = req.slice(
          req.indexOf("cashuA")
        );
        this.handleCashuToken();
      } else if (req.indexOf("cashuB") !== -1) {
        receiveStore.receiveData.tokensBase64 = req.slice(
          req.indexOf("cashuB")
        );
        this.handleCashuToken();
      } else if (p2pkStore.isValidPubkey(req)) {
        this.handleP2PK(req);
      } else if (req.startsWith("http")) {
        const mintStore = useMintsStore();
        mintStore.addMintData = { url: req, nickname: "" };
      }
    },
    fetchBitcoinPriceUSD: async function () {
      var { data } = await axios.get(
        "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
      );
      return data.data.rates.USD;
    },
    lnurlPayFirst: async function (address: string) {
      var host;
      var data;
      if (address.split("@").length == 2) {
        let [user, lnaddresshost] = address.split("@");
        host = `https://${lnaddresshost}/.well-known/lnurlp/${user}`;
        const resp = await axios.get(host); // Moved it here: we don't want 2 potential calls
        data = resp.data;
      } else if (address.toLowerCase().slice(0, 6) === "lnurl1") {
        let decoded = bech32.decode(address, 20000);
        const words = bech32.fromWords(decoded.words);
        const uint8Array = new Uint8Array(words);
        host = new TextDecoder().decode(uint8Array);

        const resp = await axios.get(host);
        data = resp.data;
      }
      if (host == undefined) {
        notifyError("Invalid LNURL", "LNURL Error");
        return;
      }
      if (data.tag == "payRequest") {
        this.payInvoiceData.lnurlpay = data;
        this.payInvoiceData.lnurlpay.domain = host
          .split("https://")[1]
          .split("/")[0];
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
          amount: null,
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
        notifyError("No amount", "LNURL Error");
        return;
      }
      if (this.payInvoiceData.lnurlpay == null) {
        notifyError("No LNURL data", "LNURL Error");
        return;
      }
      if (
        this.payInvoiceData.lnurlpay.tag == "payRequest" &&
        this.payInvoiceData.lnurlpay.minSendable <= amount * 1000 &&
        this.payInvoiceData.lnurlpay.maxSendable >= amount * 1000
      ) {
        if (mintStore.activeUnit == "usd") {
          try {
            var priceUsd = await this.fetchBitcoinPriceUSD();
          } catch (e) {
            notifyError(
              "Couldn't get Bitcoin price",
              "fetchBitcoinPriceUSD Error"
            );
            return;
          }

          const satPrice = 1 / (priceUsd / 1e8);
          const usdAmount = amount;
          amount = Math.floor(usdAmount * satPrice);
          console.log(`converted amount: ${amount}`);
        }
        var { data } = await axios.get(
          `${this.payInvoiceData.lnurlpay.callback}?amount=${amount * 1000}`
        );
        // check http error
        if (data.status == "ERROR") {
          notifyError(data.reason, "LNURL Error");
          return;
        }
        console.log(data.pr);
        console.log(`callback: ${this.payInvoiceData.lnurlpay.callback}`);
        await this.decodeRequest(data.pr);
      }
    },
    generateNewMnemonic: function () {
      if (this.mnemonic == "") {
        this.mnemonic = generateNewMnemonic();
      }
      return this.mnemonic;
    },
    handleOutputsHaveAlreadyBeenSignedError: function (
      keysetId: string,
      error: any
    ) {
      if (error.message.includes("outputs have already been signed")) {
        this.increaseKeysetCounter(keysetId, 10);
        notify("Please try again.");
        return true;
      }
      return false;
    },
  },
});
