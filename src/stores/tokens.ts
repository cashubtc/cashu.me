import { useLocalStorage } from "@vueuse/core";
import { date } from "quasar";
import { defineStore } from "pinia";
import { Proof, Token } from "@cashu/cashu-ts";

/**
 * The tokens store handles everything related to tokens and proofs
 */

type HistoryToken = {
  status: "paid" | "pending";
  amount: number;
  date: string;
  token: string;
  mint: string;
  unit: string;
};

export const useTokensStore = defineStore("tokens", {
  state: () => ({
    historyTokens: useLocalStorage("cashu.historyTokens", [] as HistoryToken[]),
    proofs: useLocalStorage("cashu.proofs", [] as Proof[]),
  }),
  actions: {
    /**
     * @param {{amount: number, serializedProofs: string}}
     */
    addPaidToken({
      amount,
      serializedProofs,
      mint,
      unit,
    }: {
      amount: number;
      serializedProofs: string;
      mint: string;
      unit: string;
    }) {
      this.historyTokens.push({
        status: "paid",
        amount,
        date: currentDateStr(),
        token: serializedProofs,
        mint,
        unit,
      } as HistoryToken);
    },
    addPendingToken({
      amount,
      serializedProofs,
      mint,
      unit,
    }: {
      amount: number;
      serializedProofs: string;
      mint: string;
      unit: string;
    }) {
      this.historyTokens.push({
        status: "pending",
        amount,
        date: currentDateStr(),
        token: serializedProofs,
        mint,
        unit,
      });
    },
    editHistoryToken(
      tokenToEdit: string,
      options?: {
        newAmount?: number;
        addAmount?: number;
        newStatus?: "paid" | "pending";
        newToken?: string;
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
        }

        return this.historyTokens[index];
      }

      return undefined;
    },
    setTokenPaid(token: string) {
      const index = this.historyTokens.findIndex((t) => t.token === token);
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
  },
});

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}
