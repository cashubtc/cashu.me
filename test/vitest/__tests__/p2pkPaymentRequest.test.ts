import { test, describe, expect, vi } from "vitest";
import { PaymentRequest } from "@cashu/cashu-ts";

// The wallet store grabs `t` from useI18n() in its state initializer, which
// only works inside a component setup context.
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

import { useWalletStore } from "src/stores/wallet";
import { useProofsStore } from "src/stores/proofs";

const PUBKEY =
  "02a9acc1e48c25eeeb9289b5031cc57da9fe72f3fe2861d264bdc074209b107ba2";
const HASH = "e0d21f5a0158ee5eafcd25f31036ff2b9ea23bda56c81b883c5b41d3d9b56b39";

const makePr = (nut10?: { kind: string; data: string; tags: string[][] }) =>
  new PaymentRequest(
    undefined,
    "pr1",
    21,
    "sat",
    undefined,
    undefined,
    false,
    nut10
  );

describe("PaymentRequest.toP2PKOptions (NUT-18 lock contract)", () => {
  // SendTokenDialog.payPaymentRequest branches on this contract: options
  // returned -> sendToLock, undefined -> plain send.
  test("returns undefined when the request has no nut10 lock", () => {
    expect(makePr().toP2PKOptions()).toBeUndefined();
  });

  test("returns undefined for an unsupported lock kind", () => {
    expect(
      makePr({ kind: "DLC", data: "deadbeef", tags: [] }).toP2PKOptions()
    ).toBeUndefined();
  });

  test("builds P2PK options from a P2PK lock", () => {
    const opts = makePr({
      kind: "P2PK",
      data: PUBKEY,
      tags: [["locktime", "1750000000"]],
    }).toP2PKOptions();
    expect(opts).toMatchObject({ pubkey: PUBKEY, locktime: 1750000000 });
    expect(opts?.hashlock).toBeUndefined();
  });

  test("builds HTLC options from an HTLC lock", () => {
    const opts = makePr({
      kind: "HTLC",
      data: HASH,
      tags: [["pubkeys", PUBKEY]],
    }).toP2PKOptions();
    expect(opts).toMatchObject({ hashlock: HASH, pubkey: [PUBKEY] });
  });

  test("survives a creqA encode/decode round-trip", () => {
    const encoded = makePr({
      kind: "P2PK",
      data: PUBKEY,
      tags: [],
    }).toEncodedCreqA();
    const decoded = PaymentRequest.fromEncodedRequest(encoded);
    expect(decoded.toP2PKOptions()).toMatchObject({ pubkey: PUBKEY });
  });
});

describe("walletStore.sendToLock pubkey normalization", () => {
  const setup = () => {
    const wallet = useWalletStore();
    const proofs = useProofsStore();
    const walletProofs = [
      { id: "ks1", amount: 21, secret: "s1", C: "c1", reserved: false },
    ] as any[];
    const sendProofs = [{ id: "ks1", amount: 21, secret: "s2", C: "c2" }];
    const asP2PK = vi.fn().mockReturnValue({
      run: vi.fn().mockResolvedValue({ keep: [], send: sendProofs }),
    });
    const mockWallet = {
      unit: "sat",
      mint: { mintUrl: "https://mint.test" },
      ops: {
        send: vi
          .fn()
          .mockReturnValue({ keyset: vi.fn().mockReturnValue({ asP2PK }) }),
      },
    } as any;
    wallet.spendableProofs = vi.fn().mockReturnValue(walletProofs);
    wallet.coinSelect = vi.fn().mockReturnValue(walletProofs);
    wallet.getKeyset = vi.fn().mockReturnValue("ks1");
    proofs.removeProofs = vi.fn().mockResolvedValue(undefined);
    proofs.addProofs = vi.fn().mockResolvedValue(undefined);
    return { wallet, mockWallet, asP2PK, sendProofs, walletProofs };
  };

  test("wraps a bare pubkey string in P2PKOptions", async () => {
    const { wallet, mockWallet, asP2PK, sendProofs } = setup();
    const result = await wallet.sendToLock([], mockWallet, 21, PUBKEY);
    expect(asP2PK).toHaveBeenCalledWith({ pubkey: PUBKEY });
    expect(result.sendProofs).toEqual(sendProofs);
  });

  test("passes full P2PKOptions through untouched", async () => {
    const { wallet, mockWallet, asP2PK } = setup();
    const lockOptions = {
      pubkey: [PUBKEY],
      hashlock: HASH,
      locktime: 1750000000,
    };
    await wallet.sendToLock([], mockWallet, 21, lockOptions);
    expect(asP2PK).toHaveBeenCalledWith(lockOptions);
  });

  test("removes inputs and keeps change, but not the locked sendProofs", async () => {
    const { wallet, mockWallet, walletProofs } = setup();
    const proofs = useProofsStore();
    await wallet.sendToLock([], mockWallet, 21, PUBKEY);
    expect(proofs.removeProofs).toHaveBeenCalledWith(walletProofs);
    expect(proofs.addProofs).toHaveBeenCalledWith([]);
  });
});
