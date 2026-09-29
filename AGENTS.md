# Cashu.me Agent Guide

## Commands and Tooling

- Use npm and `package-lock.json`; `npm ci` matches CI. The app requires Node >=22.4; E2E documents Node 24+.
- `npm run dev` serves HTTPS on port 8080 and opens a browser. `E2E=true` switches to HTTP and disables automatic browser opening.
- `npm test` watches; `npm run test:ci` runs once. Focus a file with `npm run test:ci -- src/stores/__tests__/dexieAmountMigration.test.ts`; add `-t "test name"` to narrow further.
- CI checks `npm run lint`, `npm run checkformat`, `npm run test:ci`, `npm run build`, and `npm run build:pwa`. No dedicated typecheck script is configured. `npm run build` is SPA, not PWA; the PWA output is `dist/pwa`.
- `npm run format` rewrites the whole repo. For focused edits use `npx prettier --write <files>` and `npx eslint <source-files>`. The active ESLint config is `.eslintrc.js`, not the adjacent `.eslintrc.json`; Vue scripts must use `lang="ts"`.
- UI text uses `src/i18n/en-US` as the source of truth; update other locales and run `npm run i18n:check` for key parity.
- Do not run bare `make` as a build shortcut: its default target deploys to production. `make staging` also deploys remotely.

## App Wiring and Conventions

- Quasar owns startup. Follow `quasar.config.js` boot order (`base`, `global-components`, `i18n`), not `src/main.js` as a conventional mounted Vue entrypoint. `.quasar/` is generated.
- Existing components use Options API with Pinia mappers; do not introduce `<script setup>` into them unless refactoring the whole component. `src/boot/base.js` defines `window.windowMixin` by side effect; components opt in via `mixins: [windowMixin]`.
- Use `src/` for internal imports; omit `.ts`/`.js` extensions and include `.vue`. Use Quasar utility classes and scoped component overrides; theme variables live in `src/css/quasar.variables.scss`. Alias Lucide icons as `XIcon`.
- Keep the Vite optimizer exclusions for `@cashu/cashu-ts` and `@agicash/qr-scanner`; the SDK's ESM/BigInt code is sensitive to dependency optimization.
- PWA uses Workbox `generateSW` and emits `sw.js`; `src-pwa/custom-service-worker` is not used in this mode. Router history mode requires an `index.html` fallback when hosting.

## Wallet Invariants

- `src/stores/wallet.ts` orchestrates wallet operations through adjacent payment-method modules; `walletMelt.ts` holds shared melt/recovery logic. Preserve the shared deterministic counter source and monotonic persistence of `countersReserved` events.
- SDK v4 proofs use `Amount`, but app `WalletProof.amount` and persisted amounts are numbers. Use `src/js/cashu-amount.ts` conversions (`cashuAmountToNumber`, `normalizeCashuQuoteAmounts`), `sumProofAmounts` from `src/js/proofs.ts`, and existing SDK proof adapters. Do not persist raw SDK `Amount` objects; IndexedDB can clone them into plain `{ value }` objects.
- Dexie stores proofs, payment history, mint/melt quotes, and ecash history. `proofs.ts` exposes a `liveQuery` projection: mutate through store actions, not the projection. Proofs are keyed by `secret`; spendable selection filters mint/unit keysets and excludes reserved proofs.
- Preserve proof ownership transitions: ordinary sends reserve outgoing proofs; `invalidate` transfers ownership out of the wallet. Swaps may return unchanged input proofs, so insert only fresh outputs and remove only consumed inputs. Do not blanket-unreserve on payment/network errors; pending or uncertain melts need quote-linked reservations and saved change-recovery data.
- Critical wallet operations use `ui.ts`'s mutex: await acquisition, release in `finally`, and avoid nested acquisition (it is not reentrant). Preserve melt's deliberate release/reacquire sequence.
- Persisted-data changes need both `dexie.ts` schema-upgrade and `migrations.ts` application-migration review. Settings, mnemonic, and counters still use local storage; history has migrated to Dexie. Application migrations advance their version only after success and stop on failure.
- Use `src/js/notify.ts` helpers, preserving `silent` handling and error propagation needed by callers for recovery.

## Test Gotchas

- Vitest uses `happy-dom` and `test/vitest/setup-file.js`; tests are discovered under both `src/` and `test/vitest/__tests__/`. Setup initializes/resets Pinia, but does not clear mocked localStorage automatically. IndexedDB tests use `fake-indexeddb/auto` with isolated database names and cleanup.
- Tests importing components that reference `windowMixin` must initialize it before dynamic import; see `src/components/__tests__/PayInvoiceDialog.test.ts`. Wallet-store tests may need a `vue-i18n.useI18n` mock outside component setup.
- E2E prerequisites: Docker Compose v2 and `npx playwright install chromium`. `npm run test:e2e -- mint.spec.ts` runs a focused suite with stack lifecycle managed; `npm run test:e2e -- --grep "on-chain"` filters by title. Playwright starts its own HTTP dev server on port 4173.
- Use disposable local wallets/mints only, never real seeds or funds. E2E uses real CDK APIs with fake payment rails; Node-side helpers can rotate keysets and are not covered by browser network blocking. Do not point E2E URL overrides at live services.
- E2E runs serially on fixed ports 8085-8087 and 10000. The runner tears down its Compose project (`cashume-e2e` by default) **including volumes**, even after failures. Do not share that project with valuable data or run competing stacks.
- Read `test/e2e/README.md` for manual stack control and protocol coverage. Known defects use `test.fail`, not skips; remove the annotation when fixing one. For demo recordings, follow `.agents/skills/e2e-test-playwright-video/SKILL.md`.
