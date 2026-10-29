import { beforeEach, describe, expect, it, vi } from "vitest";

// src/js/notify.ts: every toast at the top, ungrouped, two at most (a third dismisses the
// oldest), with a close button named in the current language.

const created: Array<{ options: Record<string, any>; dismiss: () => void }> =
  [];

vi.mock("quasar", () => ({
  Notify: {
    create: (options: Record<string, any>) => {
      const dismiss = vi.fn(() => options.onDismiss?.());
      created.push({ options, dismiss });
      return dismiss;
    },
  },
}));

const locale = { value: "en-US" };
vi.mock("src/boot/i18n", () => ({
  i18n: {
    global: {
      t: (key: string) =>
        ({
          "global.actions.close.label":
            locale.value === "de-DE" ? "Schließen" : "Close",
          "common.copied": "Copied",
        }[key] ?? key),
    },
  },
}));

const notifyModule = () => import("src/js/notify");

describe("notify", () => {
  beforeEach(async () => {
    // Clear what is still on screen from the previous test.
    created.forEach((c) => c.dismiss());
    created.length = 0;
    locale.value = "en-US";
  });

  it("puts every helper's toast at the top, ungrouped, with a role", async () => {
    const n = await notifyModule();
    n.notifySuccess("ok");
    n.notifyError("bad", "why");
    n.notifyWarning("careful");
    n.notify("info");
    n.notifyApiError(new Error("api"));
    n.notifyCopied();
    expect(created.map((c) => c.options.position)).toEqual(
      Array(6).fill("top")
    );
    expect(created.every((c) => c.options.group === false)).toBe(true);
    expect(created.map((c) => c.options.attrs.role)).toEqual([
      "status",
      "alert",
      "alert",
      "status",
      "alert",
      "status",
    ]);
    expect(
      created.every((c) => c.options.attrs["data-testid"] === "app-toast")
    ).toBe(true);
    expect(created[5].options.timeout).toBeLessThan(created[0].options.timeout);
  });

  it("keeps two at most, dismissing the oldest", async () => {
    const n = await notifyModule();
    n.notify("one");
    n.notify("two");
    expect(created[0].dismiss).not.toHaveBeenCalled();
    n.notify("three");
    expect(created[0].dismiss).toHaveBeenCalledTimes(1);
    expect(created[1].dismiss).not.toHaveBeenCalled();
    // Closing "three" by hand leaves "two"; the next toast then dismisses nothing.
    created[2].options.onDismiss();
    n.notify("four");
    expect(created[1].dismiss).not.toHaveBeenCalled();
    n.notify("five");
    expect(created[1].dismiss).toHaveBeenCalledTimes(1);
  });

  it("names the close button in the current language", async () => {
    const n = await notifyModule();
    n.notify("hello");
    locale.value = "de-DE";
    n.notify("hallo");
    expect(created[0].options.actions[0]["aria-label"]).toBe("Close");
    expect(created[1].options.actions[0]["aria-label"]).toBe("Schließen");
  });

  it("keeps amounts left-to-right in right-to-left pages", async () => {
    const n = await notifyModule();
    document.documentElement.dir = "rtl";
    n.notifySuccess("Received ₿500");
    document.documentElement.dir = "ltr";
    expect(created[0].options.message).toBe("Received \u2066₿500\u2069");
  });
});
