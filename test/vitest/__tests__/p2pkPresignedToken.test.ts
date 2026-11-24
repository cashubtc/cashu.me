import { beforeEach, describe, expect, test } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  createRandomSecretKey,
  getEncodedToken,
  getPubKeyFromPrivKey,
  signP2PKProofs,
  type Proof,
} from "@cashu/cashu-ts";
import { bytesToHex } from "@noble/hashes/utils.js";
import { useP2PKStore } from "src/stores/p2pk";
import { WalletProof } from "src/stores/mints";

// A key that is not in this wallet, e.g. the closing key of a payment channel
const SIGNER_KEY = createRandomSecretKey();
const SIGNER = bytesToHex(getPubKeyFromPrivKey(SIGNER_KEY));

let nonce = 0;
const locked = (data: string, tags: string[][] = []) =>
  ({
    id: "00ad268c4d1f5826",
    amount: 1,
    C: "02e0d21f5a0158ee5eafcd25f31036ff2b9ea23bda56c81b883c5b41d3d9b56b39",
    secret: JSON.stringify([
      "P2PK",
      { nonce: String(nonce++).padStart(32, "0"), data, tags },
    ]),
  } as WalletProof);
const signedBy = (key: Uint8Array, p: WalletProof, message?: string) =>
  signP2PKProofs(
    [p as unknown as Proof],
    key,
    undefined,
    message
  )[0] as unknown as WalletProof;
const encode = (proofs: WalletProof[]) =>
  getEncodedToken({
    mint: "https://mint.example",
    unit: "sat",
    proofs: proofs as unknown as Proof[],
  });

describe("p2pk tokens that already carry their signatures (#511)", () => {
  let ours: string;
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    const p2pk = useP2PKStore();
    p2pk.generateKeypair();
    ours = p2pk.p2pkKeys[0].publicKey;
  });

  test("a proof whose witness meets its lock can be received as-is", async () => {
    const p2pk = useP2PKStore();
    const proofs = [signedBy(SIGNER_KEY, locked(SIGNER))];
    // The receive dialog blocks a token when isLocked && !isLockedToUs
    expect(p2pk.isLocked(proofs)).toBe(false);
    // and no key of ours is needed: the mint accepts the attached witness
    expect(await p2pk.getPrivateKeyForP2PKEncodedToken(encode(proofs))).toBe(
      ""
    );
  });

  test("a witness that meets the main path of an expired lock also counts", () => {
    const past = String(Math.floor(Date.now() / 1000) - 60);
    const proof = signedBy(
      SIGNER_KEY,
      locked(SIGNER, [
        ["locktime", past],
        ["refund", SIGNER],
      ])
    );
    expect(useP2PKStore().isLocked([proof])).toBe(false);
  });

  test("a proof without a witness stays locked to someone else", async () => {
    const p2pk = useP2PKStore();
    const proofs = [locked(SIGNER)];
    expect(p2pk.isLocked(proofs)).toBe(true);
    expect(p2pk.isLockedToUs(proofs)).toBe(false);
  });

  test("a witness from the wrong key does not unlock the proof", () => {
    const p2pk = useP2PKStore();
    const proof = {
      ...locked(SIGNER),
      witness: signedBy(createRandomSecretKey(), locked(SIGNER)).witness,
    };
    expect(p2pk.isLocked([proof])).toBe(true);
    expect(p2pk.isLockedToUs([proof])).toBe(false);
  });

  test("a 2-of-2 proof signed by only one key stays locked", () => {
    const proof = signedBy(
      SIGNER_KEY,
      locked(SIGNER, [
        ["pubkeys", "02" + "11".repeat(32)],
        ["n_sigs", "2"],
      ])
    );
    expect(useP2PKStore().isLocked([proof])).toBe(true);
  });

  test("a SIG_ALL witness is bound to its outputs, so the proof stays locked", () => {
    const proof = signedBy(
      SIGNER_KEY,
      locked(SIGNER, [["sigflag", "SIG_ALL"]]),
      "some outputs"
    );
    expect(useP2PKStore().isLocked([proof])).toBe(true);
    expect(useP2PKStore().isLockedToUs([proof])).toBe(false);
  });

  test("a pre-signed proof next to one locked to us still yields our key", async () => {
    const p2pk = useP2PKStore();
    const proofs = [signedBy(SIGNER_KEY, locked(SIGNER)), locked(ours)];
    expect(p2pk.isLocked(proofs)).toBe(true);
    expect(p2pk.isLockedToUs(proofs)).toBe(true);
    expect(await p2pk.getPrivateKeyForP2PKEncodedToken(encode(proofs))).toBe(
      p2pk.p2pkKeys[0].privateKey
    );
  });
});
