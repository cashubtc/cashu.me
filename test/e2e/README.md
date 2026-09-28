# Wallet browser E2E tests

This suite drives the real Cashu.me UI in Chromium against three real CDK mint
processes. CDK's fake wallet supplies deterministic BOLT11, BOLT12, and
on-chain settlement; the mint APIs and wallet cryptography are not mocked.

## What runs

| Area        | Browser behavior                                                                                                   | Backend assertion                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Onboarding  | Creates a new seed and adds the local mint                                                                         | Mint info and keys load over HTTP                 |
| Incoming    | Creates BOLT11, BOLT12, and on-chain requests                                                                      | Fake backend settles; wallet mints proofs         |
| Outgoing    | Pays BOLT11, amountless BOLT12, and on-chain requests                                                              | Wallet melts proofs and receives change           |
| Ecash       | Sends between two isolated browser contexts                                                                        | Receiver swaps proofs; replay is rejected         |
| Persistence | Reloads after minting and receiving                                                                                | IndexedDB-backed balances survive reload          |
| Protocol    | Checks both mints and all quote types directly                                                                     | NUT-04/NUT-05 advertise every configured rail     |
| Resilience  | Exercises malformed input, insufficient balance, pending and failed payments, quote recovery, and duplicate clicks | Balances and proof reservations remain consistent |

The resilience specs use Playwright's local route interception to make real CDK
responses appear unpaid, pending, or failed after the quote has been created.
This keeps error-state coverage deterministic while still exercising the real
wallet UI, quote parsing, proof selection, reservation cleanup, and history
updates. The protocol-failure specs separately verify that the CDK mint rejects
unknown quotes and malformed payment requests.

The second mint creates counterparty payment requests for outgoing tests. That
keeps payment decoding and quote creation realistic without coupling the test
to a public Lightning or Bitcoin network.

`payment-requests.spec.ts` covers Cashu (NUT-18) requests: pending and redeemed
outgoing history across reloads, retrying failed HTTP delivery with the same
proofs, selecting a supported transport among unknown alternatives, and
rejecting unknown or missing transports without spending or locking funds.
HTTP delivery is intercepted locally; issuance and redemption use the real CDK
mint and two isolated browser wallets.

## UI coverage and known defects

The `ui-*.spec.ts` suites cover mint management, real sat/USD/EUR balances,
amount entry, history checks, backups and seed recovery, settings, clipboard,
QR decoding, and narrow touch viewports. See [the coverage and defect
report](UI-TEST-REPORT.md) for the complete interaction matrix and reproduced
wallet bugs.

Mint C supports sat, USD, and EUR. Mints A and B remain sat-only, preserving
unsupported-unit protocol checks. Price feeds and Lightning-address service
responses use deterministic route fixtures. Camera tests supply QR video frames
to the real decoder; they do not call the scanner's success handler.

Known defects have executable `test.fail` regressions with report IDs. Expected
failures count as successful runner outcomes but are **not healthy features**.
When a fix makes one pass, Playwright fails the run with an unexpected pass;
remove the annotation after verifying the fix. Other setup or test failures
remain failures. Use `--trace=retain-on-failure` to retain local diagnostic traces.

## Running locally

Prerequisites are Node 24+, Docker with Compose v2, and a Playwright Chromium
installation.

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Pass normal Playwright arguments after `--`:

```bash
npm run test:e2e -- mint.spec.ts
npm run test:e2e -- --grep "on-chain"
npm run test:e2e -- '/ui-[^/]+\.spec\.ts$'
```

Record every browser, including both sides of the ecash transfer, and assemble
the labeled demo montage:

```bash
npm run test:e2e:video
```

The MP4 and its visual-review contact sheet are written below `artifacts/`.
Playwright keeps the raw recordings below `test-results/`. Normal runs still
retain video only when a test fails. To record raw videos without rendering the
montage, run `E2E_VIDEO=on npm run test:e2e`.

The runner starts all three mints, waits for their health checks, launches the Quasar
dev server, and always removes the containers and ephemeral SQLite databases.
On a failure it prints mint logs and retains the Playwright trace, screenshot,
and video according to `playwright.config.ts`.

For interactive work, start the stack separately and then use Playwright UI:

```bash
npm run test:e2e:stack:up
E2E=true npm run dev -- --port 4173
npm run test:e2e:playwright -- --ui
npm run test:e2e:stack:down
```

## Hermeticity and upgrades

- The CDK image is pinned by multi-architecture digest. Upgrade it deliberately,
  verify the config schema, and run `protocol.spec.ts` before changing the pin.
- Each test gets fresh browser storage. The two-wallet test creates two separate
  browser contexts so seeds, local storage, and IndexedDB never overlap.
- Browser helpers block non-local HTTP and secure WebSocket traffic. Tests cannot
  silently depend on price feeds, Nostr discovery, or public mints.
- The suite uses one worker because the mints bind fixed loopback ports and wallet
  state transitions are easier to diagnose serially.

## Test tiers

This fast PR suite proves the wallet against CDK's protocol implementation and
fake payment rails. It intentionally does not claim that LND/CLN, bitcoind, or a
real chain is healthy. Keep those integrations in a slower scheduled suite with
Bitcoin regtest and a Lightning implementation; reuse the same Playwright page
objects and change only the backend topology.
