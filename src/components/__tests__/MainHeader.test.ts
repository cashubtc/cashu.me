import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { useUiStore } from "src/stores/ui";
import { notifyApiError } from "src/js/notify";

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("src/js/notify", () => ({
  notifyApiError: vi.fn(),
}));

let MainHeader: any;

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  MainHeader = (await import("src/components/MainHeader.vue")).default;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("MainHeader reload", () => {
  it("starts the countdown after acquiring the mutex and releases on cancel", async () => {
    vi.useFakeTimers();
    const ui = useUiStore();
    let grant!: () => void;
    vi.spyOn(ui, "lockMutex").mockImplementation(
      () => new Promise<void>((resolve) => (grant = resolve))
    );
    const unlock = vi.spyOn(ui, "unlockMutex").mockResolvedValue();
    const header = MainHeader.setup();
    const reload = header.reload();

    await vi.advanceTimersByTimeAsync(3000);
    expect(header.countdown.value).toBe(0);
    expect(unlock).not.toHaveBeenCalled();

    grant();
    await reload;
    expect(header.countdown.value).toBe(3);
    await header.reload();
    expect(header.countdown.value).toBe(0);
    expect(unlock).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports acquisition errors without starting a countdown", async () => {
    const error = new Error("Lock acquisition failed");
    vi.spyOn(useUiStore(), "lockMutex").mockRejectedValue(error);
    const header = MainHeader.setup();

    await header.reload();

    expect(header.countdown.value).toBe(0);
    expect(notifyApiError).toHaveBeenCalledWith(error);
  });
});
