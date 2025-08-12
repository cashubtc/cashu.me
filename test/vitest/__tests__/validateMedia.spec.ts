import { describe, it, expect } from "vitest";
import {
  isTrustedUrl,
  normalizeYouTube,
  ipfsToGateway,
  normalizeMediaUrl,
  extractIframeSrc,
  determineMediaType,
  filterValidMedia,
} from "../../../src/utils/validateMedia";

describe("validateMedia", () => {
  it("accepts trusted schemes", () => {
    expect(isTrustedUrl("https://example.com")).toBe(true);
    expect(isTrustedUrl("ipfs://cid")).toBe(true);
    expect(isTrustedUrl("nostr:foo")).toBe(true);
  });

  it("rejects untrusted schemes", () => {
    expect(isTrustedUrl("http://example.com")).toBe(false);
    expect(isTrustedUrl("ftp://example.com")).toBe(false);
  });

  it("normalizes youtube links", () => {
    const url = "https://youtu.be/abcd1234efg";
    expect(normalizeYouTube(url)).toBe(
      "https://www.youtube.com/embed/abcd1234efg",
    );
  });

  it("converts ipfs links to gateway", () => {
    const url = "ipfs://bafy123/file.png";
    expect(ipfsToGateway(url)).toBe(
      "https://nftstorage.link/ipfs/bafy123/file.png",
    );
    expect(normalizeMediaUrl(url)).toBe(
      "https://nftstorage.link/ipfs/bafy123/file.png",
    );
  });

  it("parses iframe snippets", () => {
    const snippet = '<iframe src="https://example.com/embed"></iframe>';
    expect(extractIframeSrc(snippet)).toBe("https://example.com/embed");
    expect(normalizeMediaUrl(snippet)).toBe("https://example.com/embed");
  });

  it("detects media type", () => {
    expect(determineMediaType("https://example.com/video.mp4")).toBe("video");
    expect(determineMediaType("https://example.com/song.mp3")).toBe("audio");
    expect(determineMediaType("https://www.youtube.com/embed/id")).toBe(
      "youtube",
    );
    expect(determineMediaType("https://example.com/image.png")).toBe("image");
    expect(determineMediaType("https://example.com/page")).toBe("iframe");
  });

  it("detects nostr event links", () => {
    expect(determineMediaType("https://primal.net/e/abc123")).toBe("nostr");
    expect(determineMediaType("https://snort.social/e/def456")).toBe("nostr");
  });

  it("filters invalid media entries", () => {
    const media = filterValidMedia([
      { url: "" },
      { url: "http://bad.com" },
      { url: "https://good.com/ok.png" },
    ]);
    expect(media).toEqual([{ url: "https://good.com/ok.png" }]);
  });
});
