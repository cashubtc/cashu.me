# Batch mint paid Bolt11 quote checks

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

Paid responses from a successful batch quote check are minted in one batch request, proofs are persisted, invoices are marked paid, and the background flow stays silent.

## Acceptance criteria

- [ ] Paid batch quote-check responses are minted through `prepareBatchMint("bolt11", ...)` and `completeBatchMint(...)` in one batch mint request.
- [ ] The global wallet mutex is held across batch mint preparation and completion.
- [ ] Signed-output retry behavior matches the current single mint path.
- [ ] Minted proofs are added through `proofsStore.addProofs` and left untagged by quote.
- [ ] Minted invoices are marked paid through payment history and removed from the checker after proof persistence.
- [ ] Background batch minting does not show user notifications.

## Blocked by

- Batch quote check one due Bolt11 group per checker tick.
- Defend batch response ordering and malformed success cases.
