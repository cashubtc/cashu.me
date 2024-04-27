import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore, WalletProof } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useCameraStore } from "./camera";
import { useUiStore } from "src/stores/ui";

import { step1Alice, step3Alice } from "src/js/dhke";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { secp256k1 } from '@noble/curves/secp256k1';

import { splitAmount } from "src/js/utils";
import * as _ from "underscore";
import { uint8ToBase64 } from "src/js/base64";
import token from "src/js/token";
import { notifyApiError, notifyError, notifySuccess, notifyWarning, notify } from "src/js/notify";
import { CashuMint, CashuWallet, Proof, SerializedBlindedSignature, MintKeys, MintQuotePayload, SplitPayload, MintPayload, MeltPayload, CheckStatePayload, MeltQuotePayload, MeltQuoteResponse, generateNewMnemonic, deriveSeedFromMnemonic } from "@cashu/cashu-ts";
import { blindMessage, hashToCurve } from "@cashu/cashu-ts/dist/lib/es5/DHKE";
import * as bolt11Decoder from "light-bolt11-decoder";
import bech32 from "bech32";
import axios from "axios";
import { date } from "quasar";

type Invoice = {
  amount: number;
  bolt11: string;
  quote: string;
  memo: string;
};

type InvoiceHistory = Invoice & {
  date: string;
  status: "pending" | "paid";
  mint?: string;
  unit?: string;
};

type KeysetCounter = {
  id: string;
  counter: number;
};

const receiveStore = useReceiveTokensStore();
const tokenStore = useTokensStore();
const uIStore = useUiStore();

