import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCameraStore } from "../../../src/stores/camera";

beforeEach(() => {
  localStorage.clear();
});

describe("Camera store", () => {
  it("toggles camera visibility", () => {
    const store = useCameraStore();
    expect(store.camera.show).toBe(false);
    store.showCamera();
    expect(store.camera.show).toBe(true);
    store.closeCamera();
    expect(store.camera.show).toBe(false);
  });

  it("checks camera permission", async () => {
    const queryMock = vi.fn().mockResolvedValue({ state: "granted" });
    (navigator as any).permissions = { query: queryMock };
    const store = useCameraStore();
    await store.hasCamera();
    expect(queryMock).toHaveBeenCalledWith({ name: "camera" });
  });
});
