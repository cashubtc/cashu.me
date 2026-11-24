import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMintsStore } from "src/stores/mints";

describe("mints store activeMint()", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  function setupWithoutActiveMint() {
    const mints = useMintsStore();
    mints.mints = [{ url: "https://mint.example", keys: [], keysets: [] }];
    mints.activeMintUrl = "";
    const activate = vi
      .spyOn(mints, "activateMintUrl")
      .mockResolvedValue(undefined);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    return { mints, activate, consoleError };
  }

  it("does not start another activation while a mint is being added", () => {
    const { mints, activate, consoleError } = setupWithoutActiveMint();
    mints.addMintBlocking = true;

    expect(mints.activeMint().mint.url).toBe("https://mint.example");
    expect(activate).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("falls back to the first mint when no mint is active", () => {
    const { mints, activate } = setupWithoutActiveMint();
    mints.addMintBlocking = false;

    expect(mints.activeMint().mint.url).toBe("https://mint.example");
    expect(activate).toHaveBeenCalledWith("https://mint.example", false, true);
  });
});
