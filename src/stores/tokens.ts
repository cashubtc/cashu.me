import { useLocalStorage } from "@vueuse/core";
import { date } from "quasar";
import { defineStore } from "pinia";
import { PaymentRequest, Proof, Token } from "@cashu/cashu-ts";
import token from "src/js/token";

/**
 * The tokens store handles everything related to tokens and proofs
 */

export type HistoryToken = {
  status: "paid" | "pending";
  amount: number;
  date: string;
  token: string;
  mint: string;
  unit: string;
  paymentRequest?: PaymentRequest;
  fee?: number;
  label?: string; // Add label field for custom naming
};

export const useTokensStore = defineStore("tokens", {
  state: () => ({
    historyTokens: useLocalStorage("cashu.historyTokens", [] as HistoryToken[]),
  }),
  actions: {
    /**
     * @param {{amount: number, token: string, mint: string, unit: string}} param0
     */
    addPaidToken({
      amount,
      token,
      mint,
      unit,
      fee,
      paymentRequest,
      label,
    }: {
      amount: number;
      token: string;
      mint: string;
      unit: string;
      fee?: number;
      paymentRequest?: PaymentRequest;
      label?: string;
    }) {
      this.historyTokens.push({
        status: "paid",
        amount,
        date: currentDateStr(),
        token,
        mint,
        unit,
        fee,
        paymentRequest,
        label,
      } as HistoryToken);
    },
    addPendingToken({
      amount,
      token,
      mint,
      unit,
      fee,
      paymentRequest,
      label,
    }: {
      amount: number;
      token: string;
      mint: string;
      unit: string;
      fee?: number;
      paymentRequest?: PaymentRequest;
      label?: string;
    }) {
      this.historyTokens.push({
        status: "pending",
        amount,
        date: currentDateStr(),
        token: token,
        mint,
        unit,
        fee,
        paymentRequest,
        label,
      });
    },
    editHistoryToken(
      tokenToEdit: string,
      options?: {
        newAmount?: number;
        addAmount?: number;
        newStatus?: "paid" | "pending";
        newToken?: string;
        newFee?: number;
      }
    ): HistoryToken | undefined {
      const index = this.historyTokens.findIndex(
        (t) => t.token === tokenToEdit
      );
      if (index >= 0) {
        if (options) {
          if (options.newToken) {
            this.historyTokens[index].token = options.newToken;
          }
          if (options.newAmount) {
            this.historyTokens[index].amount =
              options.newAmount * Math.sign(this.historyTokens[index].amount);
          }
          if (options.addAmount) {
            if (this.historyTokens[index].amount > 0) {
              this.historyTokens[index].amount += options.addAmount;
            } else {
              this.historyTokens[index].amount -= options.addAmount;
            }
          }
          if (options.newStatus) {
            this.historyTokens[index].status = options.newStatus;
          }
          if (options.newFee) {
            this.historyTokens[index].fee = options.newFee;
          }
        }

        return this.historyTokens[index];
      }

      return undefined;
    },
    setTokenPaid(token: string) {
      const index = this.historyTokens.findIndex(
        (t) => t.token === token && t.status == "pending"
      );
      if (index >= 0) {
        this.historyTokens[index].status = "paid";
      }
    },
    deleteToken(token: string) {
      const index = this.historyTokens.findIndex((t) => t.token === token);
      if (index >= 0) {
        this.historyTokens.splice(index, 1);
      }
    },
    tokenAlreadyInHistory(tokenStr: string): HistoryToken | undefined {
      return this.historyTokens.find((t) => t.token === tokenStr);
    },
  },
});

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}
