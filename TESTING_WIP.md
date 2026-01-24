# Cashu.me Testing Implementation Plan

This document outlines a comprehensive, ruthless testing strategy for the Cashu.me wallet. The goal is to move from nearly zero coverage to a robust, reliable codebase.

## 🔴 Priority 1: Core Wallet Logic & Persistence (The "Don't Lose Funds" Phase)

**Estimated Duration:** 4-6 weeks
**Criticality:** Extreme. Any bug here can lead to loss of user funds or broken wallet state.

### 1.1 `src/stores/proofs.ts` (Proof Management)

This is the database layer for ecash tokens. We MUST ensure CRUD operations are atomic and reliable.

- **Unit Tests:**
  - `sumProofs`:
    - Empty array returns 0.
    - Array with one proof returns proof.amount.
    - Array with multiple proofs returns correct sum.
    - Handles large integer amounts without overflow issues (up to 2^53 - 1).
  - `getUnreservedProofs`:
    - Correctly filters out proofs where `reserved === true`.
    - Returns all proofs when none are reserved.
  - `serializeProofs`:
    - Correctly encodes to V4 by default.
    - Falls back to V3 if V4 fails.
    - Includes correct mint URL and unit.
    - Throws error if no keysets/mints are found for the proofs.
- **Integration Tests (Dexie):**
  - `addProofs`:
    - Proofs are correctly added to the `proofs` table.
    - Adding a proof with an existing `secret` should fail or be handled (Dexie unique constraint).
  - `removeProofs`:
    - Successfully deletes proofs by their `secret`.
    - Handles deletion of non-existent proofs gracefully.
  - `setReserved`:
    - Updates `reserved` and `quote` fields for multiple proofs in a single transaction.
    - Unsetting (`reserved = false`) clears the `quote` field.
  - `getProofsForQuote`:
    - Returns exactly the proofs tagged with the given `quote`.

### 1.2 `src/stores/wallet.ts` (Core Controller)

The heart of the application. Handles all Cashu protocol interactions.

- **Unit Tests:**
  - `splitAmount`:
    - Input 0 -> [].
    - Input 1 -> [1].
    - Input 7 -> [1, 2, 4].
    - Input 13 -> [1, 4, 8].
  - `coinSelect`:
    - Exact amount match.
    - Excess amount (returns minimal proofs needed).
    - Insufficient balance (returns empty array).
    - Fee inclusion logic: Verify it accounts for output fees when selecting proofs.
- **Integration Tests (Mocked Mint):**
  - `send`:
    - **Case A: No swap needed.** Total of selected proofs matches target. Verify proofs are reserved but not deleted.
    - **Case B: Swap needed.** Total of selected proofs > target. Verify `swapWallet.send` is called, `keepProofs` are added back, and `sendProofs` are reserved.
    - **Case C: Error handling.** Mint returns error during swap. Verify proofs are unreserved and state is reverted.
  - `melt`:
    - **Success path:** Send -> meltProofs -> get change. Verify change is added to DB and spent proofs are removed.
    - **Change logic:** Verify correct number of blank outputs are generated for change based on `fee_reserve`.
    - **Failure path (Internal):** `meltProofs` throws error. Verify proofs are unreserved and keyset counter is rolled back.
    - **Failure path (External):** Mint returns `UNPAID` state after check. Verify rollback.
    - **Persistence:** Verify `isUnloading` flag prevents destructive state changes if the user closes the app during a pending melt.
  - `mint`:
    - Verify transition from `PAID` quote to proofs.
    - Verify keyset counter is incremented by exactly the number of proofs received.
    - Verify duplicate signatures error (`handleOutputsHaveAlreadyBeenSignedError`) triggers a counter bump and retry.

### 1.3 `src/stores/mints.ts` (Mint Management)

