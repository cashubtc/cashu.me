import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import { currentDateStr } from "src/js/utils";
import { useMintsStore, MintClass, Mint } from "./mints";
import { WalletProof } from "src/types/proofs";
import { useLocalStorage } from "@vueuse/core";
import { useProofsStore } from "./proofs";
import { LOCAL_STORAGE_KEYS } from "src/constants/localStorageKeys";
import { HistoryToken, useTokensStore } from "./tokens";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useUiStore } from "src/stores/ui";
import { useP2PKStore } from "src/stores/p2pk";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { usePRStore } from "./payment-request";
import { useWorkersStore } from "./workers";
import { useInvoicesWorkerStore } from "./invoicesWorker";
import { useBucketsStore } from "./buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useLockedTokensStore } from "./lockedTokens";
import { useInvoiceHistoryStore } from "./invoiceHistory";
import { v4 as uuidv4 } from "uuid";
import { ensureCompressed } from "src/utils/ecash";

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
  MintQuoteResponse,
  ProofState,
  getEncodedToken,
} from "@cashu/cashu-ts";
import { getSignedProofs } from "@cashu/crypto/modules/client/NUT11";
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
import { useMnemonicStore } from "./mnemonic";
import { Invoice, InvoiceHistory } from "src/types/invoice";
import { useSettingsStore } from "./settings";
import { usePriceStore } from "./price";
import { i18n } from "src/boot/i18n";
import { useNostrStore } from "./nostr";
import { useSignerStore } from "./signer";
import { watch } from "vue";
// HACK: this is a workaround so that the catch block in the melt function does not throw an error when the user exits the app
// before the payment is completed. This is necessary because the catch block in the melt function would otherwise remove all
// quotes from the invoiceHistory and the user would not be able to pay the invoice again after reopening the app.
let isUnloading = false;
window.addEventListener("beforeunload", () => {
  isUnloading = true;
});


type KeysetCounter = {
  id: string;
  counter: number;
};

const receiveStore = useReceiveTokensStore();
const tokenStore = useTokensStore();
const proofsStore = useProofsStore();

