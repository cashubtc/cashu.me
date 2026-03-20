import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { notifyError, notifySuccess } from "../js/notify";
import { useTokensStore } from "./tokens";
import { currentDateStr } from "src/js/utils";
import { useProofsStore } from "./proofs";

export const useStorageStore = defineStore("storage", {
  state: () => ({
    lastLocalStorageCleanUp: useLocalStorage(
      "cashu.lastLocalStorageCleanUp",
      new Date()
    ),
  }),
  actions: {
    restoreFromBackup: async function (backup: any) {
      const proofsStore = useProofsStore();
      if (!backup) {
        notifyError("Unrecognized Backup Format!");
      } else {
        const keys = Object.keys(backup);
        for (const key of keys) {
          // we treat some keys differently *magic*
          if (key === "cashu.dexie.db.proofs") {
            const proofs = JSON.parse(backup[key]);
            await proofsStore.addProofs(proofs);
          } else {
            localStorage.setItem(key, backup[key]);
          }
        }
        notifySuccess("Backup restored");
        window.location.reload();
      }
    },
    exportWalletState: async function () {
      const jsonToSave: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) {
          continue;
        }
        const v = localStorage.getItem(k);
        jsonToSave[k] = v;
      }
      // proofs table *magic*
      const proofs = await useProofsStore().getProofs();
      jsonToSave["cashu.dexie.db.proofs"] = JSON.stringify(proofs);

      const textToSave = JSON.stringify(jsonToSave);
      const textToSaveAsBlob = new Blob([textToSave], {
        type: "text/plain",
      });
      const textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

      const fileName = `cashu_me_backup_${currentDateStr()}.json`;
      const downloadLink = document.createElement("a");
      downloadLink.download = fileName;
      downloadLink.innerHTML = "Download File";
      downloadLink.href = textToSaveAsURL;
      downloadLink.onclick = function () {
        document.body.removeChild(event.target);
      };
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      notifySuccess("Wallet backup exported");
    },
    checkLocalStorage: async function () {
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
      const data = new Array(10240).join("x");
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
      const lastCleanUp = this.lastLocalStorageCleanUp;
      if (
        !lastCleanUp ||
        isNaN(new Date(lastCleanUp).getTime()) ||
        new Date().getTime() - new Date(lastCleanUp).getTime() > cleanUpInterval
      ) {
        console.log(`Last clean up: ${lastCleanUp}, cleaning up local storage`);
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
      const paidInvoices = walletStore.invoiceHistory.filter(
        (i) => i.status == "paid"
      );

      if (paidInvoices.length > max_history) {
        const sortedInvoices = paidInvoices.sort((a, b) => {
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
      const paidTokens = tokenStore.historyTokens.filter(
        (t) => t.status == "paid"
      );

      if (paidTokens.length > max_history) {
        const sortedTokens = paidTokens.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const deleteTokens = sortedTokens.slice(
          0,
          sortedTokens.length - max_history
        );
        for (let i = 0; i < deleteTokens.length; i++) {
          deleteTokens[i].token = undefined;
        }
      }

      const localStorageSizeAfter = JSON.stringify(localStorage).length;
      const localStorageSizeDiff =
        localStorageSizeBefore - localStorageSizeAfter;
      console.log(`Cleaned up ${localStorageSizeDiff} bytes of local storage`);
      if (localStorageSizeDiff > 0 && verbose) {
        notifySuccess(`Cleaned up ${localStorageSizeDiff} bytes`);
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
