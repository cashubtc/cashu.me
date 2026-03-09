import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useWalletStore } from "../wallet";
import { useProofsStore } from "../proofs";
import { useUiStore } from "../ui";
import { WalletProof } from "../mints";

// Mock dependencies
vi.mock("@cashu/cashu-ts", async () => {
  const actual: any = await vi.importActual("@cashu/cashu-ts");
  return {
    ...actual,
    CashuMint: vi.fn(),
    CashuWallet: vi.fn().mockImplementation(() => ({
      selectProofsToSend: vi.fn(),
      send: vi.fn(),
      getFeesForProofs: vi.fn().mockReturnValue(0),
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
    })),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
}));

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
}));

describe("useWalletStore Send Logic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProof1: WalletProof = {
    id: "00abcdef12345678",
    amount: 10,
    secret: "secret1",
    C: "C1",
    reserved: false,
  };

  const mockProof2: WalletProof = {
    id: "00abcdef12345678",
    amount: 20,
    secret: "secret2",
    C: "C2",
    reserved: false,
  };

  it("should send proofs successfully without swap", async () => {
    const store = useWalletStore();
    const proofsStore = useProofsStore();
    const uiStore = useUiStore();

    // Mock getKeyset
    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");

    // Mock wallet interactions
    const mockWallet = {
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
      selectProofsToSend: vi.fn().mockReturnValue({
        send: [mockProof1], // Select 10
        keep: [],
      }),
      getFeesForProofs: vi.fn().mockReturnValue(0),
      send: vi.fn(), // Should not be called for internal send logic?
      // Wait, store.send calls wallet.send ONLY if swap is needed?
      // Let's re-read the code.
      // wallet.ts line 459: if (totalAmount != targetAmount) { ... swap ... }
      // else { keepProofs = []; sendProofs = proofsToSend; }
    } as any;

    // Spy on stores
    uiStore.lockMutex = vi.fn();
    uiStore.unlockMutex = vi.fn();
    proofsStore.setReserved = vi.fn();
    proofsStore.removeProofs = vi.fn();

    // Call send with amount 10
    const result = await store.send([mockProof1, mockProof2], mockWallet, 10);

    expect(uiStore.lockMutex).toHaveBeenCalled();
    // Verify selection was called
    expect(mockWallet.selectProofsToSend).toHaveBeenCalledWith(
      expect.any(Array),
      10,
      false
    );
    // Verify results
    expect(result.sendProofs.length).toBe(1);
    expect(result.sendProofs[0]).toEqual(
      expect.objectContaining({ amount: 10 })
    );
    expect(result.keepProofs.length).toBe(0);

    // Verify side effects
    expect(proofsStore.setReserved).toHaveBeenCalledWith(
      result.sendProofs,
      true
    );
    expect(uiStore.unlockMutex).toHaveBeenCalled();
  });

  it("should perform swap if selected proofs > target amount", async () => {
    const store = useWalletStore();
    const proofsStore = useProofsStore();

    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");
    store.mintWallet = vi.fn().mockResolvedValue({
      send: vi.fn().mockResolvedValue({
        keep: [{ amount: 40, secret: "keep1" }],
        send: [{ amount: 10, secret: "send1" }],
      }),
      selectProofsToSend: vi.fn().mockReturnValue({
        send: [mockProof1],
        keep: [],
      }), // used in second coinSelect
      getFeesForProofs: vi.fn().mockReturnValue(0),
    });
    store.keysetCounter = vi.fn().mockReturnValue(0);
    store.increaseKeysetCounter = vi.fn();

    const mockWallet = {
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
      selectProofsToSend: vi.fn().mockReturnValue({
        send: [mockProof2], // Select 20 for target 10 (overshoot)
        keep: [],
      }),
      getFeesForProofs: vi.fn().mockReturnValue(0),
    } as any;

    proofsStore.addProofs = vi.fn();
    proofsStore.removeProofs = vi.fn();
    proofsStore.setReserved = vi.fn();

    await store.send([mockProof2], mockWallet, 10);

    // Verify swap wallet was created
    expect(store.mintWallet).toHaveBeenCalledWith(
      "https://mint.test",
      "sat",
      true
    );

    // Verify proofs were added/removed correctly
    // keepProofs and sendProofs from swap should be added
    expect(proofsStore.addProofs).toHaveBeenCalledTimes(2);

    // Verify return
    expect(proofsStore.setReserved).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ amount: 10 })]),
      true
    );
  });

  it("should handle errors and unlock mutex", async () => {
    const store = useWalletStore();
    const uiStore = useUiStore();
    const proofsStore = useProofsStore();

    store.getKeyset = vi.fn().mockReturnValue("key1");

    const mockWallet = {
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
      selectProofsToSend: vi.fn().mockImplementation(() => {
        throw new Error("Selection failed");
      }),
    } as any;

    uiStore.lockMutex = vi.fn();
    uiStore.unlockMutex = vi.fn();
    proofsStore.setReserved = vi.fn();

    await expect(store.send([mockProof1], mockWallet, 10)).rejects.toThrow(
      "Selection failed"
    );

    expect(uiStore.lockMutex).toHaveBeenCalled();
    expect(uiStore.unlockMutex).toHaveBeenCalled();
    // Should unreserve proofs if they were selected (but here selection failed)
    // If selection failed, proofsToSend is empty, so setReserved might be called with empty or not called?
    // In catch block: await proofsStore.setReserved(proofsToSend, false);
    expect(proofsStore.setReserved).toHaveBeenCalledWith([], false);
  });
});
