import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useLocalStorage } from "@vueuse/core";
import { notifyError, notifySuccess } from "../js/notify";
import { HistoryToken, useTokensStore } from "./tokens";
import { currentDateStr } from "src/js/utils";
import { coerceWalletProofs, useProofsStore } from "src/stores/proofs";
import {
  buildPaymentRowsFromLegacyInvoice,
  LegacyInvoiceHistory,
  usePaymentHistoryStore,
} from "./paymentHistory";
import {
  BACKUP_TABLE_KEY_PREFIX,
  cashuDb,
  WALLET_TABLES,
  walletTableSpec,
} from "src/stores/dexie";
import { importLegacyLocalStorageKeys } from "src/stores/legacyImporters";
import {
  flushPendingWrites,
  suspendPendingWrites,
} from "src/stores/tableMirror";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { deserializeProofs, JSONInt } from "@cashu/cashu-ts";
import { i18n } from "src/boot/i18n";

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

/**
 * Serialize every backed-up Dexie table as `cashu.dexie.db.<name>`. All
 * tables are read in one read-only transaction, so the backup is a single
 * consistent snapshot (e.g. a mint rename can't split mint rows and keys).
 */
export async function exportBackupTables(): Promise<Record<string, string>> {
  const specs = WALLET_TABLES.filter((spec) => spec.backup);
  const rowsByTable = await cashuDb.transaction(
    "r",
    specs.map((spec) => cashuDb.table(spec.name)),
    async () => {
      const result: Record<string, unknown[]> = {};
      for (const spec of specs) {
        result[spec.name] = await cashuDb.table(spec.name).toArray();
      }
      return result;
    }
  );
  const tables: Record<string, string> = {};
  for (const spec of specs) {
    const key = `${BACKUP_TABLE_KEY_PREFIX}${spec.name}`;
    if (spec.name === "proofs") {
      // proofs table *magic*: exported as plain proofs with number amounts
      const proofs = coerceWalletProofs(rowsByTable[spec.name] as any[]);
      tables[key] = JSONInt.stringify(proofs) as string;
    } else {
      tables[key] = stringifyBackupTable(rowsByTable[spec.name]);
    }
  }
  return tables;
}

export async function restoreBackupTable(name: string, value: string) {
  const spec = walletTableSpec(name);
  if (!spec || !spec.backup) {
    console.warn(`Skipping unknown backup table ${name}`);
    return;
  }
  const parsed = parseBackupTable(value);
  const rows = spec.normalize ? parsed.map(spec.normalize) : parsed;
  if (spec.restore) {
    await spec.restore(rows);
  } else {
    await cashuDb.table(name).bulkPut(rows);
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
      if (!backup) {
        notifyError("Unrecognized Backup Format!");
        return;
      }
      // Land this tab's pending changes, then stop the in-memory stores from
      // writing: restored rows go straight into the tables, and a store's
      // older copy must not overwrite them. The page reloads afterwards
      // (also after a failure), so every store loads the restored data.
      await flushPendingWrites().catch((error) => {
        console.error("Restoring with unsaved changes", error);
      });
      suspendPendingWrites();
      try {
        await this.restoreFromBackupUnchecked(backup);
        notifySuccess("Backup restored");
      } catch (error) {
        console.error("Could not restore backup", error);
        notifyError(i18n.global.t("WalletStorage.restore_failed"));
      }
      window.location.reload();
    },
    restoreFromBackupUnchecked: async function (backup: any) {
      const proofsStore = useProofsStore();
      {
        // Keyset counters belong to one mnemonic. When the backup brings a
        // different one, start from the backup's counters only; merging by
        // max would carry this wallet's counters over to the restored seed.
        const backupMnemonic = backup["cashu.mnemonic"];
        if (
          typeof backupMnemonic === "string" &&
          backupMnemonic !== (localStorage.getItem("cashu.mnemonic") ?? "")
        ) {
          await cashuDb.keysetCounters.clear();
        }
        const keys = Object.keys(backup);
        for (const key of keys) {
          // we treat some keys differently *magic*
          if (key === `${BACKUP_TABLE_KEY_PREFIX}proofs`) {
            const proofs = deserializeProofs(backup[key]);
            // restoring the same backup twice must not fail on known proofs
            await proofsStore.addMissingProofs(proofs);
          } else if (key.startsWith(BACKUP_TABLE_KEY_PREFIX)) {
            await restoreBackupTable(
              key.slice(BACKUP_TABLE_KEY_PREFIX.length),
              backup[key]
            );
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
        // Backups from older versions carry data in localStorage keys that now
        // live in IndexedDB; move them into their tables.
        await importLegacyLocalStorageKeys();
      }
    },
    /**
     * Download a backup file. Pending writes are flushed first. If some could
     * not be saved, the backup is still exported (it is the user's safety net)
     * but flagged as incomplete; with `requireSaved` it is refused instead.
     */
    exportWalletState: async function (
      options: { requireSaved?: boolean } = {}
    ) {
      let complete = true;
      try {
        await flushPendingWrites();
      } catch (error) {
        console.error("Exporting with unsaved changes", error);
        if (options.requireSaved) {
          notifyError(i18n.global.t("WalletStorage.backup_unsaved"));
          throw error;
        }
        complete = false;
      }
      try {
        await this.downloadBackup(complete);
      } catch (error) {
        console.error("Could not create backup", error);
        notifyError(i18n.global.t("WalletStorage.backup_failed"));
        throw error;
      }
    },
    downloadBackup: async function (complete: boolean) {
      const jsonToSave: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) {
          continue;
        }
        const v = localStorage.getItem(k);
        jsonToSave[k] = v;
      }
      Object.assign(jsonToSave, await exportBackupTables());

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
      if (complete) {
        notifySuccess("Wallet backup exported");
      } else {
        notifyError(i18n.global.t("WalletStorage.export_partial"));
      }
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
      await usePaymentHistoryStore().deleteOldPaidPayments(
        max_history,
        useTransactionWorkerStore().queuedQuoteIds()
      );
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
