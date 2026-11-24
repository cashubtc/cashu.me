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
import { i18n } from "src/boot/i18n";

let ready: Promise<void> | null = null;

/**
 * The wallet runs in one tab at a time: stores load their tables once and do
 * not follow writes from other tabs. Thrown (without a notification) when
 * another tab already holds the wallet; the router shows /already-running.
 */
export class WalletOpenInAnotherTabError extends Error {
  constructor() {
    super("The wallet is already open in another tab");
    this.name = "WalletOpenInAnotherTabError";
  }
}

let tabLock: Promise<boolean> | null = null;

/**
 * Hold a Web Lock for this tab's lifetime. Resolves false when another tab
 * holds it. Without Web Locks every tab proceeds, as before.
 */
function acquireTabLock(): Promise<boolean> {
  if (!tabLock) {
    const locks = (globalThis.navigator as any)?.locks;
    if (!locks?.request) {
      tabLock = Promise.resolve(true);
    } else {
      tabLock = new Promise<boolean>((resolve) => {
        locks
          .request(
            "cashu-wallet-tab",
            { ifAvailable: true },
            (lock: unknown) => {
              resolve(!!lock);
              // keep the lock until the tab closes
              return lock ? new Promise(() => {}) : undefined;
            }
          )
          .catch(() => resolve(true));
      }).then((acquired) => {
        // let a later attempt (e.g. "Retry" after the other tab closed) ask again
        if (!acquired) tabLock = null;
        return acquired;
      });
    }
  }
  return tabLock;
}

/**
 * Rejects when the wallet data could not be loaded. The user is told, and the
 * next call (e.g. the next navigation) tries again. Stores that did not load
 * never write, so nothing stored is overwritten in the meantime.
 */
export function walletDataReady(): Promise<void> {
  if (!ready) {
    ready = loadWalletData().catch((error) => {
      ready = null;
      if (!(error instanceof WalletOpenInAnotherTabError)) {
        console.error("Failed to load wallet data", error);
        notifyError(i18n.global.t("WalletStorage.load_failed")).catch(() => {});
      }
      throw error;
    });
  }
  return ready;
}

/** For tests: forget that the wallet data was loaded. */
export function resetWalletDataReadyForTests() {
  ready = null;
  tabLock = null;
}

async function loadWalletData() {
  if (!(await acquireTabLock())) throw new WalletOpenInAnotherTabError();

  await withMigrationLock(async () => {
    const { useDexieStore } = await import("src/stores/dexie");
    await useDexieStore().migrateToDexie();
    const { useMigrationsStore } = await import("src/stores/migrations");
    const migrations = useMigrationsStore();
    migrations.initMigrations();
    // A failed migration (reported, retried later) stops startup: stores
    // and workers must not run without the data it was moving.
    if (!(await migrations.runMigrations())) {
      throw new Error("A wallet data migration failed");
    }
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
