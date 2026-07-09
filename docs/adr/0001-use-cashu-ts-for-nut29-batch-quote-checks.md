# Use cashu-ts for NUT-29 batch quote checks

Cashu.me will implement Bolt11 batch quote checking through a `@cashu/cashu-ts` release that exposes `Wallet.checkMintQuoteBatchBolt11(quotes)` and the NUT-29 `prepareBatchMint`/`completeBatchMint` flow, rather than adding local NUT-29 HTTP request code. This keeps Cashu protocol request, normalization, auth, and error behavior centralized in the wallet library; mints without NUT-29 support still fall back at runtime to the existing single-quote checker.
