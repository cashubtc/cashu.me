import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

// Owner 2026-10-29, items 3 and 14: one picker recipe in two sizes, and the chevron as a real
// button. The store is a fixed two-mint stand-in; picking is not under test here.

vi.hoisted(() => {
  (globalThis as unknown as { windowMixin: object }).windowMixin = {
    methods: { formatCurrency: (n: number, u: string) => `${n} ${u}` },
  };
});

vi.mock("src/stores/mints", () => {
  const mints = [
    { url: "https://a.example.com", nickname: "Mint A", keysets: [], info: {} },
    { url: "https://b.example.com", nickname: "Mint B", keysets: [], info: {} },
  ];
  const store = {
    activeMintUrl: "https://a.example.com",
    activeUnit: "sat",
    activeProofs: [],
    mints,
    selectMintUrl: vi.fn(),
  };
  class MintClass {
    mint: any;
    constructor(mint: any) {
      this.mint = mint;
    }
    get allBalances() {
      return { sat: 21 };
    }
  }
  return { useMintsStore: () => store, MintClass };
});
vi.mock("src/boot/i18n", () => ({
  i18n: { global: { t: (key: string) => key } },
}));

const { default: ChooseMint } = await import("src/components/ChooseMint.vue");

const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key} ${JSON.stringify(params)}` : key;

const mountPicker = (props: Record<string, unknown> = {}) =>
  mount(ChooseMint, {
    props: { dryRun: true, ...props },
    global: {
      mocks: { $t: t },
      stubs: {
        IconCircle: { template: `<span class="avatar"><slot /></span>` },
        IconButton: {
          inheritAttrs: false,
          props: ["label", "disable"],
          emits: ["click"],
          template: `<button v-bind="$attrs" :aria-label="label" :disabled="disable"
            @click="!disable && $emit('click', $event)"><slot /></button>`,
        },
        BottomSheet: {
          props: ["modelValue"],
          template: `<div v-if="modelValue" class="sheet"><slot /></div>`,
        },
        SheetOption: {
          props: ["label", "selected"],
          template: `<div role="option" :aria-selected="selected">{{ label }}</div>`,
        },
      },
    },
  });

const shell = (w: ReturnType<typeof mountPicker>) =>
  w.get('[data-testid="choose-mint"]');
const trigger = (w: ReturnType<typeof mountPicker>) =>
  w.get('[data-testid="choose-mint-trigger"]');

describe("ChooseMint", () => {
  it("has one native button and a noninteractive field", () => {
    const w = mountPicker();
    expect(w.findAll("button")).toHaveLength(1);
    const field = shell(w);
    expect(field.element.tagName).toBe("DIV");
    expect(field.attributes("role")).toBeUndefined();
    expect(field.attributes("tabindex")).toBeUndefined();
    expect(field.find("button").exists()).toBe(true);
    expect(trigger(w).attributes("aria-label")).toBe(
      'ChooseMint.open_selector {"mint":"Mint A"}'
    );
  });

  it("sets size by dense alone; a label only adds its line", async () => {
    const w = mountPicker();
    const base = shell(w).classes();
    expect(base).not.toContain("mint-picker--dense");
    await w.setProps({ label: "From" });
    expect(shell(w).classes()).toEqual(base);
    expect(w.get(".mint-picker__label").text()).toBe("From");
    await w.setProps({ dense: true });
    expect(shell(w).classes()).toEqual([...base, "mint-picker--dense"]);
    // Same avatar and text hierarchy in both sizes.
    expect(w.find(".avatar").exists()).toBe(true);
    expect(w.find(".mint-picker__caption").exists()).toBe(true);
  });

  it("opens exactly once from the field and from the chevron", async () => {
    for (const target of [shell, trigger]) {
      const w = mountPicker();
      await target(w).trigger("click");
      expect(w.emitted("update:open")).toEqual([[true]]);
      expect(trigger(w).attributes("aria-expanded")).toBe("true");
    }
  });

  it("stays closed from both paths when disabled", async () => {
    const w = mountPicker({ disable: true });
    await shell(w).trigger("click");
    await trigger(w).trigger("click");
    expect(w.emitted("update:open")).toBeUndefined();
    expect(shell(w).attributes("aria-disabled")).toBe("true");
    expect(trigger(w).attributes("disabled")).toBeDefined();
  });

  it("points aria-controls at its own listbox, unique per picker", async () => {
    const a = mountPicker();
    const b = mountPicker();
    const idA = trigger(a).attributes("aria-controls");
    expect(idA).toBeTruthy();
    expect(idA).not.toBe(trigger(b).attributes("aria-controls"));
    expect(trigger(a).attributes("aria-haspopup")).toBe("listbox");
    expect(trigger(a).attributes("aria-expanded")).toBe("false");
    await trigger(a).trigger("click");
    const listbox = a.get("[role=listbox]");
    expect(listbox.attributes("id")).toBe(idA);
    expect(listbox.findAll("[role=option]").map((o) => o.text())).toEqual([
      "Mint A",
      "Mint B",
    ]);
    expect(listbox.get('[aria-selected="true"]').text()).toBe("Mint A");
  });

  it("keeps the Any option first and names an empty picker plainly", async () => {
    const w = mountPicker({
      anyLabel: "Any mint",
      modelValue: "",
      requireActiveMint: false,
    });
    expect(trigger(w).attributes("aria-label")).toBe(
      "ChooseMint.open_selector_empty"
    );
    await trigger(w).trigger("click");
    const options = w.findAll("[role=option]");
    expect(options[0].text()).toBe("Any mint");
    expect(options[0].attributes("aria-selected")).toBe("true");
  });
});
