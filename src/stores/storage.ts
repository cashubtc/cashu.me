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
import {
  cashuAmountToNumber,
  normalizeCashuQuoteAmounts,
} from "src/js/cashu-amount";

export function stringifyBackupTable(rows: unknown[]): string {
  const serialized = JSONInt.stringify(rows);
  if (serialized === undefined) {
    throw new Error("Could not serialize wallet backup table");
  }
  return serialized;
}

export function parseBackupTable(value: string): any[] {
  const parsed = JSONInt.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid wallet backup table");
  }
  return parsed;
}

/** Validate the existing backup format before either persistence backend is changed. */
export function validateWalletBackup(
  backup: unknown
): asserts backup is Record<string, string> {
  const invalid = () => {
    throw new Error("Invalid wallet backup format");
  };
  const isObject = (value: any) =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const isString = (value: any) =>
    typeof value === "string" && value.length > 0;
  const validUrl = (value: any) => {
    if (!isString(value)) return false;
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        Boolean(url.hostname) &&
        !/[%\s]/.test(url.hostname)
      );
    } catch {
      return false;
    }
  };
  if (!isObject(backup)) invalid();
  const data = backup as Record<string, string>;
  if (Object.values(data).some((value) => typeof value !== "string")) invalid();
  const proofKeys = ["cashu.dexie.db.proofs", "cashu.proofs"].filter(
    (key) => key in data
  );
  if (!proofKeys.length || !("cashu.mints" in data)) invalid();
  for (const key of proofKeys) {
    const proofs = parseBackupTable(data[key]);
    for (const proof of proofs) {
      if (
        !isObject(proof) ||
        !isString(proof.id) ||
        !isString(proof.secret) ||
        !isString(proof.C)
      )
        invalid();
      if (cashuAmountToNumber(proof.amount) <= 0) invalid();
    }
    if (key === "cashu.dexie.db.proofs") deserializeProofs(data[key]);
  }
  const mints = parseBackupTable(data["cashu.mints"]);
  for (const mint of mints) {
    if (
      !isObject(mint) ||
      !validUrl(mint.url) ||
      !Array.isArray(mint.keys) ||
      !Array.isArray(mint.keysets)
    )
      invalid();
    if (mint.nickname !== undefined && typeof mint.nickname !== "string")
      invalid();
    if (
      mint.keys.some(
        (keys: any) =>
          !isObject(keys) || !isString(keys.id) || !isObject(keys.keys)
      )
    )
      invalid();
    if (
      mint.keysets.some(
        (keyset: any) =>
          !isObject(keyset) || !isString(keyset.id) || !isString(keyset.unit)
      )
    )
      invalid();
  }
  if (data["cashu.activeMintUrl"] && !validUrl(data["cashu.activeMintUrl"]))
    invalid();
  const tableKeys = {
    "cashu.dexie.db.paymentHistory": "id",
    "cashu.dexie.db.mintQuotes": "quote",
    "cashu.dexie.db.meltQuotes": "quote",
    "cashu.dexie.db.ecashHistory": "id",
    "cashu.invoiceHistory": "quote",
    "cashu.historyTokens": "date",
  };
  for (const [key, primaryKey] of Object.entries(tableKeys)) {
    if (!(key in data)) continue;
    for (const row of parseBackupTable(data[key])) {
      if (!isObject(row) || !isString(row[primaryKey])) invalid();
      if (
        key === "cashu.dexie.db.mintQuotes" ||
        key === "cashu.dexie.db.meltQuotes"
      )
        normalizeCashuQuoteAmounts(row);
      if (key === "cashu.invoiceHistory")
        buildPaymentRowsFromLegacyInvoice(row);
    }
  }
}

export const useStorageStore = defineStore("storage", {
  state: () => ({
    lastLocalStorageCleanUp: useLocalStorage(
      "cashu.lastLocalStorageCleanUp",
      new Date()
    ),
  }),
  actions: {
    restoreFromBackup: async function (backup: any) {
      try {
        validateWalletBackup(backup);
      } catch {
        notifyError("Invalid wallet backup format");
        return;
      }
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
            await cashuDb.paymentHistory.bulkPut(parseBackupTable(backup[key]));
          } else if (key === "cashu.dexie.db.mintQuotes") {
            await cashuDb.mintQuotes.bulkPut(
              parseBackupTable(backup[key]).map(normalizeCashuQuoteAmounts)
            );
          } else if (key === "cashu.dexie.db.meltQuotes") {
            await cashuDb.meltQuotes.bulkPut(
              parseBackupTable(backup[key]).map(normalizeCashuQuoteAmounts)
            );
          } else if (key === "cashu.dexie.db.ecashHistory") {
            await cashuDb.ecashHistory.bulkPut(parseBackupTable(backup[key]));
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
      jsonToSave["cashu.dexie.db.paymentHistory"] = stringifyBackupTable(
        await cashuDb.paymentHistory.toArray()
      );
      jsonToSave["cashu.dexie.db.mintQuotes"] = stringifyBackupTable(
        await cashuDb.mintQuotes.toArray()
      );
      jsonToSave["cashu.dexie.db.meltQuotes"] = stringifyBackupTable(
        await cashuDb.meltQuotes.toArray()
      );
      jsonToSave["cashu.dexie.db.ecashHistory"] = stringifyBackupTable(
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
