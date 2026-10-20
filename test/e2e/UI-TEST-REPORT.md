# Wallet UI browser coverage and defect report

This change adds browser tests for the UI interactions in the coverage review.
All wallet funds, proofs, invoices, and transfers use disposable local CDK mints.
No real wallet, public mint, or personal seed is used.

## Test design

- Mint A and B retain the existing sat-only configuration. Mint C advertises sat,
  USD, and EUR and issues real proofs for all three units.
- The new page object performs changes through visible controls. Storage reads
  in validation tests are assertions, not a way to perform the interaction.
- Prices and npub.cash responses are fulfilled by deterministic local fixtures.
  Public HTTP and secure WebSocket traffic remains blocked.
- CDK fake backends settle independently. Successful swap tests delay the
  destination quote response until that real quote is paid, matching the ordering
  of a completed Lightning payment. They do not fabricate proofs or paid states.
- Onboarding waits for the mint in the joined-mint list; matching the preview
  URL could previously continue before the connection completed.
- Browser tests drain route handlers before context teardown. Existing pending
  melt tests now await the response and assert the reserved amount, preventing
  premature success and disposed-response errors.
- The camera fixture supplies QR images as video frames. The wallet's real QR
  decoder and payment parser still run. It does not invoke component callbacks.
- Touch tests use Chromium's mobile viewport and touch input. They do not claim
  coverage of Safari, native NFC, real cameras, or installed service workers.
- Expected failures run their setup normally, then mark the specific assertion
  for a reproduced defect with `test.fail`. A fix that makes the test pass is an
  unexpected pass, prompting removal of the annotation. These are not skipped
  tests and do not mean the underlying feature is healthy.

## Coverage map

| Interaction           | Browser coverage                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Add mints             | Add/cancel, nickname, URL normalization, duplicates, malformed URL, unavailable preview, persistence                                   |
| Switch mints          | Two funded mints, balances, payment selector, persistence, replacing a payment quote                                                   |
| Remove mints          | Cancel, funded warning, active/last removal, re-add and spend retained funds, inactive-mint regression                                 |
| Edit mints            | Nickname save/cancel, persistence and spending, duplicate/malformed URL regressions                                                    |
| Currency units        | Actual USD/EUR minting and ecash sending, cent precision, history labels, sats isolation, sat-only fallback                            |
| Amount entry          | Custom keypad, physical keyboard, backspace, zero, insufficient funds, exact balance, fiat input mode                                  |
| History               | Incoming/outgoing quote checks across all three rails, reload, details, filtering, pagination, empty results                           |
| Unclaimed ecash       | Reopen/copy, check spendability, long-press reclaim, deletion confirmation                                                             |
| Unknown mint          | Token deep link, cancellation, receive-and-trust action, addition and balance persistence                                              |
| Multimint swaps       | Source/destination selection, balances/history, insufficient funds, quote-service failure and retry                                    |
| Backup and recovery   | Seed reveal/copy, invalid seed, restore to a fresh context, JSON export/import, duplicate import, invalid JSON/structure               |
| Display/privacy       | Hidden balances, fiat currency/rate fixture, no price requests when disabled, checking preferences and startup behavior                |
| Navigation            | Draft dismissal/reopen, tabs, mint/payment deep links, settings navigation and browser Back                                            |
| Input transports      | Clipboard, permission denial/manual fallback, QR camera decoding, unavailable-camera dismissal                                         |
| Appearance            | Theme, symbol, numeric keyboard preference, language persistence and translated send flow                                              |
| Optional UI           | NWC enable/allowance/copy/disable, P2PK key generation/copy/quick access, payment-request amount/copy, Lightning address/mint settings |
| Narrow touch viewport | Mint management, currency swipe, keypad and payment control reachability                                                               |

## Reproduced wallet defects

These findings describe the checked-out implementation. This PR adds coverage
and reports the defects; it does not silently change wallet behavior.

### UI-001 — Removing an inactive mint changes the selected mint

- Severity: medium.
- Reproduce: add three mints; select the third; remove the second.
- Expected: the third remains selected.
- Actual: the first mint becomes selected.
- Cause: `removeMint` in `src/stores/mints.ts` activates the first remaining mint
  after every removal, regardless of which mint was active.
- Regression: `removing an inactive mint preserves the active mint`.

### UI-002 — Mint URL editing permits duplicate entries

- Severity: medium; duplicate entries make mint selection ambiguous.
- Reproduce: add two mints; edit the second mint's URL to the first mint's URL.
- Expected: reject the duplicate and preserve both original entries.
- Actual: both entries have the same URL.
- Cause: `updateMint` directly replaces the stored entry without validation.
- Regression: `editing a mint rejects a duplicate URL`.

### UI-003 — Mint URL editing accepts malformed URLs

- Severity: medium; the configured mint can become unusable.
- Reproduce: edit a mint URL to `not a mint url` and save.
- Expected: validation error with the original URL retained.
- Actual: the malformed value is persisted.
- Regression: `editing a mint rejects a malformed URL`.

### UI-004 — Lightning deep links do not parse the supplied invoice

- Severity: medium.
- Reproduce: fund a wallet and open `/?lightning=<valid BOLT11 invoice>`.
- Expected: invoice parsing and the payable quote appear, as when pasting it.
- Actual: the input contains the invoice, but no payment action appears.
- Evidence: the input matches the real counterparty invoice while the quote
  action never appears. `WalletPage.vue` assigns the input directly.
- Regression: `a Lightning deep link parses its prefilled invoice`.

### UI-005 — Structurally invalid backup JSON is accepted

