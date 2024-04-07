import { defineStore } from "pinia";
import { useWalletStore } from "src/stores/wallet"; // invoiceData,
import { useUiStore } from "src/stores/ui"; // showInvoiceDetails
import { useSendTokensStore } from "src/stores/sendTokensStore"; // showSendTokens and sendData
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";

export const useWorkersStore = defineStore("workers", {
  state: () => {
    return {
      invoiceCheckListener: null as NodeJS.Timeout | null,
      tokensCheckSpendableListener: null as NodeJS.Timeout | null,
    };
  },
  getters: {},
  actions: {
    clearAllWorkers: function () {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
      }
      if (this.tokensCheckSpendableListener) {
        clearInterval(this.tokensCheckSpendableListener);
      }
    },
    invoiceCheckWorker: async function () {
      const walletStore = useWalletStore();
      const uiStore = useUiStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.invoiceCheckListener = setInterval(async () => {
        try {
          nInterval += 1;

          // exit loop after 1m
          if (nInterval > 12) {
            console.log("### stopping invoice check worker");
            this.clearAllWorkers();
          }
          console.log("### invoiceCheckWorker setInterval", nInterval);
          console.log(walletStore.invoiceData);

          // this will throw an error if the invoice is pending
          await walletStore.checkInvoice(walletStore.invoiceData.quote, false);

          // only without error (invoice paid) will we reach here
          console.log("### stopping invoice check worker");
          this.clearAllWorkers();
          uiStore.showInvoiceDetails = false;
          // if (window.navigator.vibrate) navigator.vibrate(200);
          // notifySuccess("Payment received", "top");
        } catch (error) {
          console.log("invoiceCheckWorker: not paid yet");
        }
      }, 5000);
    },
    checkTokenSpendableWorker: async function (tokensBase64: string) {
      const walletStore = useWalletStore();
      const sendTokensStore = useSendTokensStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.tokensCheckSpendableListener = setInterval(async () => {
        try {
          nInterval += 1;
          // exit loop after 30s
          if (nInterval > 10) {
            console.log("### stopping token check worker");
            this.clearAllWorkers();
          }
          console.log("### checkTokenSpendableWorker setInterval", nInterval);
          let paid = await walletStore.checkTokenSpendable(
            tokensBase64,
            false
          );
          if (paid) {
            console.log("### stopping token check worker");
            this.clearAllWorkers();
            sendTokensStore.showSendTokens = false;
          }
        } catch (error) {
          console.log("checkTokenSpendableWorker: not paid yet");
        }
      }, 3000);
    },
  },
});
