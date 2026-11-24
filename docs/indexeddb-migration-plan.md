# Moving the remaining dynamic state from localStorage to IndexedDB

Status: proposal · Scope: `src/stores/*`, `src/stores/dexie.ts`, `src/stores/storage.ts`, `src/stores/migrations.ts`

## 1. How we migrated so far

There are three generations of migration in the codebase. The newest is the one to keep using.

| Data | Where it lives now | How it got there |
| --- | --- | --- |
| Proofs (`cashu.proofs`) | `db.proofs` | `useDexieStore().migrateToDexie()` gated by the `cashu.dexie.migrated` flag, called from `WalletPage.created` |
| Lightning payment history (`cashu.invoiceHistory`) | `db.paymentHistory`, `db.mintQuotes`, `db.meltQuotes` | Versioned migration **v4** in `migrations.ts` → `paymentHistory.migrateLegacyInvoiceHistoryFromLocalStorage()` |
| Ecash history (`cashu.historyTokens`) | `db.ecashHistory` | Versioned migration **v5** → `tokens.migrateHistoryTokensFromLocalStorage()` |
| Mint reviews, NIP-87 infos, HTTP info cache | separate `mintReviews` DB | Created fresh, no migration (caches) |
| Web-of-trust crawl | separate `nostrUserDB` DB | Created fresh, no migration (cache) |

The v4/v5 pattern, which is the one to repeat:

1. **Schema**: bump `CashuDexie` to a new `version(n)` that adds the tables (with an `.upgrade()` only when existing rows need reshaping, as in v4).
2. **Data move**: register a migration in `migrations.ts`. It runs under the global mutex, before the history stores hydrate. It reads the legacy key, transforms it, `bulkPut`s inside one `rw` transaction, and only then calls `localStorage.removeItem`. `bulkPut` makes it idempotent, and a failure stops the chain without bumping `cashu.migrations.version`, so it is retried on the next launch.
3. **Runtime**: Dexie is the source of truth. The Pinia store keeps an in-memory mirror that a `liveQuery` subscription plus an explicit `refresh…()` after each write keeps current, so components and getters still read synchronously.
4. **Backup**: `storage.exportWalletState()` writes each table under a `cashu.dexie.db.<table>` key (BigInt-safe via `JSONInt`). `restoreFromBackup()` maps those keys back, and also accepts the legacy localStorage keys so that old backup files can still be restored.
5. **Wipe**: `dexie.deleteAllTables()` plus the per-DB `clearAllDatabases()` from Advanced Settings.

### Things the next round should do better

- **Write ordering in the first migration.** `migrateToDexie()` calls `cashuDb.proofs.add()` in a `forEach` without awaiting it, then removes `cashu.proofs` straight away (the backup download it triggers first is the only safety net). Every new migration should commit the transaction, check the row count, and only then delete the key. A shared helper (§3.2) enforces this.
- **Each table is listed by hand in four places**: the schema, export, restore and `deleteAllTables`. It is easy to add a table and leave it out of the backup, which would silently lose data. A table registry (§3.1) fixes this.
- **Pruning leaves rows behind.** `deleteOldPaidPayments()` deletes `paymentHistory` rows but leaves their `mintQuotes`/`meltQuotes` rows, so those two tables grow without limit.
- **Fire-and-forget writes.** `tokens.persistHistoryToken()` doesn't await its `put`. Writes should be awaited wherever a later step depends on them.
- **No persistent-storage request.** Nothing calls `navigator.storage.persist()`. Proofs are money. Once more data lives in IndexedDB we should ask the browser to keep it, so that it isn't evicted under storage pressure.

## 2. What is still in localStorage

I listed every `cashu.*` key and sorted them by whether they grow.

### Moving to IndexedDB (dynamic or large)

