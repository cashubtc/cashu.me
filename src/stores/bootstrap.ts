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

let ready: Promise<void> | null = null;

export function walletDataReady(): Promise<void> {
  if (!ready) {
    ready = loadWalletData().catch((error) => {
      console.error("Failed to load wallet data", error);
      // allow a retry on the next navigation
      ready = null;
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
    const { useDexieStore } = await import("./dexie");
    await useDexieStore().migrateToDexie();
    const { useMigrationsStore } = await import("./migrations");
    const migrations = useMigrationsStore();
    migrations.initMigrations();
    await migrations.runMigrations();
  });

  // mints first: proofs, history and payment requests resolve against them
  const { useMintsStore } = await import("./mints");
  await useMintsStore().init();

  const [{ useWalletStore }, { useTokensStore }, { usePRStore }] =
    await Promise.all([
      import("./wallet"),
      import("./tokens"),
      import("./payment-request"),
    ]);
  await Promise.all([
    useWalletStore().initPaymentHistory(),
    useTokensStore().initEcashHistory(),
    usePRStore().init(),
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
    const { useWelcomeStore } = await import("./welcome");
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
