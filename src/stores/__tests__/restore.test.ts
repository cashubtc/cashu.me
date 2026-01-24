import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useRestoreStore } from "../restore";
import { useProofsStore } from "../proofs";
import { useMintsStore, WalletProof } from "../mints";
import { useWalletStore } from "../wallet";
import { CheckStateEnum } from "@cashu/cashu-ts";

// Mock dependencies
vi.mock("@cashu/cashu-ts", () => {
  return {
    CashuMint: vi.fn().mockImplementation(() => ({
      getKeySets: vi.fn().mockResolvedValue({
        keysets: [{ id: "keyset1", unit: "sat" }],
      }),
    })),
    CashuWallet: vi.fn().mockImplementation(() => ({
      restore: vi.fn(),
      checkProofsStates: vi.fn(),
    })),
    CheckStateEnum: { SPENT: "SPENT", UNSPENT: "UNSPENT" },
  };
});

vi.mock("src/boot/i18n", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
}));

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notify: vi.fn(),
}));

describe("useRestoreStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProof1 = { secret: "s1", amount: 10, C: "C1", id: "keyset1" };
  const mockProof2 = { secret: "s2", amount: 20, C: "C2", id: "keyset1" };

  it("should restore unspent proofs", async () => {
    const store = useRestoreStore();
    const proofsStore = useProofsStore();
    const mintsStore = useMintsStore();
    const walletStore = useWalletStore();

    // Setup state
    store.mnemonicToRestore = "seed phrase";

    // Mocks
    walletStore.mnemonicToSeedSync = vi
      .fn()
      .mockReturnValue(new Uint8Array(32));
    mintsStore.activateMintUrl = vi.fn();
    proofsStore.addProofs = vi.fn();
    proofsStore.proofs = [];

    // Import the mocked class constructors to set return values
    const { CashuWallet } = await import("@cashu/cashu-ts");

    const restoreMock = vi
      .fn()
      .mockResolvedValueOnce({ proofs: [mockProof1, mockProof2] }) // Batch 1
      .mockResolvedValue({ proofs: [] }); // Batch 2, 3 (End of gap)

    const checkStatesMock = vi.fn().mockResolvedValue([
      { state: CheckStateEnum.UNSPENT }, // p1 unspent
      { state: CheckStateEnum.SPENT }, // p2 spent
    ]);

    // @ts-ignore
    CashuWallet.mockImplementation(() => ({
      restore: restoreMock,
      checkProofsStates: checkStatesMock,
    }));

    await store._restoreMint("https://mint.test");

    // Verify
    expect(mintsStore.activateMintUrl).toHaveBeenCalledWith(
      "https://mint.test"
    );
    // Should add p1, but not p2 (spent)
    expect(proofsStore.addProofs).toHaveBeenCalledWith([
      expect.objectContaining({ secret: "s1" }),
    ]);
    expect(proofsStore.addProofs).not.toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ secret: "s2" })])
    );
  });

  it("should handle already existing proofs", async () => {
    const store = useRestoreStore();
    const proofsStore = useProofsStore();
    const walletStore = useWalletStore();
    const mintsStore = useMintsStore();

    store.mnemonicToRestore = "seed phrase";
    walletStore.mnemonicToSeedSync = vi
      .fn()
      .mockReturnValue(new Uint8Array(32));
    mintsStore.activateMintUrl = vi.fn();

    // p1 is already in store
    proofsStore.proofs = [mockProof1 as any];
    proofsStore.addProofs = vi.fn();

    const { CashuWallet } = await import("@cashu/cashu-ts");
    // @ts-ignore
    CashuWallet.mockImplementation(() => ({
      restore: vi
        .fn()
        .mockResolvedValueOnce({ proofs: [mockProof1] })
        .mockResolvedValue({ proofs: [] }),
      checkProofsStates: vi
        .fn()
        .mockResolvedValue([{ state: CheckStateEnum.UNSPENT }]),
    }));

    await store._restoreMint("https://mint.test");

    // Should NOT add p1 again
    expect(proofsStore.addProofs).toHaveBeenCalledWith([]);
  });
});
