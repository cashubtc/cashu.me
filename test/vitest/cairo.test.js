import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCairoStore } from "../../src/stores/cairo";

describe("Cairo Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with empty Cairo data", () => {
    const cairoStore = useCairoStore();
    expect(cairoStore.cairoReceiveData.executable).toBe("");
    expect(cairoStore.cairoReceiveData.programInput).toEqual([]);
    expect(cairoStore.showCairoDialog).toBe(false);
  });

  it("should set Cairo receive data correctly", () => {
    const cairoStore = useCairoStore();
    const executable = "func main() { return 1; }";
    const programInput = [BigInt(123), BigInt(456)];

    cairoStore.setCairoReceiveData(executable, programInput);

    expect(cairoStore.cairoReceiveData.executable).toBe(executable);
    expect(cairoStore.cairoReceiveData.programInput).toEqual(programInput);
  });

  it("should clear Cairo receive data", () => {
    const cairoStore = useCairoStore();

    // Set some data first
    cairoStore.setCairoReceiveData("test", [BigInt(1)]);
    expect(cairoStore.cairoReceiveData.executable).toBe("test");

    // Clear the data
    cairoStore.clearCairoReceiveData();
    expect(cairoStore.cairoReceiveData.executable).toBe("");
    expect(cairoStore.cairoReceiveData.programInput).toEqual([]);
  });

  it("should show and hide Cairo dialog", () => {
    const cairoStore = useCairoStore();

    cairoStore.showCairoReceiveDialog();
    expect(cairoStore.showCairoDialog).toBe(true);

    cairoStore.hideCairoReceiveDialog();
    expect(cairoStore.showCairoDialog).toBe(false);
  });
});
