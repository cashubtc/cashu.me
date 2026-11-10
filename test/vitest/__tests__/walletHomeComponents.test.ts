import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

// ExpansionIndicator  and WalletActions' Scan (item 24).

vi.hoisted(() => {
  (globalThis as unknown as { windowMixin: object }).windowMixin = {};
});
const { default: ExpansionIndicator } = await import(
  "src/components/ui/ExpansionIndicator.vue"
);
const { default: WalletActions } = await import(
  "src/components/WalletActions.vue"
);

describe("ExpansionIndicator", () => {
  it("turns the same decorative chevron and names the action", async () => {
    const wrapper = mount(ExpansionIndicator, {
      props: { expanded: false, label: "Show history and mints" },
    });
    const icon = wrapper.find("svg");
    expect(icon.attributes("aria-hidden")).toBe("true");
    expect(wrapper.classes()).not.toContain("expansion-indicator--expanded");
    expect(wrapper.text()).toBe("Show history and mints");
    await wrapper.setProps({ expanded: true, label: "Hide history and mints" });
    expect(wrapper.classes()).toContain("expansion-indicator--expanded");
    expect(wrapper.text()).toBe("Hide history and mints");
    expect(wrapper.find("svg").element).toBe(icon.element);
    expect(wrapper.findAll("button, [role=button], [tabindex]")).toHaveLength(
      0
    );
  });
});

describe("WalletActions", () => {
  it("renders the minimal Scan glyph and emits scan once", async () => {
    const wrapper = mount(WalletActions, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          "q-btn": {
            template: `<button v-bind="$attrs"><slot /></button>`,
          },
        },
      },
    });
    const scan = wrapper.get('[data-testid="wallet-scan"]');
    expect(scan.find("svg").classes()).toContain("lucide-scan-icon");
    await scan.trigger("click");
    expect(wrapper.emitted("scan")).toHaveLength(1);
  });
});
