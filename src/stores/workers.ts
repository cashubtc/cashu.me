import { defineStore } from "pinia";
import { useWalletStore } from "src/stores/wallet";
export const useWorkersStore = defineStore("workers", {
  state: () => {
    return {
      invoiceCheckListener: null as NodeJS.Timeout | null,
      invoiceWorkerRunning: false,
      invoiceWorkerProcessing: false,
      checkInterval: 5000,
    };
  },
  getters: {},

  actions: {
    clearAllWorkers: function () {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
        this.invoiceCheckListener = null;
        this.invoiceWorkerRunning = false;
      }
    },
    invoiceCheckWorker: async function (quote: string) {
      const walletStore = useWalletStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.invoiceCheckListener = setInterval(async () => {
        if (this.invoiceWorkerProcessing) return;
        this.invoiceWorkerProcessing = true;
        try {
          this.invoiceWorkerRunning = true;
          nInterval += 1;

          // exit loop after 1m
          if (nInterval > 12) {
            console.log("### stopping invoice check worker");
            this.clearAllWorkers();
            return;
          }
          console.log("### invoiceCheckWorker setInterval", nInterval);

          // this will throw an error if the invoice is pending
          await walletStore.checkInvoiceBolt11(quote, false);

          // only without error (invoice paid) will we reach here
          console.log("### stopping invoice check worker");
          this.clearAllWorkers();
        } catch (error) {
          console.log("invoiceCheckWorker: not paid yet");
        } finally {
          this.invoiceWorkerProcessing = false;
        }
      }, this.checkInterval);
    },
  },
});
