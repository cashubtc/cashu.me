# Defend batch response ordering and malformed success cases

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

Successful batch quote-check responses are defensively validated against request order, and malformed success responses are handled as broken batch behavior.

## Acceptance criteria

- [ ] Response count must match request count.
- [ ] Each response quote must match the requested quote at the same index.
- [ ] Duplicate, missing, or wrong quote identifiers are treated as malformed.
- [ ] Malformed responses prevent batch minting.
- [ ] Malformed responses are surfaced through the same batch-failure path that the cooldown/fallback slice handles.

## Blocked by

- Batch quote check one due Bolt11 group per checker tick.
