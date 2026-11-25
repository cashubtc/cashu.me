import {
  prepareZXingModule,
  readBarcodes,
  type ReaderOptions,
} from "zxing-wasm/reader";
const defaults: ReaderOptions = {
  formats: ["QRCode"],
  tryHarder: true,
  tryInvert: true,
  tryRotate: true,
  tryDenoise: false,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
};
let options = { ...defaults };
let configured = false;

type ScannerMessage =
  | {
      type: "configure";
      options: Partial<ReaderOptions> & { wasmUrl?: string };
    }
  | { type: "decode"; imageData: ImageData };

// Match @agicash/qr-scanner's worker protocol and decoder defaults.
self.onmessage = async ({ data }: MessageEvent<ScannerMessage>) => {
  if (data.type === "configure") {
    const { wasmUrl, ...readerOptions } = data.options;
    if (wasmUrl) {
      // Camera workers have a separate ZXing instance from the main thread.
      prepareZXingModule({ overrides: { locateFile: () => wasmUrl } });
      configured = true;
    }
    options = { ...defaults, ...readerOptions, formats: ["QRCode"] };
  } else if (data.type === "decode") {
    try {
      if (!configured)
        throw new Error("Missing local QR decoder configuration");
      const decoded = await readBarcodes(data.imageData, options);
      const results = decoded
        .filter((result) => result.isValid)
        .map((result) => ({
          data: result.text,
          cornerPoints: [
            result.position.topLeft,
            result.position.topRight,
            result.position.bottomRight,
            result.position.bottomLeft,
          ],
        }));
      self.postMessage({ type: "result", results });
    } catch (error) {
      self.postMessage({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
self.postMessage({ type: "ready" });