| Key | Store | Why it should move |
| --- | --- | --- |
| `cashu.mints` | `mints.ts` | **Largest remaining blob.** Each mint embeds `keys[]` for every keyset it has ever had (~64 pubkeys, ≈5–6 KB per keyset), plus `info` and `keysets`. The array only grows as mints rotate keysets, and `useLocalStorage` re-serializes all of it on every small change (`motdDismissed`, `lastInfoUpdated`, `multinutSelected`, …). |
| `cashu.pr.ours` | `payment-request.ts` | A new entry is appended per payment request and pruned only for foreign keys. `receivedPaymentIds[]` inside each entry also grows. |
| `cashu.worker.invoices.quotesQueue`, `…bolt12QuotesQueue`, `…onchainQuotesQueue`, `cashu.worker.outgoing.queue` | `transactionWorker.ts` | Capped at 50 entries / 14 days, but `lastChecked` and `checkCount` change on every worker tick, so the whole array is re-stringified many times a minute. Most of the data duplicates `mintQuotes`/`meltQuotes`. |
| `cashu.nwc.connections` (`processedRequestIds`) | `nwc.ts` | Up to 1,000 event ids per connection, kept inside the connection object, which also holds that connection's secret. |
| `cashu.ndk.nip17EventIdsWeHaveSeen` | `nostr.ts` | Seen-event log with a 10-day window, checked with a linear `find` on every incoming event. Same job as NWC's `processedRequestIds`. |
| `cashu.ndk.mintRecommendations` | `mintRecommendations.ts` | Derived from the `mintReviews` DB, so it belongs there. It's a cache, so it can be rebuilt instead of migrated. |
| `cashu.keysetCounters`, `cashu.oldMnemonicCounters` | `wallet.ts` | Small, and grows once per keyset and per mnemonic rotation. The real reason to move it is **atomicity**: the counter bump can then commit in the same transaction as the proofs and quotes it produced. It needs care (see Phase 4). |
| `cashu.P2PKKeys` | `p2pk.ts` | Grows with every generated key. Losing it means losing access to ecash locked to those keys. Low volume, high stakes. |

### Staying in localStorage

These are small fixed-size scalars, or they must be readable synchronously before the app mounts:

- Settings and UI flags: `cashu.settings.*`, `cashu.ui.*`, `cashu.welcome.*`, `cashu.restore.*`, `cashu.p2pk.showP2PkButtonInDrawer`, `cashu.pr.enable`/`receive`, `cashu.nwc.enabled`, `cashu.nip60.*`, `cashu.npc.*` (npubcash config).
- Boot-time keys: `cashu.language` (read in `boot/i18n.js` before Vue starts), `cashu.theme`, `cashu.darkMode`.
- Pointers and bookkeeping: `cashu.activeMintUrl`, `cashu.activeUnit`, `cashu.migrations.version`, `cashu.dexie.migrated`, `cashu.lastLocalStorageCleanUp`, `cashu.nostrMintBackup.lastBackupTimestamp`, `cashu.nwc.seenCommandsUntil`, `cashu.ndk.lastEventTimestamp`.
- Price: `cashu.price.*`. The `bitcoinPrices` map is a few KB and fixed-size. It doesn't need IndexedDB, though we could store only the selected currency.
- Secrets: `cashu.mnemonic` and the `cashu.ndk.*` signer keys. They are small and read synchronously at boot. Moving them is a separate security decision, not a storage-size one, so they are out of scope here.

## 3. Shared infrastructure (Phase 0, one PR, no data moves)

### 3.1 Table registry

Add one list in `dexie.ts` that every whole-database operation iterates over:

```ts
// dexie.ts
export const BACKED_UP_TABLES = [
  "proofs", "paymentHistory", "mintQuotes", "meltQuotes", "ecashHistory",
  // new tables are added here, and nowhere else
] as const;
```

- `exportWalletState()` loops over it and writes `cashu.dexie.db.<name>` with `stringifyBackupTable`. Proofs keep their current `JSONInt` path.
- `restoreFromBackup()` handles any `cashu.dexie.db.<name>` key whose name is in the registry with `bulkPut(parseBackupTable(...))`, plus a per-table `normalize` hook (quotes already need `normalizeCashuQuoteAmounts`). The legacy-key branches stay as they are, and we add one branch for each key we retire in this plan (`cashu.mints`, `cashu.pr.ours`, …). That way an old backup file restores into the new tables instead of writing back to localStorage a key the app no longer reads.
- `deleteAllTables()` becomes `Promise.all(cashuDb.tables.map(t => t.clear()))`.
- Add a unit test that fails when a table in `cashuDb.tables` is missing from the registry and isn't explicitly marked as a cache.

