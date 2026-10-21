import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { prepareZXingModule, readBarcodes } from "zxing-wasm/reader";

vi.mock("zxing-wasm/reader", () => ({
  prepareZXingModule: vi.fn(),
  readBarcodes: vi.fn(),
}));
const originalHandler = self.onmessage;
let post: ReturnType<typeof vi.spyOn>;
const send = (data: unknown) =>
  self.onmessage!.call(self, new MessageEvent("message", { data }));

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  post = vi.spyOn(self, "postMessage").mockImplementation(() => {});
  await import("src/js/qr-scanner-worker");
});
afterEach(() => {
  self.onmessage = originalHandler;
  post.mockRestore();
});

it("takes the local WASM URL from configuration rather than its script URL", async () => {
  await send({
    type: "configure",
    options: {
      wasmUrl: "https://wallet.example/assets/reader.wasm",
      tryInvert: false,
    },
  });
  const config = vi.mocked(prepareZXingModule).mock.calls[0][0]!;
  expect(config.overrides!.locateFile!("zxing_reader.wasm", "")).toBe(
    "https://wallet.example/assets/reader.wasm"
  );
  await send({ type: "configure", options: { tryInvert: true } });
  expect(prepareZXingModule).toHaveBeenCalledTimes(1);
  vi.mocked(readBarcodes).mockResolvedValueOnce([]);
  const imageData = { width: 1, height: 1 };
  await send({ type: "decode", imageData });
  expect(readBarcodes).toHaveBeenCalledWith(
    imageData,
    expect.objectContaining({ formats: ["QRCode"], tryInvert: true })
  );
  expect(post).toHaveBeenLastCalledWith({ type: "result", results: [] });
});

it("refuses to decode without local configuration instead of using the default CDN", async () => {
  await send({ type: "decode", imageData: {} });
  expect(readBarcodes).not.toHaveBeenCalled();
  expect(post).toHaveBeenLastCalledWith({
    type: "error",
    message: "Missing local QR decoder configuration",
  });
});
