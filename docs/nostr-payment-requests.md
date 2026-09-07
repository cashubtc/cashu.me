# Nostr payment requests: reliability and test strategy

## Review outcome

The original NIP-17 encryption format was interoperable, but the end-to-end flow
was not reliable. Publication errors could be swallowed, reactive request objects
could fail IndexedDB serialization, concurrent receipts could share the mutable
receive dialog buffer, and relay checkpoints/seen IDs could advance before value
was durably handled. A newly restored wallet did not scan its full relay history.
Request editing and request ownership also needed separation from sending.

## Implementation

1. **Protocol boundary.** `paymentRequestProtocol` verifies the signed 1059 wrapper,
   signed kind-13 seal, and intentionally unsigned kind-14 rumor, including author,
   recipient and event hash. It bounds message/proof sizes, validates URLs and
   payloads, preserves large integers, and fingerprints proofs independently of
   wrapper IDs and request IDs. The SDK is pinned to `5.0.0-rc.9` for the updated
   NUT-18 request schema (`mp`, `sm`, both request encodings).
2. **Durable processing.** `paymentJobs` owns immutable inbox/outbox jobs in Dexie.
   Outgoing inputs and serialized swap outputs are saved before contacting the
   mint. Incoming envelopes are saved before processing and marked processed only
   after the receipt is durable. Proofs, history and job completion commit together.
   Failed publications reuse the token and exact signed envelope. Lost mint
   responses recover the saved blinded outputs using NUT-09; incomplete restores
   never become successful payments. Plaintext-token storage errors also leave
   their envelopes retryable; concurrent legacy delivery is deduplicated.
3. **Concurrency.** Payment operations use the wallet mutex, Web Locks where
   available, and a renewing IndexedDB lease. Deterministic counter reservations
   are atomic across wallet instances and namespaced by a hash of the seed. Seed
   changes rebind counter sources, stop subscriptions, and prevent attributing or
   completing receipts into another wallet across awaited operations.
4. **Relay transport.** Dedicated payment-only WebSocket connections require actual
   `OK` and `EOSE` frames. Timeouts are failures, not successful synchronization.
   NIP-42 authentication uses a recipient identity for reading; post-auth queries
   get fresh subscription IDs so cached subscriptions and late pre-auth EOSE cannot
   hide history. Publication authentication uses an ephemeral key.
5. **Routing and recovery.** A verified kind-10050 inbox list takes priority. An
   explicit nprofile relay hint is used only after a completed absent-list lookup.
   Advertising the receiving key/list requires an explicit privacy opt-in. History
   recovery scans newest-first, persists a cursor per identity/relay, repeats and
   grows equal-timestamp boundaries, and resumes after failures. Subsequent scans
   overlap the last completed scan by two days plus clock-skew allowance. Live
   delivery never advances the historical checkpoint.
6. **Receiving policy.** Known owned requests may be auto-claimed when enabled.
   Unknown requests/mints, unsolicited plaintext tokens, overlapping proofs and
   mismatched terms stay reviewable. Matching checks cover mint preference/strict
   lists, units, supported methods/fees, amount, single-use and locking conditions.
   Only successfully claimed, matching net value contributes to request totals.
7. **UI and migration.** Editing terms creates a new UUID and preserves previously
   shared requests. Scanning a foreign request never adds an owned address. Failed
   edits restore the labels corresponding to the saved QR. Saved payments and relay
   recovery status are available in Payment requests settings. Existing owned
   requests/history links migrate idempotently; pending outgoing history with a
   matching encoded request can be adopted without another debit.
8. **Backups and retention.** Backup export snapshots all wallet database tables
   in one transaction (excluding temporary locks), including prepared outputs and
   counters. Restoring counters never decreases their durable high-water mark.
   Paid-token cleanup removes redundant job payloads, tokens, previews and envelopes
   while preserving receipt fingerprints and accounting links. Pending value is
   not redacted.

