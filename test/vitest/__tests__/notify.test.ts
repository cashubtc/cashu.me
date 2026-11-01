import { beforeEach, describe, expect, it, vi } from "vitest";

// src/js/notify.ts: every helper sends one Sonner toast of its tone, the caption as the
// description, amounts kept left-to-right, and copy confirmations shorter than the rest.

const sent: Array<{ kind: string; message: string; options: any }> = [];
const record = (kind: string) => (message: string, options: any) =>
  sent.push({ kind, message, options });

vi.mock("vue-sonner", () => ({
  toast: {
    success: record("success"),
    error: record("error"),
    warning: record("warning"),
    info: record("info"),
  },
}));

vi.mock("src/boot/i18n", () => ({
  i18n: {
    global: { t: (key: string) => ({ "common.copied": "Copied" }[key] ?? key) },
  },
}));

const notifyModule = () => import("src/js/notify");

describe("notify", () => {
  beforeEach(() => {
    sent.length = 0;
  });

  it("sends each helper's toast in its tone, with the caption as description", async () => {
    const n = await notifyModule();
    n.notifySuccess("ok");
    n.notifyError("bad", "why");
    n.notifyWarning("careful");
    n.notify("info");
    n.notifyApiError(new Error("api"));
    n.notifyCopied();
    expect(sent.map((t) => t.kind)).toEqual([
      "success",
      "error",
      "warning",
      "info",
      "warning",
      "success",
    ]);
    expect(sent[1].options.description).toBe("why");
    expect(sent[5].message).toBe("Copied");
    expect(sent[5].options.duration).toBeLessThan(sent[0].options.duration);
  });

  it("keeps amounts left-to-right in right-to-left pages", async () => {
    const n = await notifyModule();
    document.documentElement.dir = "rtl";
    n.notifySuccess("Received ₿500");
    document.documentElement.dir = "ltr";
    expect(sent[0].message).toBe("Received ⁦₿500⁩");
  });
});
