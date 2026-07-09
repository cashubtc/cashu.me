# NUT-29 Bolt11 Batch Checking and Batch Minting

Status: ready-for-agent

## Problem Statement

Cashu.me currently checks and mints pending incoming payments one quote at a time in the background. When a wallet has many pending Bolt11 mint quotes, startup and interval-based checking can create unnecessary request churn: each quote may require a separate quote-state request and a separate mint request. Users rarely mint actively; they expect the wallet to receive payments in the background quickly and quietly.

## Solution

Use NUT-29 as an invisible background optimization for the Bolt11 queue in `useInvoicesWorkerStore`. During each interval-based checker tick, Cashu.me should select one compatible mint/unit group of due Bolt11 pending incoming payments, batch quote check as many as allowed by the mint's advertised NUT-29 limit, batch mint the paid subset, and leave unpaid entries queued with normal backoff. Manual checks and websocket-triggered flows keep using the existing single-quote behavior.

## User Stories

1. As a wallet user, I want pending incoming payments to become proofs faster in the background, so that my wallet balance updates without manual work.
2. As a wallet user, I want background receiving to create fewer mint requests, so that startup and periodic checking are less noisy and more reliable.
3. As a wallet user, I want the interface to stay the same, so that NUT-29 feels like a performance improvement rather than a new workflow.
4. As a wallet user, I want manual checks on a single history item to stay immediate and scoped to that item, so that I get predictable feedback.
5. As a wallet user, I want unpaid pending incoming payments to remain pending after a batch quote check, so that the wallet does not lose track of them.
6. As a wallet user, I want already-issued Bolt11 quotes to be marked paid locally, so that old pending entries do not linger.
7. As a wallet user, I want locked mint quotes to be batch minted correctly, so that privacy/security features do not disable the optimization.
8. As a wallet user, I want a missing signing key to avoid breaking other paid quotes in the same checker tick, so that one bad entry does not block all background receiving.
9. As a wallet user, I want mints without NUT-29 support to keep working as before, so that receiving remains compatible.
10. As a wallet user, I want broken NUT-29 mints to fall back to the existing single-quote path, so that payments still arrive.
11. As a wallet user, I want network and rate-limit problems to avoid extra fallback request bursts, so that degraded connectivity is not made worse.
12. As a wallet user, I want the wallet to stay quiet during background batch receiving, so that I am not spammed with notifications.
13. As a wallet user, I want my original incoming payment history dates preserved, so that history remains meaningful.
14. As a wallet user, I want paid dates to reflect when Cashu.me completed local minting, so that background settlement is visible in history state.
15. As a maintainer, I want NUT-29 protocol behavior delegated to cashu-ts, so that Cashu.me does not maintain duplicate protocol request logic.
16. As a maintainer, I want the checker tick to make at most one batch quote check and one batch mint request, so that request volume remains bounded.
17. As a maintainer, I want batching to prefer the largest compatible due group, so that each checker tick does as much useful work as possible.
18. As a maintainer, I want batch entries capped by mint-advertised `max_batch_size`, so that predictable batch-size failures are avoided.
19. As a maintainer, I want oldest due entries selected first when a group exceeds the cap, so that queue behavior is fair.
20. As a maintainer, I want successful batch quote-check responses validated against request order, so that mint bugs are caught safely.
21. As a maintainer, I want malformed batch responses to put the mint's batch path into cooldown, so that bad batch behavior does not repeat every interval.
22. As a maintainer, I want interval-based tests to cover the full worker behavior, so that queue mutation, fallback, and proof persistence are verified together.
23. As a maintainer, I want single manual checks to remain covered separately, so that background batching does not leak into user-triggered flows.

## Implementation Decisions

