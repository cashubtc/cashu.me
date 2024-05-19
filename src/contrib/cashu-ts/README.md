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

Supported token formats:

- [x] v1 read
- [x] v2 read (deprecated)
- [x] v3 read/write

## Usage

Go to the [docs](https://cashubtc.github.io/cashu-ts/docs) for detailed usage, or have a look at the [integration tests](./test/integration.test.ts) for examples on how to implement a wallet.

### Install

```shell
npm i @cashu/cashu-ts
```

### Example

```typescript
import { CashuMint, CashuWallet, getEncodedToken } from '@cashu/cashu-ts';

const mint = new CashuMint(mintUrl);
const wallet = new CashuWallet(mint);
const mintQuote = await wallet.mintQuote(64);
const tokens = await wallet.mintTokens(64, mintQuote.quote);
```

## Contribute

Contributions are very welcome.

If you want to contribute, please open an Issue or a PR.
