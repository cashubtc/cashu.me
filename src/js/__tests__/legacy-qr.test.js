import { describe, expect, it } from "vitest";
import {
  isLegacyRetailQR,
  translateLegacyQRToLightningAddress,
} from "../legacy-qr";

describe("legacy-qr", () => {
  describe("isLegacyRetailQR", () => {
    it("should return false for non-string values", () => {
      expect(isLegacyRetailQR(null)).toBe(false);
      expect(isLegacyRetailQR(undefined)).toBe(false);
      expect(isLegacyRetailQR(123)).toBe(false);
      expect(isLegacyRetailQR({})).toBe(false);
      expect(isLegacyRetailQR([])).toBe(false);
    });

    it("should return true for EMV QR codes (starting with 000201)", () => {
      expect(isLegacyRetailQR("000201")).toBe(true);
      expect(
        isLegacyRetailQR(
          "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C"
        )
      ).toBe(true);
    });

    it("should return false for non-EMV codes", () => {
      expect(isLegacyRetailQR("00020")).toBe(false);
      expect(isLegacyRetailQR("lnbc1234567890")).toBe(false);
      expect(isLegacyRetailQR("cashuA123456")).toBe(false);
    });

    it("should handle whitespace", () => {
      expect(isLegacyRetailQR("  000201  ")).toBe(true);
    });
  });

  describe("translateLegacyQRToLightningAddress", () => {
    it("should convert PicknPay EMV QR code", () => {
      const qr =
        "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C";
      expect(translateLegacyQRToLightningAddress(qr)).toBe(
        `${qr}@cryptoqr.net`
      );
    });

    it("should convert Ecentric EMV QR code", () => {
      const qr =
        "00020129530019za.co.ecentric.payment0122RD2HAK3KTI53EC/confirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2";
      // slash is URL-encoded as %2F
      expect(translateLegacyQRToLightningAddress(qr)).toBe(
        "00020129530019za.co.ecentric.payment0122RD2HAK3KTI53EC%2Fconfirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2@cryptoqr.net"
      );
    });

    it("should return null for non-EMV codes", () => {
      expect(translateLegacyQRToLightningAddress("lnbc123")).toBeNull();
    });

    it("should return null for unsupported merchants", () => {
      expect(
        translateLegacyQRToLightningAddress(
          "00020129530023other.merchant.code0122test"
        )
      ).toBeNull();
    });
  });
});
