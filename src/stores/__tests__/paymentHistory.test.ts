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
    if (typeof indexedDB !== "undefined") {
      await cashuDb.paymentHistory.clear();
      await cashuDb.mintQuotes.clear();
      await cashuDb.meltQuotes.clear();
    }
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

    const payments =
      typeof indexedDB !== "undefined"
        ? await cashuDb.paymentHistory.toArray()
        : store.paymentHistory;
    const mintQuotes =
      typeof indexedDB !== "undefined"
        ? await cashuDb.mintQuotes.toArray()
        : store.mintQuotes;
    const meltQuotes =
      typeof indexedDB !== "undefined"
        ? await cashuDb.meltQuotes.toArray()
        : store.meltQuotes;

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
});
