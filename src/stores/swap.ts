import { useLocalStorage } from "@vueuse/core";
import { date } from "quasar";
import { defineStore } from "pinia";
import {
  PaymentRequest,
  Proof,
  Token,
  MeltQuoteResponse,
} from "@cashu/cashu-ts";
import { Mint, useMintsStore } from "./mints";
import { useWalletStore } from "./wallet";
import { useProofsStore } from "./proofs";
import { notifyError, notifyWarning } from "../js/notify";
import token from "src/js/token";
import { i18n } from "../boot/i18n";

/**
 * The tokens store handles everything related to tokens and proofs
 */

type SwapAmountData = {
  fromUrl: string | undefined;
  toUrl: string | undefined;
  amount: number;
};

export type HistoryToken = {
  status: "paid" | "pending";
  amount: number;
  date: string;
  token?: string;
  mint: string;
  unit: string;
  paymentRequest?: PaymentRequest;
  fee?: number;
  meltQuote?: MeltQuoteResponse;
  paidDate?: string;
};

export const useSwapStore = defineStore("swap", {
  state: () => ({
    swapAmountData: {} as SwapAmountData,
    swapBlocking: false,
  }),
  actions: {
    //
    mintAmountSwap: async function (swapAmountData: SwapAmountData) {
      const walletStore = useWalletStore();
      const mintStore = useMintsStore();
      if (this.swapBlocking) {
        notifyWarning(i18n.global.t("swap.in_progress_warning_text"));
        return;
      }
      if (!swapAmountData.fromUrl || !swapAmountData.toUrl) {
        notifyError(i18n.global.t("swap.invalid_swap_data_error_text"));
        return;
      }
      this.swapBlocking = true;
      try {
        // get invoice
        // await mintStore.activateMintUrl(swapAmountData.toUrl);
        const toWallet = walletStore.mintWallet(
          swapAmountData.toUrl,
          mintStore.activeUnit
        );
        const mintQuote = await walletStore.requestMint(
          swapAmountData.amount,
          toWallet
        );

        // pay invoice
        const fromWallet = walletStore.mintWallet(
          swapAmountData.fromUrl,
          mintStore.activeUnit
        );
        const meltQuote = await walletStore.meltQuote(
          fromWallet,
          mintQuote.request
        );
        const mint = mintStore.mints.find(
          (m) => m.url === swapAmountData.fromUrl
        );
        if (!mint) {
          throw new Error("mint not found");
        }
        const mintProofs = mintStore.mintUnitProofs(mint, fromWallet.unit);
        await walletStore.melt(mintProofs, meltQuote, fromWallet);

        // settle invoice on other side
        await walletStore.checkInvoice(mintQuote.quote);
      } catch (e) {
        console.error("Error swapping", e);
        notifyError(i18n.global.t("swap.swap_error_text"));
      } finally {
        this.swapBlocking = false;
      }
    },
    meltToMintFees: function (tokenJson: Token) {
      const proofsStore = useProofsStore();
      const walletStore = useWalletStore();
      const fromMintUrl = token.getMint(tokenJson);
      const unit = token.getUnit(tokenJson);
      const tokenAmount = proofsStore.sumProofs(token.getProofs(tokenJson));
      let meltAmount = tokenAmount - Math.max(2, Math.ceil(tokenAmount * 0.02));
      try {
        // walletStore.mintWallet(fromMintUrl, unit); will fail if we don't have fromMintUrl yet
        const fromWallet = walletStore.mintWallet(fromMintUrl, unit);
        const proofs = token.getProofs(tokenJson);
        meltAmount -= fromWallet.getFeesForProofs(proofs);
      } catch (e) {}
      return tokenAmount - meltAmount;
    },
    meltProofsToMint: async function (tokenJson: Token, mint: Mint) {
      const proofsStore = useProofsStore();
      const walletStore = useWalletStore();
      if (this.swapBlocking) {
        notifyWarning(i18n.global.t("swap.in_progress_warning_text"));
        return;
      }

      this.swapBlocking = true;
      try {
        const tokenAmount = proofsStore.sumProofs(token.getProofs(tokenJson));
        let meltAmount =
          tokenAmount - Math.max(2, Math.ceil(tokenAmount * 0.02));
        const unit = token.getUnit(tokenJson);
        const fromMintUrl = token.getMint(tokenJson);
        const fromWallet = walletStore.mintWallet(fromMintUrl, unit);
        const toWallet = walletStore.mintWallet(mint.url, unit);
        const proofs = token.getProofs(tokenJson);
        meltAmount -= fromWallet.getFeesForProofs(proofs);

        const mintQuote = await walletStore.requestMint(meltAmount, toWallet);
        const meltQuote = await walletStore.meltQuote(
          fromWallet,
          mintQuote.request
        );
        await walletStore.melt(proofs, meltQuote, fromWallet);

        await walletStore.checkInvoice(mintQuote.quote);
      } catch (e) {
        console.error("Error swapping", e);
        notifyError(i18n.global.t("swap.swap_error_text"));
      } finally {
        this.swapBlocking = false;
      }
    },
  },
});
