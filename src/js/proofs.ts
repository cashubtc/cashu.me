import { type ProofLike, sumProofs as sumCashuProofs } from "@cashu/cashu-ts";

export function sumProofAmounts(proofs: Array<Pick<ProofLike, "amount">>) {
  return sumCashuProofs(proofs).toNumber();
}
