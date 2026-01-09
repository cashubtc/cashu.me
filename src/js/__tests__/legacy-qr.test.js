import { describe, expect, it } from "vitest";
import {
  isLegacyRetailQR,
  translateLegacyQRToLightningAddress,
  convertMerchantQRToLightningAddress,
} from "../legacy-qr";

describe("legacy-qr", () => {
  describe("isLegacyRetailQR", () => {
    it("should return false for null or undefined", () => {
      expect(isLegacyRetailQR(null)).toBe(false);
      expect(isLegacyRetailQR(undefined)).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isLegacyRetailQR(123)).toBe(false);
      expect(isLegacyRetailQR({})).toBe(false);
      expect(isLegacyRetailQR([])).toBe(false);
    });

    it("should return true for EMV QR codes (starting with 000201)", () => {
      // Test EMV QR code from PicknPay (test environment)
      const testEMVCode = "00020129530023za.co.electrum.picknpay0122RD2HAK3KTI53EC/confirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2";
      expect(isLegacyRetailQR(testEMVCode)).toBe(true);

      // Production EMV QR code
      const prodEMVCode = "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C";
      expect(isLegacyRetailQR(prodEMVCode)).toBe(true);

      // Test environment EMV QR code
      const testEnvEMVCode = "00020126260008za.co.mp0110628654976427530023za.co.electrum.picknpay0122a/r4RBWjSNGflZtjFg4VJQ530371054041.2363044A53";
      expect(isLegacyRetailQR(testEnvEMVCode)).toBe(true);
    });

    it("should return true for codes starting with 000201", () => {
      expect(isLegacyRetailQR("000201")).toBe(true); // Even short EMV codes are valid
      expect(isLegacyRetailQR("000201123")).toBe(true);
    });

    it("should return false for codes not starting with 000201", () => {
      expect(isLegacyRetailQR("00020")).toBe(false); // Not starting with 000201
      expect(isLegacyRetailQR("123456")).toBe(false);
      expect(isLegacyRetailQR("lnbc1234567890")).toBe(false);
      expect(isLegacyRetailQR("lightning:lnbc1234567890")).toBe(false);
      expect(isLegacyRetailQR("LNURL1ABCDEF")).toBe(false);
      expect(isLegacyRetailQR("lnurl1ABCDEF")).toBe(false);
      expect(isLegacyRetailQR("bitcoin:123?lightning=lnbc123")).toBe(false);
      expect(isLegacyRetailQR("cashuA123456")).toBe(false);
      expect(isLegacyRetailQR("cashuB123456")).toBe(false);
      expect(isLegacyRetailQR("creqA123456")).toBe(false);
      expect(isLegacyRetailQR("http://example.com")).toBe(false);
      expect(isLegacyRetailQR("https://example.com")).toBe(false);
    });

    it("should handle whitespace correctly", () => {
      expect(isLegacyRetailQR("  000201  ")).toBe(true); // trimmed
      expect(isLegacyRetailQR("  00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C  ")).toBe(true); // trimmed
    });
  });

  describe("convertMerchantQRToLightningAddress", () => {
    it("should convert PicknPay EMV QR code on mainnet", () => {
      const qrContent = "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C";
      const result = convertMerchantQRToLightningAddress(qrContent, "mainnet");
      expect(result).toBe(
        "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C@cryptoqr.net"
      );
    });

    it("should convert PicknPay EMV QR code on signet", () => {
      const qrContent = "00020126260008za.co.mp0110628654976427530023za.co.electrum.picknpay0122a/r4RBWjSNGflZtjFg4VJQ530371054041.2363044A53";
      const result = convertMerchantQRToLightningAddress(qrContent, "signet");
      expect(result).toBe(
        "00020126260008za.co.mp0110628654976427530023za.co.electrum.picknpay0122a%2Fr4RBWjSNGflZtjFg4VJQ530371054041.2363044A53@staging.cryptoqr.net"
      );
    });

    it("should convert Ecentric EMV QR code on mainnet", () => {
      const qrContent = "00020129530019za.co.ecentric.payment0122RD2HAK3KTI53EC/confirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2";
      const result = convertMerchantQRToLightningAddress(qrContent, "mainnet");
      expect(result).toBe(
        "00020129530019za.co.ecentric.payment0122RD2HAK3KTI53EC%2Fconfirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2@cryptoqr.net"
      );
    });

    it("should return null for non-matching merchant", () => {
      const qrContent = "00020129530023other.merchant.code0122RD2HAK3KTI53EC/confirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2";
      const result = convertMerchantQRToLightningAddress(qrContent, "mainnet");
      expect(result).toBeNull();
    });

    it("should return null for empty QR content", () => {
      expect(convertMerchantQRToLightningAddress("", "mainnet")).toBeNull();
      expect(convertMerchantQRToLightningAddress(null, "mainnet")).toBeNull();
    });

    it("should handle URL-unsafe characters", () => {
      const qrContent = "00020129530023za.co.electrum.picknpay0122RD2HAK3KTI53EC/confirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2";
      const result = convertMerchantQRToLightningAddress(qrContent, "mainnet");
      expect(result).toContain("@cryptoqr.net");
      expect(result).toContain("%2F"); // Encoded forward slash
    });
  });

  describe("translateLegacyQRToLightningAddress", () => {
    it("should return null for invalid legacy QR code format", () => {
      expect(translateLegacyQRToLightningAddress("lnbc123")).toBeNull();
    });

    it("should convert EMV QR code to Lightning Address", () => {
      const emvQRCode = "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C";
      const result = translateLegacyQRToLightningAddress(emvQRCode);
      expect(result).toBe(
        "00020126260008za.co.mp0110248723666427530023za.co.electrum.picknpay0122ydgKJviKSomaVw0297RaZw5303710540571.406304CE9C@cryptoqr.net"
      );
    });


    it("should return null for unsupported merchant QR codes", () => {
      const unsupportedQR = "00020129530023other.merchant.code0122RD2HAK3KTI53EC/confirm520458125303710540115802ZA5916cryptoqrtestscan6002CT63049BE2";
      expect(translateLegacyQRToLightningAddress(unsupportedQR)).toBeNull();
    });

    it("should use provided network parameter", () => {
      const qrContent = "00020126260008za.co.mp0110628654976427530023za.co.electrum.picknpay0122a/r4RBWjSNGflZtjFg4VJQ530371054041.2363044A53";
      const result = translateLegacyQRToLightningAddress(qrContent, "signet");
      expect(result).toContain("@staging.cryptoqr.net");
    });
  });
});
