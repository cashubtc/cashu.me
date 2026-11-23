import { beforeEach, describe, expect, test } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  createRandomSecretKey,
  getEncodedToken,
  getPubKeyFromPrivKey,
  signP2PKProofs,
  verifyP2PKSpendingConditions,
  type Proof,
} from "@cashu/cashu-ts";
import { bytesToHex } from "@noble/hashes/utils.js";
import { useP2PKStore } from "src/stores/p2pk";
import { WalletProof } from "src/stores/mints";

const OTHER =
  "02e0d21f5a0158ee5eafcd25f31036ff2b9ea23bda56c81b883c5b41d3d9b56b39";
// Another party, whose signature can already be on a proof we receive
const SIGNER_KEY = createRandomSecretKey();
const SIGNER = bytesToHex(getPubKeyFromPrivKey(SIGNER_KEY));
const now = () => Math.floor(Date.now() / 1000);
const PAST = () => ["locktime", String(now() - 60)];
const FUTURE = () => ["locktime", String(now() + 3600)];

let nonce = 0;
const locked = (data: string, tags: string[][] = []) =>
  ({
    id: "00ad268c4d1f5826",
    amount: 1,
    C: OTHER,
    secret: JSON.stringify([
      "P2PK",
      { nonce: String(nonce++).padStart(32, "0"), data, tags },
    ]),
  } as WalletProof);
const signedBy = (key: Uint8Array, p: WalletProof) =>
  signP2PKProofs([p as unknown as Proof], key)[0] as unknown as WalletProof;
const encode = (proofs: WalletProof[]) =>
  getEncodedToken({
    mint: "https://mint.example",
    unit: "sat",
    proofs: proofs as unknown as Proof[],
  });

// Signs with the one key the store picked and checks every proof as a mint would (NUT-11).
const spendable = async (proofs: WalletProof[]) => {
  const key = await useP2PKStore().getPrivateKeyForP2PKEncodedToken(
    encode(proofs)
  );
  return (
    !!key &&
    signP2PKProofs(proofs as unknown as Proof[], key).every(
      (p) => verifyP2PKSpendingConditions(p).success
    )
  );
};

describe("p2pk key selection", () => {
  let a: string;
  let b: string;
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    const p2pk = useP2PKStore();
    p2pk.generateKeypair();
    p2pk.generateKeypair();
    [a, b] = p2pk.p2pkKeys.map((k) => k.publicKey);
  });

  test.each([
    ["a plain lock to our key", () => [locked(a)]],
    [
      "our main key after locktime, refund key not ours",
      () => [locked(a, [PAST(), ["refund", OTHER]])],
    ],
    [
      "our additional key after locktime, refund key not ours",
      () => [
        locked(OTHER, [
          PAST(),
          ["pubkeys", a],
          ["n_sigs", "1"],
          ["refund", OTHER],
        ]),
      ],
    ],
    [
      "our refund key after locktime",
      () => [locked(OTHER, [PAST(), ["refund", a]])],
    ],
    [
      "an expired 2-of-2 we hold one key of, with our refund key",
      () => [
        locked(a, [PAST(), ["pubkeys", OTHER], ["n_sigs", "2"], ["refund", b]]),
      ],
    ],
    [
      "proofs that share our refund key",
      () => [locked(a, [PAST(), ["refund", b]]), locked(b)],
    ],
  ])("can spend %s", async (_name, make) => {
    const proofs = make();
    const p2pk = useP2PKStore();
    expect(p2pk.isLocked(proofs)).toBe(true);
    expect(p2pk.isLockedToUs(proofs)).toBe(true);
    expect(await spendable(proofs)).toBe(true);
  });

  test("prefers our refund key to our main key after locktime", () => {
    const secret = locked(a, [PAST(), ["refund", b]]).secret;
    expect(useP2PKStore().getSecretP2PKPubkey(secret)).toBe(b);
  });

  test.each([
    ["a lock to someone else", () => [locked(OTHER)]],
    [
      "our refund key before locktime",
      () => [locked(OTHER, [FUTURE(), ["refund", a]])],
    ],
    [
      "an expired lock where no key is ours",
      () => [locked(OTHER, [PAST(), ["refund", OTHER]])],
    ],
  ])("shows %s as locked, but not to us", async (_name, make) => {
    const proofs = make();
    const p2pk = useP2PKStore();
    expect(p2pk.isLocked(proofs)).toBe(true);
    expect(p2pk.isLockedToUs(proofs)).toBe(false);
    expect(await p2pk.getPrivateKeyForP2PKEncodedToken(encode(proofs))).toBe(
      ""
    );
  });

  test("adds no key to an expired proof its refund key has already signed", async () => {
    const p2pk = useP2PKStore();
    const expired = () => locked(a, [PAST(), ["refund", SIGNER]]);
    const keyFor = (p: WalletProof) =>
      p2pk.getPrivateKeyForP2PKEncodedToken(encode([p]));
    expect(await keyFor(signedBy(SIGNER_KEY, expired()))).toBe("");
    // a witness that does not satisfy the lock changes nothing
    const stranger = createRandomSecretKey();
    const unsatisfied = {
      ...expired(),
      witness: signedBy(
        stranger,
        locked(bytesToHex(getPubKeyFromPrivKey(stranger)))
      ).witness,
    };
    expect(await keyFor(unsatisfied)).toBe(p2pk.p2pkKeys[0].privateKey);
    expect(await keyFor(expired())).toBe(p2pk.p2pkKeys[0].privateKey);
  });

  test("treats an expired lock without refund keys as unlocked", () => {
    const p2pk = useP2PKStore();
    expect(p2pk.isLocked([locked(OTHER, [PAST()])])).toBe(false);
    expect(p2pk.isLocked([locked(a, [PAST()])])).toBe(false);
  });

  test("matches our key by x-coordinate, ignoring case and prefix", async () => {
    const p2pk = useP2PKStore();
    const variant = "03" + a.slice(2).toUpperCase();
    expect(p2pk.haveThisKey(variant)).toBe(true);
    expect(p2pk.haveThisKey("04" + a.slice(2))).toBe(false);
    expect(p2pk.haveThisKey("ff" + a)).toBe(false);
    // a malformed key field stays locked and not ours
    const malformed = locked(42 as unknown as string);
    expect(p2pk.isLocked([malformed])).toBe(true);
    expect(p2pk.isLockedToUs([malformed])).toBe(false);
    expect(p2pk.isLockedToUs([locked(variant)])).toBe(true);
    expect(
      await p2pk.getPrivateKeyForP2PKEncodedToken(encode([locked(variant)]))
    ).toBe(p2pk.p2pkKeys[0].privateKey);
  });
});
