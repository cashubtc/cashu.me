import { defineStore } from "pinia";
import { useWalletStore } from "src/stores/wallet"; // invoiceData,
import { useUiStore } from "src/stores/ui"; // showInvoiceDetails
import { useSendTokensStore } from "src/stores/sendTokensStore"; // showSendTokens and sendData
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";

export const useWorkersStore = defineStore("workers", {
  state: () => {
    return {
      invoiceCheckListener: () => {},
      tokensCheckSpendableListener: () => {},
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

          // exit loop after 2m
          if (nInterval > 40) {
            console.log("### stopping invoice check worker");
            this.clearAllWorkers();
          }
          console.log("### invoiceCheckWorker setInterval", nInterval);
          console.log(walletStore.invoiceData);

          // this will throw an error if the invoice is pending
          await walletStore.checkInvoice(walletStore.invoiceData.hash, false);

          // only without error (invoice paid) will we reach here
          console.log("### stopping invoice check worker");
          this.clearAllWorkers();
          walletStore.invoiceData.bolt11 = "";
          uiStore.showInvoiceDetails = false;
          if (window.navigator.vibrate) navigator.vibrate(200);
          notifySuccess("Payment received", "top");
        } catch (error) {
          console.log("invoiceCheckWorker: not paid yet");
        }
      }, 3000);
    },
    checkTokenSpendableWorker: async function () {
      const walletStore = useWalletStore();
      const sendTokensStore = useSendTokensStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.tokensCheckSpendableListener = setInterval(async () => {
        try {
          nInterval += 1;
          // exit loop after 2m
          if (nInterval > 24) {
            console.log("### stopping token check worker");
            this.clearAllWorkers();
          }
          console.log("### checkTokenSpendableWorker setInterval", nInterval);
          console.log(sendTokensStore.sendData);

          // this will throw an error if the invoice is pending
          let paid = await walletStore.checkTokenSpendable(
            sendTokensStore.sendData.tokensBase64,
            false
          );
          if (paid) {
            console.log("### stopping token check worker");
            this.clearAllWorkers();
            sendTokensStore.sendData.tokens = "";
            sendTokensStore.showSendTokens = false;
          }
        } catch (error) {
          console.log("checkTokenSpendableWorker: not paid yet");
        }
      }, 3000);
    },
  },
});
