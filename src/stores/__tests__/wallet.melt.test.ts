import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useWalletStore } from "../wallet";
import { useProofsStore } from "../proofs";
import { useUiStore } from "../ui";
import { useTokensStore } from "../tokens";
import { WalletProof } from "../mints";
import { MeltQuoteState } from "@cashu/cashu-ts";

// Mock dependencies
vi.mock("@cashu/cashu-ts", () => {
  return {
    CashuMint: vi.fn(),
    CashuWallet: vi.fn().mockImplementation(() => ({
      selectProofsToSend: vi.fn(),
      send: vi.fn(),
      meltProofs: vi.fn(),
      getFeesForProofs: vi.fn().mockReturnValue(0),
      mint: {
        mintUrl: "https://mint.test",
        checkMeltQuote: vi.fn(),
      },
      unit: "sat",
    })),
    MeltQuoteState: { PAID: "PAID", UNPAID: "UNPAID", PENDING: "PENDING" },
    MintQuoteState: {
      PAID: "PAID",
      UNPAID: "UNPAID",
      PENDING: "PENDING",
      ISSUED: "ISSUED",
    },
    CheckStateEnum: { SPENT: "SPENT", UNSPENT: "UNSPENT" },
    PaymentRequestTransportType: {
      BOLT11: "bolt11",
      NOSTR: "nostr",
      POST: "post",
    },
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
}));

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
  notify: vi.fn(),
}));

describe("useWalletStore Melt Logic", () => {
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

  const mockQuote = {
    quote: "quote123",
    amount: 10,
    fee_reserve: 0,
    state: "UNPAID",
    expiry: 1000,
  };

  it("should melt proofs successfully", async () => {
    const store = useWalletStore();
    const proofsStore = useProofsStore();
    const uiStore = useUiStore();

    // Setup mocks
    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");
    store.keysetCounter = vi.fn().mockReturnValue(0);
    store.increaseKeysetCounter = vi.fn();

    // Mock send to return proofs immediately (no swap)
    // We spy on the store's send method to avoid testing send logic again
    const sendSpy = vi.spyOn(store, "send").mockResolvedValue({
      sendProofs: [mockProof1],
      keepProofs: [],
    });

    const mockWallet = {
      mint: { mintUrl: "https://mint.test" },
      unit: "sat",
      meltProofs: vi.fn().mockResolvedValue({
        quote: { ...mockQuote, state: MeltQuoteState.PAID },
        change: [],
      }),
    } as any;

    proofsStore.setReserved = vi.fn();
    proofsStore.removeProofs = vi.fn();
    proofsStore.addProofs = vi.fn();
    proofsStore.sumProofs = vi.fn().mockReturnValue(0); // change sum
    uiStore.lockMutex = vi.fn();
    uiStore.unlockMutex = vi.fn();

    // Execute
    await store.melt([mockProof1], mockQuote as any, mockWallet);

    // Verify
    expect(sendSpy).toHaveBeenCalled();
    expect(proofsStore.setReserved).toHaveBeenCalledWith(
      [mockProof1],
      true,
      "quote123"
    );
    expect(mockWallet.meltProofs).toHaveBeenCalled();
    expect(proofsStore.removeProofs).toHaveBeenCalledWith([mockProof1]);
    expect(store.invoiceHistory.length).toBe(1);
    expect(store.invoiceHistory[0].status).toBe("paid");
  });

  it("should rollback on failure if quote is UNPAID", async () => {
    const store = useWalletStore();
    const proofsStore = useProofsStore();

    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");
    store.keysetCounter = vi.fn().mockReturnValue(0);
    store.increaseKeysetCounter = vi.fn();

    vi.spyOn(store, "send").mockResolvedValue({
      sendProofs: [mockProof1],
      keepProofs: [],
    });

    const mockWallet = {
      mint: {
        mintUrl: "https://mint.test",
        checkMeltQuote: vi
          .fn()
          .mockResolvedValue({ ...mockQuote, state: MeltQuoteState.UNPAID }),
      },
      unit: "sat",
      meltProofs: vi.fn().mockRejectedValue(new Error("Network Error")),
    } as any;

    proofsStore.setReserved = vi.fn();

    // Execute and expect error
    await expect(
      store.melt([mockProof1], mockQuote as any, mockWallet)
    ).rejects.toThrow("Network Error");

    // Verify rollback
    // It should have unreserved the proofs
    expect(proofsStore.setReserved).toHaveBeenLastCalledWith(
      [mockProof1],
      false
    );
    // It should have removed the invoice from history (actually it removes by quote id)
    // Check if removeOutgoingInvoiceFromHistory was called?
    // Let's check keyset counter rollback
    expect(store.increaseKeysetCounter).toHaveBeenLastCalledWith(
      "00abcdef12345678",
      -1
    ); // -1 because sendProofs.length is 1
  });

  it("should NOT rollback if quote is PENDING", async () => {
    const store = useWalletStore();
    const proofsStore = useProofsStore();

    store.getKeyset = vi.fn().mockReturnValue("00abcdef12345678");
    store.keysetCounter = vi.fn().mockReturnValue(0);
    store.increaseKeysetCounter = vi.fn();

    vi.spyOn(store, "send").mockResolvedValue({
      sendProofs: [mockProof1],
      keepProofs: [],
    });

    const mockWallet = {
      mint: {
        mintUrl: "https://mint.test",
        checkMeltQuote: vi
          .fn()
          .mockResolvedValue({ ...mockQuote, state: MeltQuoteState.PENDING }),
      },
      unit: "sat",
      meltProofs: vi.fn().mockRejectedValue(new Error("Timeout")),
    } as any;

    proofsStore.setReserved = vi.fn();

    await expect(
      store.melt([mockProof1], mockQuote as any, mockWallet)
    ).rejects.toThrow("Timeout");

    // Verify NO rollback of reserved status (except maybe the initial reservation)
    // The last call to setReserved should be true (from the start of melt) OR it should NOT be called with false
    // actually mock calls are cumulative.
    // It calls setReserved(true) at start.
    // If it rolls back, it calls setReserved(false).
    // So we check if it was called with false.
    expect(proofsStore.setReserved).not.toHaveBeenCalledWith(
      expect.anything(),
      false
    );
  });
});
