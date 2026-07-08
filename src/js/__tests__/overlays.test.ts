import { describe, expect, it } from "vitest";
import {
  getWalletOverlayFromPath,
  getWalletOverlayFromRoute,
  getWalletOverlayPath,
  isWalletHomePath,
  WalletOverlay,
} from "src/js/overlays";

describe("wallet overlay routes", () => {
  it("maps overlay ids to stable wallet paths", () => {
    expect(getWalletOverlayPath(WalletOverlay.Send)).toBe("/wallet/send");
    expect(getWalletOverlayPath(WalletOverlay.Receive)).toBe("/wallet/receive");
    expect(getWalletOverlayPath(WalletOverlay.PayInvoice)).toBe(
      "/wallet/pay-invoice"
    );
    expect(getWalletOverlayPath(WalletOverlay.MultinutPayment)).toBe(
      "/wallet/multinut-payment"
    );
  });

  it("parses overlay ids from browser paths", () => {
    expect(getWalletOverlayFromPath("/wallet/send-token")).toBe(
      WalletOverlay.SendTokens
    );
    expect(getWalletOverlayFromPath("/wallet/receive-token?foo=bar")).toBe(
      WalletOverlay.ReceiveTokens
    );
    expect(getWalletOverlayFromPath("#/wallet/create-invoice")).toBe(
      WalletOverlay.CreateInvoice
    );
  });

  it("parses overlay ids from Vue Router params", () => {
    expect(
      getWalletOverlayFromRoute({
        path: "/wallet/send",
        params: { walletOverlay: "send" },
      })
    ).toBe(WalletOverlay.Send);
  });

  it("recognizes the wallet home path", () => {
    expect(isWalletHomePath("/")).toBe(true);
    expect(isWalletHomePath("/wallet/send")).toBe(false);
  });
});