export const useWalletStore = defineStore("wallet", {
  state: () => {
    return {
      mnemonic: useLocalStorage("cashu.mnemonic", ""),
      invoiceHistory: useLocalStorage(
        "cashu.invoiceHistory",
        [] as InvoiceHistory[]
      ),
      keysetCounters: useLocalStorage("cashu.keysetCounters", [] as KeysetCounter[]),
      oldMnemonicCounters: useLocalStorage("cashu.oldMnemonicCounters", [] as { mnemonic: string, keysetCounters: KeysetCounter[] }[]),
      invoiceData: {
        amount: 0,
        memo: "",
        bolt11: "",
        quote: "",
      } as Invoice,
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
        },
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
          amount: 0,
          comment: "",
          quote: "",
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
      const wallet = new CashuWallet(mint, { mnemonicOrSeed: mnemonic, unit: mints.activeUnit });
      return wallet;
    },
    seed(): Uint8Array {
      return deriveSeedFromMnemonic(this.mnemonic);
    }
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
        return 0;
      }
    },
    increaseKeysetCounter: function (id: string, by: number) {
      const keysetCounter = this.keysetCounters.find((c) => c.id === id);
      if (keysetCounter) {
        keysetCounter.counter += by;
      } else {
        this.keysetCounters.push({ id, counter: by });
      }
    },
    getKeyset(): string {
      const mintStore = useMintsStore();
      const keysets = mintStore.activeMint().keysets;
      if (keysets == null || keysets.length == 0) {
        throw new Error("no keysets found.");
      }
      const unitKeysets = mintStore.activeMint().unitKeysets(mintStore.activeUnit)
      if (unitKeysets == null || unitKeysets.length == 0) {
        console.error("no keysets found for unit", mintStore.activeUnit);
        throw new Error("no keysets found for unit");
      }
      const keyset_id = unitKeysets[0].id;
      const keys = mintStore.activeMint().mint.keys.find((k) => k.id === keyset_id);
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
    splitToSend: async function (proofs: WalletProof[], amount: number, invlalidate: boolean = false) {
      /*
      splits proofs so the user can keep firstProofs, send scndProofs.
      then sets scndProofs as reserved.

      if invalidate, scndProofs (the one to send) are invalidated
      */
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        const spendableProofs = proofsStore.getUnreservedProofs(proofs);
        if (proofsStore.sumProofs(spendableProofs) < amount) {
          const balance = await mintStore.getBalance();
          notifyWarning(
            "Balance is too low.",
            `Your balance is ${balance} sat and you're trying to pay ${amount} sats.`
          );
          throw Error("balance too low.");
        }

        // coin selection: sort and select proofs until amount is reached
        spendableProofs.sort((a, b) => a.amount - b.amount);
        let sum = 0;
        let i = 0;
        while (sum < amount) {
          sum += spendableProofs[i].amount;
          i += 1;
        }
        const proofsToSplit = spendableProofs.slice(0, i);

        const keysetId = this.getKeyset()
        const counter = this.keysetCounter(keysetId);
        const { returnChange: keepProofs, send: sendProofs } = await this.wallet.send(amount, proofsToSplit, { counter: counter })
        this.increaseKeysetCounter(keysetId, keepProofs.length + sendProofs.length);

        mintStore.addProofs(keepProofs);
        mintStore.addProofs(sendProofs);

        if (invlalidate) {
          mintStore.removeProofs(sendProofs);
        }

        mintStore.removeProofs(proofsToSplit);

        return { keepProofs, sendProofs };
      } catch (error: any) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch { }
        throw error;
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
      const mintStore = useMintsStore();
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

      if (token.getMint(tokenJson) != mintStore.activeMintUrl) {
        await mintStore.activateMintUrl(token.getMint(tokenJson));
      }
      const amount = proofs.reduce((s, t) => (s += t.amount), 0);

      // set unit to unit in token
      if (tokenJson.unit != undefined) {
        mintStore.activeUnit = tokenJson.unit
      }
      try {
        // redeem
        // await this.split(proofs, amount);
        const keysetId = this.getKeyset()
        const counter = this.keysetCounter(keysetId)
        const { token: tokenReceived, tokensWithErrors } = await this.wallet.receive(receiveStore.receiveData.tokensBase64, { counter })
        if (tokensWithErrors?.token || tokenReceived.token.length == 0) {
          throw new Error("Error receiving tokens");
        }

        // this.increaseKeysetCounter(keysetId, tokenReceived.token[0].proofs.length);
        this.increaseKeysetCounter(keysetId, tokenReceived.token.map(t => t.proofs.length).reduce((a, b) => a + b, 0));

        mintStore.removeProofs(proofs);
        // gather all token.token[i].proofs
        const receivedProofs = tokenReceived.token.map((t) => t.proofs).flat();
        mintStore.addProofs(receivedProofs);

        tokenStore.addPaidToken({
          amount,
          serializedProofs: receiveStore.receiveData.tokensBase64,
          unit: mintStore.activeUnit,
        });

        if (!!window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Ecash Received");
      } catch (error: any) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch { }
        throw error;
      }
      // }
    },
    // SPLIT

    split: async function (proofs: WalletProof[], amount: number) {
      /*
      supplies proofs and requests a split from the mint of these
      proofs at a specific amount
      */
      const mintStore = useMintsStore();
      try {
        if (proofs.length == 0) {
          throw new Error("no proofs provided.");
        }
        // let { firstProofs, scndProofs } = await this.splitApi(proofs, amount);
        const keyset_id = this.getKeyset();
        const counter = this.keysetCounter(keyset_id);
        const { returnChange: firstProofs, send: scndProofs } = await this.wallet.send(amount, proofs, { counter: counter })
        this.increaseKeysetCounter(keyset_id, firstProofs.length + scndProofs.length);

        mintStore.removeProofs(proofs);
        // add new firstProofs, scndProofs to this.proofs
        mintStore.addProofs(
          firstProofs.concat(scndProofs)
        );
        return { firstProofs, scndProofs };
      } catch (error: any) {
        console.error(error);
        try {
          try {
            notifyApiError(error);
          } catch { }
        } catch { }
        throw error;
      }
    },

    // /mint
    /**
     * Ask the mint to generate an invoice for the given amount
     * Upon paying the request, the mint will credit the wallet with
     * cashu tokens
     */
    requestMint: async function (amount?: number) {
      const mintStore = useMintsStore();
      if (amount) {
        this.invoiceData.amount = amount;
      }
      try {
        // create MintQuotePayload(this.invoiceData.amount) payload
        const payload: MintQuotePayload = {
          amount: this.invoiceData.amount, unit: mintStore.activeUnit
        };
        const data = await mintStore.activeMint().api.mintQuote(
          payload
        );
        this.invoiceData.bolt11 = data.request;
        this.invoiceData.quote = data.quote;
        this.invoiceHistory.push({
          ...this.invoiceData,
          date: currentDateStr(),
          status: "pending",
          mint: mintStore.activeMintUrl,
          unit: mintStore.activeUnit
        });
        return data;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error, "Could not request mint");
      }
    },
    mint: async function (amount: number, hash: string, verbose: boolean = true) {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();

      try {
        // const split = splitAmount(amount);
        const keysetId = this.getKeyset()
        const counter = this.keysetCounter(keysetId)
        const { proofs } = await this.wallet.mintTokens(amount, hash, { keysetId, counter })
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
        });

        return proofs;
      } catch (error: any) {
        console.error(error);
        if (verbose) {
          try {
            notifyApiError(error);
          } catch { }
        }
        throw error;
      }
    },
    melt: async function () {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();

      this.payInvoiceData.blocking = true;
      console.log("#### pay lightning");
      if (this.payInvoiceData.invoice == null) {
        throw new Error("no invoice provided.");
      }
      const invoice = this.payInvoiceData.invoice.bolt11;
      const amount_invoice = this.payInvoiceData.invoice.sat;
      // const quote = await this.meltQuote(this.payInvoiceData.input.request);
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
      const { keepProofs, sendProofs } = await this.splitToSend(
        mintStore.activeMint().proofsUnit(mintStore.activeUnit),
        amount
      );
      proofsStore.setReserved(sendProofs, true);
      try {
        // NUT-08 blank outputs for change
        let n_outputs = Math.max(Math.ceil(Math.log2(quote.fee_reserve)), 1);
        let amounts = Array.from({ length: n_outputs }, () => 1);

        // const unitKeysets = mintStore.activeMint().unitKeysets(mintStore.activeUnit)
        // if (unitKeysets == null || unitKeysets.length == 0) {
        //   console.error("no keysets found for unit", mintStore.activeUnit);
        //   throw new Error("no keysets found for unit");
        // }
        // const keyset_id = unitKeysets[0].id;

        const keysetId = this.getKeyset();
        const counter = this.keysetCounter(keysetId);
        const data = await this.wallet.payLnInvoice(invoice, sendProofs, quote, { keysetId, counter })

        if (data.isPaid != true) {
          throw new Error("Invoice not paid.");
        }
        // let secrets = await this.generateSecrets(keyset_id, counters);
        // let outputs = await this.constructOutputs(amounts, keyset_id, counters);

        let amount_paid = amount;
        // const payload: MeltPayload = {
        //   inputs: sendProofs.flat(),
        //   outputs: outputs,
        //   quote: quote.quote,
        // };
        // const data = await mintStore.activeMint().api.melt(payload);
        // mintStore.assertMintError(data);
        // if (data.paid != true) {
        //   throw new Error("Invoice not paid.");
        // }

        if (!!window.navigator.vibrate) navigator.vibrate(200);

        notifySuccess("Invoice Paid");
        console.log("#### pay lightning: token paid");
        // delete spent tokens from db
        mintStore.removeProofs(sendProofs);

        // NUT-08 get change
        if (data.change != null) {
          const changeProofs = data.change;
          // const changeProofs = await this.constructProofs(
          //   data.change,
          //   keyset_id,
          //   counters
          // );
          console.log(
            "## Received change: " + proofsStore.sumProofs(changeProofs)
          );
          amount_paid = amount_paid - proofsStore.sumProofs(changeProofs);
          mintStore.addProofs(changeProofs);
        }
        // update UI
        const serializedProofs = proofsStore.serializeProofs(sendProofs);
        if (serializedProofs == null) {
          throw new Error("could not serialize proofs.");
        }
        tokenStore.addPaidToken({
          amount: -amount_paid,
          serializedProofs: serializedProofs,
          unit: mintStore.activeUnit,
        });

        this.invoiceHistory.push({
          amount: -amount_paid,
          bolt11: this.payInvoiceData.input.request,
          quote: quote.quote,
          memo: "fixme",
          date: currentDateStr(),
          status: "paid",
          mint: mintStore.activeMintUrl,
        });

        this.payInvoiceData.invoice = { sat: 0, memo: "", bolt11: "" };
        this.payInvoiceData.show = false;
        this.payInvoiceData.blocking = false;
      } catch (error) {
        this.payInvoiceData.blocking = false;
        proofsStore.setReserved(sendProofs, false);
        console.error(error);
        throw error;
      }
    },

    // get a melt quote
    meltQuote: async function () {
      this.payInvoiceData.blocking = true;
      const mintStore = useMintsStore();
      if (this.payInvoiceData.input.request == "") {
        throw new Error("no invoice provided.");
      }
      const payload: MeltQuotePayload = {
        unit: mintStore.activeUnit,
        request: this.payInvoiceData.input.request,
      };
      this.payInvoiceData.meltQuote.payload = payload;
      try {
        const data = await mintStore.activeMint().api.meltQuote(payload);
        mintStore.assertMintError(data);
        this.payInvoiceData.meltQuote.response = data;
        console.log("#### meltQuote", payload, " response:", data);
        this.payInvoiceData.blocking = false;
        return data;
      } catch (error: any) {
        this.payInvoiceData.blocking = false;
        this.payInvoiceData.meltQuote.error = error;
        console.error(error);
        try {
          notifyApiError(error);
        } catch { }
        throw error;
      }
    },
    // /check

    checkProofsSpendable: async function (proofs: Proof[], update_history = false) {
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
            });
          }
        }
        // return unspent proofs
        return spentProofs;
      } catch (error: any) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch { }
        throw error;
      }
    },
    checkTokenSpendable: async function (tokenStr: string, verbose: boolean = true) {
      /*
      checks whether a base64-encoded token (from the history table) has been spent already.
      if it is spent, the appropraite entry in the history table is set to paid.
      */
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();

      const tokenJson = token.decode(tokenStr);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      const proofs = token.getProofs(tokenJson);

      // activate the mint
      if (token.getMint(tokenJson).length > 0) {
        await mintStore.activateMintUrl(token.getMint(tokenJson));
      }

      const spentProofs = await this.checkProofsSpendable(proofs);
      let paid = false;
      if (spentProofs != undefined && spentProofs.length == proofs.length) {
        tokenStore.setTokenPaid(tokenStr);
        paid = true;
      }
      if (paid) {
        if (!!window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Ecash Paid");
      } else {
        console.log("### token not paid yet");
        if (verbose) {
          notify("Token still pending");
        }
        // this.sendData.tokens = token
      }
      return paid;
    },
    checkInvoice: async function (quote: string, verbose = true) {
      const mintStore = useMintsStore();
      console.log("### checkInvoice.quote", quote);
      const invoice = this.invoiceHistory.find((i) => i.quote === quote);
      if (!invoice) {
        throw new Error("invoice not found");
      }
      try {
        if (invoice.mint != mintStore.activeMintUrl && invoice.mint != undefined) {
          await mintStore.activateMintUrl(invoice.mint, false);
        }
        const proofs = await this.mint(invoice.amount, invoice.quote, verbose);
        if (!!window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Payment received", "top");
        return proofs;
      } catch (error) {
        if (verbose) {
          notify("Invoice still pending");
        }
        console.log("Invoice still pending", invoice.quote);
        throw error;
      }
    },
    ////////////// UI HELPERS //////////////

    checkPendingInvoices: async function (verbose: boolean = true) {
      const last_n = 10;
      let i = 0;
      for (const invoice of this.invoiceHistory.slice().reverse()) {
        if (i >= last_n) {
          break;
        }
        if (invoice.status === "pending" && invoice.amount > 0) {
          console.log("### checkPendingInvoices", invoice.quote)
          try {
            await this.checkInvoice(invoice.quote, verbose);
          } catch (error) {
            console.log(`${invoice.quote} still pending`);
            throw error;
          }
        }
        i += 1;
      }
    },
    checkPendingTokens: async function (verbose: boolean = true) {
      const tokenStore = useTokensStore();
      const last_n = 5;
      let i = 0;
      // invert for loop
      for (const token of tokenStore.historyTokens.slice().reverse()) {
        if (i >= last_n) {
          break;
        }
        if (token.status === "pending" && token.amount < 0) {
          console.log("### checkPendingTokens", token.token)
          this.checkTokenSpendable(token.token, verbose);
        }
        i += 1;
      }
    },
    decodeRequest: function (r = null) {
      // delete this.payInvoiceData.invoice;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.meltQuote.response = null;

      const camera = useCameraStore();
      // set the argument as the data to parse
      if (typeof r == "string" && r != null) {
        this.payInvoiceData.input.request = r;
      }
      let reqtype = null;
      let req = null;
      // get request
      if (camera.camera.data) {
        // get request from camera
        req = camera.camera.data;
      } else if (this.payInvoiceData.input.request) {
        // get request from pay invoice dialog
        req = this.payInvoiceData.input.request;
      }
      if (req == null) {
        throw new Error("no request provided.");
      }

      if (req.toLowerCase().startsWith("lnbc")) {
        this.payInvoiceData.input.request = req;
        reqtype = "bolt11";
      } else if (req.toLowerCase().startsWith("lightning:")) {
        this.payInvoiceData.input.request = req.slice(10);
        reqtype = "bolt11";
      } else if (req.toLowerCase().startsWith("lnurl:")) {
        this.payInvoiceData.input.request = req.slice(6);
        reqtype = "lnurl";
      } else if (req.indexOf("lightning=lnurl1") !== -1) {
        this.payInvoiceData.input.request = req
          .split("lightning=")[1]
          .split("&")[0];
        reqtype = "lnurl";
      } else if (
        req.toLowerCase().startsWith("lnurl1") ||
        req.match(/[\w.+-~_]+@[\w.+-~_]/)
      ) {
        this.payInvoiceData.input.request = req;
        reqtype = "lnurl";
      } else if (req.indexOf("cashuA") !== -1) {
        // very dirty way of parsing cashu tokens from either a pasted token or a URL like https://host.com?token=eyJwcm
        receiveStore.receiveData.tokensBase64 = req.slice(req.indexOf("cashuA"));
        reqtype = "cashu";
      }

      if (reqtype == "bolt11") {
        console.log("#### QR CODE: BOLT11");
        this.payInvoiceData.show = true;
        let invoice;
        try {
          invoice = bolt11Decoder.decode(this.payInvoiceData.input.request);
        } catch (error) {
          notifyWarning("Failed to decode invoice", undefined, 3000);
          this.payInvoiceData.show = false;
          throw error;
        }

        // invoice.amount = invoice.sections[2] / 1000;
        // invoice.amount_msat = invoice.sections[2];
        let cleanInvoice = {};
        // let cleanInvoice = {
        //   msat: invoice.amount_msat,
        //   sat: invoice.amount,
        //   fsat: invoice.amount,
        // };
        // _.each(invoice.sections, (tag) => {
        //   console.log(tag);
        // });
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
        this.meltQuote();
      } else if (reqtype == "lnurl") {
        console.log("#### QR CODE: LNURL");
        this.lnurlPayFirst(this.payInvoiceData.input.request);
      } else if (reqtype == "cashu") {
        console.log("#### QR CODE: CASHU TOKEN");
        this.payInvoiceData.show = false;
        receiveStore.showReceiveTokens = true;
      }
    },
    lnurlPayFirst: async function (address: string) {
      var host;
      if (address.split("@").length == 2) {
        let [user, lnaddresshost] = address.split("@");
        host = `https://${lnaddresshost}/.well-known/lnurlp/${user}`;
      } else if (address.toLowerCase().slice(0, 6) === "lnurl1") {
        let host = Buffer.from(
          bech32.fromWords(bech32.decode(address, 20000).words)
        ).toString();
        var { data } = await axios.get(host);
        host = data.domain;
      }
      if (host == undefined) {
        notifyError("Invalid LNURL", "LNURL Error");
        return;
      }
      var { data } = await axios.get(host);
      if (data.tag == "payRequest") {
        this.payInvoiceData.domain = host.split("https://")[1].split("/")[0];
        this.payInvoiceData.lnurlpay = data;
        if (
          this.payInvoiceData.lnurlpay.maxSendable ==
          this.payInvoiceData.lnurlpay.minSendable
        ) {
          this.payInvoiceData.input.amount =
            this.payInvoiceData.lnurlpay.maxSendable / 1000;
        }
        this.payInvoiceData.show = true;
      }
    },
    lnurlPaySecond: async function () {
      let amount = this.payInvoiceData.input.amount;
      if (this.payInvoiceData.lnurlpay == null) {
        notifyError("No LNURL data", "LNURL Error");
        return;
      }
      if (
        this.payInvoiceData.lnurlpay.tag == "payRequest" &&
        this.payInvoiceData.lnurlpay.minSendable <= amount * 1000 &&
        this.payInvoiceData.lnurlpay.maxSendable >= amount * 1000
      ) {
        var { data } = await axios.get(
          `${this.payInvoiceData.lnurlpay.callback}?amount=${amount * 1000}`
        );
        // check http error
        if (data.status == "ERROR") {
          notifyError(data.reason, "LNURL Error");
          return;
        }
        console.log(data.pr);
        this.payInvoiceData.input.request = data.pr;
        this.decodeRequest();
      }
    },
    generateNewMnemonic: function () {
      if (this.mnemonic == "") {
        this.mnemonic = generateNewMnemonic();
      }
      return this.mnemonic
    }
  },
});
