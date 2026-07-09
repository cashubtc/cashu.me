# Cashu.me Wallet

Cashu.me is a wallet context for receiving, storing, and spending Cashu ecash proofs across connected mints.

## Language

**Pending incoming payment**:
An incoming payment request that has been created but has not yet resulted in local spendable proofs.
_Avoid_: Pending invoice, unredeemed payment

**Batch minting**:
Minting proofs for multiple compatible paid mint quotes in one mint request as a background optimization.
_Avoid_: Redeem all, bulk claim

**Batch quote check**:
Checking the payment state of multiple compatible mint quotes in one mint request as a background optimization. Successful responses preserve request order.
_Avoid_: Multi-check, quote scan

**Locked mint quote**:
A mint quote whose minted outputs must be authorized by a private key corresponding to the quote's public key.
_Avoid_: Protected invoice, signed invoice

**Batch signing key set**:
The private keys supplied to authorize any locked mint quotes in a batch. The keys are matched to locked quotes by public key rather than by position.
_Avoid_: Ordered signing keys, key list

**Checker tick**:
One scheduled run of the background incoming payment checker. A Bolt11 batch checker tick should perform at most one batch quote check and one batch mint request.
_Avoid_: Poll cycle, interval pass
