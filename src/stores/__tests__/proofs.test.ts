import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProofsStore } from "../proofs";
import { useMintsStore } from "../mints";
import { cashuDb } from "../dexie";
import { WalletProof } from "../mints";

describe("useProofsStore", () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    await cashuDb.proofs.clear();

    // Mock useMintsStore for serializeProofs
    const mintStore = useMintsStore();
    mintStore.mints = [
      {
        url: "https://mint.test",
        keysets: [{ id: "00abcdef12345678", unit: "sat", active: true }],
        keys: [],
      } as any,
    ];
  });

  const mockProof1: WalletProof = {
    id: "00abcdef12345678",
    amount: 10,
    secret: "secret1",
    C: "C1",
    reserved: false,
  };

  const mockProof2: WalletProof = {
    id: "00abcdef12345678",
    amount: 20,
    secret: "secret2",
    C: "C2",
    reserved: false,
  };

  const mockProofReserved: WalletProof = {
    id: "00abcdef12345678",
    amount: 5,
    secret: "secret3",
    C: "C3",
    reserved: true,
  };

  describe("sumProofs", () => {
    it("should return correct sum", () => {
      const store = useProofsStore();
      expect(store.sumProofs([])).toBe(0);
      expect(store.sumProofs([mockProof1])).toBe(10);
      expect(store.sumProofs([mockProof1, mockProof2])).toBe(30);
    });

    it("should handle large integer amounts", () => {
      const store = useProofsStore();
      const largeProof1 = {
        ...mockProof1,
        amount: Number.MAX_SAFE_INTEGER - 10,
      };
      const largeProof2 = { ...mockProof2, amount: 10 };
      expect(store.sumProofs([largeProof1, largeProof2])).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });
  });

  describe("getUnreservedProofs", () => {
    it("should filter out reserved proofs", () => {
      const store = useProofsStore();
      const proofs = [mockProof1, mockProof2, mockProofReserved];
      const unreserved = store.getUnreservedProofs(proofs);
      expect(unreserved.length).toBe(2);
      expect(unreserved).toEqual(
        expect.arrayContaining([mockProof1, mockProof2])
      );
      expect(unreserved).not.toContainEqual(mockProofReserved);
    });
  });

  describe("serializeProofs", () => {
    it("should serialize proofs to V4 token correctly", () => {
      const store = useProofsStore();
      const token = store.serializeProofs([mockProof1]);
      expect(token).toContain("cashuB");
      // Basic validation that it produced a string
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(10);
    });

    it("should throw error if keyset not found", () => {
      const store = useProofsStore();
      const unknownProof = { ...mockProof1, id: "unknownKeyset" };
      expect(() => store.serializeProofs([unknownProof])).toThrow(
        "No keysets found for proofs"
      );
    });
  });

  describe("Dexie Operations", () => {
    it("addProofs should add proofs to DB", async () => {
      const store = useProofsStore();
      await store.addProofs([mockProof1]);

      const storedProofs = await cashuDb.proofs.toArray();
      expect(storedProofs.length).toBe(1);
      expect(storedProofs[0].secret).toBe(mockProof1.secret);
    });

    it("removeProofs should remove proofs from DB", async () => {
      const store = useProofsStore();
      await store.addProofs([mockProof1, mockProof2]);
      await store.removeProofs([mockProof1]);

      const storedProofs = await cashuDb.proofs.toArray();
      expect(storedProofs.length).toBe(1);
      expect(storedProofs[0].secret).toBe(mockProof2.secret);
    });

    it("setReserved should update reserved status and quote", async () => {
      const store = useProofsStore();
      await store.addProofs([mockProof1]);

      await store.setReserved([mockProof1], true, "quote123");

      const storedProofs = await cashuDb.proofs.toArray();
      expect(storedProofs[0].reserved).toBe(true);
      expect(storedProofs[0].quote).toBe("quote123");

      await store.setReserved([mockProof1], false);
      const updatedProofs = await cashuDb.proofs.toArray();
      expect(updatedProofs[0].reserved).toBe(false);
      expect(updatedProofs[0].quote).toBeUndefined();
    });

    it("getProofsForQuote should return proofs for specific quote", async () => {
      const store = useProofsStore();
      const p1 = { ...mockProof1 };
      const p2 = { ...mockProof2 };

      await store.addProofs([p1, p2]);
      await store.setReserved([p1], true, "quoteA");
      await store.setReserved([p2], true, "quoteB");

      const quoteAProofs = await store.getProofsForQuote("quoteA");
      expect(quoteAProofs.length).toBe(1);
      expect(quoteAProofs[0].secret).toBe(p1.secret);
    });
  });
});
