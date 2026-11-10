import { mount, flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "quasar";
import { notifyApiError, notifyCopied } from "src/js/notify";
import CopyButton from "src/components/ui/CopyButton.vue";

vi.mock("quasar", () => ({ copyToClipboard: vi.fn() }));
vi.mock("src/js/notify", () => ({
  notifyApiError: vi.fn(),
  notifyCopied: vi.fn(),
}));

function button() {
  return mount(CopyButton, {
    props: { value: "copy me", label: "Copy" },
    global: {
      stubs: {
        IconButton: {
          template: "<button @click=\"$emit('click')\"><slot /></button>",
        },
      },
    },
  });
}

describe("copy feedback", () => {
  it("waits for clipboard success before showing the check", async () => {
    let resolve!: () => void;
    vi.mocked(copyToClipboard).mockReturnValue(
      new Promise<void>((done) => {
        resolve = done;
      })
    );
    const wrapper = button();
    await wrapper.trigger("click");
    expect(wrapper.vm.copied).toBe(false);
    resolve();
    await flushPromises();
    expect(wrapper.vm.copied).toBe(true);
    expect(notifyCopied).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("reports a clipboard rejection without showing success", async () => {
    vi.mocked(notifyCopied).mockClear();
    const error = new Error("Clipboard unavailable");
    vi.mocked(copyToClipboard).mockRejectedValue(error);
    const wrapper = button();
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.vm.copied).toBe(false);
    expect(notifyCopied).not.toHaveBeenCalled();
    expect(notifyApiError).toHaveBeenCalledWith(error);
    wrapper.unmount();
  });
});
