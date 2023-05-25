import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { step1Alice, step3Alice } from "src/js/dhke";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { splitAmount } from "src/js/utils";
import * as _ from "underscore";
import { uint8ToBase64 } from "src/js/base64";
import token from "src/js/token";
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";

export const useWalletStore = defineStore("wallet", {
  state: () => {
    return {
      invoiceHistory: useLocalStorage("cashu.invoiceHistory", []),
      invoiceData: {
        amount: 0,
        memo: "",
        bolt11: "",
        hash: "",
      },
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
      const wallet = new CashuWallet(mints.keys, mints.activeMint);
      return wallet;
    },
  },
  actions: {
    constructOutputs: async function (amounts, secrets) {
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
    promiseToProof: function (id, amount, C_hex, secret, r, mint_pubkeys) {
      const C_ = nobleSecp256k1.Point.fromHex(C_hex);
      const A = mint_pubkeys[amount];
      const C = step3Alice(
        C_,
        nobleSecp256k1.utils.hexToBytes(r),
        nobleSecp256k1.Point.fromHex(A)
      );
      return {
        id,
        amount,
        C: C.toHex(true),
        secret,
      };
    },
    constructProofs: function (promises, secrets, rs, mint_pubkeys) {
      const proofs = [];
      for (let i = 0; i < promises.length; i++) {
        const encodedSecret = uint8ToBase64.encode(secrets[i]);
        let { id, amount, C, secret } = this.promiseToProof(
          promises[i].id,
          promises[i].amount,
          promises[i]["C_"],
          encodedSecret,
          rs[i],
          mint_pubkeys
        );
        proofs.push({ id, amount, C, secret });
      }
      return proofs;
    },
    generateSecrets: async function (amounts) {
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
     * @param {number | null} amount
     * @returns
     */
    requestMint: async function (amount = null) {
      const mints = useMintsStore();
      if (amount != null) {
        this.invoiceData.amount = amount;
      }
      try {
        const data = await mints.activeMint.requestMint(
          this.invoiceData.amount
        );
        this.invoiceData.bolt11 = data.pr;
        this.invoiceData.hash = data.hash;
        this.invoiceHistory.push(
          // extend dictionary
          Object.assign({}, this.invoiceData, {
            date: currentDateStr(),
            status: "pending",
            mint: mints.activeMintUrl,
          })
        );
        return data;
      } catch (error) {
        console.error(error);
        notifyApiError(error);
      }
    },
    /**
     * Sets an invoice status to paid
     * @param {string} payment_hash
     */
    setInvoicePaid(payment_hash) {
      const invoice = this.invoiceHistory.find((i) => i.hash === payment_hash);
      invoice.status = "paid";
    },
    /**
     * Sets an invoice status to paid
     * @param {array} proofs
     * @param {number} amount
     * @returns
     */
    splitToSend: async function (proofs, amount, invlalidate = false) {
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
          this.notifyWarning(
            "Balance is too low.",
            `Your balance is ${this.getBalance()} sat and you're trying to pay ${amount} sats.`
          );
          throw Error("balance too low.");
        }

        // call /split

        let { firstProofs, scndProofs } = await this.split(
          spendableProofs,
          amount
        );
        // set scndProofs in this.proofs as reserved
        const usedSecrets = proofs.map((p) => p.secret);
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
        } catch {}
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
      const receive = useReceiveTokensStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();
      receive.showReceiveTokens = false;
      console.log("### receive tokens", receive.receiveData.tokensBase64);
      try {
        if (receive.receiveData.tokensBase64.length == 0) {
          throw new Error("no tokens provided.");
        }
        const tokenJson = token.decode(receive.receiveData.tokensBase64);
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
            receive.showReceiveTokens = true;
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
          serializedProofs: receive.receiveData.tokensBase64,
        });

        if (window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Tokens received.");
      } catch (error) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch {}
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
          } catch {}
        } catch {}
        throw error;
      }
    },

    // /split

    splitApi: async function (proofs, amount) {
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
          amount,
          proofs,
          outputs,
        };
        const keys = mintStore.keys; // fix keys for constructProofs
        const data = await mintStore.activeMint.split(payload);

        mintStore.assertMintError(data);
        const frst_rs = rs.slice(0, frst_amounts.length);
        const frst_secrets = secrets.slice(0, frst_amounts.length);
        const scnd_rs = rs.slice(frst_amounts.length);
        const scnd_secrets = secrets.slice(frst_amounts.length);
        const firstProofs = this.constructProofs(
          data.fst,
          frst_secrets,
          frst_rs,
          keys
        );
        const scndProofs = this.constructProofs(
          data.snd,
          scnd_secrets,
          scnd_rs,
          keys
        );

        return { firstProofs, scndProofs };
      } catch (error) {
        this.payInvoiceData.blocking = false;
        console.error(error);
        try {
          notifyApiError(error);
        } catch {}
        throw error;
      }
    },

    // /mint

    mintApi: async function (amounts, payment_hash, verbose = true) {
      /*
                asks the mint to check whether the invoice with payment_hash has been paid
                and requests signing of the attached outputs.
                */
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      try {
        let secrets = await this.generateSecrets(amounts);
        let { outputs, rs } = await this.constructOutputs(amounts, secrets);
        const keys = mintStore.keys; // fix keys for constructProofs
        const data = await mintStore.activeMint.mint({ outputs }, payment_hash);
        mintStore.assertMintError(data, false);
        if (data.promises == null) {
          return {};
        }
        let proofs = await this.constructProofs(
          data.promises,
          secrets,
          rs,
          keys
        );
        return proofs;
      } catch (error) {
        console.error(error);
        if (verbose) {
          try {
            notifyApiError(error);
          } catch {}
        }
        throw error;
      }
    },
    mint: async function (amount, payment_hash, verbose = true) {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();

      try {
        const split = splitAmount(amount);
        const proofs = await this.mintApi(split, payment_hash, verbose);
        if (!proofs.length) {
          throw "could not mint";
        }
        mintStore.setProofs(mintStore.proofs.concat(proofs));
        // hack to update balance
        mintStore.setActiveProofs(mintStore.activeProofs.concat([]));
        // this.storeProofs();

        // update UI
        await this.setInvoicePaid(payment_hash);
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
          } catch {}
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
          this.activeProofs,
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
        const keys = mintStore.keys; // fix keys for constructProofs
        const data = await mintStore.activeMint.melt(payload);
        mintStore.assertMintError(data);
        if (data.paid != true) {
          throw new Error("Invoice not paid.");
        }
        if (window.navigator.vibrate) navigator.vibrate(200);
        notifySuccess("Token paid.");
        console.log("#### pay lightning: token paid");
        // delete spent tokens from db
        proofsStore.deleteProofs(scndProofs);

        // NUT-08 get change
        if (data.change != null) {
          const changeProofs = this.constructProofs(
            data.change,
            secrets,
            rs,
            keys
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
          serializedProofs: this.serializeProofs(scndProofs),
        });

        this.invoiceHistory.push({
          amount: -amount_paid,
          bolt11: this.payInvoiceData.data.request,
          hash: this.payInvoiceData.data.hash,
          memo: this.payInvoiceData.data.memo,
          date: currentDateStr(),
          status: "paid",
          mint: this.activeMintUrl,
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
    checkFees: async function (payment_request) {
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
        } catch {}
        throw error;
      }
    },
    // /check

    checkProofsSpendable: async function (proofs, update_history = false) {
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
        } catch {}
        throw error;
      }
    },
  },
});
