# Support locked mint quotes in Bolt11 batches

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

Batch minting supports locked mint quotes using the stored batch signing key set, including mixed locked/unlocked batches, while avoiding bad-key entries blocking other paid quotes.

## Acceptance criteria

- [ ] Locked paid quotes with matching stored private keys are included in batch minting.
- [ ] Mixed locked and unlocked paid quotes can mint in the same batch.
- [ ] The unique batch signing key set from invoice `privKey` values is passed as `config.privkey`, not as quote-order-dependent keys.
- [ ] Paid locked quotes without matching private keys are excluded from batch minting.
- [ ] If a key-missing locked quote is the only paid quote, the existing single-quote path is used as the tick's mint attempt.
- [ ] If other paid quotes can batch, key-missing locked quotes remain queued for later handling.

## Blocked by

- Batch mint paid Bolt11 quote checks.
