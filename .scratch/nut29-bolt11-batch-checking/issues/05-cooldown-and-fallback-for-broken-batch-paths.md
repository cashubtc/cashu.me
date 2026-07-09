# Cooldown and fallback for broken batch paths

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

Advertised-but-broken NUT-29 batch behavior enters a separate mint/unit/method batch cooldown and falls back conservatively, preserving reliability without creating request bursts.

## Acceptance criteria

- [ ] Batch quote-check failures for advertised NUT-29 support record batch cooldown.
- [ ] Batch mint failures after a successful batch quote check record batch cooldown.
- [ ] Protocol-like batch failures fall back to exactly one single-quote attempt in the same checker tick.
- [ ] Network and rate-limit failures do not trigger single-quote fallback in the same checker tick.
- [ ] Successful batch responses clear the batch cooldown.
- [ ] While cooldown is active, the interval checker uses the existing single-quote path for that mint/unit/method.
- [ ] Batch cooldown does not reuse `reusableMintCooldowns`, which is mint-only and scoped to reusable Bolt12/on-chain failures.

## Blocked by

- Batch mint paid Bolt11 quote checks.
