# Protect non-batch entry points

Status: ready-for-agent

## Parent

`.scratch/nut29-bolt11-batch-checking/PRD.md`

## What to build

Manual checks and websocket-triggered paid events remain single-quote flows, so background batching does not change user-triggered behavior.

## Acceptance criteria

- [ ] Manual Bolt11 checks do not call NUT-29 batch APIs.
- [ ] Websocket-triggered Bolt11 paid events do not call NUT-29 batch APIs.
- [ ] Existing manual and websocket single-quote success behavior remains intact.
- [ ] Background batch tests do not require changes to manual user flows.

## Blocked by

- Batch mint paid Bolt11 quote checks.
