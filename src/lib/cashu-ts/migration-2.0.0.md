# Version 2.0.0 Migration guide

⚠️ Upgrading to version 2.0.0 will come with breaking changes! Please follow the migration guide for a smooth transition to the new version.

## Breaking changes

### `CashuWallet` interface changes

#### removed `payLnInvoice` helper

The helper function was removed. Instead users will have to manage a melt quote manually:

```ts
const quote = await wallet.createMeltQuote(invoice);
const totalAmount = quote.fee_reserve + invoiceAmount;
const { keep, send } = await wallet.send(totalAmount, proofs);
const payRes = await wallet.meltProofs(quote, send);
```

---

#### Preference for outputs are now passed as a object of simple arrays

**`AmountPreference`** is not used anymore.

`preference?: Array<AmountPreference>;` -> `outputAmounts?: OutputAmounts;`

where

```typescript
export type OutputAmounts = {
	sendAmounts: Array<number>;
	keepAmounts?: Array<number>;
};
```

---

#### CashuWallet can no longer be instantiated using BIP39 mnemonic!

In order to reduce the bundle size, BIP39 has been removed as a dependency of cashu-ts. Therefore users that want to use deterministic secrets with a BIP39 menmonic will have to convert the wordlist into a seed manually and then instantiate the wallet using:

```ts
const wallet = new CashuWallet(mint, { bip39seed: uint8ArrayOfSeed });
```

#### `checkProofsStates` replaces `checkProofsSpent`

To check the state of a `Proof`, call `CashuWallet.checkProofsStates`. `checkProofsStates` now returns an array of `ProofState`'s, one for each `Proof` provided. The spent states are in `ProofState.state` and can have the values `CheckStateEnum.SPENT`, `CheckStateEnum.UNSPENT`, and `CheckStateEnum.PENDING`. `ProofState` also contains a `witness` if present.

---

#### renamed functions

- in `SendResponse`, `returnChange` is now called `keep`
- `CashuWallet.mintTokens()` is now called `CashuWallet.mintProofs()` and returns <Promise<Array<Proof>> instead of Promise<{proofs: Array<Proof>}>
- `CashuWallet.meltTokens()` is now called `CashuWallet.meltProofs()`
- `CashuMint.split()` is now called `CashuMint.swap()`

---

### Type changes

#### Wallet payload types

- `BlindedTransaction` has been removed
- `BlindedMessageData` has been replaced by `BlindingData`
  - In `BlindingData` `rs` has been renamed to `blindingFactors`

---

#### Token Types

- The `Token` type no longer reassembles the token v3 structure, but instead is a simple object type:

```ts
type Token = {
	mint: string;
	proofs: Array<Proof>;
	memo?: string;
	unit?: string;
};
```

- The old `Token` type got renamed to `DeprecatedToken`

---
