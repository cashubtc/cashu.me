import { mount, flushPromises } from "@vue/test-utils";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { PaymentMethod } from "src/stores/walletTypes";

vi.mock("src/stores/mints", () => ({
  useMintsStore: () => ({ activeMintUrl: "", activeUnit: "sat", mints: [] }),
}));

const { fetchAddressTxMetadata } = vi.hoisted(() => ({
  fetchAddressTxMetadata: vi.fn(),
}));
vi.mock("src/js/onchain", async (importOriginal) => ({
  ...(await importOriginal<typeof import("src/js/onchain")>()),
  fetchAddressTxMetadata,
}));

let MintQuoteInformation: any;

// Echoes the key and its params, so the tests read which string a state picked.
const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key} ${JSON.stringify(params)}` : key;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  MintQuoteInformation = (await import("../MintQuoteInformation.vue")).default;
});

describe("MintQuoteInformation", () => {
  it("keeps linking the address to its explorer page once a transaction is known", () => {
    const addressExplorerUrl = MintQuoteInformation.computed.addressExplorerUrl;
    const context: any = {
      isOnchain: true,
      invoice: { request: "bc1qexampleaddress" },
      onchainMetadata: null,
    };

    expect(addressExplorerUrl.call(context)).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );

    context.onchainMetadata = {
      url: "https://mempool.space/tx/transaction-id",
    };

    expect(addressExplorerUrl.call(context)).toBe(
      "https://mempool.space/address/bc1qexampleaddress"
    );
  });

  it("refreshes on-chain metadata when an incoming payment becomes paid", () => {
    const loadOnchainMetadata = vi.fn();

    MintQuoteInformation.watch["invoice.status"].call(
      { loadOnchainMetadata },
      "paid"
    );
    MintQuoteInformation.watch["invoice.status"].call(
      { loadOnchainMetadata },
      "pending"
    );

    expect(loadOnchainMetadata).toHaveBeenCalledTimes(1);
  });

  it("does not create an explorer URL for non-on-chain payments", () => {
    const addressExplorerUrl = MintQuoteInformation.computed.addressExplorerUrl;

    expect(
      addressExplorerUrl.call({
        isOnchain: false,
        method: PaymentMethod.Bolt11,
        invoice: { request: "lnbc1example" },
        onchainMetadata: null,
      })
    ).toBeNull();
  });

  describe("one on-chain status (owner 2026-10-29, item 10)", () => {
    const stateDisplay = (status: string, onchainMetadata: unknown) =>
      MintQuoteInformation.computed.stateDisplay.call({
        invoice: { status },
        mintQuote: null,
        isOnchain: true,
        onchainMetadata,
        $t: t,
        $te: () => true,
      });

    it("waits while no deposit is known", () => {
      expect(stateDisplay("pending", null)).toBe(
        "QuoteInformation.states.waiting"
      );
    });

    it("counts confirmations once the explorer sees the deposit", () => {
      expect(
        stateDisplay("pending", {
          confirmed: false,
          confirmations: 1,
          confirmationThreshold: 3,
        })
      ).toBe('QuoteInformation.states.confirming {"count":1,"threshold":3}');
    });

    it("says the ecash is being issued once confirmed but not yet credited", () => {
      expect(
        stateDisplay("pending", {
          confirmed: true,
          confirmations: 3,
          confirmationThreshold: 3,
        })
      ).toBe("QuoteInformation.states.issuing");
    });

    it("never says paid before the store does", () => {
      expect(
        stateDisplay("paid", {
          confirmed: true,
          confirmations: 3,
          confirmationThreshold: 3,
        })
      ).toBe("QuoteInformation.states.paid");
    });

    // Owner 2026-10-29b, item 10: each state keeps its own mark; only Paid is positive.
    it.each([
      ["pending", null, "waiting"],
      ["pending", { confirmed: false, confirmations: 1 }, "confirming"],
      ["pending", { confirmed: true, confirmations: 3 }, "issuing"],
      ["paid", { confirmed: true, confirmations: 3 }, "paid"],
      ["expired", null, "other"],
    ])("a %s quote with %j reads as %s", (status, metadata, tone) => {
      expect(
        MintQuoteInformation.computed.statusTone.call({
          isPaidState: status === "paid",
          isWaitingState: status === "pending",
          isOnchain: true,
          onchainMetadata: metadata,
        })
      ).toBe(tone);
    });

    const render = async (status: string, hidePaidStatus: boolean) => {
      fetchAddressTxMetadata.mockResolvedValue({
        confirmed: false,
        confirmations: 1,
        confirmationThreshold: 3,
        txid: "a".repeat(64),
        url: "https://mempool.space/tx/aaaa",
      });
      const wrapper = mount(MintQuoteInformation, {
        props: {
          hidePaidStatus,
          method: PaymentMethod.Onchain,
          mintQuote: { quote: "q1", request: "bc1qexampleaddress" },
          invoice: { status, request: "bc1qexampleaddress", amount: 1000 },
        },
        global: {
          mocks: {
            $t: t,
            $te: () => true,
            $q: { dark: { isActive: true } },
            $i18n: { locale: "en-US" },
            $pinia: {},
            formatCurrency: (n: number) => `${n} sat`,
          },
          stubs: {
            DetailRow: {
              props: ["label", "value"],
              template: `<div class="row" :data-label="label">{{ value }}<slot /></div>`,
            },
            PendingDots: true,
          },
        },
      });
      await flushPromises();
      return wrapper;
    };

    it("renders exactly one status row while pending, and no separate chain status", async () => {
      const wrapper = await render("pending", true);
      const status = wrapper.findAll('[data-label="QuoteInformation.status"]');
      expect(status).toHaveLength(1);
      expect(status[0].text()).toContain("states.confirming");
      expect(wrapper.text()).not.toMatch(/chain_status|confirmations"/);
    });

    it("leaves a paid receive to the hero: no status row, no confirmations row", async () => {
      const wrapper = await render("paid", true);
      expect(
        wrapper.findAll('[data-label="QuoteInformation.status"]')
      ).toHaveLength(0);
      expect(
        wrapper.findAll('[data-label="QuoteInformation.confirmations"]')
      ).toHaveLength(0);
    });
  });
});
