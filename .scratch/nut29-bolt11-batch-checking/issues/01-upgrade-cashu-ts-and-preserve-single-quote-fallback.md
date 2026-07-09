# Upgrade cashu-ts and preserve single-quote fallback

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

Cashu.me depends on the cashu-ts version with Bolt11 batch quote-check support, detects whether a stored mint advertises NUT-29 Bolt11 support, adds a separate batch-path cooldown, and keeps the current single-quote checker behavior when batch support is absent or unavailable.

## Acceptance criteria

- [ ] The app depends on a cashu-ts version that exposes `Wallet.checkMintQuoteBatchBolt11(quotes)` plus `prepareBatchMint("bolt11", ...)` and `completeBatchMint(...)`.
- [ ] NUT-29 support detection treats an absent `methods` list or a list containing `bolt11` as Bolt11 batch-capable.
- [ ] Mints that do not advertise NUT-29 Bolt11 support use the existing single-quote checker.
- [ ] Mints in the new mint/unit/method batch cooldown use the existing single-quote checker.
- [ ] Existing single-quote Bolt11 checker behavior remains covered by tests.

## Blocked by

- None - can start immediately.
