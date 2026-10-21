import { afterEach, describe, expect, it, vi } from "vitest";
import { Clipboard } from "@capacitor/clipboard";
import { useUiStore } from "src/stores/ui";
import { notifyError } from "src/js/notify";
import { i18n } from "src/boot/i18n";

vi.mock("@capacitor/clipboard", () => ({ Clipboard: { read: vi.fn() } }));
vi.mock("src/js/notify", () => ({ notifyError: vi.fn() }));

const capacitorDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "Capacitor"
);
const clipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard"
);

afterEach(() => {
  for (const [target, key, descriptor] of [
    [window, "Capacitor", capacitorDescriptor],
    [navigator, "clipboard", clipboardDescriptor],
  ] as const) {
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else Reflect.deleteProperty(target, key);
  }
  vi.clearAllMocks();
});

for (const native of [false, true]) {
  describe(native ? "Capacitor clipboard" : "browser clipboard", () => {
    const setup = () => {
      const readText = vi.fn();
      Object.defineProperty(window, "Capacitor", {
        configurable: true,
        value: native ? {} : undefined,
      });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { readText },
      });
      return native ? vi.mocked(Clipboard.read) : readText;
    };

    it("handles denied reads with feedback and empty input", async () => {
      setup().mockRejectedValue(
        new DOMException("Permission denied", "NotAllowedError")
      );
      await expect(useUiStore().pasteFromClipboard()).resolves.toBe("");
      expect(notifyError).toHaveBeenCalledWith(
        i18n.global.t("RestoreView.actions.paste.error")
      );
    });

    it("still returns successful clipboard reads", async () => {
      setup().mockResolvedValue(
        native ? { value: "invoice", type: "text/plain" } : "invoice"
      );
      await expect(useUiStore().pasteFromClipboard()).resolves.toBe("invoice");
      expect(notifyError).not.toHaveBeenCalled();
    });
  });
}
