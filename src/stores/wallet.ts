import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useCameraStore } from "./camera";

import { step1Alice, step3Alice } from "src/js/dhke";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { splitAmount } from "src/js/utils";
import * as _ from "underscore";
import { uint8ToBase64 } from "src/js/base64";
import token from "src/js/token";
import { notifyApiError, notifyError, notifySuccess, notifyWarning, notify } from "src/js/notify";
import { CashuMint, CashuWallet, Proof, SerializedBlindedSignature, MintKeys } from "@cashu/cashu-ts";
import * as bolt11Decoder from "light-bolt11-decoder";
import bech32 from "bech32";
import axios from "axios";
import { date } from "quasar";

type Invoice = {
  amount: number;
  bolt11: string;
  hash: string;
  memo: string;
};

type InvoiceHistory = Invoice & {
  date: string;
  status: "pending" | "paid";
  mint?: string;
};
const proofsStore = useProofsStore();
const receiveStore = useReceiveTokensStore();
const tokenStore = useTokensStore();

export const useWalletStore = defineStore("wallet", {
  state: () => {
    return {
      invoiceHistory: useLocalStorage(
        "cashu.invoiceHistory",
        [] as InvoiceHistory[]
      ),
      invoiceData: {
        amount: 0,
        memo: "",
        bolt11: "",
        hash: "",
      } as Invoice,
      payInvoiceData: {
        blocking: false,
        bolt11: "",
        show: false,
        invoice: null,
        lnurlpay: null,
        lnurlauth: null,
        data: {
          request: "",
          amount: 0,
          comment: "",
        },
      },
    };
  },
  getters: {
    wallet() {
      const mints = useMintsStore();
      const mint = new CashuMint(mints.activeMintUrl);
      const wallet = new CashuWallet(mint);
      return wallet;
    },
  },
  actions: {
    constructOutputs: async function (amounts: number[], secrets: Uint8Array[]) {
      const outputs = [];
      const rs = [];
      for (let i = 0; i < amounts.length; i++) {
        const { B_, r } = await step1Alice(secrets[i]);
        outputs.push({ amount: amounts[i], B_: B_ });
        rs.push(r);
      }
      return {
        outputs,
        rs,
      };
    },
    promiseToProof: async function (id: string, amount: number, C_hex: string, r: string) {
      const mintStore = useMintsStore();

      const C_ = nobleSecp256k1.Point.fromHex(C_hex);
      const A = await mintStore.getKeysForKeyset(id);
      const publicKey: string = A[amount];

      const C = step3Alice(
        C_,
        nobleSecp256k1.utils.hexToBytes(r),
        nobleSecp256k1.Point.fromHex(publicKey)
      );
      return {
        id,
        amount,
        C: C.toHex(true),
      };
    },
    constructProofs: async function (promises: SerializedBlindedSignature[], secrets: Uint8Array[], rs: string[]) {
      const proofs = [];
      for (let i = 0; i < promises.length; i++) {
        // const encodedSecret = uint8ToBase64.encode(secrets[i]);
        // use hex for now
        const encodedSecret = nobleSecp256k1.utils.bytesToHex(secrets[i]);
        let { id, amount, C } = await this.promiseToProof(
          promises[i].id,
          promises[i].amount,
          promises[i]["C_"],
          rs[i]
        );
        proofs.push({ id, amount, C, secret: encodedSecret });
      }
      return proofs;
    },
    generateSecrets: async function (amounts: number[]) {
      let secrets = [];
      for (let i = 0; i < amounts.length; i++) {
        const secret = nobleSecp256k1.utils.randomBytes(32);
        secrets.push(secret);
      }
      return secrets;
    },

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
        const data = await mintStore.activeMint.requestMint(
          this.invoiceData.amount
        );
        this.invoiceData.bolt11 = data.pr;
        this.invoiceData.hash = data.hash;
        this.invoiceHistory.push({
          ...this.invoiceData,
          date: currentDateStr(),
          status: "pending",
          mint: mintStore.activeMintUrl,
        });
        return data;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error, "Could not request mint");
      }
    },
    setInvoicePaid(payment_hash: string) {
      const invoice = this.invoiceHistory.find((i) => i.hash === payment_hash);
      if (!invoice) return;
      invoice.status = "paid";
    },
    /**
     * Sets an invoice status to paid
     * @param {array} proofs
     * @param {number} amount
     * @returns
     */
    splitToSend: async function (proofs: Proof[], amount: number, invlalidate: boolean = false) {
      /*
      splits proofs so the user can keep firstProofs, send scndProofs.
      then sets scndProofs as reserved.

      if invalidate, scndProofs (the one to send) are invalidated
      */
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        const spendableProofs = proofs.filter((p) => !p.reserved);
        if (proofsStore.sumProofs(spendableProofs) < amount) {
          const balance = await mintStore.getBalance();
          notifyWarning(
            "Balance is too low.",
            `Your balance is ${balance} sat and you're trying to pay ${amount} sats.`
          );
          throw Error("balance too low.");
        }

        // filter spendable proofs so that the amount is reached
        spendableProofs.sort((a, b) => a.amount - b.amount);
        let sum = 0;
        let i = 0;
        while (sum < amount) {
          sum += spendableProofs[i].amount;
          i += 1;
        }
        const proofsToSplit = spendableProofs.slice(0, i);

        // call /split

        let { firstProofs, scndProofs } = await this.split(
          proofsToSplit,
          amount
        );
        // set scndProofs in this.proofs as reserved
        const usedSecrets = proofsToSplit.map((p) => p.secret);
        let newProofs = mintStore.proofs.map((proof) => {
          if (usedSecrets.includes(proof.secret)) {
            proof.reserved = true;
          }
          return proof;
        });
        mintStore.setProofs(newProofs);

        // hack: to make Vue JS update
        mintStore.setProofs(mintStore.proofs.concat([]));

        if (invlalidate) {
          // delete scndProofs from db
          proofsStore.deleteProofs(scndProofs);
        }

        return { firstProofs, scndProofs };
      } catch (error) {
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
      try {
        if (receiveStore.receiveData.tokensBase64.length == 0) {
          throw new Error("no tokens provided.");
        }
        const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
        if (tokenJson == undefined) {
          throw new Error("no tokens provided.");
        }
        let proofs = token.getProofs(tokenJson);
        // check if we have all mints
        for (var i = 0; i < tokenJson.token.length; i++) {
          if (
            !mintStore.mints
              .map((m) => m.url)
              .includes(token.getMint(tokenJson))
          ) {
            // pop up add mint dialog warning
            // hack! The "add mint" component is in SettingsView which may now
            // have been loaded yet. We switch the tab to settings to make sure
            // that it loads. Remove this code when the TrustMintComnent is refactored!
            // await this.setTab("settings");
            mintStore.setMintToAdd(tokenJson.token[i].mint);
            mintStore.showAddMintDialog = true;
            // this.addMintDialog.show = true;
            // show the token receive dialog again for the next attempt
            receiveStore.showReceiveTokens = true;
            return;
          }

          // TODO: We assume here that all proofs are from one mint! This will fail if
          // that's not the case!
          if (token.getMint(tokenJson) != mintStore.activeMintUrl) {
            await mintStore.activateMint(token.getMint(tokenJson));
          }
        }

        const amount = proofs.reduce((s, t) => (s += t.amount), 0);

        // redeem
        await this.split(proofs, amount);

        // update UI

        // HACK: we need to do this so the balance updates
        mintStore.setProofs(mintStore.proofs.concat([]));
        mintStore.setActiveProofs(mintStore.activeProofs.concat([]));
        mintStore.getBalance();

        tokenStore.addPaidToken({
          amount,
          serializedProofs: receiveStore.receiveData.tokensBase64,
        });

        if (window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Ecash Received");
      } catch (error) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch { }
        throw error;
      }
      // }
    },
    // SPLIT

    split: async function (proofs, amount) {
      /*
                    supplies proofs and requests a split from the mint of these
                    proofs at a specific amount
                    */
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        if (proofs.length == 0) {
          throw new Error("no proofs provided.");
        }
        let { firstProofs, scndProofs } = await this.splitApi(proofs, amount);
        proofsStore.deleteProofs(proofs);
        // add new firstProofs, scndProofs to this.proofs
        mintStore.setProofs(
          mintStore.proofs.concat(firstProofs).concat(scndProofs)
        );
        // this.storeProofs();
        return { firstProofs, scndProofs };
      } catch (error) {
        console.error(error);
        try {
          try {
            notifyApiError(error);
          } catch { }
        } catch { }
        throw error;
      }
    },

    // /split

    splitApi: async function (proofs: Proof[], amount: number) {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        const total = proofsStore.sumProofs(proofs);
        const frst_amount = total - amount;
        const scnd_amount = amount;
        const frst_amounts = splitAmount(frst_amount);
        const scnd_amounts = splitAmount(scnd_amount);
        const amounts = _.clone(frst_amounts);
        amounts.push(...scnd_amounts);
        let secrets = await this.generateSecrets(amounts);
        if (secrets.length != amounts.length) {
          throw new Error(
            "number of secrets does not match number of outputs."
          );
        }
        let { outputs, rs } = await this.constructOutputs(amounts, secrets);
        const payload = {
          proofs,
          outputs,
        };
        const data = await mintStore.activeMint.split(payload);

        // push all promise, amount, secret, rs to mintStore.appendBlindSignatures
        for (let i = 0; i < data.promises.length; i++) {
          mintStore.appendBlindSignatures(
            data.promises[i],
            amounts[i],
            secrets[i],
            rs[i]
          );
        }

        mintStore.assertMintError(data);
        const first_promises = data.promises.slice(0, frst_amounts.length);
        const frst_rs = rs.slice(0, frst_amounts.length);
        const frst_secrets = secrets.slice(0, frst_amounts.length);
        const scnd_promises = data.promises.slice(frst_amounts.length);
        const scnd_rs = rs.slice(frst_amounts.length);
        const scnd_secrets = secrets.slice(frst_amounts.length);
        const firstProofs = await this.constructProofs(
          first_promises,
          frst_secrets,
          frst_rs,
        );
        const scndProofs = await this.constructProofs(
          scnd_promises,
          scnd_secrets,
          scnd_rs,
        );

        return { firstProofs, scndProofs };
      } catch (error) {
        this.payInvoiceData.blocking = false;
        console.error(error);
        try {
          notifyApiError(error);
        } catch { }
        throw error;
      }
    },

    // /mint

    mintApi: async function (amounts: number[], hash: string, verbose: boolean = true) {
      /*
                asks the mint to check whether the invoice with payment_hash has been paid
                and requests signing of the attached outputs.
                */
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        const secrets = await this.generateSecrets(amounts);
        const { outputs, rs } = await this.constructOutputs(amounts, secrets);
        const data = await mintStore.activeMint.mint({ outputs }, hash);
        mintStore.assertMintError(data, false);
        if (data.promises == null) {
          return {};
        }
        let proofs = await this.constructProofs(
          data.promises,
          secrets,
          rs
        );
        return proofs;
      } catch (error) {
        console.error(error);
        if (verbose) {
          try {
            notifyApiError(error);
          } catch { }
        }
        throw error;
      }
    },
    mint: async function (amount: number, hash: string, verbose: boolean = true) {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();

      try {
        const split = splitAmount(amount);
        const proofs = await this.mintApi(split, hash, verbose);
        if (!proofs.length) {
          throw "could not mint";
        }
        mintStore.setProofs(mintStore.proofs.concat(proofs));
        // hack to update balance
        mintStore.setActiveProofs(mintStore.activeProofs.concat([]));
        // this.storeProofs();

        // update UI
        await this.setInvoicePaid(hash);
        tokenStore.addPaidToken({
          amount,
          serializedProofs: proofsStore.serializeProofs(proofs),
        });

        return proofs;
      } catch (error) {
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

      // todo: get fees from server and add to inputs
      this.payInvoiceData.blocking = true;
      console.log("#### pay lightning");
      const amount_invoice = this.payInvoiceData.invoice.sat;
      const amount =
        amount_invoice +
        (await this.checkFees(this.payInvoiceData.data.request));
      console.log(
        "#### amount invoice",
        amount_invoice,
        "amount with fees",
        amount
      );

      try {
        let { firstProofs, scndProofs } = await this.splitToSend(
          mintStore.activeProofs,
          amount
        );
        // NUT-08 blank outputs for change
        let amounts = [1, 1, 1, 1]; // four change blank outputs
        let secrets = await this.generateSecrets(amounts);
        let { outputs, rs } = await this.constructOutputs(amounts, secrets);

        let amount_paid = amount;
        const payload = {
          proofs: scndProofs.flat(),
          amount,
          pr: this.payInvoiceData.data.request,
          outputs,
        };
        const data = await mintStore.activeMint.melt(payload);
        mintStore.assertMintError(data);
        if (data.paid != true) {
          throw new Error("Invoice not paid.");
        }

        if (window.navigator.vibrate) navigator.vibrate(200);

        notifySuccess("Ecash Paid");
        console.log("#### pay lightning: token paid");
        // delete spent tokens from db
        proofsStore.deleteProofs(scndProofs);

        // NUT-08 get change
        if (data.change != null) {
          const changeProofs = await this.constructProofs(
            data.change,
            secrets,
            rs
          );
          console.log(
            "## Received change: " + proofsStore.sumProofs(changeProofs)
          );
          amount_paid = amount_paid - proofsStore.sumProofs(changeProofs);
          mintStore.setProofs(mintStore.proofs.concat(changeProofs));
          // hack to update balance
          mintStore.setActiveProofs(mintStore.activeProofs.concat([]));
          // this.storeProofs();
        }

        // update UI

        tokenStore.addPaidToken({
          amount: -amount_paid,
          serializedProofs: proofsStore.serializeProofs(scndProofs),
        });

        this.invoiceHistory.push({
          amount: -amount_paid,
          bolt11: this.payInvoiceData.data.request,
          hash: this.payInvoiceData.data.hash,
          memo: this.payInvoiceData.data.memo,
          date: currentDateStr(),
          status: "paid",
          mint: mintStore.activeMintUrl,
        });

        this.payInvoiceData.invoice = false;
        this.payInvoiceData.show = false;
        this.payInvoiceData.blocking = false;
      } catch (error) {
        this.payInvoiceData.blocking = false;
        console.error(error);
        throw error;
      }
    },

    // /checkfees
    checkFees: async function (payment_request: string) {
      const mintStore = useMintsStore();
      const payload = {
        pr: payment_request,
      };
      try {
        const data = await mintStore.activeMint.checkFees(payload);
        mintStore.assertMintError(data);
        console.log("#### checkFees", payment_request, data.fee);
        return data.fee;
      } catch (error) {
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
      const payload = {
        proofs: proofs.map((p) => {
          return { secret: p.secret };
        }),
      };
      try {
        const data = await mintStore.activeMint.check(payload);
        mintStore.assertMintError(data);
        // delete proofs from database if it is spent
        let spentProofs = proofs.filter((p, pidx) => !data.spendable[pidx]);
        if (spentProofs.length) {
          proofsStore.deleteProofs(spentProofs);

          // update UI
          if (update_history) {
            tokenStore.addPaidToken({
              amount: -proofsStore.sumProofs(spentProofs),
              serializedProofs: proofsStore.serializeProofs(spentProofs),
            });
          }
        }

        return data.spendable;
      } catch (error) {
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
        await mintStore.activateMint(token.getMint(tokenJson));
      }

      const spendable = await this.checkProofsSpendable(proofs);
      let paid = false;
      if (spendable != undefined && spendable.includes(false)) {
        tokenStore.setTokenPaid(tokenStr);
        paid = true;
      }
      if (paid) {
        if (window.navigator.vibrate) navigator.vibrate(200);
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
    checkInvoice: async function (payment_hash: string, verbose = true) {
      const mintStore = useMintsStore();
      console.log("### checkInvoice.hash", payment_hash);
      const invoice = this.invoiceHistory.find((i) => i.hash === payment_hash);
      if (!invoice) {
        throw new Error("invoice not found");
      }
      try {
        if (invoice.mint != null) {
          await mintStore.activateMint(invoice.mint, false);
        }
        const proofs = await this.mint(invoice.amount, invoice.hash, verbose);
        if (window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Payment received", "top");
        return proofs;
      } catch (error) {
        if (verbose) {
          notify("Invoice still pending");
        }
        console.log("Invoice still pending", invoice.hash);
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
          console.log("### checkPendingInvoices", invoice.hash)
          try {
            await this.checkInvoice(invoice.hash, verbose);
          } catch (error) {
            console.log(`${invoice.hash} still pending`);
            throw error;
          }
        }
        i += 1;
      }
    },
    checkPendingTokens: async function (verbose: boolean = true) {
      const tokenStore = useTokensStore();
      const last_n = 10;
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

    // findTokenForAmount: function (amount) {
    //   const mintStore = useMintsStore();
    //   // unused coin selection
    //   for (const token of mintStore.activeProofs) {
    //     const index = token.promises?.findIndex((p) => p.amount === amount);
    //     if (index >= 0) {
    //       return {
    //         promise: token.promises[index],
    //         secret: token.secrets[index],
    //         r: token.rs[index],
    //       };
    //     }
    //   }
    // },
    decodeRequest: function (r = null) {
      const camera = useCameraStore();
      // set the argument as the data to parse
      if (typeof r == "string" && r != null) {
        this.payInvoiceData.data.request = r;
      }
      let reqtype = null;
      let req = null;
      // get request
      if (camera.camera.data) {
        // get request from camera
        req = camera.camera.data;
      } else if (this.payInvoiceData.data.request) {
        // get request from pay invoice dialog
        req = this.payInvoiceData.data.request;
      }
      if (req == null) {
        throw new Error("no request provided.");
      }

      if (req.toLowerCase().startsWith("lnbc")) {
        this.payInvoiceData.data.request = req;
        reqtype = "bolt11";
      } else if (req.toLowerCase().startsWith("lightning:")) {
        this.payInvoiceData.data.request = req.slice(10);
        reqtype = "bolt11";
      } else if (req.toLowerCase().startsWith("lnurl:")) {
        this.payInvoiceData.data.request = req.slice(6);
        reqtype = "lnurl";
      } else if (req.indexOf("lightning=lnurl1") !== -1) {
        this.payInvoiceData.data.request = req
          .split("lightning=")[1]
          .split("&")[0];
        reqtype = "lnurl";
      } else if (
        req.toLowerCase().startsWith("lnurl1") ||
        req.match(/[\w.+-~_]+@[\w.+-~_]/)
      ) {
        this.payInvoiceData.data.request = req;
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
          invoice = bolt11Decoder.decode(this.payInvoiceData.data.request);
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
      } else if (reqtype == "lnurl") {
        console.log("#### QR CODE: LNURL");
        this.lnurlPayFirst(this.payInvoiceData.data.request);
      } else if (reqtype == "cashu") {
        console.log("#### QR CODE: CASHU TOKEN");
        this.payInvoiceData.show = false;
        receiveStore.showReceiveTokens = true;
      }
    },
    lnurlPayFirst: async function (address) {
      var host;
      if (address.split("@").length == 2) {
        let [user, lnaddresshost] = address.split("@");
        host = `https://${lnaddresshost}/.well-known/lnurlp/${user}`;
      } else if (address.toLowerCase().slice(0, 6) === "lnurl1") {
        let host = Buffer.from(
          bech32.fromWords(bech32.decode(address, 20000).words)
        ).toString();
        var { data } = await axios.get(host);
        // const { data } = await LNbits.api.request(
        //   "POST",
        //   "/api/v1/payments/decode",
        //   "",
        //   {
        //     data: address,
        //   }
        // );
        host = data.domain;
      }
      var { data } = await axios.get(host);
      if (data.tag == "payRequest") {
        this.payInvoiceData.domain = host.split("https://")[1].split("/")[0];
        this.payInvoiceData.lnurlpay = data;
        if (
          this.payInvoiceData.lnurlpay.maxSendable ==
          this.payInvoiceData.lnurlpay.minSendable
        ) {
          this.payInvoiceData.data.amount =
            this.payInvoiceData.lnurlpay.maxSendable / 1000;
        }
        this.payInvoiceData.show = true;
      }
    },
    lnurlPaySecond: async function () {
      let amount = this.payInvoiceData.data.amount;
      if (
        this.payInvoiceData.lnurlpay.tag == "payRequest" &&
        this.payInvoiceData.lnurlpay.minSendable <=
        amount * 1000 <=
        this.payInvoiceData.lnurlpay.maxSendable
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
        this.payInvoiceData.data.request = data.pr;
        this.decodeRequest();
      }
    },
  },
});
