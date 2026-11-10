import { describe, expect, it } from "vitest";
import { middleShorten } from "src/components/ui/QrCopyLine.vue";

describe("QR copy line text", () => {
  it("keeps a Lightning address's whole domain, shortening a long name", () => {
    expect(
      middleShorten(
        "npub18875ua0xq02vsu9f7vzd06e8tsknvdeseequ0l34glkgxsudyhnsem37pe@npub.cash"
      )
    ).toBe("npub1887…37pe@npub.cash");
    expect(middleShorten("satoshi@getalby.com")).toBe("satoshi@getalby.com");
  });

  it("shortens other long text in the middle and leaves short text alone", () => {
    expect(middleShorten("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq")).toBe(
      "bc1qar0srrr7…gtzzwf5mdq"
    );
    expect(middleShorten("02a1…9f3c")).toBe("02a1…9f3c");
  });
});
