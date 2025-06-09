import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import { useWalletStore } from "src/stores/wallet"; // invoiceData,
import { useUiStore } from "src/stores/ui"; // showInvoiceDetails
import { useSendTokensStore } from "src/stores/sendTokensStore"; // showSendTokens and sendData
import { useSettingsStore } from "./settings";
import { HistoryToken, useTokensStore } from "./tokens";
export const useWorkersStore = defineStore("workers", {
  state: () => {
    return {
      invoiceCheckListener: null as NodeJS.Timeout | null,
      tokensCheckSpendableListener: null as NodeJS.Timeout | null,
      invoiceWorkerRunning: false,
      tokenWorkerRunning: false,
      checkInterval: 5000,
    };
  },
  getters: {},

  actions: {
    clearAllWorkers: function () {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
        this.invoiceWorkerRunning = false;
      }
      if (this.tokensCheckSpendableListener) {
        clearInterval(this.tokensCheckSpendableListener);
        this.tokenWorkerRunning = false;
      }
    },
    invoiceCheckWorker: async function (quote: string) {
      const walletStore = useWalletStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.invoiceCheckListener = setInterval(async () => {
        try {
          this.invoiceWorkerRunning = true;
          nInterval += 1;

          // exit loop after 1m
          if (nInterval > 12) {
            debug("### stopping invoice check worker");
            this.clearAllWorkers();
          }
          debug("### invoiceCheckWorker setInterval", nInterval);

          // this will throw an error if the invoice is pending
          await walletStore.checkInvoice(quote, false);

          // only without error (invoice paid) will we reach here
          debug("### stopping invoice check worker");
          this.clearAllWorkers();
        } catch (error) {
          debug("invoiceCheckWorker: not paid yet");
        }
      }, this.checkInterval);
    },
    checkTokenSpendableWorker: async function (historyToken: HistoryToken) {
      const settingsStore = useSettingsStore();
      if (!settingsStore.checkSentTokens) {
        debug(
          "settingsStore.checkSentTokens is disabled, not kicking off checkTokenSpendableWorker"
        );
        return;
      }
      debug("### kicking off checkTokenSpendableWorker");
      this.tokenWorkerRunning = true;
      const walletStore = useWalletStore();
      const sendTokensStore = useSendTokensStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.tokensCheckSpendableListener = setInterval(async () => {
        try {
          nInterval += 1;
          // exit loop after 30s
          if (nInterval > 10) {
            debug("### stopping token check worker");
            this.clearAllWorkers();
          }
          debug("### checkTokenSpendableWorker setInterval", nInterval);
          let paid = await walletStore.checkTokenSpendable(historyToken, false);
          if (paid) {
            debug("### stopping token check worker");
            this.clearAllWorkers();
            sendTokensStore.showSendTokens = false;
          }
        } catch (error) {
          debug("checkTokenSpendableWorker: some error", error);
          this.clearAllWorkers();
        }
      }, this.checkInterval);
    },
  },
});
