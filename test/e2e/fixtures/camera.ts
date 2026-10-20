import type { Page } from "@playwright/test";
import QRCode from "qrcode";

/** Supply camera frames while exercising the real browser QR decoder and parser. */
export async function installCamera(page: Page, payload: string | null) {
  const dataUrl =
    payload === null
      ? null
      : await QRCode.toDataURL(payload, { width: 640, margin: 4 });
  await page.addInitScript(async (imageUrl) => {
    Object.defineProperty(navigator.mediaDevices, "enumerateDevices", {
      value: async () => [
        {
          deviceId: "test-camera",
          groupId: "test",
          kind: "videoinput",
          label: "Test camera",
        },
      ],
    });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        if (!imageUrl)
          throw new DOMException("Camera permission denied", "NotAllowedError");
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 640;
        const image = new Image();
        image.src = imageUrl;
        await image.decode();
        const ctx = canvas.getContext("2d")!;
        const stream = canvas.captureStream(10);
        const timer = setInterval(() => ctx.drawImage(image, 0, 0), 100);
        stream
          .getVideoTracks()[0]
          .addEventListener("ended", () => clearInterval(timer));
        return stream;
      },
    });
  }, dataUrl);
}
