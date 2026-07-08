import { describe, expect, it } from "vitest";
import {
  getWalletOverlayFromPath,
  getWalletOverlayFromRoute,
  getWalletOverlayPath,
  isWalletHomePath,
} from "src/js/overlays";

describe("wallet overlay routes", () => {
  it("maps overlay ids to stable wallet paths", () => {
    expect(getWalletOverlayPath("sendDialog")).toBe("/wallet/send");
    expect(getWalletOverlayPath("receiveDialog")).toBe("/wallet/receive");
    expect(getWalletOverlayPath("payInvoice")).toBe("/wallet/pay-invoice");
    expect(getWalletOverlayPath("multinutPayment")).toBe(
      "/wallet/multinut-payment"
    );
  });

  it("parses overlay ids from browser paths", () => {
    expect(getWalletOverlayFromPath("/wallet/send-token")).toBe("sendTokens");
    expect(getWalletOverlayFromPath("/wallet/receive-token?foo=bar")).toBe(
      "receiveTokens"
    );
    expect(getWalletOverlayFromPath("#/wallet/create-invoice")).toBe(
      "createInvoice"
    );
  });

  it("parses overlay ids from Vue Router params", () => {
    expect(
      getWalletOverlayFromRoute({
        path: "/wallet/send",
        params: { walletOverlay: "send" },
      })
    ).toBe("sendDialog");
  });

  it("recognizes the wallet home path", () => {
    expect(isWalletHomePath("/")).toBe(true);
    expect(isWalletHomePath("/wallet/send")).toBe(false);
  });
});