### 3.2 `moveLocalStorageKey` helper

This replaces the hand-written migration bodies:

```ts
async function moveLocalStorageKey<T, R>(opts: {
  key: string;
  tables: Table[];                        // the tables the write touches
  parse?: (raw: string) => T;             // default JSON.parse
  write: (value: T) => Promise<number>;   // runs inside the rw transaction, returns rows written
  verify?: () => Promise<boolean>;        // e.g. row count >= source length
}) {
  const raw = localStorage.getItem(opts.key);
  if (raw == null) return;                // already moved, or never existed
  const value = (opts.parse ?? JSON.parse)(raw);
  await cashuDb.transaction("rw", opts.tables, () => opts.write(value));
  if (opts.verify && !(await opts.verify())) {
    throw new Error(`verification failed for ${opts.key}`); // key stays, migration retries
  }
  localStorage.removeItem(opts.key);      // only after commit + verify
}
```

Every data move in the phases below is a `migrations.ts` entry (v6, v7, …) that calls this helper.

### 3.3 Hydration gate

`useLocalStorage` is synchronous. Dexie isn't. The two failure modes are a reader that sees an empty store before hydration, and, worse, **a write made before hydration that the hydration then overwrites, or that overwrites the hydrated data**. Mints are read everywhere (getters, `MintClass`, `mintWalletSync`, the proofs `liveQuery` callback), so:

- Each migrated store exposes `hydrated: boolean` and an `init()` that loads its tables and starts its `liveQuery` (same as `initPaymentHistory` / `initEcashHistory`).
- Add `src/stores/bootstrap.ts` with `await walletDataReady()`: run migrations, then `Promise.all` of every store's `init()`. `WalletPage.created` already awaits migrations plus the two history inits. That block becomes this one call, and the transaction worker, websocket, NWC and NIP-17 listeners start only after it.
- Store write actions assert `hydrated` in dev builds, so that ordering bugs show up in tests.

I'd avoid a generic `useDexieRef()` drop-in for `useLocalStorage`. Its async default value is exactly what causes the write-before-hydrate bug, and explicit tables let us index the fields we actually query.

### 3.4 Storage hygiene

- Call `navigator.storage.persist()` once after onboarding finishes, and log `navigator.storage.estimate()` in the debug console.
- Rename `cleanUpLocalStorage` to `pruneStorage` and fix the orphaned quote rows: delete the `mintQuotes`/`meltQuotes` rows that belong to pruned `paymentHistory` rows in the same transaction.
- Keep `checkLocalStorageQuota()`. It still matters until Phase 2 lands.

## 4. Phased migration

Each phase is one PR: a schema version, a migration entry, store changes, backup registry entries and tests. The phases are ordered by payoff divided by risk.

### Phase 1: easy wins (caches and seen-event logs)

**Dexie `version(5)`**

```ts
seenEvents:      "[scope+id], scope, created_at",   // scope: "nip17" | `nwc:${connectionPubkey}`
paymentRequests: "id, createdAt",
```

In `mintReviews` DB v3: `recommendations: "url"`.

- **Mint recommendations**: store the rows in `mintReviews.recommendations`, or recompute them from `reviews` on hydrate. Migration: `localStorage.removeItem("cashu.ndk.mintRecommendations")`, the same as migration v2 already did once. Keep this out of the backup registry because it is a cache.
- **Seen events**: `nostr.ts` and `nwc.ts` check with `seenEvents.get([scope, id])` and record with `put`. A single `where("created_at").below(cutoff).delete()` replaces both pruning paths: the 10-day filter and the 1,000-id cap. Migration: copy `nip17EventIdsWeHaveSeen`, and each connection's `processedRequestIds`, into the table, then strip `processedRequestIds` from `cashu.nwc.connections`. The connections themselves (secret plus allowance) stay in localStorage. Back up `seenEvents` so that a restored wallet doesn't re-process old DMs or NWC requests.
- **Payment requests**: move `ourPaymentRequests` into `paymentRequests`. Drop `receivedPaymentIds[]`, because `ecashHistory` already has a `paymentRequestId` index, so "payments for this request" becomes `ecashHistory.where("paymentRequestId").equals(id)`. Replace `selectedPRIndex` with `selectedPaymentRequestId` (localStorage, a scalar), so that pruning can't shift the selection.

