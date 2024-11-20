import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useLocalStorage } from "@vueuse/core";
import { notifyError, notifySuccess } from "../js/notify";
import { useTokensStore } from "./tokens";


export const useStorageStore = defineStore("storage", {
  state: () => ({
    lastLocalStorageCleanUp: useLocalStorage("cashu.lastLocalStorageCleanUp", new Date()),
  }),
  actions: {
    checkLocalStorage: function () {
      const needsCleanup = this.checkLocalStorageQuota();
      if (needsCleanup) {
        this.cleanUpLocalStorage(true);
      } else {
        this.cleanUpLocalStorageScheduler();
      }
    },
    checkLocalStorageQuota: function (): boolean {
      // determine if the user might have exceeded the local storage quota
      // store 10kb of data in local storage to check if it fails
      const localStorageSize = JSON.stringify(localStorage).length;
      console.log(`Local storage size: ${localStorageSize} bytes`);
      let data = new Array(10240).join("x");
      try {
        localStorage.setItem("cashu.test", data);
        localStorage.removeItem("cashu.test");
        return false;
      } catch (e) {
        console.log("Local storage quota exceeded");
        notifyError(
          "Local storage quota exceeded. Clean up your local storage."
        );
        return true;
      }
    },
    cleanUpLocalStorageScheduler: function () {
      const cleanUpInterval = 1000 * 60 * 60 * 24 * 7; // 7 day
      let lastCleanUp = this.lastLocalStorageCleanUp;
      if (
        !lastCleanUp ||
        isNaN(new Date(lastCleanUp).getTime()) ||
        new Date().getTime() - new Date(lastCleanUp).getTime() > cleanUpInterval
      ) {
        this.cleanUpLocalStorage();
      }
    },
    cleanUpLocalStorage: function (verbose = false) {
      const walletStore = useWalletStore();
      const tokenStore = useTokensStore();
      const localStorageSizeBefore = JSON.stringify(localStorage).length;

      // delete cashu.spentProofs from local storage
      localStorage.removeItem("cashu.spentProofs");

      // from all paid invoices in this.invoiceHistory, delete the oldest so that only max 100 remain
      const max_history = 200;
      let paidInvoices = walletStore.invoiceHistory.filter((i) => i.status == "paid");

      if (paidInvoices.length > max_history) {
        let sortedInvoices = paidInvoices.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const deleteInvoices = sortedInvoices.slice(
          0,
          sortedInvoices.length - max_history
        );
        walletStore.invoiceHistory = walletStore.invoiceHistory.filter(
          (i) => !deleteInvoices.includes(i)
        );
      }

      // walk through the oldest paid tokenStore.historyTokens and delete the token
      let paidTokens = tokenStore.historyTokens.filter(
        (t) => t.status == "paid"
      );

      if (paidTokens.length > max_history) {
        let sortedTokens = paidTokens.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const deleteTokens = sortedTokens.slice(
          0,
          sortedTokens.length - max_history
        );
        for (var i = 0; i < deleteTokens.length; i++) {
          deleteTokens[i].token = undefined;
        }
      }

      const localStorageSizeAfter = JSON.stringify(localStorage).length;
      const localStorageSizeDiff =
        localStorageSizeBefore - localStorageSizeAfter;
      console.log(`Cleaned up ${localStorageSizeDiff} bytes of local storage`);
      if (localStorageSizeDiff > 0 && verbose) {
        notifySuccess(
          `Cleaned up ${localStorageSizeDiff} bytes`
        );
      }
      this.lastLocalStorageCleanUp = new Date();
    },

  },
  getters: {
    canPasteFromClipboard() {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
  },
});
