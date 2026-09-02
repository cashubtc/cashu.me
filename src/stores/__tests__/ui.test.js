import { describe, expect, it } from "vitest";
import { useUiStore } from "src/stores/ui";

describe("ui store", () => {
  it("formats custom Cashu units as plain integers with the unit code", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(12, "unit")).toBe("12 UNIT");
    // Three-letter custom units must not be formatted as decimal
    // currencies (no invented ".00" — Cashu amounts are integers).
    expect(ui.formatCurrency(25, "tst")).toBe("25 TST");
  });

  it("still formats real ISO currency units as currencies", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(12.5, "gbp")).toContain("12.5");
    expect(ui.formatCurrency(12.5, "gbp")).not.toContain("GBP 12.5");
  });

  it("keeps cent-based fiat formatting", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(1234, "usd")).toContain("12.34");
  });

  it("runs a queued foreground payment before background work", async () => {
    const ui = useUiStore();
    const order = [];

    await ui.lockMutex();
    const background = ui
      .lockMutex("background")
      .then(() => order.push("background"));

    ui.beginForegroundPayment();
    const foreground = ui
      .lockMutex("foreground")
      .then(() => order.push("foreground"));

    ui.unlockMutex();
    await foreground;

    expect(order).toEqual(["foreground"]);

    ui.unlockMutex();
    ui.endForegroundPayment();
    await background;

    expect(order).toEqual(["foreground", "background"]);
    ui.unlockMutex();
  });

  it("keeps background work out of the gap between foreground mutex sections", async () => {
    const ui = useUiStore();
    const order = [];

    ui.beginForegroundPayment();
    await ui.lockMutex("foreground");
    const background = ui
      .lockMutex("background")
      .then(() => order.push("background"));

    ui.unlockMutex();
    await Promise.resolve();
    expect(order).toEqual([]);
    expect(ui.globalMutexLock).toBe(false);

    await ui.lockMutex("foreground");
    order.push("foreground");
    ui.unlockMutex();
    ui.endForegroundPayment();
    await background;

    expect(order).toEqual(["foreground", "background"]);
    ui.unlockMutex();
  });
});
