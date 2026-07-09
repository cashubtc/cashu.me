# Tickets: NUT-29 Bolt11 Batch Checking

Build invisible NUT-29 batch quote checking and batch minting for interval-based Bolt11 pending incoming payments. Source spec: `./PRD.md`.

Work the **frontier**: any ticket whose blockers are all done. Validation must land before paid batch responses are minted; after tickets 1, 2, and 6 are done, tickets 3, 4, 5, and 7 can proceed as their blockers allow.

## Upgrade cashu-ts and preserve single-quote fallback

**What to build:** Cashu.me depends on the cashu-ts version with Bolt11 batch quote-check support, detects whether a stored mint advertises NUT-29 Bolt11 support, adds a separate batch-path cooldown, and keeps the current single-quote checker behavior when batch support is absent or unavailable.

**Blocked by:** None - can start immediately.

- [ ] The app depends on a cashu-ts version that exposes `Wallet.checkMintQuoteBatchBolt11(quotes)` plus `prepareBatchMint("bolt11", ...)` and `completeBatchMint(...)`.
- [ ] NUT-29 support detection treats an absent `methods` list or a list containing `bolt11` as Bolt11 batch-capable.
- [ ] Mints that do not advertise NUT-29 Bolt11 support use the existing single-quote checker.
- [ ] Mints in the new mint/unit/method batch cooldown use the existing single-quote checker.
- [ ] Existing single-quote Bolt11 checker behavior remains covered by tests.

## Batch quote check one due Bolt11 group per checker tick

**What to build:** The Bolt11 portion of the interval checker pre-filters due Bolt11 pending incoming payments, selects one compatible mint/unit group per checker tick, and performs one batch quote check that updates unpaid and issued entries without minting.

**Blocked by:** Upgrade cashu-ts and preserve single-quote fallback.

- [ ] Only valid due legacy/explicit Bolt11 pending incoming payments are eligible for grouping.
- [ ] Eligible entries are grouped by mint and unit.
- [ ] The Bolt11 queue attempts one group only and does not expand Bolt12, on-chain, or outgoing queue behavior.
- [ ] The selected group maximizes due entries, respects the mint batch size, and chooses oldest due entries first using `lastChecked || addedAt`.
- [ ] Unpaid responses remain queued with backoff updated.
- [ ] Checked quote responses are normalized and persisted to `paymentHistory.mintQuotes`.
- [ ] Issued responses are marked paid through payment history and removed without minting.

## Batch mint paid Bolt11 quote checks

**What to build:** Paid responses from a successful batch quote check are minted in one batch request, proofs are persisted, invoices are marked paid, and the background flow stays silent.

**Blocked by:** Batch quote check one due Bolt11 group per checker tick; Defend batch response ordering and malformed success cases.

- [ ] Paid batch quote-check responses are minted through `prepareBatchMint("bolt11", ...)` and `completeBatchMint(...)` in one batch mint request.
- [ ] The global wallet mutex is held across batch mint preparation and completion.
- [ ] Signed-output retry behavior matches the current single mint path.
- [ ] Minted proofs are added through `proofsStore.addProofs` and left untagged by quote.
- [ ] Minted invoices are marked paid through payment history and removed from the checker after proof persistence.
- [ ] Background batch minting does not show user notifications.

## Support locked mint quotes in Bolt11 batches

**What to build:** Batch minting supports locked mint quotes using the stored batch signing key set, including mixed locked/unlocked batches, while avoiding bad-key entries blocking other paid quotes.

**Blocked by:** Batch mint paid Bolt11 quote checks.

- [ ] Locked paid quotes with matching stored private keys are included in batch minting.
- [ ] Mixed locked and unlocked paid quotes can mint in the same batch.
- [ ] The unique batch signing key set from invoice `privKey` values is passed as `config.privkey`, not as quote-order-dependent keys.
- [ ] Paid locked quotes without matching private keys are excluded from batch minting.
- [ ] If a key-missing locked quote is the only paid quote, the existing single-quote path is used as the tick's mint attempt.
- [ ] If other paid quotes can batch, key-missing locked quotes remain queued for later handling.

## Cooldown and fallback for broken batch paths

**What to build:** Advertised-but-broken NUT-29 batch behavior enters a separate mint/unit/method batch cooldown and falls back conservatively, preserving reliability without creating request bursts.

**Blocked by:** Batch mint paid Bolt11 quote checks.

- [ ] Batch quote-check failures for advertised NUT-29 support record batch cooldown.
- [ ] Batch mint failures after a successful batch quote check record batch cooldown.
- [ ] Protocol-like batch failures fall back to exactly one single-quote attempt in the same checker tick.
- [ ] Network and rate-limit failures do not trigger single-quote fallback in the same checker tick.
- [ ] Successful batch responses clear the batch cooldown.
- [ ] While cooldown is active, the interval checker uses the existing single-quote path for that mint/unit/method.
- [ ] Batch cooldown does not reuse `reusableMintCooldowns`, which is mint-only and scoped to reusable Bolt12/on-chain failures.

## Defend batch response ordering and malformed success cases

**What to build:** Successful batch quote-check responses are defensively validated against request order, and malformed success responses are handled as broken batch behavior.

**Blocked by:** Batch quote check one due Bolt11 group per checker tick.

- [ ] Response count must match request count.
- [ ] Each response quote must match the requested quote at the same index.
- [ ] Duplicate, missing, or wrong quote identifiers are treated as malformed.
- [ ] Malformed responses prevent batch minting.
- [ ] Malformed responses are surfaced through the same batch-failure path that the cooldown/fallback slice handles.

## Protect non-batch entry points

**What to build:** Manual checks and websocket-triggered paid events remain single-quote flows, so background batching does not change user-triggered behavior.

**Blocked by:** Batch mint paid Bolt11 quote checks.

- [ ] Manual Bolt11 checks do not call NUT-29 batch APIs.
- [ ] Websocket-triggered Bolt11 paid events do not call NUT-29 batch APIs.
- [ ] Existing manual and websocket single-quote success behavior remains intact.
- [ ] Background batch tests do not require changes to manual user flows.