export const useWalletStore = defineStore("wallet", {
  state: () => {
    const t = i18n.global.t;
    return {
      t: t,
      
      keysetCounters: useLocalStorage(
        LOCAL_STORAGE_KEYS.CASHU_KEYSETCOUNTERS,
        [] as KeysetCounter[]
      ),
      invoiceData: {} as InvoiceHistory,
      activeWebsocketConnections: 0,
      payInvoiceData: {
        blocking: false,
        bolt11: "",
        show: false,
        bucketId: DEFAULT_BUCKET_ID,
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
      const mnemonicStore = useMnemonicStore();
      if (mnemonicStore.mnemonic == "") {
        mnemonicStore.mnemonic = generateMnemonic(wordlist);
      }
      const mnemonic: string = mnemonicStore.mnemonic;
      const bip39Seed = mnemonicToSeedSync(mnemonic);
      const walletOptions: any = {
        keys: mints.activeKeys,
        keysets: mints.activeKeysets,
        bip39seed: bip39Seed,
        unit: mints.activeUnit,
      };
      if (mints.activeInfo && (mints.activeInfo as any).nuts) {
        walletOptions.mintInfo = mints.activeInfo;
      }
      const wallet = new CashuWallet(mint, walletOptions);
      return wallet;
    },
    seed(): Uint8Array {
      const mnemonicStore = useMnemonicStore();
      return mnemonicToSeedSync(mnemonicStore.mnemonic);
    },
  },
  actions: {
    mintWallet(url: string, unit: string): CashuWallet {
      // short-lived wallet for mint operations
      // note: the unit of the wallet will be activeUnit by default,
      // overwrite wallet.unit if needed
      const mints = useMintsStore();
      const storedMint = mints.mints.find((m) => m.url === url);
      if (!storedMint) {
        throw new Error("mint not found");
      }
      const unitKeysets = mints.mintUnitKeysets(storedMint, unit);
      const mint = new CashuMint(url);
      const mnemonicStore = useMnemonicStore();
      if (mnemonicStore.mnemonic == "") {
        mnemonicStore.mnemonic = generateMnemonic(wordlist);
      }
      const mnemonic: string = mnemonicStore.mnemonic;
      const bip39Seed = mnemonicToSeedSync(mnemonic);
      const walletOptions: any = {
        keys: storedMint.keys,
        keysets: unitKeysets,
        bip39seed: bip39Seed,
        unit: unit,
      };
      if (storedMint.info && (storedMint.info as any).nuts) {
        walletOptions.mintInfo = storedMint.info;
      }
      const wallet = new CashuWallet(mint, walletOptions);
      return wallet;
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
    findSpendableMint: function (
      amount: number,
      preferred: string[] = []
    ): Mint | null {
      const mintsStore = useMintsStore();
      const unit = mintsStore.activeUnit;
      const checked = new Set<string>();

      for (const url of preferred) {
        const mint = mintsStore.mints.find((m) => m.url === url);
        if (!mint) continue;
        checked.add(url);
        const mintClass = new MintClass(mint);
        if (mintClass.unitBalance(unit) >= amount) {
          return mint;
        }
      }

      for (const mint of mintsStore.mints) {
        if (checked.has(mint.url)) continue;
        const mintClass = new MintClass(mint);
        if (mintClass.unitBalance(unit) >= amount) {
          return mint;
        }
      }

      return null;
    },
    signP2PKIfNeeded: function <T extends Proof>(proofs: T[]): T[] {
      if (
        !proofs.some(
          (p) => typeof p.secret === "string" && p.secret.startsWith("P2PK:")
        )
      ) {
        return proofs;
      }
      const privKey = useNostrStore().privKeyHex;
      if (!privKey) return proofs;
      try {
        const signed = getSignedProofs(proofs as any, privKey as any);
        return proofs.map((p, idx) => ({
          ...(p as any),
          ...(signed[idx] as any),
        })) as T[];
      } catch (e) {
        console.error(e);
        return proofs;
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
    setInvoicePaid(quoteId: string) {
      useInvoiceHistoryStore().setInvoicePaid(quoteId);
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
    coinSelect: function (
      proofs: WalletProof[],
      wallet: CashuWallet,
      amount: number,
      includeFees: boolean = false,
      preferredBucketId?: string
    ): WalletProof[] {
      if (proofs.reduce((s, t) => (s += t.amount), 0) < amount) {
        // there are not enough proofs to pay the amount
        return [];
      }

      let orderedProofs = [...proofs];

      if (preferredBucketId) {
        orderedProofs.sort((a, b) => {
          const aPref = a.bucketId === preferredBucketId ? 0 : 1;
          const bPref = b.bucketId === preferredBucketId ? 0 : 1;
          if (aPref !== bPref) {
            return aPref - bPref;
          }
          return b.amount - a.amount;
        });
      }

      let sum = 0;
      let selectedProofs: WalletProof[] = [];
      for (const proof of orderedProofs) {
        selectedProofs.push(proof);
        sum += proof.amount;
        const fees = includeFees ? wallet.getFeesForProofs(selectedProofs) : 0;
        if (sum >= amount + fees) {
          break;
        }
      }

      const finalFees = includeFees
        ? wallet.getFeesForProofs(selectedProofs)
        : 0;
      if (sum < amount + finalFees) {
        return [];
      }

      return selectedProofs.map(
        (p) => ({ ...p, reserved: false } as WalletProof)
      );
    },
    spendableProofs: function (proofs: WalletProof[], amount: number) {
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const spendableProofs = proofsStore.getUnreservedProofs(proofs);
      if (proofsStore.sumProofs(spendableProofs) < amount) {
        const balance = mintStore.activeBalance;
        const unit = mintStore.activeUnit;
        notifyWarning(
          this.t("wallet.notifications.balance_too_low"),
          `${uIStore.formatCurrency(
            balance,
            unit
          )} is not enough to pay ${uIStore.formatCurrency(amount, unit)}.`
        );
        throw Error("Balance too low");
      }
      return spendableProofs;
    },
    getFeesForProofs: function (proofs: Proof[]): number {
      return this.wallet.getFeesForProofs(proofs);
    },
    send: async function (
      proofs: WalletProof[],
      wallet: CashuWallet,
      amount: number,
      invalidate: boolean = false,
      includeFees: boolean = false,
      bucketId: string = DEFAULT_BUCKET_ID
    ): Promise<{ keepProofs: Proof[]; sendProofs: Proof[] }> {
      /*
      splits proofs so the user can keep firstProofs, send scndProofs.
      then sets scndProofs as reserved.

      if invalidate, scndProofs (the one to send) are invalidated
      */
      const mintStore = useMintsStore();
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
          includeFees,
          bucketId
        );
        proofsToSend = this.signP2PKIfNeeded(proofsToSend);
        const totalAmount = proofsToSend.reduce((s, t) => (s += t.amount), 0);
        const fees = includeFees ? wallet.getFeesForProofs(proofsToSend) : 0;
        const targetAmount = amount + fees;

        let keepProofs: Proof[] = [];
        let sendProofs: Proof[] = [];

        if (totalAmount != targetAmount) {
          const counter = this.keysetCounter(keysetId);
          proofsToSend = this.coinSelect(
            spendableProofs,
            wallet,
            targetAmount,
            true,
            bucketId
          );
          proofsToSend = this.signP2PKIfNeeded(proofsToSend);
          ({ keep: keepProofs, send: sendProofs } = await wallet.send(
            targetAmount,
            proofsToSend,
            { counter, keysetId, proofsWeHave: spendableProofs }
          ));
          this.increaseKeysetCounter(
            keysetId,
            keepProofs.length + sendProofs.length
          );
          await proofsStore.addProofs(keepProofs, undefined, bucketId, "");
          useSignerStore().reset();
          await proofsStore.addProofs(sendProofs, undefined, bucketId, "");
          useSignerStore().reset();

          // make sure we don't delete any proofs that were returned
          const proofsToSendNotReturned = proofsToSend
            .filter((p) => !sendProofs.find((s) => s.secret === p.secret))
            .filter((p) => !keepProofs.find((k) => k.secret === p.secret));
          await proofsStore.removeProofs(proofsToSendNotReturned);
        } else if (totalAmount == targetAmount) {
          keepProofs = [];
          sendProofs = this.signP2PKIfNeeded(proofsToSend);
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

        // ADD THIS NEW LOGIC BLOCK
        if (error.message && error.message.includes("Token already spent")) {
          notifyError(
            "Selected proofs have already been spent. Correcting local state.",
            "Balance Out of Sync"
          );
          // Call the new reconciliation function with the proofs that failed
          await this.reconcileSpentProofs(proofsToSend);
        } else {
          notifyApiError(error, "Payment failed"); // Keep original error notification for other cases
        }

        this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
    },
    reconcileSpentProofs: async function (proofs: Proof[]) {
      console.log("Reconciling spent proofs from local state.");
      const proofsStore = useProofsStore();
      await proofsStore.removeProofs(proofs);
      notifyWarning(
        "Your balance was out of sync and has been corrected.",
        "State Corrected"
      );
    },
    /**
     *
     *
     * @param {array} proofs
     */
    attemptRedeem: async function (
      tokenString: string,
    ): Promise<boolean> {
      /*
      Receives a token that is prepared in the receiveToken – it is not yet in the history
      */
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const p2pkStore = useP2PKStore();

      const receiveStore = useReceiveTokensStore();

      const bucketId = receiveStore.receiveData.bucketId ?? DEFAULT_BUCKET_ID;

      receiveStore.showReceiveTokens = false;

      if (tokenString.length == 0) {
        throw new Error("no tokens provided.");
      }
      const tokenJson = token.decode(tokenString);
      if (tokenJson == undefined) {
        throw new Error("no tokens provided.");
      }
      let proofs = token.getProofs(tokenJson).map((p) => {
        if (typeof p.secret === "string" && p.secret.startsWith('["P2PK"')) {
          const s = JSON.parse(p.secret);
          if (s[1]?.data) s[1].data = ensureCompressed(s[1].data);
          p.secret = JSON.stringify(s);
        }
        return p;
      });
      if (proofs.length == 0) {
        throw new Error("no proofs found.");
      }
      const inputAmount = proofs.reduce((s, t) => (s += t.amount), 0);
      let fee = 0;
      let mintInToken = token.getMint(tokenJson);
      let unitInToken = token.getUnit(tokenJson);

      const historyToken = {
        amount: inputAmount,
        token: tokenString,
        unit: unitInToken,
        mint: mintInToken,
        label: receiveStore.receiveData.label ?? "",
        description: receiveStore.receiveData.description ?? "",
        fee: fee,
        bucketId,
      } as HistoryToken;
      const mintWallet = this.mintWallet(historyToken.mint, historyToken.unit);
      const mint = mintStore.mints.find((m) => m.url === historyToken.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      if (!proofs.every((p) => mint.keysets.some((k) => k.id === p.id))) {
        throw new Error("Keyset mismatch for token proofs");
      }
      await uIStore.lockMutex();
      try {
        // redeem
        const keysetId = this.getKeyset(historyToken.mint, historyToken.unit);
        const counter = this.keysetCounter(keysetId);
        const nostrStore = useNostrStore();
        const localPriv = receiveStore.receiveData.p2pkPrivateKey;

        /* ---------- P2PK remote-sign fall-back ------------ */
        const needsSig = proofs.some(
          (p) => typeof p.secret === "string" && p.secret.startsWith('["P2PK"')
        );

        if (needsSig && !localPriv) {
          throw new Error("You do not have the private key to unlock this token.");
        }

        let privkey = localPriv || (nostrStore as any).activePrivkeyHex;

        let remoteSigned = false;
        if (!privkey && needsSig) {
          const signed = await useWorkersStore().signWithRemote(proofs);
          // did we actually get any witness back?
          if (signed.some((p) => (p as any).witness?.signatures?.length > 0)) {
  proofs = signed as any;
            remoteSigned = true;
          }
        }



        if (!privkey && needsSig && !remoteSigned) {
          useSignerStore().reset();
          const ui = useUiStore();
          ui.showMissingSignerModal = true;
          await new Promise<void>(resolve => {
            const stop = watch(
              () => ui.showMissingSignerModal,
              v => { if (!v) { stop(); resolve(); } }
            );
          });
          if (!useSignerStore().method) {
            throw new Error("User cancelled signer setup");
          }
          throw new Error(
            "No private key or remote signer available for P2PK unlock"
          );
        }

        /* Re-encode token if we mutated proofs with a witness */
        const tokenToRedeem = remoteSigned
          ? getEncodedToken({
              mint: mintInToken,
              unit: unitInToken,
              proofs,
            })
          : tokenString;

        debug("redeem: sending proofs", proofs);

        let receivedProofs: Proof[];
        try {
          receivedProofs = await mintWallet.receive(tokenToRedeem, {
            counter,
            privkey: privkey || mintWallet.privkey,
            proofsWeHave: mintStore.mintUnitProofs(mint, historyToken.unit),
          });
          await proofsStore.addProofs(
            receivedProofs,
            undefined,
            bucketId,
            receiveStore.receiveData.label ?? ""
          );
          useSignerStore().reset();
          this.increaseKeysetCounter(keysetId, receivedProofs.length);
        } catch (error: any) {
          console.error(error);
          this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
          throw new Error("Error receiving tokens: " + error);
        }

        p2pkStore.setPrivateKeyUsed(privkey);

        const outputAmount = receivedProofs.reduce(
          (s, t) => (s += t.amount),
          0
        );

        // if token is already in history, set to paid, else add to history
        if (
          tokenStore.historyTokens.find(
            (t) => t.token === tokenString && t.amount > 0
          )
        ) {
          tokenStore.setTokenPaid(tokenString);
        } else {
          // if this is a self-sent token, we will find an outgoing token with the inverse amount
          if (
            tokenStore.historyTokens.find(
              (t) => t.token === tokenString && t.amount < 0
            )
          ) {
            tokenStore.setTokenPaid(tokenString);
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
        return true;
      } catch (error: any) {
        console.error(error);
        notifyApiError(error);
        throw error;
      } finally {
        uIStore.unlockMutex();
      }
      // }
    },

    redeem: async function (tokenString: string) {
      const receiveStore = useReceiveTokensStore();
      const p2pkStore = useP2PKStore();
      receiveStore.receiveData.tokensBase64 = tokenString;
      receiveStore.receiveData.p2pkPrivateKey =
        p2pkStore.getPrivateKeyForP2PKEncodedToken(tokenString);
      while (true) {
        const res = await this.attemptRedeem(tokenString);
        if (res) break;
      }
    },

    // /mint
    /**
     * Ask the mint to generate an invoice for the given amount
     * Upon paying the request, the mint will credit the wallet with
     * cashu tokens
     */
    requestMint: async function (
      amount: number,
      mintWallet: CashuWallet
    ): Promise<MintQuoteResponse> {
      try {
        // create MintQuotePayload(this.invoiceData.amount) payload
        const payload: MintQuotePayload = {
          amount: amount,
          unit: mintWallet.unit,
        };
        const data = await mintWallet.mint.createMintQuote(payload);
        this.invoiceData.amount = amount;
        this.invoiceData.bolt11 = data.request;
        this.invoiceData.quote = data.quote;
        this.invoiceData.date = currentDateStr();
        this.invoiceData.status = "pending";
        this.invoiceData.mint = mintWallet.mint.mintUrl;
        this.invoiceData.unit = mintWallet.unit;
        this.invoiceData.mintQuote = data;
        useInvoiceHistoryStore().invoiceHistory.push({
          ...this.invoiceData,
        });
        return data as any;
      } catch (error: any) {
        console.error(error);
        notifyApiError(
          error,
          this.t("wallet.notifications.could_not_request_mint")
        );
        throw error;
      } finally {
      }
    },
    mint: async function (
      invoice: InvoiceHistory,
      verbose: boolean = true,
      bucketId: string = DEFAULT_BUCKET_ID
    ) {
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      const tokenStore = useTokensStore();
      const uIStore = useUiStore();
      const keysetId = this.getKeyset(invoice.mint, invoice.unit);
      const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
      const mint = mintStore.mints.find((m) => m.url === invoice.mint);
      if (!mint) {
        throw new Error("mint not found");
      }

      await uIStore.lockMutex();
      try {
        // first we check if the mint quote is paid
        const mintQuote = await mintWallet.checkMintQuote(invoice.quote);
        invoice.mintQuote = mintQuote;
        debug("### mint(): mintQuote", mintQuote);
        switch (mintQuote.state) {
          case MintQuoteState.PAID:
            break;
          case MintQuoteState.UNPAID:
            if (verbose) {
              notify(this.t("wallet.notifications.invoice_still_pending"));
            }
            throw new Error("invoice pending.");
          case MintQuoteState.ISSUED:
            throw new Error("invoice already issued.");
          default:
            throw new Error("unknown state.");
        }
        // MintQuoteState must be PAID
        const counter = this.keysetCounter(keysetId);
        const proofs = await mintWallet.mintProofs(
          invoice.amount,
          invoice.quote,
          {
            keysetId,
            counter,
            proofsWeHave: mintStore.mintUnitProofs(mint, invoice.unit),
          }
        );
        this.increaseKeysetCounter(keysetId, proofs.length);
        await proofsStore.addProofs(proofs, undefined, bucketId, "");
        useSignerStore().reset();

        // update UI
        await this.setInvoicePaid(invoice.quote);
        const serializedProofs = proofsStore.serializeProofs(proofs);
        tokenStore.addPaidToken({
          amount: invoice.amount,
          token: serializedProofs,
          unit: invoice.unit,
          mint: invoice.mint,
          label: "",
          description: invoice.memo ?? "",
          bucketId,
        });
        useInvoicesWorkerStore().removeInvoiceFromChecker(invoice.quote);

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
    // get a melt quote for the current invoice data
    meltQuoteInvoiceData: async function () {
      // choose active wallet with active mint and unit
      const mintWallet = this.wallet;
      // throw an error if this.payInvoiceData.blocking is true
      if (this.payInvoiceData.blocking) {
        throw new Error("already processing an melt quote.");
      }
      this.payInvoiceData.blocking = true;
      this.payInvoiceData.meltQuote.error = "";
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
        const data = await this.meltQuote(mintWallet, payload.request);
        mintStore.assertMintError(data);
        this.payInvoiceData.meltQuote.response = data;
        this.payInvoiceData.blocking = false;
        return data as any;
      } catch (error: any) {
        this.payInvoiceData.blocking = false;
        this.payInvoiceData.meltQuote.error = error;
        console.error(error);
        notifyApiError(error);
        throw error;
      } finally {
      }
    },
    meltQuote: async function (
      wallet: CashuWallet,
      request: string
    ): Promise<MeltQuoteResponse> {
      const mintStore = useMintsStore();
      const data = await wallet.createMeltQuote(request);
      mintStore.assertMintError(data);
      return data as any;
    },
    meltInvoiceData: async function (bucketId: string = DEFAULT_BUCKET_ID) {
      if (this.payInvoiceData.invoice == null) {
        throw new Error("no invoice provided.");
      }
      const quote = this.payInvoiceData.meltQuote.response;
      if (quote == null) {
        throw new Error("no quote found.");
      }
      const request = this.payInvoiceData.invoice.bolt11;
      if (
        useInvoiceHistoryStore()
          .invoiceHistory.find(
          (i) => i.bolt11 === request && i.amount < 0 && i.status === "paid"
          )
      ) {
        notifyError("Invoice already paid.");
        throw new Error("invoice already paid.");
      }

      const mintStore = useMintsStore();
      const mintWallet = this.mintWallet(
        mintStore.activeMintUrl,
        mintStore.activeUnit
      );
      const proofs = mintStore.activeProofs.filter(
        (p) => p.bucketId === bucketId
      );
      return await this.melt(proofs, quote, mintWallet);
    },
    melt: async function (
      proofs: WalletProof[],
      quote: MeltQuoteResponse,
      mintWallet: CashuWallet
    ) {
      const uIStore = useUiStore();
      const proofsStore = useProofsStore();
      const tokenStore = useTokensStore();

      debug("#### melt()");
      const amount = quote.amount + quote.fee_reserve;
      let countChangeOutputs = 0;
      const keysetId = this.getKeyset(mintWallet.mint.mintUrl, mintWallet.unit);
      let keysetCounterIncrease = 0;

      // start melt
      let sendProofs: Proof[] = [];
      const bucketId = proofs[0]?.bucketId ?? DEFAULT_BUCKET_ID;
      try {
        const { keepProofs: keepProofs, sendProofs: _sendProofs } =
          await this.send(proofs, mintWallet, amount, false, true, bucketId);
        sendProofs = _sendProofs;
        if (sendProofs.length == 0) {
          throw new Error("could not split proofs.");
        }
      } catch (error: any) {
        console.error(error);
        notifyApiError(error, "Payment failed");
        throw error;
      }

      await uIStore.lockMutex();
      try {
        await this.addOutgoingPendingInvoiceToHistory(quote);
        await proofsStore.setReserved(sendProofs, true, quote.quote);

        // NUT-08 blank outputs for change
        const counter = this.keysetCounter(keysetId);

        // QUIRK: we increase the keyset counter by sendProofs and the maximum number of possible change outputs
        // this way, in case the user exits the app before meltProofs is completed, the returned change outputs won't cause a "outputs already signed" error
        // if the payment fails, we decrease the counter again
        this.increaseKeysetCounter(keysetId, sendProofs.length);
        if (quote.fee_reserve > 0) {
          countChangeOutputs = Math.ceil(Math.log2(quote.fee_reserve)) || 1;
          this.increaseKeysetCounter(keysetId, countChangeOutputs);
          keysetCounterIncrease += countChangeOutputs;
        }

        uIStore.triggerActivityOrb();

        // NOTE: if the user exits the app while we're in the API call, JS will emit an error that we would catch below!
        // We have to handle that case in the catch block below
        sendProofs = this.signP2PKIfNeeded(sendProofs);
        const data = await mintWallet.meltProofs(quote, sendProofs, {
          keysetId,
          counter,
        });

        if (data.quote.state != MeltQuoteState.PAID) {
          throw new Error("Invoice not paid.");
        }

        // NUT-08 get change
        if (data.change != null) {
          const changeProofs = data.change;
          debug("## Received change: " + proofsStore.sumProofs(changeProofs));
          await proofsStore.addProofs(changeProofs, undefined, bucketId, "");
          useSignerStore().reset();
        }

        // delete spent tokens from db
        await proofsStore.removeProofs(sendProofs);

        let amount_paid = amount - proofsStore.sumProofs(data.change);
        useUiStore().vibrate();
        notifySuccess(
          this.t("wallet.notifications.paid_lightning", {
            amount: uIStore.formatCurrency(amount_paid, mintWallet.unit),
          })
        );
        debug("#### pay lightning: token paid");
        tokenStore.addPaidToken({
          amount: -amount_paid,
          token: proofsStore.serializeProofs(sendProofs),
          unit: mintWallet.unit,
          mint: mintWallet.mint.mintUrl,
          label: "",
          description: this.payInvoiceData.invoice?.description ?? "",
          bucketId,
        });

        this.updateOutgoingInvoiceInHistory(quote, {
          status: "paid",
          amount: -amount_paid,
        });

        this.payInvoiceData.invoice = { sat: 0, memo: "", bolt11: "" };
        this.payInvoiceData.show = false;
        return data as any;
      } catch (error: any) {
        if (isUnloading) {
          // NOTE: An error is thrown when the user exits the app while the payment is in progress.
          // do not handle the error if the user exits the app
          throw error;
        }
        // get quote and check state
        const mintQuote = await mintWallet.mint.checkMeltQuote(quote.quote);
        if (
          mintQuote.state == MeltQuoteState.PAID ||
          mintQuote.state == MeltQuoteState.PENDING
        ) {
          debug(
            "### melt: error, but quote is paid or pending. not rolling back."
          );
          this.payInvoiceData.show = false;
          notify(this.t("wallet.notifications.payment_pending_refresh"));
          throw error;
        }
        // roll back proof management and keyset counter
        await proofsStore.setReserved(sendProofs, false);
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
        const bucketId = (proofs[0] as any)?.bucketId ?? DEFAULT_BUCKET_ID;
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
              label: "",
              description: "",
              bucketId,
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
      const mintWallet = this.mintWallet(historyToken.mint, historyToken.unit);

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
              tokenStr: serializedUnspentProofs,
              unit: historyToken2.unit,
              mint: historyToken2.mint,
              label: historyToken2.label ?? "",
              description: historyToken2.description ?? "",
              bucketId: historyToken2.bucketId,
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
        debug("### token not paid yet");
        if (verbose) {
          notify(this.t("wallet.notifications.token_still_pending"));
        }
        return false;
      }
      return true;
    },
    checkInvoice: async function (
      quote: string,
      verbose = true,
      hideInvoiceDetailsOnMint = true,
      bucketId: string = DEFAULT_BUCKET_ID
    ) {
      const uIStore = useUiStore();
      uIStore.triggerActivityOrb();
      const mintStore = useMintsStore();
      const invoice = useInvoiceHistoryStore().invoiceHistory.find(
        (i) => i.quote === quote
      );
      if (!invoice) {
        throw new Error("invoice not found");
      }
      const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
      const mint = mintStore.mints.find((m) => m.url === invoice.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      try {
        // check the state first
        const state = (await mintWallet.checkMintQuote(quote)).state;
        if (state == MintQuoteState.ISSUED) {
          this.setInvoicePaid(quote);
          return;
        }
        if (state != MintQuoteState.PAID) {
          debug("### mintQuote not paid yet");
          if (verbose) {
            notify(this.t("wallet.notifications.invoice_still_pending"));
          }
          throw new Error(`invoice state not paid: ${state}`);
        }
        const proofs = await this.mint(invoice, verbose, bucketId);
        if (hideInvoiceDetailsOnMint) {
          uIStore.showInvoiceDetails = false;
        }
        useUiStore().vibrate();
        notifySuccess(
          this.t("wallet.notifications.received_lightning", {
            amount: uIStore.formatCurrency(invoice.amount, invoice.unit),
          })
        );
        return proofs;
      } catch (error) {
        // if (verbose) {
        //   notify("Invoice still pending");
        // }
        debug("Invoice still pending", invoice.quote);
        throw error;
      }
    },
    checkOutgoingInvoice: async function (quote: string, verbose = true) {
      const uIStore = useUiStore();
      const mintStore = useMintsStore();
      const invoice = useInvoiceHistoryStore().invoiceHistory.find(
        (i) => i.quote === quote
      );
      if (!invoice) {
        throw new Error("invoice not found");
      }
      const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
      const mint = mintStore.mints.find((m) => m.url === invoice.mint);
      if (!mint) {
        throw new Error("mint not found");
      }
      const proofs: Proof[] = await proofsStore.getProofsForQuote(quote);
      try {
        // this is an outgoing invoice, we first do a getMintQuote to check if the invoice is paid
        const meltQuote = await mintWallet.mint.checkMeltQuote(quote);
        this.updateOutgoingInvoiceInHistory(meltQuote);
        if (meltQuote.state == MeltQuoteState.PENDING) {
          debug("### mintQuote not paid yet");
          if (verbose) {
            notify(this.t("wallet.notifications.invoice_still_pending"));
          }
          throw new Error("invoice not paid yet.");
        } else if (meltQuote.state == MeltQuoteState.UNPAID) {
          // we assume that the payment failed and we unset the proofs as reserved
          await useProofsStore().setReserved(proofs, false);
          this.removeOutgoingInvoiceFromHistory(quote);
          notifyWarning(
            this.t("wallet.notifications.lightning_payment_failed")
          );
        } else if (meltQuote.state == MeltQuoteState.PAID) {
          // if the invoice is paid, we check if all proofs are spent and if so, we invalidate them and set the invoice state in the history to "paid"
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
          // set invoice in history to paid
          this.setInvoicePaid(quote);
        }
      } catch (error: any) {
        if (verbose) {
          notifyApiError(error);
        }
        debug("Could not check quote", invoice.quote, error);
        throw error;
      }
    },
    onTokenPaid: async function (historyToken: HistoryToken) {
      const sendTokensStore = useSendTokensStore();
      const uIStore = useUiStore();
      const tokenJson = token.decode(historyToken.token);
      const mintStore = useMintsStore();
      const settingsStore = useSettingsStore();
      if (!settingsStore.checkSentTokens) {
        debug(
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
        debug("Websockets not supported, kicking off token check worker.");
        useWorkersStore().checkTokenSpendableWorker(historyToken);
        return;
      }
      try {
        debug("onTokenPaid kicking off websocket");
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
            debug(`Websocket: proof state updated: ${proofState.state}`);
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
    mintOnPaid: async function (
      quote: string,
      verbose = true,
      kickOffInvoiceChecker = true,
      hideInvoiceDetailsOnMint = true
    ) {
      const mintStore = useMintsStore();
      const settingsStore = useSettingsStore();
      if (!settingsStore.checkIncomingInvoices) {
        debug(
          "settingsStore.checkIncomingInvoices is disabled, skipping invoice check"
        );
        return;
      }
      const invoice = useInvoiceHistoryStore().invoiceHistory.find(
        (i) => i.quote === quote
      );
      if (!invoice) {
        throw new Error("invoice not found");
      }
      const mintWallet = this.mintWallet(invoice.mint, invoice.unit);
      const mint = mintStore.mints.find((m) => m.url === invoice.mint);

      if (!mint) {
        throw new Error("mint not found");
      }
      // add to checker before we try a websocket
      if (kickOffInvoiceChecker) {
        if (useSettingsStore().periodicallyCheckIncomingInvoices) {
          debug(`Adding quote ${quote} to long-polling checker.`);
          useInvoicesWorkerStore().addInvoiceToChecker(quote);
        } else if (useSettingsStore().checkIncomingInvoices) {
          debug(`Adding quote ${quote} to old worker checker.`);
          useWorkersStore().invoiceCheckWorker(quote);
        }
      }

      if (
        !settingsStore.useWebsockets ||
        !mint.info?.nuts[17]?.supported ||
        !mint.info?.nuts[17]?.supported.find(
          (s) =>
            s.method == "bolt11" &&
            s.unit == invoice.unit &&
            s.commands.indexOf("bolt11_mint_quote") != -1
        )
      ) {
        debug("Websockets not supported.");
        return;
      }
      const uIStore = useUiStore();
      try {
        this.activeWebsocketConnections++;
        uIStore.triggerActivityOrb();
        const unsub = await mintWallet.onMintQuotePaid(
          quote,
          async (mintQuoteResponse: MintQuoteResponse) => {
            debug("Websocket: mint quote paid.");
            let proofs;
            try {
              proofs = await this.mint(invoice, false);
            } catch (error: any) {
              console.error(error);
              // notifyApiError(error);
              throw error;
            }

            if (hideInvoiceDetailsOnMint) {
              uIStore.showInvoiceDetails = false;
            }
            useUiStore().vibrate();
            notifySuccess(
              this.t("wallet.notifications.received_lightning", {
                amount: uIStore.formatCurrency(invoice.amount, invoice.unit),
              })
            );
            unsub();
            return proofs;
          },
          async (error: any) => {
            if (verbose) {
              notifyApiError(error);
            }
            debug("Invoice still pending", invoice.quote);
            throw error;
          }
        );
      } catch (error) {
        debug("Error in websocket subscription", error);
      } finally {
        this.activeWebsocketConnections--;
      }
    },
    ////////////// UI HELPERS //////////////
    addOutgoingPendingInvoiceToHistory: async function (
      quote: MeltQuoteResponse
    ) {
      const mintStore = useMintsStore();
      useInvoiceHistoryStore().invoiceHistory.push({
        amount: -(quote.amount + quote.fee_reserve),
        bolt11: this.payInvoiceData.input.request,
        quote: quote.quote,
        memo: "Outgoing invoice",
        date: currentDateStr(),
        status: "pending",
        mint: mintStore.activeMintUrl,
        unit: mintStore.activeUnit,
        meltQuote: quote,
      });
    },
    removeOutgoingInvoiceFromHistory: function (quote: string) {
      useInvoiceHistoryStore().removeOutgoingInvoiceFromHistory(quote);
    },
    updateOutgoingInvoiceInHistory: function (
      quote: MeltQuoteResponse,
      options?: { status?: "pending" | "paid"; amount?: number }
    ) {
      useInvoiceHistoryStore().updateOutgoingInvoiceInHistory(quote, options);
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
          debug("### checkPendingTokens", t.token);
          this.checkTokenSpendable(t, verbose);
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
        notifyWarning(
          this.t("wallet.notifications.failed_to_decode_invoice"),
          undefined,
          3000
        );
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
      invoice.sections.forEach((tag) => {
        if (typeof tag === "object" && tag !== null && Object.prototype.hasOwnProperty.call(tag, "name")) {
          if (tag.name === "amount") {
            cleanInvoice.msat = parseInt(tag.value, 10);
            cleanInvoice.sat = parseInt(tag.value, 10) / 1000;
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
      await this.meltQuoteInvoiceData();
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
    handlePaymentRequest: async function (req: string) {
      const prStore = usePRStore();
      await prStore.decodePaymentRequest(req);
    },
    decodeRequest: async function (req: string) {
      const p2pkStore = useP2PKStore();
      req = req.trim();
      this.payInvoiceData.input.request = req;
      if (req.toLowerCase().startsWith("lnbc")) {
        this.payInvoiceData.input.request = req;
        await this.handleBolt11Invoice();
      } else if (req.toLowerCase().startsWith("lightning:")) {
        this.payInvoiceData.input.request = req.slice(10);
        await this.handleBolt11Invoice();
      } else if (req.startsWith("bitcoin:")) {
        const lightningInvoice = req.match(/lightning=([^&]+)/);
        if (lightningInvoice) {
          this.payInvoiceData.input.request = lightningInvoice[1];
          await this.handleBolt11Invoice();
        }
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
      } else if (req.startsWith("cashu")) {
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
        var { data } = await axios.get(
          `${this.payInvoiceData.lnurlpay.callback}?amount=${amount * 1000}`
        );
        // check http error
        if (data.status == "ERROR") {
          notifyError(data.reason, this.t("wallet.notifications.lnurl_error"));
          return;
        }
        await this.decodeRequest(data.pr);
      }
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
