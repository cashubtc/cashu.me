import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ConfirmationsRow from "src/components/ConfirmationsRow.vue";
import QuoteStatusRow from "src/components/QuoteStatusRow.vue";

// Owner 2026-10-29b, item 10: the confirmation row gets its green back (a check and the count
// in the positive colour once the threshold is met), while the Status row stays the one
// payment status: no state word here.

const global = {
  mocks: { $t: (key: string) => key },
  stubs: {
    DetailRow: {
      props: ["label", "valueClass"],
      template: `<div class="row" :data-label="label" :data-value-class="JSON.stringify(valueClass)"><slot /></div>`,
    },
    PendingDots: { template: `<i class="dots" />` },
    transition: false,
  },
};

const tx = (confirmations: number, confirmed: boolean) => ({
  txid: "a".repeat(64),
  url: "",
  confirmations,
  confirmationThreshold: 3,
  confirmed,
});

describe("ConfirmationsRow", () => {
  it("shows dots alone until the explorer first answers", () => {
    const row = mount(ConfirmationsRow, {
      props: { metadata: null, loading: true },
      global,
    });
    expect(row.find(".dots").exists()).toBe(true);
    expect(row.find("svg").exists()).toBe(false);
  });

  it("below the threshold: a clock and a muted count", () => {
    const row = mount(ConfirmationsRow, {
      props: { metadata: tx(1, false) },
      global,
    });
    const value = row.get('[data-testid="confirmations-value"]');
    expect(value.text()).toBe("1/3");
    expect(value.classes()).toContain("confirmations--pending");
    expect(value.classes()).not.toContain("text-positive");
    expect(value.find("svg").classes()).toContain("lucide-clock-icon");
  });

  it("at the threshold: a check and the count in the positive colour", () => {
    const row = mount(ConfirmationsRow, {
      props: { metadata: tx(3, true) },
      global,
    });
    const value = row.get('[data-testid="confirmations-value"]');
    expect(value.text()).toBe("3/3");
    expect(value.classes()).toContain("text-positive");
    expect(value.find("svg").classes()).toContain("lucide-circle-check-icon");
    expect(value.find("svg").attributes("aria-hidden")).toBe("true");
  });

  it("keeps the known count while refetching", () => {
    const row = mount(ConfirmationsRow, {
      props: { metadata: tx(2, false), loading: true },
      global,
    });
    expect(row.find(".dots").exists()).toBe(false);
    expect(row.text()).toBe("2/3");
  });
});

describe("QuoteStatusRow", () => {
  const render = (tone: string) =>
    mount(QuoteStatusRow, { props: { tone, text: tone }, global });

  it.each([
    ["waiting", "dots", false],
    ["confirming", "lucide-clock-icon", false],
    ["issuing", "dots", false],
    ["paid", "lucide-circle-check-icon", true],
  ])("%s shows %s, positive only when paid", (tone, mark, positive) => {
    const row = render(tone);
    expect(
      mark === "dots"
        ? row.find(".dots").exists()
        : row.find(`svg.${mark}`).exists()
    ).toBe(true);
    expect(
      row.get("[data-value-class]").attributes("data-value-class")
    ).toContain(`"text-positive":${positive}`);
    expect(row.get('[data-testid="quote-status"]').text()).toBe(tone);
  });
});
