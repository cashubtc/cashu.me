import type { Page } from "@playwright/test";

/** Read-only assertions against the isolated browser wallet, never app mutation. */
export async function walletRows(page: Page, table: string): Promise<any[]> {
  return page.evaluate(
    (name) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("db");
        request.onerror = () =>
          reject(new Error("Could not inspect test wallet database"));
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(name, "readonly");
          const read = tx.objectStore(name).getAll();
          read.onsuccess = () => resolve(read.result);
          read.onerror = () => reject(read.error);
          tx.oncomplete = () => db.close();
          tx.onabort = () => db.close();
        };
      }),
    table
  );
}
