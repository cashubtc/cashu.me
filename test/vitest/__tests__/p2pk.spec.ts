import { describe, it, expect, beforeEach, vi } from "vitest";
import { useP2PKStore } from "../../../src/stores/p2pk";
import { useWalletStore } from "../../../src/stores/wallet";
import { useProofsStore } from "../../../src/stores/proofs";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import * as secp from "@noble/secp256k1";
import { ensureCompressed } from "../../../src/utils/ecash";
import { createP2PKHTLC } from "../../../src/js/token";

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

  it("returns original key for expired locktime secret", () => {
    const p2pk = useP2PKStore();
    const locktime = Math.floor(Date.now() / 1000) - 1000;
    const secret = JSON.stringify([
      "P2PK",
      {
        data: "02aa",
        tags: [["locktime", String(locktime)]],
      },
    ]);
    const pub = p2pk.getSecretP2PKPubkey(secret);
    const info = p2pk.getSecretP2PKInfo(secret);
    expect(pub).toBe("02aa");
    expect(info.locktime).toBe(locktime);
  });

  it("normalizes pubkeys from secrets", () => {
    const p2pk = useP2PKStore();
    const priv = secp.utils.randomPrivateKey();
    const compressed = Buffer.from(secp.getPublicKey(priv, true)).toString(
      "hex",
    );
    const uncompressed = Buffer.from(secp.getPublicKey(priv, false)).toString(
      "hex",
    );

    let secret = JSON.stringify(["P2PK", { data: compressed }]);
    expect(p2pk.getSecretP2PKPubkey(secret)).toBe(compressed);

    secret = JSON.stringify(["P2PK", { data: uncompressed }]);
    expect(p2pk.getSecretP2PKPubkey(secret)).toBe(compressed);
  });

  it("extracts receiver key from HTLC token", () => {
    const p2pk = useP2PKStore();
    const receiver =
      "02112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00";
    const { token } = createP2PKHTLC(1, receiver, 1, 0);
    expect(p2pk.getSecretP2PKPubkey(token)).toBe(receiver);
  });

  it("handles P2PK: prefixed secrets", () => {
    const p2pk = useP2PKStore();
    const receiver =
      "03112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00";
    expect(p2pk.getSecretP2PKPubkey(`P2PK:${receiver}`)).toBe(receiver);
  });

  it("returns empty string for random secret", () => {
    const p2pk = useP2PKStore();
    const random = "aa".repeat(32); // 64-hex string
    expect(p2pk.getSecretP2PKPubkey(random)).toBe("");
    expect(p2pk.isLocked([{ secret: random } as any])).toBe(false);
  });

  it("parses valid P2PK secret", () => {
    const p2pk = useP2PKStore();
    const secret = JSON.stringify(["P2PK", { data: "02aa" }]);
    expect(p2pk.getSecretP2PKPubkey(secret)).toBe("02aa");
    expect(p2pk.isLocked([{ secret } as any])).toBe(true);
  });

  it("detects pure P2PK tokens", () => {
    const p2pk = useP2PKStore();
    const pure = JSON.stringify(["P2PK", { data: "02aa" }]);
    const htlc = JSON.stringify({ receiverP2PK: "02bb" });
    expect(p2pk.isPureP2PK([{ secret: pure } as any])).toBe(true);
    expect(p2pk.isPureP2PK([{ secret: htlc } as any])).toBe(false);
    expect(p2pk.isPureP2PK([{ secret: "random" } as any])).toBe(false);
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
    vi.spyOn(walletStore, "wallet", "get").mockReturnValue(wallet);

    await walletStore.sendToLock(1, "pk", 123);
    expect(wallet.send).toHaveBeenCalledWith(
      1,
      [{ secret: "s", amount: 1, id: "a", C: "c" }],
      { keysetId: "kid", p2pk: { pubkey: "pk", locktime: 123 } },
    );
  });

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
  //   "hs"
  // );
  //   expect(wallet.splitWithSecret).toHaveBeenCalledWith(
  //     1,
  //     [{ secret: "s", amount: 1, id: "a", C: "c" }],
  //     { pubkey: "pk", locktime: 123, rfnd: "r", hSecret: "hs" }
  //   );
  // });

  it("extracts pubkeys from encoded token", () => {
    const p2pk = useP2PKStore();
    const locktime = Math.floor(Date.now() / 1000) + 1000;
    const secret = JSON.stringify([
      "P2PK",
      {
        data: "02aa",
        tags: [["locktime", String(locktime)]],
      },
    ]);
    const tokenObj = {
      token: [{ proofs: [{ id: "a", amount: 1, C: "c", secret }], mint: "m" }],
    };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    expect(p2pk.getTokenPubkey(encoded)).toBe("02aa");
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

    vi.spyOn(walletStore, "wallet", "get").mockReturnValue(wallet);

    const { sendProofs } = await walletStore.sendToLock(1, pubHex, 0);
    const tokenObj = { token: [{ proofs: sendProofs, mint: "m" }] };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    expect(p2pk.getPrivateKeyForP2PKEncodedToken(encoded)).toBe(skHex);
  });

  it("creates locktime-only secret in locked token", async () => {
    const walletStore = useWalletStore();
    const proofsStore = useProofsStore();
    vi.spyOn(proofsStore, "removeProofs").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(proofsStore, "serializeProofs").mockImplementation(
      (proofs: any) => {
        const tokenObj = { token: [{ proofs, mint: "m" }] };
        return (
          "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64")
        );
      },
    );

    walletStore.spendableProofs = vi.fn(() => [
      { secret: "s", amount: 100, id: "a", C: "c" } as any,
    ]);
    walletStore.coinSelect = vi.fn(() => [
      { secret: "s", amount: 100, id: "a", C: "c" } as any,
    ]);
    walletStore.getKeyset = vi.fn(() => "kid");

    const locktime = Math.floor(Date.now() / 1000) + 3600;
    const wallet = {
      mint: { mintUrl: "m" },
      unit: "sat",
      send: vi.fn(async (_a: number, _p: any, opts: any) => {
        const secret = JSON.stringify([
          "P2PK",
          {
            data: opts.p2pk.pubkey,
            tags: [["locktime", String(opts.p2pk.locktime)]],
          },
        ]);
        return { keep: [], send: [{ id: "a", amount: 100, C: "c", secret }] };
      }),
    } as any;

    vi.spyOn(walletStore, "wallet", "get").mockReturnValue(wallet);

    const { locked } = await walletStore.sendToLock(100, "02aa", locktime);
    const decoded = JSON.parse(
      Buffer.from(locked.tokenString.slice(6), "base64").toString(),
    );
    const secretObj = JSON.parse(decoded.token[0].proofs[0].secret);
    expect(secretObj[1].tags).toEqual([["locktime", String(locktime)]]);
  });

  it("shows P2PK chip only for pure P2PK tokens", async () => {
    window.windowMixin = {
      methods: { formatCurrency: (v: number) => String(v) },
    } as any;
    const TokenInformation = (
      await import("../../../src/components/TokenInformation.vue")
    ).default;
    const { mount } = await import("@vue/test-utils");

    const pureSecret = JSON.stringify(["P2PK", { data: "02aa" }]);
    const tokenObj = {
      token: [
        {
          proofs: [{ id: "a", amount: 1, C: "c", secret: pureSecret }],
          mint: "m",
        },
      ],
    };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");

    const wrapperPure = mount(TokenInformation, {
      props: { encodedToken: encoded },
    });
    expect(wrapperPure.text()).toContain("P2PK");

    const htlcSecret = JSON.stringify({ receiverP2PK: "02bb" });
    const tokenObjHtlc = {
      token: [
        {
          proofs: [{ id: "a", amount: 1, C: "c", secret: htlcSecret }],
          mint: "m",
        },
      ],
    };
    const encodedHtlc =
      "cashuA" + Buffer.from(JSON.stringify(tokenObjHtlc)).toString("base64");
    const wrapperHtlc = mount(TokenInformation, {
      props: { encodedToken: encodedHtlc },
    });
    expect(wrapperHtlc.text()).not.toContain("P2PK");
  });
});
