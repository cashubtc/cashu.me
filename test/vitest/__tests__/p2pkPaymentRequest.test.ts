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

describe("walletStore.sendToLock pubkey normalization", () => {
  const setup = () => {
    const wallet = useWalletStore();
    const proofs = useProofsStore();
    const walletProofs = [
      { id: "ks1", amount: 21, secret: "s1", C: "c1", reserved: false },
    ] as any[];
    const sendProofs = [{ id: "ks1", amount: 21, secret: "s2", C: "c2" }];
    const asLocked = vi.fn().mockReturnValue({
      run: vi.fn().mockResolvedValue({ keep: [], send: sendProofs }),
    });
    const keyset = vi.fn().mockReturnValue({ asLocked });
    const mockWallet = {
      unit: "sat",
      keysetId: "ks1",
      mint: { mintUrl: "https://mint.test" },
      ops: {
        send: vi.fn().mockReturnValue({ keyset }),
      },
    } as any;
    wallet.spendableProofs = vi.fn().mockReturnValue(walletProofs);
    wallet.coinSelect = vi.fn().mockReturnValue(walletProofs);
    wallet.getKeyset = vi.fn().mockReturnValue("ks1");
    proofs.removeProofs = vi.fn().mockResolvedValue(undefined);
    proofs.addProofs = vi.fn().mockResolvedValue(undefined);
    return { wallet, mockWallet, keyset, asLocked, sendProofs, walletProofs };
  };

  test("wraps a bare pubkey string in P2PKOptions", async () => {
    const { wallet, mockWallet, keyset, asLocked, sendProofs } = setup();
    const result = await wallet.sendToLock([], mockWallet, 21, PUBKEY);
    expect(keyset).toHaveBeenCalledWith("ks1");
    expect(asLocked).toHaveBeenCalledWith({ pubkey: PUBKEY });
    expect(result.sendProofs).toEqual(sendProofs);
  });

  test("removes inputs and keeps change, but not the locked sendProofs", async () => {
    const { wallet, mockWallet, walletProofs } = setup();
    const proofs = useProofsStore();
    await wallet.sendToLock([], mockWallet, 21, PUBKEY);
    expect(proofs.removeProofs).toHaveBeenCalledWith(walletProofs);
    expect(proofs.addProofs).toHaveBeenCalledWith([]);
  });
});

describe("walletStore.sendToRequest", () => {
  const dleq = { e: "e", s: "s", r: "r" };
  const setup = (exactMatch: any[] = []) => {
    const wallet = useWalletStore();
    const proofs = useProofsStore();
    const walletProofs = [
      { id: "ks1", amount: 16, secret: "s1", C: "c1", dleq, reserved: false },
      { id: "ks1", amount: 8, secret: "s2", C: "c2", reserved: false },
      { id: "ks1", amount: 4, secret: "s3", C: "c3", dleq, reserved: false },
    ] as any[];
    // s3 passes through unselected; s1 and s2 are swapped
    const keep = [
      { id: "ks1", amount: 4, secret: "s3", C: "c3" },
      { id: "ks1", amount: 2, secret: "k1", C: "ck" },
    ];
    const send = [{ id: "ks1", amount: 22, secret: "x1", C: "cx" }];
    const builder: any = {
      keyset: vi.fn(() => builder),
      proofsWeHave: vi.fn(() => builder),
      asDeterministic: vi.fn(() => builder),
      offlineExactOnly: vi.fn(() => ({
        run: vi.fn().mockResolvedValue({ keep: [], send: exactMatch }),
      })),
      run: vi.fn().mockResolvedValue({ keep, send }),
    };
    const mockWallet = {
      keysetId: "ks1",
      ops: { sendToRequest: vi.fn(() => builder) },
    } as any;
    wallet.spendableProofs = vi.fn().mockReturnValue(walletProofs);
    proofs.removeProofs = vi.fn().mockResolvedValue(undefined);
    proofs.addProofs = vi.fn().mockResolvedValue(undefined);
    return { wallet, proofs, mockWallet, builder, send };
  };

  test("swaps, keeps fresh change and drops the swapped inputs", async () => {
    const { wallet, proofs, mockWallet, builder, send } = setup();
    const pr = new PaymentRequest(undefined, "pr1", 21, "sat");
    const result = await wallet.sendToRequest([], mockWallet, pr);
    expect(wallet.spendableProofs).toHaveBeenCalledWith([], 21);
    expect(mockWallet.ops.sendToRequest).toHaveBeenCalledWith(
      pr,
      expect.any(Array),
      undefined
    );
    expect(builder.asDeterministic).toHaveBeenCalled();
    expect(proofs.removeProofs).toHaveBeenCalledWith([
      expect.objectContaining({ secret: "s1" }),
      expect.objectContaining({ secret: "s2" }),
    ]);
    expect(proofs.addProofs).toHaveBeenCalledWith([
      expect.objectContaining({ secret: "k1" }),
    ]);
    expect(result.sendProofs).toEqual(send);
  });

  test("hands over an exact match, with DLEQ, without a swap", async () => {
    // cashu-ts returns offline matches without their DLEQ
    const { wallet, proofs, mockWallet, builder } = setup([
      { id: "ks1", amount: 16, secret: "s1", C: "c1" },
      { id: "ks1", amount: 4, secret: "s3", C: "c3" },
    ]);
    const pr = new PaymentRequest(undefined, "pr1", 20, "sat");
    const result = await wallet.sendToRequest([], mockWallet, pr);
    expect(builder.run).not.toHaveBeenCalled();
    expect(proofs.removeProofs).toHaveBeenCalledWith(result.sendProofs);
    expect(proofs.addProofs).not.toHaveBeenCalled();
    expect(result.sendProofs.map((p) => p.secret)).toEqual(["s1", "s3"]);
    expect(result.sendProofs.every((p) => p.dleq === dleq)).toBe(true);
  });

  test("leaves a locked request's send outputs to cashu-ts", async () => {
    const { wallet, mockWallet, builder } = setup();
    const pr = new PaymentRequest(
      undefined,
      "pr1",
      undefined,
      "sat",
      undefined,
      undefined,
      false,
      { kind: "P2PK", data: PUBKEY, tags: [] }
    );
    await wallet.sendToRequest([], mockWallet, pr, 21);
    expect(mockWallet.ops.sendToRequest).toHaveBeenCalledWith(
      pr,
      expect.any(Array),
      21
    );
    expect(builder.asDeterministic).not.toHaveBeenCalled();
    expect(builder.offlineExactOnly).not.toHaveBeenCalled();
  });
});
