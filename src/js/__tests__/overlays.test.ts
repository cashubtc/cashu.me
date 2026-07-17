import { describe, expect, it } from "vitest";
import {
  getWalletOverlayFromPath,
  getWalletOverlayFromRoute,
  getWalletOverlayLocation,
  getWalletOverlayPath,
  isWalletHomePath,
  walletOverlayHistoryState,
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

  it("marks a terminal overlay to close its complete sheet flow", () => {
    window.history.replaceState(
      { [walletOverlayHistoryState.depth]: 2 },
      "",
      "/wallet/receive-ecash"
    );

    expect(
      getWalletOverlayLocation(WalletOverlay.ReceiveTokens, {
        closeFlowOnBack: true,
      })
    ).toEqual({
      path: "/wallet/receive-token",
      state: {
        [walletOverlayHistoryState.depth]: 3,
        [walletOverlayHistoryState.closeFlowOnBack]: true,
      },
    });
  });
});