NDK remains in use for the wallet's other Nostr features. The small dedicated
payment transport makes acknowledgement, authentication and durable-history
completion explicit rather than relying on convenience fetch semantics.

## Automated verification

| Layer                          | Regression or failure oracle                                                                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real cryptographic unit tests  | Independent historical envelopes, invalid signatures/seals/rumors, wrong recipients, unsupported NIPs/locks, limits, integer precision, duplicate proof identities, `creqA`/`creqB` schema round trips                                                     |
| Store tests with IndexedDB     | Concurrent A/B receipts, storage failures, atomic accounting, manual-only receipts, unknown-mint isolation, pending publication retry, immutable request IDs, legacy deduplication/adoption, reactive serialization, counter reservations, backup contents |
| Saved-output tests             | Real blinded signatures, order-independent NUT-09 unblinding, incomplete restoration rejection, no unnecessary restore on success                                                                                                                          |
| Local WebSocket fault tests    | Delayed/rejected acknowledgements, missing EOSE, persistence barrier, authentication/re-subscription, late pre-auth EOSE, verified inbox discovery and completed-empty fallback                                                                            |
| History pagination tests       | Older-than-two-day recovery, equal-timestamp pages, interrupted writes, capped boundaries, resumable cursors, overlapping catch-up                                                                                                                         |
| Browser + real test mint/relay | Two isolated wallets, open/authenticated relay delivery, reload/replay, rejected publication with identical retry and no second debit, manual claim after reload, lost swap response, offline recipient recovery                                           |
| Relay authorization test       | Anonymous reader cannot obtain kind 1059; authenticated recipient can, after a positive AUTH acknowledgement                                                                                                                                               |
| Existing wallet browser suite  | BOLT11/BOLT12/on-chain mint and melt, ecash transfer/replay, keyset rotation, insufficient balance, pending/failed quotes and duplicate submission                                                                                                         |

Run with Node 24, npm and Docker:

```sh
npm ci
npm run test:ci
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The E2E stack uses digest-pinned CDK fake-wallet mints and nostr-rs-relay 0.10.0
(one open, one NIP-42 protected). Test service ports bind only to loopback and use
temporary databases. The browser page helper blocks public HTTP and secure relay
traffic. The existing wallet E2E CI workflow runs the new scenarios automatically.
Never use a funded wallet, real mnemonic, or public payment relay for these tests.

Pending-melt fixtures do not forward a real spend and then disguise its response.
Their assertions distinguish total retained proofs from the spendable balance:
pending inputs stay reserved locally, total value is conserved, and the real mint
still reports the retained proofs unspent.

## Operational limits and next coverage

- A relay ACK proves relay acceptance, not recipient receipt or claim. Relays can
  delete messages, silently limit historical results, or go offline. The recovery
  UI reports interrupted/capped boundaries but cannot prove remote retention.
- Keep full wallet backups. A mnemonic alone does not restore locally authored
  request terms, unsubmitted prepared swaps, or arbitrary long deterministic
  counter gaps. Recovered messages without their original request need review.
- If a mint permanently rejects a saved preparation (for example, an output
  keyset retires during a prepared swap), the job remains saved. Do not release its
  inputs or create fresh outputs merely on a timeout. A follow-up can explicitly
  verify all inputs remain unspent and replace the preparation transactionally.
- Browser coverage currently targets Chromium. Follow-up coverage should include
  WebKit/PWA suspension, the non-Web-Locks fallback, browser quota exhaustion,
  restore/import during in-flight work, fee-paying and locked requests against
  independent wallet implementations, and large real-relay history datasets.
- The new recovery controls currently use English copy; localization is a
  follow-up. NIP-04, NWC and NIP-60 are not redesigned by this change.
- The SDK pin is a prerelease. Review its release notes and rerun the whole wallet
  regression suite before changing it; do not silently follow upstream main.
