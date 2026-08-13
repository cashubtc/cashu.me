import { createPinia } from "pinia";
import { mount } from "@vue/test-utils";
import { beforeAll, describe, expect, it, vi } from "vitest";

const storeMocks = vi.hoisted(() => ({
  clearNostrDatabases: vi.fn(),
  clearMintDatabases: vi.fn(),
}));

vi.mock("quasar", async (importOriginal) => ({
  ...(await importOriginal<typeof import("quasar")>()),
  Ripple: {},
}));

vi.mock("src/stores/nostrUser", () => ({
  useNostrUserStore: () => ({
    clearAllDatabases: storeMocks.clearNostrDatabases,
  }),
}));

vi.mock("src/stores/mintRecommendations", () => ({
  useMintRecommendationsStore: () => ({
    clearAllDatabases: storeMocks.clearMintDatabases,
  }),
}));

let AdvancedSettings: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  AdvancedSettings = (await import("../AdvancedSettings.vue")).default;
});

describe("AdvancedSettings", () => {
  it.each(["new_seed", "import_wallet", "reset_wallet"])(
    "keeps the %s confirmation controls enabled",
    async (setting) => {
      const wrapper = mount(AdvancedSettings, {
        global: {
          plugins: [createPinia()],
          config: {
            warnHandler: () => undefined,
          },
          mocks: {
            $t: (key: string) => key,
          },
          stubs: {
            SettingsPageShell: { template: "<div><slot /></div>" },
            SettingsSection: { template: "<div><slot /></div>" },
            QItem: {
              props: { disable: Boolean },
              emits: ["click"],
              template:
                '<div class="q-item" :class="{ disabled: disable }" @click="$emit(\'click\', $event)"><slot /></div>',
            },
            QItemSection: { template: "<div><slot /></div>" },
            QItemLabel: { template: "<div><slot /></div>" },
            QBtn: { template: "<button><slot /></button>" },
          },
        },
      });

      const row = wrapper
        .findAll(".q-item")
        .find((item) =>
          item.text().includes(`Settings.advanced.developer.${setting}.button`)
        );

      expect(row).toBeDefined();
      await row!.trigger("click");

      expect(row!.classes()).not.toContain("disabled");
      expect(
        row!.findAll("button").every((button) => !button.attributes("disabled"))
      ).toBe(true);
    }
  );

  it("waits for wallet databases to clear before clearing local storage", async () => {
    let resolveDexieClear!: () => void;
    let resolveNostrClear!: () => void;
    const deleteAllTables = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDexieClear = resolve;
        })
    );
    storeMocks.clearNostrDatabases.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveNostrClear = resolve;
        })
    );
    storeMocks.clearMintDatabases.mockResolvedValue(undefined);
    const clearLocalStorage = vi.spyOn(localStorage, "clear");

    const nukePromise = AdvancedSettings.methods.nukeWallet.call({
      exportWalletState: vi.fn().mockResolvedValue(undefined),
      deleteAllTables,
    });

    await vi.waitFor(() => expect(deleteAllTables).toHaveBeenCalledOnce());
    expect(storeMocks.clearNostrDatabases).not.toHaveBeenCalled();
    expect(clearLocalStorage).not.toHaveBeenCalled();

    resolveDexieClear();
    await vi.waitFor(() =>
      expect(storeMocks.clearNostrDatabases).toHaveBeenCalledOnce()
    );
    expect(clearLocalStorage).not.toHaveBeenCalled();

    resolveNostrClear();
    await nukePromise;

    expect(storeMocks.clearMintDatabases).toHaveBeenCalledOnce();
    expect(clearLocalStorage).toHaveBeenCalledOnce();
  });
});