- Implement the feature as an invisible optimization in the interval-based incoming payment checker only. Do not add a visible "redeem all" or "batch receive" action.
- The first implementation is Bolt11-only. Bolt12 and on-chain reusable/delta-based flows are out of scope.
- Upgrade Cashu.me from the currently pinned `@cashu/cashu-ts` 4.5.x line to a release that exposes the typed Bolt11 batch quote-check API. Use `Wallet.checkMintQuoteBatchBolt11(quotes)` in the wallet path; only use the lower-level mint helper with `customRequest` if the implementation actually needs a custom request function.
- Use cashu-ts NUT-29 batch mint APIs for batch minting, specifically the `prepareBatchMint("bolt11", entries, config)` and `completeBatchMint(preview)` flow. Do not add app-local NUT-29 HTTP request code.
- Respect ADR-0001: Cashu protocol request, normalization, auth, and error behavior should remain centralized in cashu-ts.
- Treat NUT-29 support as advertised by the stored mint info object on `StoredMint.info`. Handle both numeric and string nut keys (`nuts[29]` and `nuts["29"]`). If NUT-29 is present and its optional `methods` list is absent or includes `bolt11`, assume the mint supports Bolt11 batch quote checking and batch minting.
- If mint info does not advertise NUT-29 Bolt11 support, use the existing single-quote checker.
- Inside the Bolt11 portion of a checker tick, attempt exactly one single quote or one compatible Bolt11 group. Do not expand the existing Bolt12, on-chain, or outgoing queue behavior in this feature.
- Pre-filter queued Bolt11 entries before grouping. Drop entries whose invoice is missing, not a pending incoming payment, not positive amount, too old, or not legacy/explicit Bolt11. Use the existing `shouldCheckInvoice(invoice)` and `dueTime(q)` rules where possible.
- Group eligible due Bolt11 pending incoming payments by mint and unit.
- Choose the due group with the largest number of entries, capped by mint `max_batch_size`. Break ties by oldest due queue entry, using `lastChecked || addedAt`.
- When a group exceeds `max_batch_size`, select oldest due entries first, using `lastChecked || addedAt`.
- If a mint does not advertise `max_batch_size`, rely on cashu-ts's default/internal cap rather than adding an app-specific setting.
- Send batch quote-check requests in oldest-first order. Successful responses are expected to preserve request order.
- Assert each successful batch quote-check response matches the requested quote at the same index before any batch minting. Treat mismatch, duplicates, missing quote fields, or wrong response lengths as malformed mint behavior.
- Batch quote-check success can return mixed `PAID`, `UNPAID`, and `ISSUED` states.
- Batch mint only `PAID` responses. Do not include unpaid quotes in a batch mint request.
- Keep `UNPAID` quotes queued and update their queue entry `lastChecked` and `checkCount` as the current single-quote pending path does.
- Normalize checked quote responses before persistence, matching the current `paymentHistory` amount normalization behavior.
- Mark `ISSUED` quotes paid locally through `setInvoicePaid(quote, { mintQuote })` and remove them from the Bolt11 checker without attempting to mint them.
- Do not re-check quotes after a successful batch mint. Use the batch quote-check responses for pre-mint state, then mark minted invoices paid after proofs are persisted.
- Take the global wallet mutex only for the minting phase. Batch quote check happens outside the mutex.
- Hold the global wallet mutex across both batch mint preparation and completion.
- Use the same signed-output retry behavior as single minting by wrapping the full prepare/complete batch mint operation in the existing retry-on-signed-outputs mechanism.
- Persist batch-minted proofs with the normal `proofsStore.addProofs` insertion path. Do not use missing-proof insertion for the normal fresh mint path.
- Persist invoice and quote mutations through `usePaymentHistoryStore` (`setPaymentPaid`, `upsertMintQuote`, or equivalent), then sync the wallet's `invoiceHistory` mirror. `invoiceHistory` is no longer the canonical persistence boundary after the rebase.
- Keep batch-minted proofs untagged by quote, matching current Bolt11 behavior. A batch produces one consolidated output set and cannot cleanly attribute every proof to one quote.
- Do not persist batch mint previews in this feature. Match current single-mint recovery behavior.
- Support locked mint quotes. Build a unique signing key set from stored invoice `privKey` values and pass it as `config.privkey` to cashu-ts; cashu-ts matches keys to locked quotes by public key, not by position.
- If a paid locked mint quote requires a private key and no matching stored private key is available, exclude that quote from batch minting.
- If a key-missing paid quote is the only paid quote in the tick, use the single-quote path as the tick's mint attempt. If other paid quotes can batch, batch those and leave the key-missing quote queued for later handling.
- If batch quote check fails for a mint that advertises NUT-29 support, record a separate batch-path cooldown for that mint/unit/method and immediately fall back to one single-quote check for the attempted group unless the failure is network/rate-limit-like. Do not reuse the existing reusable-mint cooldown map, which is mint-only and tuned for Bolt12/on-chain network failures.
- If batch mint fails after a successful batch quote check, record batch-path cooldown and fall back to one single paid quote only for protocol-like failures. Do not single-fallback for network or rate-limit failures.
- Batch-path cooldown should apply to advertised NUT-29 failures: network errors, 5xx/429, malformed successful responses, and protocol rejections. Successful batch responses clear the cooldown.
- While a mint's Bolt11 batch path is in cooldown, the interval checker should use the existing single-quote path for that mint.
- Background batch behavior should not show user notifications. Keep concise developer logging for batch attempted, paid count, minted count, and fallback reason. Be careful with same-tick fallback through `checkInvoiceBolt11(false)`: the current single-check helper mints silently internally but still has UI side effects after success, so batch fallback must avoid new background notification bursts.
- Manual user-triggered checks must continue to use the existing single-quote path even if other pending incoming payments are available.
- Websocket-triggered `PAID` events must continue to use the existing single-quote path. Do not debounce or coalesce websocket events in this feature.

