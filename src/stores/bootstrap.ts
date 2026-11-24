/**
 * Loads persisted wallet data before any page uses it.
 *
 * localStorage reads are synchronous, IndexedDB reads are not. Stores whose
 * data lives in IndexedDB keep an in-memory copy that is filled here, after
 * the versioned migrations have moved any legacy localStorage keys into their
 * tables. The router awaits `walletDataReady()` before the first navigation,
 * so pages, getters and background workers never see an empty store that is
 * merely not loaded yet, and never write over data that is still loading.
 */

import { notifyError } from "src/js/notify";

let ready: Promise<void> | null = null;

/**
 * Rejects when the wallet data could not be loaded. The user is told, and the
 * next call (e.g. the next navigation) tries again. Stores that did not load
 * never write, so nothing stored is overwritten in the meantime.
 */
export function walletDataReady(): Promise<void> {
  if (!ready) {
    ready = loadWalletData().catch((error) => {
      console.error("Failed to load wallet data", error);
      notifyError(
        "Could not load wallet data. Reload the app to try again."
      ).catch(() => {});
      ready = null;
      throw error;
    });
  }
  return ready;
}

/** For tests: forget that the wallet data was loaded. */
export function resetWalletDataReadyForTests() {
  ready = null;
}

async function loadWalletData() {
  await withMigrationLock(async () => {
    const { useDexieStore } = await import("src/stores/dexie");
    await useDexieStore().migrateToDexie();
    const { useMigrationsStore } = await import("src/stores/migrations");
    const migrations = useMigrationsStore();
    migrations.initMigrations();
    await migrations.runMigrations();
  });

  // Wallet secrets state and mints first: everything else resolves against
  // the mints, and no output may be derived before the counters are loaded.
  const [{ useMintsStore }, { useWalletStore: useWallet }, { useP2PKStore }] =
    await Promise.all([
      import("src/stores/mints"),
      import("src/stores/wallet"),
      import("src/stores/p2pk"),
    ]);
  await Promise.all([
    useMintsStore().init(),
    useWallet().initKeysetCounters(),
    useP2PKStore().init(),
  ]);

  const [
    { useWalletStore },
    { useTokensStore },
    { usePRStore },
    { useTransactionWorkerStore },
  ] = await Promise.all([
    import("src/stores/wallet"),
    import("src/stores/tokens"),
    import("src/stores/payment-request"),
    import("src/stores/transactionWorker"),
  ]);
  await Promise.all([
    useWalletStore().initPaymentHistory(),
    useTokensStore().initEcashHistory(),
    usePRStore().init(),
    useTransactionWorkerStore().init(),
  ]);

  void requestPersistentStorage();
}

/**
 * Only one tab runs migrations at a time. A second tab is sent to
 * /already-running, but only after it has started, so without the lock two
 * tabs could run the same migration at once.
 */
async function withMigrationLock(fn: () => Promise<void>) {
  const locks = (globalThis.navigator as any)?.locks;
  if (!locks?.request) {
    await fn();
    return;
  }
  await locks.request("cashu-migrations", fn);
}

/**
 * Ask the browser not to evict our IndexedDB data under storage pressure.
 * Proofs are money, so we ask once onboarding is done.
 */
async function requestPersistentStorage() {
  try {
    const storage = globalThis.navigator?.storage;
    if (!storage?.persist || !storage.persisted) return;
    const { useWelcomeStore } = await import("src/stores/welcome");
    if (useWelcomeStore().showWelcome) return;
    if (!(await storage.persisted())) {
      const granted = await storage.persist();
      console.log(`Persistent storage ${granted ? "granted" : "not granted"}`);
    }
    if (storage.estimate) {
      const { usage, quota } = await storage.estimate();
      console.log(`Storage usage: ${usage} of ${quota} bytes`);
    }
  } catch (error) {
    console.warn("Could not request persistent storage", error);
  }
}
