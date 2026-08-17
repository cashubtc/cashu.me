# Wallet browser E2E tests

This suite drives the real Cashu.me UI in Chromium against two real CDK mint
processes. CDK's fake wallet supplies deterministic BOLT11, BOLT12, and
on-chain settlement; the mint APIs and wallet cryptography are not mocked.

## What runs

| Area        | Browser behavior                                      | Backend assertion                             |
| ----------- | ----------------------------------------------------- | --------------------------------------------- |
| Onboarding  | Creates a new seed and adds the local mint            | Mint info and keys load over HTTP             |
| Incoming    | Creates BOLT11, BOLT12, and on-chain requests         | Fake backend settles; wallet mints proofs     |
| Outgoing    | Pays BOLT11, amountless BOLT12, and on-chain requests | Wallet melts proofs and receives change       |
| Ecash       | Sends between two isolated browser contexts           | Receiver swaps proofs; replay is rejected     |
| Persistence | Reloads after minting and receiving                   | IndexedDB-backed balances survive reload      |
| Protocol    | Checks both mints and all quote types directly        | NUT-04/NUT-05 advertise every configured rail |

The second mint creates counterparty payment requests for outgoing tests. That
keeps payment decoding and quote creation realistic without coupling the test
to a public Lightning or Bitcoin network.

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

The runner starts both mints, waits for their health checks, launches the Quasar
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
- The suite uses one worker because both mints bind fixed loopback ports and wallet
  state transitions are easier to diagnose serially.

## Test tiers

This fast PR suite proves the wallet against CDK's protocol implementation and
fake payment rails. It intentionally does not claim that LND/CLN, bitcoind, or a
real chain is healthy. Keep those integrations in a slower scheduled suite with
Bitcoin regtest and a Lightning implementation; reuse the same Playwright page
objects and change only the backend topology.
