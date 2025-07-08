import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWalletStore } from "../../../src/stores/wallet";
import { useProofsStore } from "../../../src/stores/proofs";
import { useBucketsStore } from "../../../src/stores/buckets";
import { useLockedTokensStore } from "../../../src/stores/lockedTokens";
import { useSignerStore } from "../../../src/stores/signer";
import { hash } from "../../../src/js/token";

vi.mock("../../../src/utils/ecash", () => ({
  ensureCompressed: (pk: string) => pk,
}));
vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({
    activeInfo: { nut_supports: [10, 11] },
    activeMintUrl: "m",
    activeUnit: "sat",
  }),
}));
vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({
    removeProofs: vi.fn(),
    addProofs: vi.fn(),
    serializeProofs: vi.fn(() => "TOKEN"),
  }),
}));
vi.mock("../../../src/stores/buckets", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBucketsStore: () => ({ ensureCreatorBucket: vi.fn(() => "creator") }),
  };
});
vi.mock("../../../src/stores/lockedTokens", () => ({
  useLockedTokensStore: () => ({ addLockedToken: vi.fn(() => ({})) }),
}));
vi.mock("../../../src/stores/signer", () => ({
  useSignerStore: () => ({ reset: vi.fn() }),
}));
vi.mock("quasar", () => ({ Notify: { create: vi.fn() } }));

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("sendToLock with hash lock", () => {
  it("calls splitWithSecret once", async () => {
    const walletStore = useWalletStore();
    const proofsStore = useProofsStore();
    const buckets = useBucketsStore();
    const locked = useLockedTokensStore();
    const signer = useSignerStore();

    vi.spyOn(proofsStore, "removeProofs").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(buckets, "ensureCreatorBucket").mockReturnValue("creator");
    vi.spyOn(locked, "addLockedToken").mockReturnValue({} as any);
    vi.spyOn(signer, "reset").mockReturnValue();

    walletStore.spendableProofs = vi.fn(() => [{ secret: "s", amount: 1, id: "a", C: "c" } as any]);
    walletStore.coinSelect = vi.fn(() => [{ secret: "s", amount: 1, id: "a", C: "c" } as any]);
    walletStore.getKeyset = vi.fn(() => "kid");
    walletStore.signP2PKIfNeeded = vi.fn((p) => p);

    const wallet = {
      mint: { mintUrl: "m" },
      unit: "sat",
      splitWithSecret: vi.fn(async () => ({ keep: [], send: [] })),
    } as any;

    const randomStub = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("11111111-1111-1111-1111-111111111111");

    const amount = 1;
    const locktime = 99;
    const receiver = "pk";
    const lockSecret = "hs";
    const hashSecret = hash(lockSecret, receiver);
    const secretStr = JSON.stringify([
      "P2PK",
      {
        data: receiver,
        nonce: "1111111111111111",
        tags: [
          ["locktime", locktime.toString()],
          ["hashlock", hashSecret],
        ],
      },
    ] as const);
    expect(hash(lockSecret, receiver)).toBe(hashSecret);

    await walletStore.sendToLock(
      [{ secret: "s", amount: 1, id: "a", C: "c" } as any],
      wallet,
      amount,
      receiver,
      "b",
      locktime,
      undefined,
      hashSecret
    );

    expect(wallet.splitWithSecret).toHaveBeenCalledTimes(1);
    expect(wallet.splitWithSecret).toHaveBeenCalledWith(
      amount,
      [{ secret: "s", amount: 1, id: "a", C: "c" }],
      secretStr,
      { proofsWeHave: [{ secret: "s", amount: 1, id: "a", C: "c" }] }
    );

    randomStub.mockRestore();
  });
});