## Testing Decisions

- Test at the interval-based incoming payment checker seam in `src/stores/invoicesWorker.ts`. This is the highest useful seam: it exercises queue selection, batch quote check, batch minting, fallback, cooldown, proof persistence, and payment history mutation together.
- Prefer existing store tests as prior art. The project already has `src/stores/__tests__/wallet.test.js`, `src/stores/__tests__/invoicesWorker.test.js`, and `src/stores/__tests__/paymentHistory.test.ts` covering pending quote queues, websocket subscriptions, concurrent mint serialization, payment-history mirroring, and subpayment history.
- Mock the mint wallet/cashu-ts API at the store boundary. Tests should assert externally visible behavior: calls made to batch/single APIs, queue state, `paymentHistory`/`mintQuotes` state, the wallet `invoiceHistory` mirror, proof insertion, cooldown state, and absence of batch calls in manual flows.
- Add a happy-path test: batch-checks and batch-mints paid Bolt11 quotes for the same mint/unit.
- Add a mixed-state test: keeps unpaid Bolt11 quotes queued and mints only paid ones.
- Add an issued-state test: marks issued Bolt11 quotes paid without minting them.
- Add a request-bound test: processes only one Bolt11 batch group per checker tick.
- Add a max-batch-size test: caps by mint NUT-29 `max_batch_size` and chooses oldest due entries.
- Add a locked-quote test: batch-mints locked Bolt11 quotes with the stored batch signing key set and an unlocked quote in the same batch.
- Add a missing-key test: excludes paid locked Bolt11 quotes without a matching private key from batch minting.
- Add a batch-check failure fallback test: falls back to one single Bolt11 check and records batch cooldown after advertised batch quote check fails.
- Add a batch-mint failure fallback test: falls back to one single paid Bolt11 quote after protocol-like batch mint failure.
- Add a network/rate-limit failure test: does not single-fallback on network or 429-style batch failures.
- Add an unsupported-mint test: uses the existing single-quote checker when mint info does not advertise NUT-29 Bolt11 support.
- Add a malformed-check-response test: treats out-of-order, wrong-quote, duplicate, missing, or wrong-length batch quote-check responses as malformed.
- Add a zero-paid test: stops after one successful batch check when no quotes are paid; unpaid entries back off, issued entries are marked paid, and no second group is attempted.
- Add a manual-check test: manual `checkInvoiceBolt11` does not use NUT-29 batch APIs.

## Out of Scope

- Visible batch receive, redeem-all, or manual batch actions.
- Bolt12 batch quote checking or batch minting.
- On-chain batch quote checking or batch minting.
- Websocket event coalescing or websocket-based batch minting.
- Persisted batch mint previews or broader NUT-19 recovery improvements.
- Per-quote proof attribution for batch-minted proofs.
- App-local NUT-29 HTTP helper implementation.
- User-facing settings for batch size or batch enablement.
- Changes to outgoing payment checking, melting, token sending, or proof-state websocket flows.

## Further Notes

- The feature depends on upgrading from the pinned cashu-ts 4.5.x line to a release exposing `Wallet.checkMintQuoteBatchBolt11(quotes)` and NUT-29 batch mint prepare/complete APIs.
- NUT-29 batch check and batch mint are both required for this feature's main path because the goal is reducing request churn, not only consolidating outputs.
- The current single-quote path performs a pre-mint quote check and then mints without a post-mint re-check. The batch path should follow the same pattern at group scope.
- Batch quote-check responses are expected to preserve request order. Cashu.me should still validate quote IDs defensively and cool down the batch path if a mint violates that contract.
- The worker's existing background silence should be preserved. Developer logs are acceptable for diagnosis, but background batching should not create user notification bursts.
