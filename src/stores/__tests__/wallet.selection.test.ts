import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useWalletStore } from "../wallet";
import { WalletProof } from "../mints";

// Mock dependencies
// We need to keep the enums/types from the actual module if they are used by the code under test
// But for selection logic, we mostly need the types which are stripped at runtime.
// If wallet.ts uses values from cashu-ts (like CheckStateEnum), we need them.
vi.mock("@cashu/cashu-ts", async () => {
  const actual: any = await vi.importActual("@cashu/cashu-ts");
  return {
    ...actual,
    CashuMint: vi.fn(),
    CashuWallet: vi.fn().mockImplementation(() => ({
      selectProofsToSend: vi.fn(),
    })),
  };
});

// Mock i18n
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

// Mock notify
vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
}));

describe("useWalletStore Selection Logic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("splitAmount", () => {
    it("should split amount into powers of 2", () => {
      const store = useWalletStore();
      expect(store.splitAmount(0)).toEqual([]);
      expect(store.splitAmount(1)).toEqual([1]);
      expect(store.splitAmount(2)).toEqual([2]);
      expect(store.splitAmount(3)).toEqual([1, 2]);
      expect(store.splitAmount(7)).toEqual([1, 2, 4]);
      expect(store.splitAmount(13)).toEqual([1, 4, 8]);
      expect(store.splitAmount(63)).toEqual([1, 2, 4, 8, 16, 32]);
    });
  });

  describe("coinSelect", () => {
    it("should return empty array if insufficient funds", () => {
      const store = useWalletStore();
      const mockWallet = {
        selectProofsToSend: vi.fn(),
      } as any;

      const proofs: WalletProof[] = [
        { id: "1", amount: 5, secret: "s1", C: "C1", reserved: false },
      ];

      const result = store.coinSelect(proofs, mockWallet, 10);
      expect(result).toEqual([]);
      expect(mockWallet.selectProofsToSend).not.toHaveBeenCalled();
    });

    it("should call wallet.selectProofsToSend if funds are sufficient", () => {
      const store = useWalletStore();
      const mockWallet = {
        selectProofsToSend: vi.fn().mockReturnValue({
          send: [{ id: "1", amount: 5, secret: "s1", C: "C1" }],
          keep: [],
        }),
      } as any;

      const proofs: WalletProof[] = [
        { id: "1", amount: 5, secret: "s1", C: "C1", reserved: false },
        { id: "1", amount: 5, secret: "s2", C: "C2", reserved: false },
      ];

      const result = store.coinSelect(proofs, mockWallet, 5);

      expect(mockWallet.selectProofsToSend).toHaveBeenCalledWith(
        proofs,
        5,
        false
      );
      expect(result.length).toBe(1);
      expect(result[0].reserved).toBe(false);
    });
  });

  describe("coinSelectSpendBase64", () => {
    it("should select proofs that sum up to amount", () => {
      const store = useWalletStore();
      const proofs: WalletProof[] = [
        { id: "base64_1", amount: 8, secret: "s1", C: "C1", reserved: false },
        { id: "base64_2", amount: 4, secret: "s2", C: "C2", reserved: false },
        { id: "base64_3", amount: 2, secret: "s3", C: "C3", reserved: false },
        { id: "base64_4", amount: 1, secret: "s4", C: "C4", reserved: false },
      ];

      const result = store.coinSelectSpendBase64(proofs, 10);
      const sum = result.reduce((s, p) => s + p.amount, 0);
      expect(sum).toBeGreaterThanOrEqual(10);
      expect(result.length).toBe(2);
      expect(result.map((p) => p.amount)).toEqual([8, 4]);
    });

    it("should ignore proofs with id starting with '00'", () => {
      const store = useWalletStore();
      const proofs: WalletProof[] = [
        { id: "00hex", amount: 10, secret: "s1", C: "C1", reserved: false },
        { id: "base64", amount: 10, secret: "s2", C: "C2", reserved: false },
      ];

      const result = store.coinSelectSpendBase64(proofs, 5);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("base64");
    });

    it("should return empty if insufficient funds", () => {
      const store = useWalletStore();
      const proofs: WalletProof[] = [
        { id: "base64", amount: 5, secret: "s1", C: "C1", reserved: false },
      ];

      const result = store.coinSelectSpendBase64(proofs, 10);
      expect(result).toEqual([]);
    });
  });
});
