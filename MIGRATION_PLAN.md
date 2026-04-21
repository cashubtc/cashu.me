# Cashu.me Coco Migration Plan

## Completed
- **Initialization**: Integrated `@cashu/coco-core` and `@cashu/coco-indexeddb`. Created `src/stores/coco.ts` and `src/boot/coco.ts` to manage the core `Manager` instance.
- **Data Migration**: Added a one-time startup script (`src/js/migrate-to-coco.ts`) to migrate legacy `localStorage` mints and `Dexie.js` proofs into the new IndexedDB schema.
- **Proofs & Balances**: Updated `src/stores/proofs.ts` to drop `Dexie.js` live queries and instead read from `cocoStore.manager.repos.proofRepository`. Listens to Coco's Typed Event Bus (`proofs:saved`, `proofs:state-changed`, etc.) to trigger reactive UI updates.
- **Minting**: Replaced custom polling and `requestMint`/`mintOnPaid` flows in `CreateInvoiceDialog.vue` with `manager.ops.mint.prepare()`, `manager.subscription.awaitMintQuotePaid()`, and `manager.ops.mint.execute()`.
- **Melting / Paying**: Refactored `meltInvoiceData` and `meltQuoteInvoiceData` in `wallet.ts` via patch files to utilize `manager.ops.melt.prepare()` and `execute()`.
- **Swaps**: Rewrote `mintAmountSwap` and `meltProofsToMint` in `swap.ts` to execute sequential `mint.prepare()` + `melt.prepare()` operations over Coco.
- **Receiving Tokens**: Replaced manual token decoding, validation, and secret extraction in `receiveTokensStore.ts` with `manager.ops.receive.prepare()` and `execute()`.
- **History Tracking**: Disabled legacy manual `localStorage` tracking (`historyTokens` and `invoiceHistory`). Rewrote `HistoryTable.vue` to fetch data asynchronously via `manager.history.getPaginatedHistory()`.
- **NWC / Nostr Connect**: Updated `handlePayInvoice` and `handleMakeInvoice` in `nwc.ts` to use Coco APIs. Hooked into `FinalizedMeltOperation` effective fees to accurately deduct NWC allowances.
- **Worker Cleanup**: Disabled custom legacy polling loops (`invoicesWorker.ts`) to let Coco's background `MintOperationWatcher` handle invoice orchestration.

## Remaining to be done
- **Sending Tokens (Offline/Inband)**: Refactor `src/stores/sendTokensStore.ts` and `SendTokenDialog.vue` to completely replace the legacy manual proof extraction and JSON encoding process with `manager.ops.send.prepare()` and `execute()`. Ensure proper handling of pending vs offline tokens.
- **Multi-nut Payments**: Ensure the multi-mint paying feature (`MultinutPaymentDialog.vue`) integrates cleanly with `manager.ops.melt` using multiple mints simultaneously.
- **Nostr Peer-to-Peer Sending (NIP-17/NIP-04)**: `nostr.ts` still has some hardcoded token creation. It needs to utilize `ops.send.prepare()` before DMing tokens to users.
- **Legacy Store Deletion**: Completely purge the old custom functions from `src/stores/wallet.ts` (currently many are left commented out or orphaned) to drastically reduce bundle size and code clutter.
- **Legacy Storage Purge**: Safely drop the `cashuDb` initialization from `dexie.ts` entirely once confident in the migration logic, and stop hydrating `historyTokens` to localStorage.
- **Complete Test Coverage Update**: Fix any remaining legacy mocks in `src/stores/__tests__/wallet.test.js` that might conflict with the new Coco patterns.

