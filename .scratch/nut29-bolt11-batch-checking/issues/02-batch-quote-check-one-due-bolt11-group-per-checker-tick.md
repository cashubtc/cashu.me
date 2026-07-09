# Batch quote check one due Bolt11 group per checker tick

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

The Bolt11 portion of the interval checker pre-filters due Bolt11 pending incoming payments, selects one compatible mint/unit group per checker tick, and performs one batch quote check that updates unpaid and issued entries without minting.

## Acceptance criteria

- [ ] Only valid due legacy/explicit Bolt11 pending incoming payments are eligible for grouping.
- [ ] Eligible entries are grouped by mint and unit.
- [ ] The Bolt11 queue attempts one group only and does not expand Bolt12, on-chain, or outgoing queue behavior.
- [ ] The selected group maximizes due entries, respects the mint batch size, and chooses oldest due entries first using `lastChecked || addedAt`.
- [ ] Unpaid responses remain queued with backoff updated.
- [ ] Checked quote responses are normalized and persisted to `paymentHistory.mintQuotes`.
- [ ] Issued responses are marked paid through payment history and removed without minting.

## Blocked by

- Upgrade cashu-ts and preserve single-quote fallback.
