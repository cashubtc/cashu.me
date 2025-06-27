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
    const permissionsGetSpy = vi
      .spyOn(navigator, "permissions", "get")
      .mockReturnValue({
        query: vi.fn().mockResolvedValue({ state: "granted" }),
      });
    const store = useCameraStore();
    await store.hasCamera();
    expect(permissionsGetSpy.mock.results[0].value.query).toHaveBeenCalledWith({
      name: "camera",
    });
  });
});
