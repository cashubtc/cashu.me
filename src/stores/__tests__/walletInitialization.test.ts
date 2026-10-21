import { describe, expect, it, vi } from "vitest";
import { useWalletStore } from "src/stores/wallet";
import { useRestoreStore } from "src/stores/restore";
import { i18n } from "src/boot/i18n";

describe("wallet initialization outside component setup", () => {
  it("uses the current global locale when translating store notifications", () => {
    const previous = i18n.global.locale;
    try {
      i18n.global.locale = "en-US";
      const wallet = useWalletStore();
      const english = wallet.t("wallet.mint.notifications.removed");
      i18n.global.locale = "de-DE";
      expect(wallet.t("wallet.mint.notifications.removed")).toBe(
        i18n.global.t("wallet.mint.notifications.removed")
      );
      expect(wallet.t("wallet.mint.notifications.removed")).not.toBe(english);
    } finally {
      i18n.global.locale = previous;
    }
  });

  it("propagates restoration failure while releasing the restoring state", async () => {
    const restore = useRestoreStore();
    const failure = new Error("Restore unavailable");
    vi.spyOn(restore, "_restoreMint").mockRejectedValueOnce(failure);
    await expect(restore.restoreMint("https://mint.example")).rejects.toBe(
      failure
    );
    expect(restore.restoringState).toBe(false);
    expect(restore.restoringMint).toBe("");
    expect(restore.restoreProgress).toBe(0);
  });
});
