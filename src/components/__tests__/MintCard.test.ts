import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MintCard from "src/components/MintCard.vue";

// Owner 2026-10-29, items 1 and 13: a ring while the wallet switches to a mint, a check on
// the selected one, no "Active" text.

const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key} ${JSON.stringify(params)}` : key;

const mountCard = (props: Record<string, unknown> = {}, slots = {}) =>
  mount(MintCard, {
    props: { url: "https://mint.example.com", name: "Example", ...props },
    slots,
    global: {
      mocks: { $t: t },
      stubs: {
        "q-item": {
          inheritAttrs: false,
          template: `<div class="q-item" v-bind="$attrs"><slot /></div>`,
        },
        "q-spinner": { template: `<svg class="q-spinner" />` },
        "q-skeleton": { template: `<span class="q-skeleton" />` },
        MintInfoContainer: { template: `<div class="mint-info" />` },
        MintReviewSummary: { template: `<div class="review" />` },
      },
    },
  });

describe("MintCard selection status", () => {
  it("marks the selected mint with one check, not Active text", () => {
    const card = mountCard({ selected: true, active: true });
    const status = card.get(".mint-card__status");
    expect(status.findAll(".mint-card__check")).toHaveLength(1);
    expect(status.find(".q-spinner").exists()).toBe(false);
    expect(card.text()).not.toMatch(/active/i);
    expect(card.attributes("aria-current")).toBe("true");
  });

  it("shows one ring while switching, even on the selected mint", () => {
    const card = mountCard({ selected: true, busy: true });
    const status = card.get(".mint-card__status");
    expect(status.findAll(".q-spinner")).toHaveLength(1);
    expect(status.find(".mint-card__check").exists()).toBe(false);
    expect(card.attributes("aria-busy")).toBe("true");
    expect(status.get("[role=status]").text()).toContain(
      'MintSettings.switching_mint {"mint":"Example"}'
    );
  });

  it("reserves the same empty cell on unselected cards of a switching list", () => {
    const card = mountCard({ showSelectionStatus: true });
    const status = card.get(".mint-card__status");
    expect(status.find(".q-spinner").exists()).toBe(false);
    expect(status.find(".mint-card__check").exists()).toBe(false);
    expect(card.attributes("aria-current")).toBeUndefined();
    expect(card.attributes("aria-busy")).toBeUndefined();
  });

  it("adds no check for an active-only pick (Restore, payment)", () => {
    const card = mountCard({ active: true });
    expect(card.find(".mint-card__status").exists()).toBe(false);
    expect(card.attributes("aria-current")).toBeUndefined();
  });

  it("hides live status and actions on the skeleton", () => {
    const card = mountCard(
      { skeleton: true, selected: true, busy: true },
      { action: `<button class="act">x</button>` }
    );
    expect(card.find(".mint-card__status").exists()).toBe(false);
    expect(card.find(".act").exists()).toBe(false);
    expect(card.attributes("aria-busy")).toBeUndefined();
  });
});
