import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useNpubCashStore } from "src/stores/npubcash";

let LightningAddressSettings: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  LightningAddressSettings = (await import("../LightningAddressSettings.vue"))
    .default;
});

describe("LightningAddressSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("keeps Lightning address options in a collapsed advanced section", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useNpubCashStore().enabled = true;
    const wrapper = mount(LightningAddressSettings, {
      global: {
        plugins: [pinia],
        mocks: { $t: (key: string) => key },
        config: { warnHandler: () => undefined },
        stubs: {
          SettingsPageShell: { template: "<div><slot /></div>" },
          SettingsSection: { template: "<div><slot /></div>" },
          ChooseMint: { template: "<div />" },
          QItem: { template: "<div><slot /></div>" },
          QItemSection: { template: "<div><slot /></div>" },
          QItemLabel: { template: "<div><slot /></div>" },
          QToggle: { template: "<div />" },
          QSpinner: { template: "<div />" },
          QIcon: { template: "<div><slot /></div>" },
          QTooltip: { template: "<div><slot /></div>" },
          QInput: {
            props: ["label"],
            template: '<div class="q-input">{{ label }}</div>',
          },
          QExpansionItem: {
            props: ["label"],
            template:
              '<details class="advanced-settings"><summary>{{ label }}</summary><slot /></details>',
          },
        },
      },
    });

    const advanced = wrapper.get(".advanced-settings");
    expect(advanced.element).toBeInstanceOf(HTMLDetailsElement);
    expect((advanced.element as HTMLDetailsElement).open).toBe(false);
    expect(advanced.text()).toContain("npub.cash hostname");
    expect(advanced.text()).toContain(
      "Settings.lightning_address.automatic_claim.toggle"
    );
    expect(advanced.text()).toContain(
      "Settings.lightning_address.show_on_receive.toggle"
    );
  });

  it("writes the normalized HTTPS URL back into the input", async () => {
    const setBaseHost = vi.fn().mockResolvedValue("https://custom.example");
    const context = {
      serverUrlInput: "custom.example",
      serverUrlError: "old error",
      setBaseHost,
    };

    await LightningAddressSettings.methods.applyServerUrl.call(context);

    expect(setBaseHost).toHaveBeenCalledWith("custom.example");
    expect(context.serverUrlInput).toBe("https://custom.example");
    expect(context.serverUrlError).toBe("");
  });
});
