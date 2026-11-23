import { describe, expect, it } from "vitest";
import { useWalletStore } from "src/stores/wallet";

describe("wallet store translations", () => {
  // Regression: the store used useI18n(), which throws unless the store is
  // first created inside a component's setup. Opening a settings page
  // directly creates it from an event handler instead.
  it("can be created outside a component setup", () => {
    expect(() => useWalletStore()).not.toThrow();
  });

  it("translates its notifications", () => {
    const key = "wallet.notifications.balance_too_low";
    const text = useWalletStore().t(key);

    expect(text).not.toBe(key);
    expect(text.length).toBeGreaterThan(0);
  });
});
