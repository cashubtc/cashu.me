import { getEncodedToken } from "@cashu/cashu-ts";
const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const G = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
console.log(getEncodedToken({ mint: "https://mint.minibits.cash/Bitcoin", unit: "sat", memo: "Thanks for lunch", proofs: [500, 250, 250].map((amount) => ({ amount, id: "00500550f0494146", secret: hex(32), C: G })) }));
