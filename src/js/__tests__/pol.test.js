import { describe, expect, it } from "vitest";
import { schnorr } from "@noble/curves/secp256k1";
import {
  sha256,
  precomputeDefaultNodes,
  computeParentNode,
  verifyMerkleProof,
  calculateY,
  calculateBPrime,
  verifyPolReceipt,
  verifyManifestSignature,
  bytesToHex,
  hexToBytes,
} from "../pol";

describe("Proof of Liabilities (PoL) Cryptography & Verification", () => {
  it("should calculate correct SHA-256 hash", async () => {
    const input = new TextEncoder().encode("cashu");
    const hash = await sha256(input);
    expect(bytesToHex(hash)).toBe("cd7f5bf5797081fff952172eb5d310cf1ecab25a8223d46ef4d41a6ea86e2fdd");
  });

  it("should precompute default empty nodes correctly with 257 levels", async () => {
    const defaultNodes = await precomputeDefaultNodes();
    expect(defaultNodes).toHaveLength(257);
    expect(defaultNodes[0].sum).toBe(0);
    // Level 0 hash is SHA256("")
    const emptyHash = await sha256(new Uint8Array(0));
    expect(bytesToHex(defaultNodes[0].hash)).toBe(bytesToHex(emptyHash));
    
    // Sums at all empty levels must be 0
    expect(defaultNodes[1].sum).toBe(0);
    expect(defaultNodes[256].sum).toBe(0);
  });

  it("should compute correct parent node hashes and sums", async () => {
    const leftHash = await sha256(new TextEncoder().encode("left"));
    const rightHash = await sha256(new TextEncoder().encode("right"));
    const parent = await computeParentNode(leftHash, 100, rightHash, 200);

    expect(parent.sum).toBe(300);
    expect(parent.hash).toBeInstanceOf(Uint8Array);
    expect(parent.hash).toHaveLength(32);
  });

  describe("verifyMerkleProof with Index Integrity", () => {
    it("should fail Merkle proof verification if index does not match SHA256 of item", async () => {
      const defaultNodes = await precomputeDefaultNodes();
      
      const proofItem = {
        item: "02b1a0000000000000000000000000000000000000000000000000000000000001",
        index: "8a31000000000000000000000000000000000000000000000000000000000002", // mismatched index
        value: 1000,
        compact_mask: "0x0000000000000000000000000000000000000000000000000000000000000000",
        siblings: []
      };

      await expect(
        verifyMerkleProof(proofItem, "some_root_hash", 1000, defaultNodes)
      ).rejects.toThrow("Leaf index integrity check failed");
    });

    it("should successfully verify Merkle proof for empty leaves if index matches item", async () => {
      const defaultNodes = await precomputeDefaultNodes();
      const item = "02b1a0000000000000000000000000000000000000000000000000000000000001";
      const indexBytes = await sha256(new TextEncoder().encode(item));
      const indexHex = bytesToHex(indexBytes);

      // Let's walk an empty leaf (value = 0) with all siblings empty
      const proofItem = {
        item,
        index: indexHex,
        value: 0,
        compact_mask: "0x0",
        siblings: []
      };

      // Root of an all-empty tree is defaultNodes[256]
      const rootHashHex = bytesToHex(defaultNodes[256].hash);
      const rootSum = defaultNodes[256].sum; // 0

      const isValid = await verifyMerkleProof(proofItem, rootHashHex, rootSum, defaultNodes);
      expect(isValid).toBe(true);
    });
  });

  describe("calculateY and calculateBPrime", () => {
    it("should calculate Y correctly from secret", async () => {
      const secret = "my_secret_token";
      const yHex = await calculateY(secret);
      expect(yHex).toHaveLength(66); // compressed public key is 33 bytes / 66 hex characters
      expect(yHex.startsWith("02") || yHex.startsWith("03")).toBe(true);
    });

    it("should calculate B' correctly from secret and blinding factor r", async () => {
      const secret = "my_secret_token";
      // 32-byte hex string for private key / blinding factor r
      const rHex = "0000000000000000000000000000000000000000000000000000000000000005";
      const bPrimeHex = await calculateBPrime(secret, rHex);
      expect(bPrimeHex).toHaveLength(66);
    });
  });

  describe("verifyPolReceipt", () => {
    it("should verify standard BIP-340 Schnorr PoL receipt signatures", async () => {
      // 1. Generate keys
      const privKey = schnorr.utils.randomPrivateKey();
      const pubKey = schnorr.getPublicKey(privKey);
      const pubKeyHex = bytesToHex(pubKey);

      const yHex = "02b1a0000000000000000000000000000000000000000000000000000000000001";
      const bHex = "03c1b0000000000000000000000000000000000000000000000000000000000002";
      const targetEpoch = 12;

      // 2. Sign for Y_hex:target_epoch
      const msgY = `${yHex}:${targetEpoch}`;
      const hashY = await sha256(new TextEncoder().encode(msgY));
      const signatureHex = bytesToHex(schnorr.sign(hashY, privKey));

      // 3. Verify standard BIP-340 validation succeeds
      const isValid = await verifyPolReceipt(signatureHex, targetEpoch, pubKeyHex, yHex, bHex);
      expect(isValid).toBe(true);
    });

    it("should fail validation for incorrect target epoch or signatures", async () => {
      const privKey = schnorr.utils.randomPrivateKey();
      const pubKey = schnorr.getPublicKey(privKey);
      const pubKeyHex = bytesToHex(pubKey);

      const yHex = "02b1a0000000000000000000000000000000000000000000000000000000000001";
      const bHex = "03c1b0000000000000000000000000000000000000000000000000000000000002";

      const msgY = `${yHex}:12`;
      const hashY = await sha256(new TextEncoder().encode(msgY));
      const signatureHex = bytesToHex(schnorr.sign(hashY, privKey));

      // Verification fails if checking incorrect epoch 13
      const isValidWrongEpoch = await verifyPolReceipt(signatureHex, 13, pubKeyHex, yHex, bHex);
      expect(isValidWrongEpoch).toBe(false);
    });
  });

  describe("verifyManifestSignature", () => {
    it("should verify epoch manifest signatures successfully", async () => {
      const privKey = schnorr.utils.randomPrivateKey();
      const pubKey = schnorr.getPublicKey(privKey);
      const pubKeyHex = bytesToHex(pubKey);

      const manifest = {
        keyset_id: "009a6154b71113b7",
        epoch_index: 1,
        timestamp: "2026-06-11T12:00:00Z",
        root_issued: { hash: "8f3c55981223", sum: 1000000 },
        root_spent: { hash: "4d1a55981224", sum: 450000 },
        outstanding_balance: 550000,
        ots_receipt: "414243",
      };

      // Construct matching colon-separated manifest string to sign
      const msg = [
        manifest.keyset_id,
        manifest.epoch_index,
        manifest.timestamp,
        manifest.root_issued.hash,
        manifest.root_issued.sum,
        manifest.root_spent.hash,
        manifest.root_spent.sum,
        manifest.outstanding_balance,
        manifest.ots_receipt,
      ].join(":");

      const msgHash = await sha256(new TextEncoder().encode(msg));
      const signature = bytesToHex(schnorr.sign(msgHash, privKey));
      manifest.mint_signature = signature;

      const isManifestValid = await verifyManifestSignature(manifest, pubKeyHex);
      expect(isManifestValid).toBe(true);
    });

    it("should fail verification if any manifest fields have been modified", async () => {
      const privKey = schnorr.utils.randomPrivateKey();
      const pubKey = schnorr.getPublicKey(privKey);
      const pubKeyHex = bytesToHex(pubKey);

      const manifest = {
        keyset_id: "009a6154b71113b7",
        epoch_index: 1,
        timestamp: "2026-06-11T12:00:00Z",
        root_issued: { hash: "8f3c55981223", sum: 1000000 },
        root_spent: { hash: "4d1a55981224", sum: 450000 },
        outstanding_balance: 550000,
        ots_receipt: "414243",
      };

      const msg = [
        manifest.keyset_id,
        manifest.epoch_index,
        manifest.timestamp,
        manifest.root_issued.hash,
        manifest.root_issued.sum,
        manifest.root_spent.hash,
        manifest.root_spent.sum,
        manifest.outstanding_balance,
        manifest.ots_receipt,
      ].join(":");

      const msgHash = await sha256(new TextEncoder().encode(msg));
      const signature = bytesToHex(schnorr.sign(msgHash, privKey));
      manifest.mint_signature = signature;

      // Tamper with root sum
      manifest.root_issued.sum = 999999;

      const isManifestValid = await verifyManifestSignature(manifest, pubKeyHex);
      expect(isManifestValid).toBe(false);
    });
  });
});