### Phase 2: mints, keysets and keys (the big one)

**Dexie `version(6)`**

```ts
mints:    "url",                         // StoredMint without keys
mintKeys: "id, mintUrl",                 // MintKeys rows: immutable per keyset id
```

Keysets stay embedded in the mint row. They are small, and almost every reader wants them together with the mint.

- **Store shape**: `useMintsStore().mints` stays a `StoredMint[]` in memory, built from `mints` plus `mintKeys` at hydrate time. That leaves the many call sites across stores and components unchanged.
- **Writes**: today code mutates the persisted array in place (`wallet.ts` merges `mint.keys`/`mint.keysets` directly, `updateMint` replaces by index, migration v1 rewrites `url`). Each of these becomes a call to one action: `persistMint(mint)` for metadata and `putKeys(keys[])` for new keysets. A temporary dev-only `watch(mints, …, { deep: true })` that warns when the in-memory array diverges from Dexie will catch any mutation site we miss.
- **Keys**: `getKeysForKeyset` and wallet construction read from the in-memory map. Later we can load keys for inactive keysets lazily, which is where most of the memory goes. That is a follow-up, not part of this phase.
- **Data migration** (next `migrations.ts` entry): `moveLocalStorageKey("cashu.mints")` splits each mint into one `mints` row plus N `mintKeys` rows. Verify that every source mint url is present and that the `mintKeys` count equals the total keys entries.
- **Backup**: add `mints` and `mintKeys` to the registry. Restore keeps accepting a legacy `cashu.mints` key from old backup files and runs the same splitter.
- **Tests**: extend `mintsActiveMint.test.ts` and `walletStoreInit.test.ts` with fake-indexeddb, plus a round-trip test: legacy `cashu.mints` → migrate → export → wipe → restore → identical `StoredMint[]`.

### Phase 3: transaction worker queues

**Dexie `version(7)`**

```ts
workerQueue: "[kind+quote], kind, mintUrl, nextCheckAt",
```

- `kind` is `"bolt11" | "bolt12" | "onchain" | "outgoing"`. Store the scheduling fields (`addedAt`, `lastChecked`, `checkCount`, `nextCheckAt`) and a reference to the quote, not a copy of it. The quote body is already in `mintQuotes`/`meltQuotes`.
- The tick updates one row (`update([kind, quote], { lastChecked, checkCount })`) instead of re-serializing four arrays.
- The two cooldown maps (`reusableMintCooldowns`, `batchPathCooldowns`) are small, keyed by mint, and read on every tick. Leave them in localStorage.
- This is the most timing-sensitive store and already has good coverage (`transactionWorker.test.js`, `workers.test.ts`). Keep the in-memory arrays as the working set and write through to Dexie, rather than querying Dexie inside the tick loop.

### Phase 4: wallet-critical state (counters and P2PK keys)

Do this last, deliberately, and only after Phases 0–2 have proven the pattern in production.

```ts
keysetCounters: "[mnemonicId+keysetId], mnemonicId",  // mnemonicId = hash of the mnemonic, not the mnemonic itself
p2pkKeys:       "publicKey, used",
```

- **Counters**: a counter that goes backwards makes the wallet re-derive outputs it has already used. The mint then refuses to sign them, and recovery needs a restore. Rules:
  - The migration writes `max(existing, legacy)` and never overwrites with a smaller value.
  - `syncCounterToStorage` keeps its `Math.max` semantics inside a Dexie transaction.
  - Once counters are in Dexie, mint/melt/swap can bump the counter **in the same transaction** as the proof and quote writes. That is the real benefit of this phase, because today the two can diverge if the tab dies between writes.
  - `oldMnemonicCounters` contains old mnemonics. Keep the secret part in localStorage, or treat it separately. Only the counter rows should move, keyed by a mnemonic fingerprint.
- **P2PK keys**: a straight move with `moveLocalStorageKey`. They must be in the backup registry from day one.

## 5. Rollout and safety