- **Unit/Integration Tests:**
  - `addMint`:
    - URL sanitization (adds https://, removes trailing slashes).
    - Prevents duplicate mint URLs.
    - Successfully triggers Nostr backup after adding.
  - `activateMint`:
    - stops existing workers before switching.
    - updates mint info, keys, and keysets.
    - handles connection errors by marking mint as `errored`.
  - `checkForMintKeysetIdCollisions`:
    - Detects hex-to-bigint collisions even if IDs are formatted differently (hex vs base64).
    - Throws a descriptive error to prevent "poisoned" mint definitions.

### 1.4 `src/stores/p2pk.ts` (P2PK & Security)

- **Unit Tests:**
  - `isValidPubkey`:
    - Valid hex pubkey (66 chars).
    - Valid npub (converted to hex).
    - Invalid strings (too short, wrong prefix).
  - `getSecretP2PKPubkey`:
    - Correctly extracts pubkey from a P2PK lock JSON.
    - Handles locktimes in the past vs future.
    - Handles refund keys after expiry.
  - `isLocked` / `isLockedToUs`:
    - Correctly identifies if a set of proofs is locked to a key in the local keystore.

### 1.5 `src/stores/restore.ts` (Backup & Recovery)

**Extremely Critical for users who lost their DB.**

- **Integration Tests:**
  - `restoreMint`:
    - Mock `wallet.restore` to return batches of proofs.
    - Verify it iterates through keysets.
    - Verify it handles "gaps" (MAX_GAP = 2).
    - Verify it checks proof states (`CheckStateEnum.SPENT` vs `UNSPENT`) before adding to DB.
    - Verify it doesn't add duplicate proofs already in the DB.

### 1.6 `src/stores/swap.ts` (Cross-Mint Swaps)

- **Integration Tests:**
  - `mintAmountSwap`:
    - Workflow: `toWallet.requestMint` -> `fromWallet.melt` -> `toWallet.checkInvoice`.
    - Verify it uses the correct unit (activeUnit).
    - Verify error handling if any of the three steps fail (e.g., fromMint is down after toMint quote was created).

### 1.7 `src/stores/workers.ts` & `src/stores/invoicesWorker.ts` (Background Processing)

- **Unit Tests:**
  - `invoiceCheckWorker`:
    - Verify it stops after 12 intervals (1 minute).
    - Verify it clears old intervals before starting new ones.
  - `InvoicesWorkerStore.processQuotes`:
    - Verify it respects `dueTime` (exponential backoff).
    - Verify it respects global rate limits (`lastInvoiceCheckTime`).
    - Verify it removes quotes from queue once paid.

---

## 🔴 Priority 2: Data Handling & Helpers

**Estimated Duration:** 3-4 weeks
**Criticality:** High. Errors here cause UI glitches or failed parsing of user input.

### 2.1 `src/js/token.ts` & `src/js/utils.js`

- **Unit Tests:**
  - `token.decode`: Test with V3/V4 tokens, malformed strings, and unsupported versions.
  - `token.getUnit` / `token.getMint`: Ensure they extract correct metadata from various token formats.
  - `splitAmount`: Exhaustive tests for various amounts (1 to 2^32).
  - `formatSat` / `formatCurrency`: Test with different locales and currency symbols (BIP-177).

### 2.2 `src/stores/tokens.ts` (History)

- **Unit Tests:**
  - `addPaidToken` / `addPendingToken`: Ensure history entries are created with correct UUIDs and timestamps.
  - `editHistoryToken`:
    - Update amount (maintains sign).
    - Update status.
    - Add amount (handles positive/negative amount correctly).
  - `deleteToken`: Ensure safe removal from history.

### 2.3 `src/stores/price.ts` (Price Fetching)

- **Unit Tests:**
  - `bitcoinPrice`: Verify it correctly stores and updates the BTC price in USD.
  - Test mapping of BTC amounts to USD/EUR based on fetched prices.

### 2.4 `src/stores/migrations.ts`

- **Unit Tests:**
  - Test individual migration functions with mocked initial states.
  - Verify that `runMigrations` applies migrations in the correct order and updates `currentVersion`.
  - Verify it locks the mutex during migration to prevent concurrent db access.

---

## 🟡 Priority 3: UI & Integration (The "User Experience" Phase)

**Estimated Duration:** 4 weeks
**Criticality:** Medium. Ensures the UI accurately reflects the underlying state and handles user interaction safely.

### 3.1 Component Unit Tests

- `AmountInputComponent.vue`: Test input validation, unit switching, and max button.
- `BalanceView.vue`: Test visibility toggling (hide balance), unit display, and reactive updates.
- `HistoryTable.vue`: Test filtering, sorting, and detail view triggers.
- `ParseInputComponent.vue`: Test pasting of various formats (Bolt11, Cashu, LNURL, P2PK).

### 3.2 Integration Flows (Store + UI)

- **Minting Flow:** `CreateInvoiceDialog` -> `wallet.requestMint` -> `wallet.mint` -> `BalanceView` update.
- **Sending Flow:** `SendDialog` -> `wallet.send` -> `DisplayTokenComponent`.
- **Paying Flow:** `PayInvoiceDialog` -> `wallet.decodeRequest` -> `wallet.melt`.

---

## 🛠 Testing Infrastructure Requirements

1. **IndexedDB Mocking:** Use `fake-indexeddb` to test Dexie-related stores without a browser environment.
2. **Pinia Setup:** Ensure fresh Pinia instances for every test (already partially in `setup-file.js`).
3. **Network Mocking:** Use `msw` (Mock Service Worker) or simple `vi.mock` for Axios and Cashu-ts API calls.
4. **Time Traveling:** Use `vi.useFakeTimers()` for testing timeout logic in workers and melt operations.

---

## ✅ Implementation Todo List

### Phase 1: Core (The Foundation)

- [ ] Setup `fake-indexeddb` in `test/vitest/setup-file.js`
- [ ] Implement `src/stores/__tests__/proofs.test.ts`
- [ ] Implement `src/stores/__tests__/mints.test.ts`
- [ ] Implement `src/stores/__tests__/wallet.selection.test.ts` (splitAmount, coinSelect)
- [ ] Implement `src/stores/__tests__/wallet.send.test.ts` (Mocked CashuWallet)
- [ ] Implement `src/stores/__tests__/wallet.receive.test.ts`
- [ ] Implement `src/stores/__tests__/wallet.melt.test.ts`
- [ ] Implement `src/stores/__tests__/p2pk.test.ts`
- [ ] Implement `src/stores/__tests__/nwc.test.ts`
- [ ] Implement `src/stores/__tests__/nostr.test.ts`
- [ ] Implement `src/stores/__tests__/restore.test.ts`
- [ ] Implement `src/stores/__tests__/swap.test.ts`
- [ ] Implement `src/stores/__tests__/workers.test.ts`

### Phase 2: Helpers & History

- [ ] Implement `src/js/__tests__/utils.test.js`
- [ ] Expand `src/js/__tests__/token.test.js` (Include V4 edge cases)
- [ ] Implement `src/stores/__tests__/tokens.test.ts`
- [ ] Implement `src/stores/__tests__/migrations.test.ts`
- [ ] Implement `src/stores/__tests__/price.test.ts`
- [ ] Implement `src/stores/__tests__/ui.test.ts` (Mutex locking/unlocking)

### Phase 3: Components & UI

- [ ] Setup Vue Test Utils
- [ ] Implement `src/components/__tests__/AmountInputComponent.test.ts`
- [ ] Implement `src/components/__tests__/BalanceView.test.ts`
- [ ] Implement `src/components/__tests__/HistoryTable.test.ts`
- [ ] Implement `src/components/__tests__/ParseInputComponent.test.ts`

### Phase 4: Complex Flows (Integration)

- [ ] Implement integration test for "Mint to Balance"
- [ ] Implement integration test for "Send Token via History"
- [ ] Implement integration test for "Pay Bolt11 with Change"
- [ ] Implement integration test for "P2PK Receive"
