import { describe, it, expect, beforeEach, vi } from "vitest";
import { useP2PKStore } from "../../../src/stores/p2pk";
import { useWalletStore } from "../../../src/stores/wallet";
import { useProofsStore } from "../../../src/stores/proofs";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import * as secp from "@noble/secp256k1";
import { ensureCompressed } from "../../../src/utils/ecash";

beforeEach(() => {
  localStorage.clear();
});

describe("P2PK store", () => {
  it("returns pubkey for future locktime secret", () => {
    const p2pk = useP2PKStore();
    const locktime = Math.floor(Date.now() / 1000) + 1000;
    const secret = JSON.stringify([
      "P2PK",
      { data: "02aa", tags: [["locktime", String(locktime)]] },
    ]);
    const pub = p2pk.getSecretP2PKPubkey(secret);
    const info = p2pk.getSecretP2PKInfo(secret);
    expect(pub).toBe("02aa");
    expect(info.locktime).toBe(locktime);
  });

  it("returns refund key for expired locktime secret", () => {
    const p2pk = useP2PKStore();
    const locktime = Math.floor(Date.now() / 1000) - 1000;
    const secret = JSON.stringify([
      "P2PK",
      {
        data: "02aa",
        tags: [
          ["locktime", String(locktime)],
          ["refund", "02bb", "02cc"],
        ],
      },
    ]);
    const pub = p2pk.getSecretP2PKPubkey(secret);
    const info = p2pk.getSecretP2PKInfo(secret);
    expect(pub).toBe("02bb");
    expect(info.locktime).toBe(locktime);
  });

  it("normalizes pubkeys from secrets", () => {
    const p2pk = useP2PKStore();
    const priv = secp.utils.randomPrivateKey();
    const compressed = Buffer.from(secp.getPublicKey(priv, true)).toString("hex");
    const uncompressed = Buffer.from(secp.getPublicKey(priv, false)).toString("hex");

    let secret = JSON.stringify(["P2PK", { data: compressed }]);
    expect(p2pk.getSecretP2PKPubkey(secret)).toBe(compressed);

    secret = JSON.stringify(["P2PK", { data: uncompressed }]);
    expect(p2pk.getSecretP2PKPubkey(secret)).toBe(compressed);
  });

  it("forwards options in sendToLock", async () => {
    const walletStore = useWalletStore();
    const proofsStore = useProofsStore();
    vi.spyOn(proofsStore, "removeProofs").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();

    walletStore.spendableProofs = vi.fn(() => [
      { secret: "s", amount: 1, id: "a", C: "c" } as any,
    ]);
    walletStore.coinSelect = vi.fn(() => [
      { secret: "s", amount: 1, id: "a", C: "c" } as any,
    ]);
    walletStore.getKeyset = vi.fn(() => "kid");
    const wallet = {
      mint: { mintUrl: "m" },
      unit: "sat",
      send: vi.fn(async (_a: number, _p: any, opts: any) => ({
        keep: [],
        send: [],
      })),
    } as any;

    await walletStore.sendToLock(
      [{ secret: "s", amount: 1, id: "a", C: "c" } as any],
      wallet,
      1,
      "pk",
      "b",
      123,
      "r"
    );
    expect(wallet.send).toHaveBeenCalledWith(
      1,
      [{ secret: "s", amount: 1, id: "a", C: "c" }],
      { keysetId: "kid", pubkey: "pk", locktime: 123, refund: "r" }
    );
  });

  // Legacy hashlock functionality has been removed.
  // it("uses splitWithSecret when hashSecret is provided", async () => {
  //   const walletStore = useWalletStore();
  //   const proofsStore = useProofsStore();
  //   vi.spyOn(proofsStore, "removeProofs").mockResolvedValue();
  //   vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
  //
  //   walletStore.spendableProofs = vi.fn(() => [
  //     { secret: "s", amount: 1, id: "a", C: "c" } as any,
  //   ]);
  //   walletStore.coinSelect = vi.fn(() => [
  //     { secret: "s", amount: 1, id: "a", C: "c" } as any,
  //   ]);
  //   walletStore.getKeyset = vi.fn(() => "kid");
  //   const wallet = {
  //     mint: { mintUrl: "m" },
  //     unit: "sat",
  //     splitWithSecret: vi.fn(async (_a: number, _p: any, opts: any) => ({
  //       keep: [],
  //       send: [],
  //     })),
  //   } as any;
  //
  //   await walletStore.sendToLock(
  //     [{ secret: "s", amount: 1, id: "a", C: "c" } as any],
  //     wallet,
  //     1,
  //     "pk",
  //     "b",
  //     123,
  //     "r",
  //     "hs"
  //   );
  //   expect(wallet.splitWithSecret).toHaveBeenCalledWith(
  //     1,
  //     [{ secret: "s", amount: 1, id: "a", C: "c" }],
  //     { pubkey: "pk", locktime: 123, refund: "r", hashSecret: "hs" }
  //   );
  // });

  it("extracts pubkeys from encoded token", () => {
    const p2pk = useP2PKStore();
    const locktime = Math.floor(Date.now() / 1000) + 1000;
    const secret = JSON.stringify([
      "P2PK",
      {
        data: "02aa",
        tags: [
          ["locktime", String(locktime)],
          ["refund", "02bb"],
        ],
      },
    ]);
    const tokenObj = {
      token: [{ proofs: [{ id: "a", amount: 1, C: "c", secret }], mint: "m" }],
    };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    expect(p2pk.getTokenPubkey(encoded)).toBe("02aa");
    expect(p2pk.getTokenRefundPubkey(encoded)).toBe("02bb");
  });

  it("redeems token locked to converted npub", async () => {
    const walletStore = useWalletStore();
    const proofsStore = useProofsStore();
    vi.spyOn(proofsStore, "removeProofs").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();

    walletStore.spendableProofs = vi.fn(() => [
      { secret: "s", amount: 1, id: "a", C: "c" } as any,
    ]);
    walletStore.coinSelect = vi.fn(() => [
      { secret: "s", amount: 1, id: "a", C: "c" } as any,
    ]);
    walletStore.getKeyset = vi.fn(() => "kid");

    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    const skHex = bytesToHex(sk);
    const npub = nip19.npubEncode(pk);

    const p2pk = useP2PKStore();
    const pubHex = ensureCompressed(nip19.decode(npub).data as string);
    p2pk.p2pkKeys = [
      { publicKey: pubHex, privateKey: skHex, used: false, usedCount: 0 },
    ];

    const wallet = {
      mint: { mintUrl: "m" },
      unit: "sat",
      send: vi.fn(async (_a: number, _p: any, opts: any) => {
        const secret = JSON.stringify(["P2PK", { data: opts.pubkey }]);
        return { keep: [], send: [{ id: "a", amount: 1, C: "c", secret }] };
      }),
    } as any;

    const { sendProofs } = await walletStore.sendToLock(
      [{ secret: "s", amount: 1, id: "a", C: "c" } as any],
      wallet,
      1,
      pubHex,
      "b"
    );
    const tokenObj = { token: [{ proofs: sendProofs, mint: "m" }] };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    expect(p2pk.getPrivateKeyForP2PKEncodedToken(encoded)).toBe(skHex);
  });
});
