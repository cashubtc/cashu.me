import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useP2PKStore } from "../p2pk";

// Mock dependencies
vi.mock("src/js/token", () => ({
  default: {
    decode: vi.fn(),
    getProofs: vi.fn(),
  },
}));

describe("useP2PKStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  describe("isValidPubkey", () => {
    it("should validate hex pubkey", () => {
      const store = useP2PKStore();
      const validHex = "02" + "a".repeat(64);
      expect(store.isValidPubkey(validHex)).toBe(true);
    });

    it("should return false for invalid pubkey", () => {
      const store = useP2PKStore();
      expect(store.isValidPubkey("invalid")).toBe(false);
      expect(store.isValidPubkey("02" + "a".repeat(63))).toBe(false);
    });
  });

  describe("getSecretP2PKPubkey", () => {
    it("should extract pubkey from basic P2PK secret", () => {
      const store = useP2PKStore();
      const pubkey = "02" + "a".repeat(64);
      const secret = JSON.stringify([
        "P2PK",
        { data: pubkey, nonce: "123", tags: [] },
      ]);

      expect(store.getSecretP2PKPubkey(secret)).toBe(pubkey);
    });

    it("should handle locktime in future (locked)", () => {
      const store = useP2PKStore();
      const pubkey = "02" + "a".repeat(64);
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const secret = JSON.stringify([
        "P2PK",
        {
          data: pubkey,
          nonce: "123",
          tags: [["locktime", futureTime.toString()]],
        },
      ]);

      expect(store.getSecretP2PKPubkey(secret)).toBe(pubkey);
    });

    it("should handle locktime in past (unlocked/refund)", () => {
      const store = useP2PKStore();
      const pubkey = "02" + "a".repeat(64);
      const refundKey = "02" + "b".repeat(64);
      const pastTime = Math.floor(Date.now() / 1000) - 3600;

      // Setup store with refund key
      store.p2pkKeys = [
        { publicKey: refundKey, privateKey: "", used: false, usedCount: 0 },
      ];

      const secret = JSON.stringify([
        "P2PK",
        {
          data: pubkey,
          nonce: "123",
          tags: [
            ["locktime", pastTime.toString()],
            ["refund", refundKey],
          ],
        },
      ]);

      // Should return refund key because we own it and lock expired
      expect(store.getSecretP2PKPubkey(secret)).toBe(refundKey);
    });

    it("should return empty string for non-P2PK secret", () => {
      const store = useP2PKStore();
      expect(store.getSecretP2PKPubkey("simple_secret")).toBe("");
      expect(store.getSecretP2PKPubkey(JSON.stringify(["P2SH", {}]))).toBe("");
    });
  });

  describe("isLockedToUs", () => {
    it("should return true if locked to our key", () => {
      const store = useP2PKStore();
      const pubkey = "02" + "a".repeat(64);
      store.p2pkKeys = [
        { publicKey: pubkey, privateKey: "", used: false, usedCount: 0 },
      ];

      const secret = JSON.stringify([
        "P2PK",
        { data: pubkey, nonce: "123", tags: [] },
      ]);
      const proofs = [{ secret, amount: 10, C: "C", id: "id" }];

      expect(store.isLockedToUs(proofs as any)).toBe(true);
    });

    it("should return false if locked to other key", () => {
      const store = useP2PKStore();
      const pubkey = "02" + "a".repeat(64);
      const otherKey = "02" + "b".repeat(64);
      store.p2pkKeys = [
        { publicKey: pubkey, privateKey: "", used: false, usedCount: 0 },
      ];

      const secret = JSON.stringify([
        "P2PK",
        { data: otherKey, nonce: "123", tags: [] },
      ]);
      const proofs = [{ secret, amount: 10, C: "C", id: "id" }];

      expect(store.isLockedToUs(proofs as any)).toBe(false);
    });
  });
});
