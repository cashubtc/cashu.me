import { useLocalStorage } from "@vueuse/core";
import { date } from "quasar";
import { defineStore } from "pinia";

export const useTokensStore = defineStore("tokens", {
  state: () => ({
    historyTokens: useLocalStorage("cashu.historyTokens", []),
  }),
  actions: {
    /**
     * @param {{amount: number, serializedProofs: string}}
     */
    addPaidToken({ amount, serializedProofs }) {
      this.historyTokens.push({
        status: "paid",
        amount,
        date: currentDateStr(),
        token: serializedProofs,
      });
    },
    /**
     * @param {{amount: number, serializedProofs: string}} param0
     */
    addPendingToken({ amount, serializedProofs }) {
      this.historyTokens.push({
        status: "pending",
        amount,
        date: currentDateStr(),
        token: serializedProofs,
      });
    },
    /**
     * @param {string} token
     */
    setTokenPaid(token) {
      const index = this.historyTokens.findIndex((t) => t.token === token);
      if (index >= 0) {
        this.historyTokens[index].status = "paid";
      }
    },
  },
});

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}
