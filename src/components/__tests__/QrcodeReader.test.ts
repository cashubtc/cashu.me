import { describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { Buffer } from "buffer";
import QrcodeReader from "src/components/QrcodeReader.vue";

const TOKEN = "cashuBtesttoken";

// Set per test: what the completed UR's decodeCBOR() returns.
let decoded: unknown;
// Captured from the component: the callback it gives the scanner.
let onScan: (result: { data: string }) => void;

vi.mock("@agicash/qr-scanner", () => ({
  default: class {
    static configureWasm() {}
    constructor(_video: unknown, callback: typeof onScan) {
      onScan = callback;
    }
    start() {}
    stop() {}
    destroy() {}
  },
}));

vi.mock("@gandlaf21/bc-ur", () => ({
  URDecoder: class {
    receivePart() {}
    estimatedPercentComplete() {
      return 1;
    }
    isComplete() {
      return true;
    }
    isSuccess() {
      return true;
    }
    resultUR() {
      return { decodeCBOR: () => decoded };
    }
  },
}));

describe("QrcodeReader completed UR scan", () => {
  it.each([
    ["a string", TOKEN],
    ["a Buffer", Buffer.from(TOKEN)],
    ["a plain Uint8Array", new TextEncoder().encode(TOKEN)],
  ])("emits the token text when decodeCBOR() returns %s", (_, value) => {
    decoded = value;
    const wrapper = shallowMount(QrcodeReader, {
      global: { mocks: { $t: (key: string) => key } },
    });

    onScan({ data: "ur:bytes/1-1/test" });

    expect(wrapper.emitted("decode")).toEqual([[TOKEN]]);
  });
});
