import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { cashuDb } from "src/stores/dexie";
import { usePaymentHistoryStore } from "src/stores/paymentHistory";
import { useWalletStore } from "src/stores/wallet";
import { PaymentMethod } from "src/stores/walletTypes";

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

describe("payment history store", () => {
  beforeEach(async () => {
    localStorage.clear();
    await cashuDb.paymentHistory.clear();
    await cashuDb.mintQuotes.clear();
    await cashuDb.meltQuotes.clear();
  });

  it("migrates legacy invoiceHistory into payment and quote tables", async () => {
    const legacyHistory = [
      {
        quote: "bolt11-mint-q",
        amount: 21,
        request: "lnbc21",
        memo: "",
        date: "2026-03-10T12:00:00.000Z",
        status: "pending",
        mint: "https://mint.example",
        unit: "sat",
        type: PaymentMethod.Bolt11,
        mintQuote: {
          quote: "bolt11-mint-q",
          request: "lnbc21",
          unit: "sat",
          amount: 21,
          state: "UNPAID",
          expiry: null,
        },
      },
      {
        quote: "bolt12-offer-q",
        amount: 100,
        request: "lno1offer",
        memo: "",
        date: "2026-03-10T12:01:00.000Z",
        paidDate: "2026-03-10T12:01:00.000Z",
        status: "paid",
        mint: "https://mint.example",
        unit: "sat",
        type: PaymentMethod.Bolt12,
        mintQuote: {
          quote: "bolt12-offer-q",
          request: "lno1offer",
          unit: "sat",
          amount: null,
          expiry: null,
          pubkey: "pubkey",
          amount_paid: 150,
          amount_issued: 150,
        },
      },
      {
        quote: "subpayment:abc",
        parentQuote: "bolt12-offer-q",
        amount: 50,
        request: "lno1offer",
        memo: "",
        date: "2026-03-10T12:02:00.000Z",
        paidDate: "2026-03-10T12:02:00.000Z",
        status: "paid",
        mint: "https://mint.example",
        unit: "sat",
        type: PaymentMethod.Bolt12Subpayment,
        mintQuote: {
          quote: "bolt12-offer-q",
          request: "lno1offer",
          unit: "sat",
          amount: null,
          expiry: null,
          pubkey: "pubkey",
          amount_paid: 150,
          amount_issued: 150,
        },
      },
      {
        quote: "onchain-melt-q",
        amount: -112,
        request: "bc1qaddress",
        memo: "Outgoing invoice",
        date: "2026-03-10T12:03:00.000Z",
        status: "pending",
        mint: "https://mint.example",
        unit: "sat",
        type: PaymentMethod.Onchain,
        meltQuote: {
          quote: "onchain-melt-q",
          amount: 100,
          unit: "sat",
          state: "PENDING",
          expiry: 0,
          request: "bc1qaddress",
          fee_options: [{ fee_index: 1, fee_reserve: 12, estimated_blocks: 6 }],
          selected_fee_index: 1,
          outpoint: null,
        },
      },
    ];

    localStorage.setItem("cashu.invoiceHistory", JSON.stringify(legacyHistory));

    const store = usePaymentHistoryStore();
    await store.migrateLegacyInvoiceHistoryFromLocalStorage();

    expect(localStorage.getItem("cashu.invoiceHistory")).toBeNull();

    const payments = await cashuDb.paymentHistory.toArray();
    const mintQuotes = await cashuDb.mintQuotes.toArray();
    const meltQuotes = await cashuDb.meltQuotes.toArray();

    expect(payments).toHaveLength(4);
    expect(mintQuotes).toHaveLength(2);
    expect(meltQuotes).toHaveLength(1);
    expect(payments.every((row) => !row.mintQuote && !row.meltQuote)).toBe(
      true
    );

    const subpayment = payments.find((row) => row.id === "subpayment:abc");
    expect(subpayment).toMatchObject({
      quote: "bolt12-offer-q",
      parentQuote: "bolt12-offer-q",
      method: PaymentMethod.Bolt12,
      paymentType: PaymentMethod.Bolt12Subpayment,
    });

    expect(mintQuotes.find((row) => row.quote === "bolt12-offer-q")).toEqual(
      expect.objectContaining({
        method: PaymentMethod.Bolt12,
        amount: null,
        amount_paid: 150,
        amount_issued: 150,
      })
    );
    expect(meltQuotes[0]).toEqual(
      expect.objectContaining({
        method: PaymentMethod.Onchain,
        fee_options: [{ fee_index: 1, fee_reserve: 12, estimated_blocks: 6 }],
      })
    );

    expect(
      store.invoiceHistory.find((row) => row.id === "subpayment:abc")
    ).toEqual(
      expect.objectContaining({
        quote: "bolt12-offer-q",
        type: PaymentMethod.Bolt12Subpayment,
        mintQuote: expect.objectContaining({ quote: "bolt12-offer-q" }),
      })
    );

    await store.migrateLegacyInvoiceHistoryFromLocalStorage();

    expect(store.paymentHistory).toHaveLength(4);
    expect(store.mintQuotes).toHaveLength(2);
    expect(store.meltQuotes).toHaveLength(1);
  });

  it("keeps the wallet invoiceHistory mirror synced with payment history changes", async () => {
    const walletStore = useWalletStore();
    const paymentHistoryStore = usePaymentHistoryStore();

    await walletStore.initPaymentHistory();
    await paymentHistoryStore.addPayment({
      quote: "mirror-q",
      amount: 21,
      request: "lnbc21",
      memo: "",
      date: "2026-03-10T12:00:00.000Z",
      status: "pending",
      mint: "https://mint.example",
      unit: "sat",
      type: PaymentMethod.Bolt11,
    });
    await nextTick();

    expect(walletStore.invoiceHistory).toHaveLength(1);
    expect(walletStore.invoiceHistory[0]).toEqual(
      expect.objectContaining({
        quote: "mirror-q",
        status: "pending",
      })
    );

    await paymentHistoryStore.setPaymentPaid("mirror-q", { amount: 21 });
    await nextTick();

    expect(walletStore.invoiceHistory[0]).toEqual(
      expect.objectContaining({
        quote: "mirror-q",
        status: "paid",
      })
    );
  });

  it("persists the requested amount of an on-chain deposit address", async () => {
    const paymentHistoryStore = usePaymentHistoryStore();
    await paymentHistoryStore.addPayment({
      quote: "onchain-q",
      amount: 0,
      request: "bc1qaddress",
      memo: "",
      date: "2026-03-10T12:00:00.000Z",
      status: "pending",
      mint: "https://mint.example",
      unit: "sat",
      type: PaymentMethod.Onchain,
      direction: "mint",
      requestedAmount: 25000,
    });

    expect(await cashuDb.paymentHistory.toArray()).toEqual([
      expect.objectContaining({ quote: "onchain-q", requestedAmount: 25000 }),
    ]);
    await paymentHistoryStore.refreshFromDexie();
    expect(paymentHistoryStore.invoiceHistory[0]).toEqual(
      expect.objectContaining({ quote: "onchain-q", requestedAmount: 25000 })
    );
  });

  it("creates a mint invoice after viewing a reactive outgoing payment", async () => {
    const paymentHistoryStore = usePaymentHistoryStore();
    await paymentHistoryStore.addPayment({
      quote: "old-melt-q",
      amount: -12,
      request: "lnbc-old",
      memo: "Outgoing invoice",
      date: "2026-03-10T12:00:00.000Z",
      status: "pending",
      mint: "https://mint.example",
      unit: "sat",
      type: PaymentMethod.Bolt11,
      meltQuote: {
        quote: "old-melt-q",
        amount: 10,
        fee_reserve: 2,
        unit: "sat",
        state: "UNPAID",
        expiry: 0,
        change: [],
      },
      meltChangeOutputData: [],
    });

    const walletStore = useWalletStore();
    walletStore.invoiceData = paymentHistoryStore.invoiceHistory[0];
    expect(walletStore.invoiceData.meltQuote).toBeDefined();
    expect(() =>
      structuredClone(walletStore.invoiceData.meltChangeOutputData)
    ).toThrow();

    const mintWallet = {
      loadMint: vi.fn(),
      getMintInfo: () => ({
        isSupported: () => ({ supported: false }),
      }),
      createMintQuoteBolt11: vi.fn(async () => ({
        quote: "new-mint-q",
        request: "lnbc-new",
        unit: "sat",
        amount: 21,
        state: "UNPAID",
        expiry: null,
      })),
      mint: { mintUrl: "https://mint.example" },
      unit: "sat",
    };

    await expect(
      walletStore.requestMintBolt11(21, mintWallet as any)
    ).resolves.toEqual(expect.objectContaining({ quote: "new-mint-q" }));

    const persistedPayment = await cashuDb.paymentHistory.get(
      "mint:new-mint-q"
    );
    expect(persistedPayment).toEqual(
      expect.objectContaining({
        direction: "mint",
        method: PaymentMethod.Bolt11,
        amount: 21,
      })
    );
    expect(walletStore.invoiceData).not.toHaveProperty("meltQuote");
    expect(walletStore.invoiceData).not.toHaveProperty("meltChangeOutputData");
  });
});
