import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWalletStore } from "../../../src/stores/wallet";
import { MintQuoteState, MeltQuoteState } from "@cashu/cashu-ts";

// mock dependent stores
const addProofs = vi.fn();
const serializeProofs = vi.fn(() => "token-ser");
const setReserved = vi.fn();
const removeProofs = vi.fn();
const sumProofs = vi.fn(() => 0);

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({
    addProofs,
    serializeProofs,
    setReserved,
    removeProofs,
    sumProofs,
  }),
}));

const addPaidToken = vi.fn();
vi.mock("../../../src/stores/tokens", () => ({
  useTokensStore: () => ({ addPaidToken }),
}));

vi.mock("../../../src/stores/invoicesWorker", () => ({
  useInvoicesWorkerStore: () => ({ removeInvoiceFromChecker: vi.fn() }),
}));

vi.mock("../../../src/js/ui-utils", () => ({
  notifyApiError: vi.fn(),
  notify: vi.fn(),
  notifySuccess: vi.fn(),
}));

vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({
    mints: [{ url: "m", keysets: [{ id: "kid", active: true }], info: {}, keys: [] }],
    mintUnitProofs: vi.fn(() => []),
    activeProofs: [],
    activeMintUrl: "m",
    activeUnit: "sat",
    assertMintError: vi.fn(),
  }),
}));

vi.mock("../../../src/stores/ui", () => ({
  useUiStore: () => ({
    lockMutex: vi.fn(),
    unlockMutex: vi.fn(),
    triggerActivityOrb: vi.fn(),
    vibrate: vi.fn(),
    formatCurrency: (a: number) => String(a),
  }),
}));

beforeEach(() => {
  addProofs.mockReset();
  serializeProofs.mockClear();
  removeProofs.mockReset();
  setReserved.mockReset();
  addPaidToken.mockReset();
});

describe("wallet mint and melt", () => {
  it("mints proofs when invoice is paid", async () => {
    const wallet = useWalletStore();
    const mintWallet = {
      checkMintQuote: vi.fn(async () => ({ state: MintQuoteState.PAID })),
      mintProofs: vi.fn(async () => [{ id: "p1" }]),
    } as any;
    wallet.mintWallet = vi.fn(() => mintWallet as any);
    wallet.getKeyset = vi.fn(() => "kid");
    wallet.keysetCounter = vi.fn(() => 0);
    wallet.increaseKeysetCounter = vi.fn();
    wallet.setInvoicePaid = vi.fn();

    const invoice = {
      amount: 1,
      bolt11: "b",
      quote: "q",
      memo: "",
      date: "d",
      status: "pending",
      mint: "m",
      unit: "sat",
    } as any;

    const proofs = await wallet.mint(invoice);
    expect(mintWallet.checkMintQuote).toHaveBeenCalledWith("q");
    expect(addProofs).toHaveBeenCalled();
    expect(addPaidToken).toHaveBeenCalled();
    expect(proofs[0].id).toBe("p1");
  });

  it("throws when invoice not paid", async () => {
    const wallet = useWalletStore();
    const mintWallet = {
      checkMintQuote: vi.fn(async () => ({ state: MintQuoteState.UNPAID })),
      mintProofs: vi.fn(),
    } as any;
    wallet.mintWallet = vi.fn(() => mintWallet as any);
    wallet.getKeyset = vi.fn(() => "kid");
    wallet.keysetCounter = vi.fn(() => 0);

    const invoice = {
      amount: 1,
      bolt11: "b",
      quote: "q",
      memo: "",
      date: "d",
      status: "pending",
      mint: "m",
      unit: "sat",
    } as any;

    await expect(wallet.mint(invoice)).rejects.toThrow();
    expect(addProofs).not.toHaveBeenCalled();
  });

  it("pays invoice via melt", async () => {
    const wallet = useWalletStore();
    const mintWallet = {
      meltProofs: vi.fn(async () => ({ quote: { state: MeltQuoteState.PAID }, change: [] })),
      mint: { mintUrl: "m" },
      unit: "sat",
    } as any;
    wallet.getKeyset = vi.fn(() => "kid");
    wallet.keysetCounter = vi.fn(() => 0);
    wallet.increaseKeysetCounter = vi.fn();
    wallet.addOutgoingPendingInvoiceToHistory = vi.fn();
    wallet.updateOutgoingInvoiceInHistory = vi.fn();
    wallet.removeOutgoingInvoiceFromHistory = vi.fn();
    wallet.send = vi.fn(async () => ({ keepProofs: [], sendProofs: [{ id: "p1", amount: 1 }] }));

    const quote = { quote: "q", amount: 1, fee_reserve: 0 } as any;
    await wallet.melt([{ id: "p1", amount: 1 } as any], quote, mintWallet);

    expect(mintWallet.meltProofs).toHaveBeenCalled();
    expect(removeProofs).toHaveBeenCalled();
    expect(addPaidToken).toHaveBeenCalled();
  });
});

