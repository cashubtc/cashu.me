import { mount } from "@vue/test-utils";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it, vi } from "vitest";

// Owner 2026-10-29b, item 2: a row's trailing glyph takes its value's colour. The glyph sits
// inside the value element and every glyph rule says currentColor, so whatever colours the
// value (text, a placeholder's muted, a disabled row's subtle, a caller's value-class) colours
// the glyph too. The real computed colours are measured in test/e2e/specs/ui-mints.spec.ts.

vi.mock("src/js/notify", () => ({ notifyCopied: vi.fn() }));
vi.mock("quasar", () => ({ copyToClipboard: vi.fn() }));

const { default: DetailRow } = await import("src/components/ui/DetailRow.vue");

const kinds = {
  action: { action: true, value: "View all" },
  placeholder: { action: true, placeholder: true, value: "Any amount" },
  link: { href: "https://mempool.space", value: "mempool.space" },
  copy: { copyValue: "npub1example", value: "npub1…" },
};

describe("DetailRow trailing glyph", () => {
  it.each(Object.entries(kinds))(
    "a %s row's glyph is inside its value",
    (_, props) => {
      const row = mount(DetailRow, { props: { label: "Label", ...props } });
      const glyphs = row.findAll("svg");
      expect(glyphs).toHaveLength(1);
      expect(glyphs[0].element.closest(".detail-value")).not.toBeNull();
    }
  );

  it("a disabled action has no chevron; a command row (no chevron) has none either", () => {
    expect(
      mount(DetailRow, {
        props: { label: "Unit", value: "BTC", action: true, disabled: true },
      }).findAll("svg")
    ).toHaveLength(0);
    expect(
      mount(DetailRow, {
        props: { label: "Audit", value: "Retry", action: true, chevron: false },
      }).findAll("svg")
    ).toHaveLength(0);
  });

  it("every trailing glyph rule takes the value's colour", () => {
    const sfc = readFileSync(join(__dirname, "../ui/DetailRow.vue"), "utf8");
    const css = sfc.match(/<style[^>]*>([\s\S]*?)<\/style>/)![1];
    for (const glyph of [
      "detail-item__chevron",
      "detail-value__external",
      "detail-value__glyph",
    ]) {
      const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(
        ([, sel]) => sel.includes(`.${glyph}`)
      );
      const colours = rules
        .map(([, , body]) => body.match(/(?:^|;|\s)color:\s*([^;]+)/)?.[1])
        .filter(Boolean);
      expect(colours, glyph).toEqual(["currentColor"]);
    }
  });
});
