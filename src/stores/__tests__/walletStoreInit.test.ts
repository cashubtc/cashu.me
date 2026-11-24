import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useWalletStore } from "src/stores/wallet";

describe("wallet store initialisation", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("can be created outside a component setup", () => {
    // Stores are often first instantiated from another store's action, where
    // there is no current component instance.
    const wallet = useWalletStore();

    expect(wallet.payInvoiceData.show).toBe(false);
    expect(wallet.t("wallet.notifications.trying_again")).toBe(
      "Trying again..."
    );
  });
});