- **Before any destructive migration**, the first migration downloaded a backup file. Don't do that on every upgrade, because it's surprising. Instead, keep a copy of the legacy value under `cashu.legacy.<key>` for one release after a successful move, then delete those copies in a later migration. This gives us a rollback path without user interaction.
- **Downgrades**: a user who loads an older build after migrating will see empty mints, because Dexie upgrades are one-way and the old code reads localStorage. The `cashu.legacy.*` copy plus a short release gap between the "write to Dexie" release and the "delete legacy copies" release covers this.
- **Multiple tabs**: `registerBroadcastChannel` sends a second tab to `/already-running`, but `WalletPage.created` registers it *after* `runMigrations()`. A second tab opened during an upgrade can therefore start the same migration. The migrations are idempotent (`bulkPut`, and the key is removed after commit), so this is mostly harmless. Still, wrap `walletDataReady()` in `navigator.locks.request("cashu-migrations", …)` so that only one tab migrates at a time. `liveQuery` already propagates changes across tabs.
- **Electron and Capacitor**: both use Chromium/WebKit IndexedDB, as `proofs` already does. Nothing platform-specific.
- **Observability**: log the bytes moved per migration (`JSON.stringify(localStorage).length` before and after), like `cleanUpLocalStorage` does today.

## 6. Expected outcome

After Phases 1–3, what remains in localStorage is a few dozen fixed-size scalars, some secrets, and the price map, probably well under 50 KB however long a wallet has been in use. Everything that grows over time is in indexed tables. All of those tables, apart from rebuildable caches, are included automatically in backup, restore and wipe.

## 7. As built

All phases are implemented (Dexie `version(5)` to `version(8)`, `migrations.ts` v6 to v9). Where the implementation differs from the proposal above:

- **Write-through mirrors instead of explicit write actions.** The stores mutate their arrays in place in many places, so routing every write through new actions would have touched a lot of code. `createTableMirror` (`src/stores/tableMirror.ts`) keeps the in-memory array and diffs it per row, writing changed rows and deleting removed ones. Nothing is written before `hydrate()` has run. Payment requests, mints, worker queues, keyset counters and P2PK keys all use it. The dev-only "divergence watcher" from Phase 2 isn't needed with this approach.
- **Importers double as restore paths.** Each moved key has an idempotent importer in `src/stores/legacyImporters.ts`. Migrations call them, and `restoreFromBackup` runs them after writing an old backup's keys, so old backup files land in the new tables.
- **Startup gate.** `walletDataReady()` (`src/stores/bootstrap.ts`) runs from a router `beforeEach` guard, inside `navigator.locks.request("cashu-migrations")`. Every route, not just the wallet page, waits for it.
- **`flushPendingWrites()`** is awaited before the app reloads or navigates away: backup restore, finishing onboarding, MOTD navigation and wallet wipe.
- **Phase 1:** `receivedPaymentIds` and `selectedPRIndex` are kept as they were. Incoming payments already carry `paymentRequestId`, so the list could be derived from `ecashHistory` instead. Both fields are part of the store's tested behaviour (the dialog's "paid" state, request replacement), so that change is left as a follow-up. NWC seen ids are pruned by age (twice the 24 h subscription window) instead of the 1,000-id cap.
- **Phase 2:** `mintKeys` is keyed by `[mintUrl+id]`. Keys for inactive keysets are not loaded lazily yet.
- **Phase 3:** no `nextCheckAt` index. The queue entries were already references (quote id plus scheduling fields), not copies.
- **Phase 4:**
  - `keysetCounters` holds the current mnemonic's counters, keyed by keyset id, the same as the old localStorage key. `cashu.oldMnemonicCounters` stays in localStorage because it contains mnemonics.
  - Counters never go backwards. The migration, restore (`putKeysetCountersMax`) and "changed before load" merges all take the maximum, and a counter source created before load is advanced to the stored values.
  - **Not done:** bumping the counter in the same IndexedDB transaction as the proof and quote writes. That needs the mint/melt/swap flows restructured and is a follow-up.
- **Not done from §3.4:** renaming `cleanUpLocalStorage`, and pruning orphaned quote rows. The orphaned-rows fix is in a separate PR.
