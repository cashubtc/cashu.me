import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useWalletStore } from "../wallet";
import { useProofsStore } from "../proofs";
import { useUiStore } from "../ui";
import { useTokensStore } from "../tokens";
import { useReceiveTokensStore } from "../receiveTokensStore";
import { useMintsStore, WalletProof } from "../mints";
import * as tokenUtils from "src/js/token";

// Mock dependencies
vi.mock("@cashu/cashu-ts", () => {
  return {
    CashuMint: vi.fn(),
    CashuWallet: vi.fn().mockImplementation(() => ({
      receive: vi.fn(),
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
    })),
    MeltQuoteState: { PAID: "PAID", UNPAID: "UNPAID", PENDING: "PENDING" },
    MintQuoteState: { PAID: "PAID", UNPAID: "UNPAID", PENDING: "PENDING" },
    CheckStateEnum: { SPENT: "SPENT", UNSPENT: "UNSPENT" },
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

vi.mock("@capacitor/haptics", () => ({
  Haptics: {
    vibrate: vi.fn(),
    impact: vi.fn(),
  },
  ImpactStyle: {},
}));

// vi.mock("src/js/token", () => ({
//   default: {
//     decode: vi.fn(),
//     getProofs: vi.fn(),
//     getMint: vi.fn(),
//     getUnit: vi.fn(),
//   },
// }));

describe("useWalletStore Receive Logic (Redeem)", () => {
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

  it("should redeem tokens successfully", async () => {
    const store = useWalletStore();
    const proofsStore = useProofsStore();
    const tokensStore = useTokensStore();
    const receiveStore = useReceiveTokensStore();
    const mintsStore = useMintsStore();
    const uiStore = useUiStore();

    // Setup state
    receiveStore.receiveData.tokensBase64 = "cashuA...";

    // Setup mints
    mintsStore.mints = [
      { url: "https://mint.test", keysets: [], keys: [] } as any,
    ];

    // Mock token utils
    const tokenMock = tokenUtils.default;
    tokenMock.decode = vi.fn().mockReturnValue({ token: [{ proofs: [] }] });
    tokenMock.getProofs = vi.fn().mockReturnValue([mockProof1]);
    tokenMock.getMint = vi.fn().mockReturnValue("https://mint.test");
    tokenMock.getUnit = vi.fn().mockReturnValue("sat");

    // Mock wallet methods
    store.mintWallet = vi.fn().mockResolvedValue({
      receive: vi.fn().mockResolvedValue([mockProof1]),
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
    });
    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");
    store.keysetCounter = vi.fn().mockReturnValue(0);
    store.increaseKeysetCounter = vi.fn();

    // Spies
    proofsStore.addProofs = vi.fn();
    tokensStore.addPaidToken = vi.fn();
    uiStore.lockMutex = vi.fn();
    uiStore.unlockMutex = vi.fn();

    // Execute
    await store.redeem();

    // Verify
    expect(store.mintWallet).toHaveBeenCalledWith(
      "https://mint.test",
      "sat",
      true
    );
    expect(proofsStore.addProofs).toHaveBeenCalledWith([mockProof1]);
    expect(store.increaseKeysetCounter).toHaveBeenCalledWith(
      "00abcdef12345678",
      1
    );
    expect(tokensStore.addPaidToken).toHaveBeenCalled();
    expect(uiStore.unlockMutex).toHaveBeenCalled();
  });

  it("should throw if no tokens provided", async () => {
    const store = useWalletStore();
    const receiveStore = useReceiveTokensStore();

    receiveStore.receiveData.tokensBase64 = "";

    await expect(store.redeem()).rejects.toThrow("no tokens provided");
  });

  it("should handle receive error", async () => {
    const store = useWalletStore();
    const receiveStore = useReceiveTokensStore();
    const mintsStore = useMintsStore();

    receiveStore.receiveData.tokensBase64 = "cashuA...";
    mintsStore.mints = [
      { url: "https://mint.test", keysets: [], keys: [] } as any,
    ];

    const tokenMock = tokenUtils.default;
    tokenMock.decode = vi.fn().mockReturnValue({ token: [{ proofs: [] }] });
    tokenMock.getProofs = vi.fn().mockReturnValue([mockProof1]);
    tokenMock.getMint = vi.fn().mockReturnValue("https://mint.test");
    tokenMock.getUnit = vi.fn().mockReturnValue("sat");

    store.mintWallet = vi.fn().mockResolvedValue({
      receive: vi.fn().mockRejectedValue(new Error("Receive failed")),
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
    });
    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");

    await expect(store.redeem()).rejects.toThrow("Error receiving tokens");
  });
});
