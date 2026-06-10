import { describe, expect, it } from "vitest";
import { useUiStore } from "src/stores/ui";

describe("ui store", () => {
  it("formats custom Cashu units without throwing", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(12, "unit")).toBe("12 unit");
  });

  it("keeps cent-based fiat formatting", () => {
    const ui = useUiStore();

    expect(ui.formatCurrency(1234, "usd")).toContain("12.34");
  });
});
