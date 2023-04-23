import { getShortUrl } from "../wallet-helpers";

describe("wallet-helpers", () => {
  describe("getShortUrl", () => {
    it("should strip out protocol prefixes", () => {
      expect(getShortUrl("https://example.com")).toBe("example.com");
      expect(getShortUrl("http://example.com")).toBe("example.com");
    });
  });
});
