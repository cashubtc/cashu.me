import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSendTokensStore } from "../../../src/stores/sendTokensStore";
import { useWalletStore } from "../../../src/stores/wallet";
import { useProofsStore } from "../../../src/stores/proofs";
import { useP2PKStore } from "../../../src/stores/p2pk";

beforeEach(() => {
  localStorage.clear();
});

describe("Timelock", () => {
  it("stores locktime in sendData", () => {
    const store = useSendTokensStore();
    store.sendData.locktime = 123;
    expect(store.sendData.locktime).toBe(123);
  });

  it("forwards locktime in sendToLock", async () => {
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
      send: vi.fn(async (_a, _p, opts) => ({ keep: [], send: [] })),
    } as any;
    vi.spyOn(walletStore, "wallet", "get").mockReturnValue(wallet);

    await walletStore.sendToLock(1, "pk", 99);
    expect(wallet.send).toHaveBeenCalledWith(
      1,
      [{ secret: "s", amount: 1, id: "a", C: "c" }],
      { keysetId: "kid", p2pk: { pubkey: "pk", locktime: 99 } },
    );
  });

  it("extracts locktime from secret", () => {
    const p2pk = useP2PKStore();
    const locktime = 1700000000;
    const secret = JSON.stringify([
      "P2PK",
      { data: "02aa", tags: [["locktime", String(locktime)]] },
    ]);
    const info = p2pk.getSecretP2PKInfo(secret);
    expect(info.locktime).toBe(locktime);
  });
});
