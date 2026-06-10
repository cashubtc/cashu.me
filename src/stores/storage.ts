import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { notifyError, notifySuccess } from "../js/notify";
import { HistoryToken, useTokensStore } from "./tokens";
import { currentDateStr } from "src/js/utils";
import { useProofsStore } from "./proofs";
import {
  buildPaymentRowsFromLegacyInvoice,
  LegacyInvoiceHistory,
  usePaymentHistoryStore,
} from "./paymentHistory";
import { cashuDb } from "./dexie";
import { deserializeProofs, JSONInt } from "@cashu/cashu-ts";

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
            const proofs = deserializeProofs(backup[key]);
            await proofsStore.addProofs(proofs);
          } else if (key === "cashu.dexie.db.paymentHistory") {
            await cashuDb.paymentHistory.bulkPut(JSON.parse(backup[key]));
          } else if (key === "cashu.dexie.db.mintQuotes") {
            await cashuDb.mintQuotes.bulkPut(JSON.parse(backup[key]));
          } else if (key === "cashu.dexie.db.meltQuotes") {
            await cashuDb.meltQuotes.bulkPut(JSON.parse(backup[key]));
          } else if (key === "cashu.dexie.db.ecashHistory") {
            await cashuDb.ecashHistory.bulkPut(JSON.parse(backup[key]));
          } else if (key === "cashu.invoiceHistory") {
            const rows = (
              JSON.parse(backup[key]) as LegacyInvoiceHistory[]
            ).map((invoice) => buildPaymentRowsFromLegacyInvoice(invoice));
            await cashuDb.transaction(
              "rw",
              cashuDb.paymentHistory,
              cashuDb.mintQuotes,
              cashuDb.meltQuotes,
              async () => {
                for (const row of rows) {
                  if (row.mintQuote)
                    await cashuDb.mintQuotes.put(row.mintQuote);
                  if (row.meltQuote)
                    await cashuDb.meltQuotes.put(row.meltQuote);
                  await cashuDb.paymentHistory.put(row.payment);
                }
              }
            );
          } else if (key === "cashu.historyTokens") {
            const historyTokens = (
              JSON.parse(backup[key]) as HistoryToken[]
            ).map((historyToken) => ({
              ...historyToken,
              id:
                historyToken.id ||
                (globalThis.crypto?.randomUUID
                  ? globalThis.crypto.randomUUID()
                  : `${Date.now()}-${Math.random()}`),
            }));
            await cashuDb.ecashHistory.bulkPut(historyTokens);
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
      jsonToSave["cashu.dexie.db.proofs"] = JSONInt.stringify(proofs);
      jsonToSave["cashu.dexie.db.paymentHistory"] = JSON.stringify(
        await cashuDb.paymentHistory.toArray()
      );
      jsonToSave["cashu.dexie.db.mintQuotes"] = JSON.stringify(
        await cashuDb.mintQuotes.toArray()
      );
      jsonToSave["cashu.dexie.db.meltQuotes"] = JSON.stringify(
        await cashuDb.meltQuotes.toArray()
      );
      jsonToSave["cashu.dexie.db.ecashHistory"] = JSON.stringify(
        await cashuDb.ecashHistory.toArray()
      );

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
        await this.cleanUpLocalStorage(true);
      } else {
        await this.cleanUpLocalStorageScheduler();
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
    cleanUpLocalStorageScheduler: async function () {
      const cleanUpInterval = 1000 * 60 * 60 * 24 * 7; // 7 day
      const lastCleanUp = this.lastLocalStorageCleanUp;
      if (
        !lastCleanUp ||
        isNaN(new Date(lastCleanUp).getTime()) ||
        new Date().getTime() - new Date(lastCleanUp).getTime() > cleanUpInterval
      ) {
        console.log(`Last clean up: ${lastCleanUp}, cleaning up local storage`);
        await this.cleanUpLocalStorage();
      }
    },
    cleanUpLocalStorage: async function (verbose = false) {
      const walletStore = useWalletStore();
      const tokenStore = useTokensStore();
      const localStorageSizeBefore = JSON.stringify(localStorage).length;

      // delete cashu.spentProofs from local storage
      localStorage.removeItem("cashu.spentProofs");

      // from all paid invoices in this.invoiceHistory, delete the oldest so that only max 100 remain
      const max_history = 200;
      await usePaymentHistoryStore().deleteOldPaidPayments(max_history);
      walletStore.syncPaymentHistoryCache?.();

      // walk through the oldest paid tokenStore.historyTokens and delete the token
      await tokenStore.redactOldPaidTokens(max_history);

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