- Severity: high; malformed backups can overwrite wallet settings.
- Reproduce: import an object containing only an invalid `cashu.activeMintUrl`.
- Expected: reject the backup before changing storage.
- Actual: the value is written and the page reloads.
- Cause: `restoreFromBackup` in `src/stores/storage.ts` iterates arbitrary object
  keys without first validating the backup structure.
- Regression: `rejects a structurally invalid backup before writing wallet state`.

### UI-006 — Seed restoration errors but reports success

- Severity: high; the recovery flow does not recover the test wallet's funds.
- Reproduce: mint 64 sats, copy its seed, and restore that seed against the same
  mint from a fresh browser wallet using Restore Selected Mints.
- Expected: recover 64 spendable sats.
- Actual: an error notification says `Must be called at the top of a setup
function`, followed by `Successfully restored 1 mint(s)`. The balance remains
  zero. The trace contains no request to the mint's restore endpoint.
- Cause to investigate: store initialization during restoration. Separately,
  `restoreMint` catches errors without propagating them, so `restoreSelectedMints`
  can incorrectly report success.
- Regression: `reveals and copies a seed and restores spendable funds in a fresh wallet`.

### UI-007 — QR decoding still depends on a public CDN

- Severity: medium; scanning cannot initialize when the CDN is unreachable.
- Reproduce: provide a valid QR camera frame while public network access is
  blocked.
- Expected: use the bundled decoder configured in `QrcodeReader.vue`.
- Actual: the scanner requests `zxing_reader.wasm` from `fastly.jsdelivr.net`;
  initialization fails and the scanner stays open without decoding.
- The separate successful-path test serves the installed WASM through a route
  fixture, so decoder/parser coverage remains independent of CDN availability.
- Regression: `scans a QR code without fetching decoder code from a public CDN`.

### UI-008 — Reimporting a backup throws an unhandled duplicate-proof error

- Severity: medium; repeating an import leaves the recovery operation unfinished.
- Reproduce: export a funded wallet, import into a fresh wallet, then import the
  same file again.
- Expected: complete without duplicating funds or history, or show a clear
  rejection before changing state.
- Actual: the second import raises an unhandled IndexedDB `ConstraintError` and
  never completes the import/reload. The first import succeeds.
- Cause: `restoreFromBackup` calls `addProofs`, which uses `proofs.add` even for
  existing proof secrets. The asynchronous rejection is not handled by the file
  reader's synchronous `try/catch`.
- Regression: `reimporting the same backup preserves funds without an unhandled error`.

### UI-009 — Enabling a Lightning address fails after direct settings navigation

- Severity: medium.
- Reproduce: open `/settings/lightning-address` directly in an initialized
  wallet, then enable the Lightning address.
- Expected: display the address and initialize the service settings.
- Actual: the address stays blank; initialization raises `Must be called at the
top of a setup function` before any service request.
- Evidence: `useWalletStore` initializes `useI18n` outside a component setup when
  the store is first reached through this route's toggle handler. Navigating
  from the home screen through Settings initializes the store earlier.
- Regression: `opens Lightning address settings directly and enables the address`.

### UI-010 — A fresh wallet raises errors before onboarding

- Severity: low; onboarding still becomes available.
- Reproduce: navigate to `/` in a fresh browser context with no wallet seed.
- Expected: reach onboarding without unhandled initialization errors.
- Actual: the page raises `Invalid mnemonic` and an error reading `slice` from
  an undefined value while initializing the Nostr wallet key.
- Evidence: traces point to `walletSeedGenerateKeyPair` and
  `subscribeToNip17DirectMessages` before a seed has been created.
- Regression: `opening a fresh wallet reaches onboarding without unhandled initialization errors`.

### UI-011 — Clipboard permission errors are unhandled

- Severity: low; manual payment entry still works.
- Reproduce: deny both clipboard read APIs, then press Paste in the payment
  dialog.
- Expected: handle the permission error and keep manual entry available.
- Actual: `Clipboard permission denied` escapes the paste handler as an unhandled
  browser error. Entering a valid invoice manually still produces a payable
  quote, and cancelling leaves the balance intact.
- Evidence: Capacitor first calls `navigator.clipboard.read()` and falls back to
  `readText()`. The fixture denies both, and the test completes manual entry
  before asserting that the paste handler produced no unhandled error.
- Regression: `clipboard denial leaves manual payment entry usable`.

## Validation

Validation used disposable local CDK mints and Chromium. The suite contains
79 cases: 28 existing cases and 51 new UI cases.

| Check                        | Result                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Full browser run             | 79 executed in 15.1 minutes: 67 passed, 10 expected defect failures, 2 test-harness failures, no skips                |
| Clipboard fixture correction | Deny both `read()` and `readText()`; targeted rerun verified manual entry and the expected UI-011 error regression    |
| Onboarding wait correction   | Match the joined-mint list instead of the trust preview; the affected BOLT12 history case passed 3 consecutive reruns |
| Current case coverage        | 68 passing scenarios and 11 expected defect failures, verified by the full run plus the targeted reruns above         |
| Unit/component tests         | 187 passed across 26 files (`npm run test:ci`)                                                                        |
| Static checks                | Full ESLint run, TypeScript check of all E2E specs, and `git diff --check` passed                                     |
| Production build             | `npm run build` passed                                                                                                |

The two localized corrections after the full run were verified with targeted
reruns, rather than another complete 79-case run. Commands:

```bash
npm run test:e2e -- --reporter=line,json --trace=retain-on-failure
npx playwright test ui-amounts-navigation.spec.ts --grep 'clipboard denial'
npx playwright test ui-history.spec.ts --grep 'incoming bolt12' --repeat-each=3
```

The targeted reruns used the same disposable mint stack before the runner
removed its containers and databases. Expected failures each reached their
intended assertion; they are not skipped coverage or claims that the affected
wallet behavior works. CI will run the complete final suite on the PR.
