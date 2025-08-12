import { describe, it, expect, vi } from "vitest";
import { useWalletStore } from "../src/stores/wallet";
import { useP2PKStore } from "../src/stores/p2pk";

vi.mock("../src/stores/p2pk", () => ({
  useP2PKStore: () => ({ firstKey: { publicKey: "02aa" } }),
}));

vi.mock("../src/stores/mints", () => ({
  useMintsStore: () => ({
    activeUnit: "sat",
    activeMintUrl: "mint",
    findSpendableMint: () => ({ url: "mint", unit: "sat", keysets: [] }),
  }),
}));

vi.mock("../src/stores/proofs", () => ({
  useProofsStore: () => ({
    serializeProofs: vi.fn((p: any) => "token"),
    removeProofs: vi.fn(),
  }),
}));

describe("sendToLock locktime tag", () => {
  it("adds only locktime tag", async () => {
    const walletStore = useWalletStore();
    const wallet: any = {
      send: vi.fn(async (_a: number, _p: any, opts: any) => ({
        keep: [],
        send: [
          {
            id: "a",
            amount: 1,
            C: "c",
            secret: JSON.stringify([
              "P2PK",
              {
                data: opts.p2pk.pubkey,
                tags: [["locktime", String(opts.p2pk.locktime)]],
              },
            ]),
          },
        ],
      })),
    };
    vi.spyOnProperty(walletStore, "wallet", "get").mockReturnValue(wallet);
    const { locked } = await walletStore.sendToLock(1, "02aa", 123);
    const decoded = JSON.parse(
      Buffer.from(locked.tokenString.slice(6), "base64").toString()
    );
    const secretObj = JSON.parse(decoded.token[0].proofs[0].secret);
    expect(secretObj[1].tags).toEqual([["locktime", "123"]]);
  });
});
