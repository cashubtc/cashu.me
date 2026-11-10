// Real test ecash and invoices from testnut, which pays its own invoices with fake funds.
import { Wallet, getEncodedToken } from "@cashu/cashu-ts";
export const TESTNUT = "https://testnut.cashu.space";
let ready;
const w = () =>
  (ready ??= (async () => {
    const wallet = new Wallet(TESTNUT, { unit: "sat" });
    await wallet.loadMint();
    return wallet;
  })());
export async function mintProofs(amount) {
  const wl = await w();
  const quote = await wl.createMintQuoteBolt11(amount);
  for (let i = 0; i < 20; i++) {
    const q = await wl.checkMintQuoteBolt11(quote.quote);
    if (q.state === "PAID" || q.state === "ISSUED") break;
    await new Promise((r) => setTimeout(r, 500));
  }
  // Plain JSON proofs (cashu-ts 4 returns Amount objects).
  return (await wl.mintProofsBolt11(amount, quote.quote)).map((p) => ({
    amount: Number(p.amount.value ?? p.amount),
    id: p.id,
    secret: p.secret,
    C: p.C,
  }));
}
export async function token(amount, memo) {
  return getEncodedToken({
    mint: TESTNUT,
    unit: "sat",
    memo,
    proofs: await mintProofs(amount),
  });
}
// A real, unpaid bolt11 invoice (a mint quote's request), for the pay screen.
export async function invoice(amount) {
  return (await (await w()).createMintQuoteBolt11(amount)).request;
}
