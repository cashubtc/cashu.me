# Cashu TS

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cashubtc/cashu-ts/node.js.yml)
![GitHub issues](https://img.shields.io/github/issues/cashubtc/cashu-ts)
![GitHub package.json version](https://img.shields.io/github/package-json/v/cashubtc/cashu-ts)
![npm](https://img.shields.io/npm/v/@cashu/cashu-ts)
![npm type definitions](https://img.shields.io/npm/types/@cashu/cashu-ts)
![npm bundle size](https://img.shields.io/bundlephobia/min/@cashu/cashu-ts)
[code coverage](https://cashubtc.github.io/cashu-ts/coverage)

⚠️ **Don't be reckless:** This project is in early development, it does however work with real sats! Always use amounts you don't mind losing.

Cashu TS is a JavaScript library for [Cashu](https://github.com/cashubtc) wallets written in Typescript.

Wallet Features:

- [x] connect to mint (load keys)
- [x] request minting tokens
- [x] minting tokens
- [x] sending tokens (get encoded token for chosen value)
- [x] receiving tokens
- [x] melting tokens
- [x] check if tokens are spent
- [ ] ...

Implemented [NUTs](https://github.com/cashubtc/nuts/):

- [x] [NUT-00](https://github.com/cashubtc/nuts/blob/main/00.md)
- [x] [NUT-01](https://github.com/cashubtc/nuts/blob/main/01.md)
- [x] [NUT-02](https://github.com/cashubtc/nuts/blob/main/02.md)
- [x] [NUT-03](https://github.com/cashubtc/nuts/blob/main/03.md)
- [x] [NUT-04](https://github.com/cashubtc/nuts/blob/main/04.md)
- [x] [NUT-05](https://github.com/cashubtc/nuts/blob/main/05.md)
- [x] [NUT-06](https://github.com/cashubtc/nuts/blob/main/06.md)
- [x] [NUT-07](https://github.com/cashubtc/nuts/blob/main/07.md)
- [x] [NUT-08](https://github.com/cashubtc/nuts/blob/main/08.md)
- [x] [NUT-09](https://github.com/cashubtc/nuts/blob/main/09.md)
- [x] [NUT-11](https://github.com/cashubtc/nuts/blob/main/11.md)
- [x] [NUT-18](https://github.com/cashubtc/nuts/blob/main/18.md)

Supported token formats:

- [x] v1 read
- [x] v2 read (deprecated)
- [x] v3 read/write
- [x] v4 read/write

## Usage

Go to the [docs](https://cashubtc.github.io/cashu-ts/docs/main) for detailed usage, or have a look at the [integration tests](./test/integration.test.ts) for examples on how to implement a wallet.

### Install

```shell
npm i @cashu/cashu-ts
```

### Examples

#### Mint tokens

```typescript
import { CashuMint, CashuWallet, MintQuoteState } from '@cashu/cashu-ts';
const mintUrl = 'http://localhost:3338';
const mint = new CashuMint(mintUrl);
const wallet = new CashuWallet(mint);
await wallet.loadMint(); // persist wallet.keys and wallet.keysets to avoid calling loadMint() in the future
const mintQuote = await wallet.createMintQuote(64);
// pay the invoice here before you continue...
const mintQuoteChecked = await wallet.checkMintQuote(mintQuote.quote);
if (mintQuoteChecked.state == MintQuoteState.PAID) {
	const proofs = await wallet.mintProofs(64, mintQuote.quote);
}
```

#### Melt tokens

```typescript
import { CashuMint, CashuWallet } from '@cashu/cashu-ts';
const mintUrl = 'http://localhost:3338'; // the mint URL
const mint = new CashuMint(mintUrl);
const wallet = new CashuWallet(mint); // load the keysets of the mint

const invoice = 'lnbc......'; // Lightning invoice to pay
const meltQuote = await wallet.createMeltQuote(invoice);
const amountToSend = meltQuote.amount + meltQuote.fee_reserve;

// CashuWallet.send performs coin selection and swaps the proofs with the mint
// if no appropriate amount can be selected offline. We must include potential
// ecash fees that the mint might require to melt the resulting proofsToSend later.
const { keep: proofsToKeep, send: proofsToSend } = await wallet.send(amountToSend, proofs, {
	includeFees: true
});
// store proofsToKeep in wallet ..

const meltResponse = await wallet.meltProofs(meltQuote, proofsToSend);
// store meltResponse.change in wallet ..
```

#### Create a token and receive it

```typescript
// we assume that `wallet` already minted `proofs`, as above
const { keep, send } = await wallet.send(32, proofs);
const token = getEncodedTokenV4({ mint: mintUrl, proofs: send });
console.log(token);

const wallet2 = new CashuWallet(mint); // receiving wallet
const receiveProofs = await wallet2.receive(token);
```

#### Get token data

```typescript
try {
	const decodedToken = getDecodedToken(token);
	console.log(decodedToken); // { mint: "https://mint.0xchat.com", unit: "sat", proofs: [...] }
} catch (_) {
	console.log('Invalid token');
}
```

## Contribute

Contributions are very welcome.

If you want to contribute, please open an Issue or a PR.
If you open a PR, please do so from the `development` branch as the base branch.
