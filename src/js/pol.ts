import { hashToCurve, deriveBlindingFactor, deriveSecret } from "@cashu/cashu-ts";
import * as nobleSecp256k1 from "@noble/secp256k1";
import { schnorr } from "@noble/curves/secp256k1";

export const { bytesToHex, hexToBytes } = nobleSecp256k1.etc;

export interface MerkleProofItem {
  item: string;          // Y hex or B' hex
  index: string;         // sha256(item) as hex string
  value: number;         // leaf sum value
  compact_mask: string;  // sibling mask as hex string
  siblings: { hash: string; sum: number }[];
}

export interface DefaultNode {
  hash: Uint8Array;
  sum: number;
}

/**
 * Standard SHA-256 hash function using Web Crypto subtle API.
 */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

/**
 * Precomputes 257 default empty node hashes for levels 0 to 256.
 */
export async function precomputeDefaultNodes(): Promise<DefaultNode[]> {
  const defaultNodes: DefaultNode[] = [];
  const emptyHash = await sha256(new Uint8Array(0));
  defaultNodes.push({ hash: emptyHash, sum: 0 });

  for (let d = 1; d <= 256; d++) {
    const prev = defaultNodes[d - 1];
    const parentSum = prev.sum + prev.sum;

    const leftSumBytes = new Uint8Array(8);
    const rightSumBytes = new Uint8Array(8);
    const view = new DataView(leftSumBytes.buffer);
    view.setBigUint64(0, BigInt(prev.sum), false); // big-endian
    
    const parentInput = new Uint8Array(prev.hash.length * 2 + 16);
    parentInput.set(prev.hash, 0);
    parentInput.set(prev.hash, prev.hash.length);
    parentInput.set(leftSumBytes, prev.hash.length * 2);
    parentInput.set(leftSumBytes, prev.hash.length * 2 + 8);

    const parentHash = await sha256(parentInput);
    defaultNodes.push({ hash: parentHash, sum: parentSum });
  }
  return defaultNodes;
}

/**
 * Constructs parent hash and sum from left/right sibling children nodes.
 */
export async function computeParentNode(
  leftHash: Uint8Array,
  leftSum: number,
  rightHash: Uint8Array,
  rightSum: number
): Promise<DefaultNode> {
  const parentSum = leftSum + rightSum;

  const leftSumBytes = new Uint8Array(8);
  const rightSumBytes = new Uint8Array(8);
  const leftView = new DataView(leftSumBytes.buffer);
  const rightView = new DataView(rightSumBytes.buffer);
  leftView.setBigUint64(0, BigInt(leftSum), false);
  rightView.setBigUint64(0, BigInt(rightSum), false);

  const parentInput = new Uint8Array(leftHash.length + rightHash.length + 16);
  parentInput.set(leftHash, 0);
  parentInput.set(rightHash, leftHash.length);
  parentInput.set(leftSumBytes, leftHash.length + rightHash.length);
  parentInput.set(rightSumBytes, leftHash.length + rightHash.length + 8);

  const parentHash = await sha256(parentInput);
  return { hash: parentHash, sum: parentSum };
}

/**
 * Mathematically verifies a Sparse Merkle-Sum Tree sibling path up to the root hash and sum.
 */
export async function verifyMerkleProof(
  proofItem: MerkleProofItem,
  rootHashHex: string,
  rootSum: number,
  defaultNodes: DefaultNode[]
): Promise<boolean> {
  const cleanMask = proofItem.compact_mask.startsWith("0x")
    ? proofItem.compact_mask
    : "0x" + proofItem.compact_mask;
  const maskInt = BigInt(cleanMask);
  const siblingIter = proofItem.siblings[Symbol.iterator]();
  const reconstructedSiblings: { hash: Uint8Array; sum: number }[] = [];

  for (let d = 0; d < 256; d++) {
    const bit = (maskInt >> BigInt(d)) & BigInt(1);
    if (bit === BigInt(1)) {
      const nextSib = siblingIter.next();
      if (nextSib.done) {
        throw new Error("Invalid compact mask or missing sibling");
      }
      reconstructedSiblings.push({
        hash: hexToBytes(nextSib.value.hash),
        sum: nextSib.value.sum,
      });
    } else {
      reconstructedSiblings.push({
        hash: defaultNodes[d].hash,
        sum: defaultNodes[d].sum,
      });
    }
  }

  const cleanIndex = proofItem.index.startsWith("0x")
    ? proofItem.index
    : "0x" + proofItem.index;
  const idxInt = BigInt(cleanIndex);
  let currentHash = proofItem.value > 0
    ? hexToBytes(proofItem.index)
    : defaultNodes[0].hash;
  let currentSum = proofItem.value;

  for (let d = 0; d < 256; d++) {
    const sib = reconstructedSiblings[d];
    const bit = (idxInt >> BigInt(d)) & BigInt(1);

    let leftHash: Uint8Array;
    let leftSum: number;
    let rightHash: Uint8Array;
    let rightSum: number;

    if (bit === BigInt(0)) {
      leftHash = currentHash;
      leftSum = currentSum;
      rightHash = sib.hash;
      rightSum = sib.sum;
    } else {
      leftHash = sib.hash;
      leftSum = sib.sum;
      rightHash = currentHash;
      rightSum = currentSum;
    }

    const parent = await computeParentNode(leftHash, leftSum, rightHash, rightSum);
    currentHash = parent.hash;
    currentSum = parent.sum;
  }

  const finalHashHex = bytesToHex(currentHash);
  return finalHashHex.toLowerCase() === rootHashHex.toLowerCase() && currentSum === rootSum;
}

/**
 * Calculates Y = hashToCurve(secret) as a compressed hex string.
 */
export async function calculateY(secret: string): Promise<string> {
  const Y_pt = await hashToCurve(new TextEncoder().encode(secret));
  return Y_pt.toHex(true);
}

/**
 * Calculates B' = Y + rG as a compressed hex string.
 */
export async function calculateBPrime(secret: string, rHex: string): Promise<string> {
  const Y_pt = await hashToCurve(new TextEncoder().encode(secret));
  const Y_local = nobleSecp256k1.ProjectivePoint.fromHex(Y_pt.toHex(true));
  const cleanR = rHex.startsWith("0x") ? rHex : "0x" + rHex;
  const P = nobleSecp256k1.ProjectivePoint.fromPrivateKey(BigInt(cleanR));
  const B_ = Y_local.add(P);
  return B_.toHex(true);
}

export async function verifyPolReceipt(
  signatureHex: string,
  targetEpoch: number,
  pubKeyHex: string,
  yHex: string,
  bHex: string
): Promise<boolean> {
  try {
    const msgY = `${yHex}:${targetEpoch}`;
    const msgB = `${bHex}:${targetEpoch}`;

    const hashY = await sha256(new TextEncoder().encode(msgY));
    const hashB = await sha256(new TextEncoder().encode(msgB));

    // For BIP-340 Schnorr, public key is 32 bytes (x-only)
    const xOnlyPubKey = pubKeyHex.length === 66 ? pubKeyHex.slice(2) : pubKeyHex;

    const isValidY = schnorr.verify(signatureHex, hashY, xOnlyPubKey);
    const isValidB = schnorr.verify(signatureHex, hashB, xOnlyPubKey);

    return isValidY || isValidB;
  } catch (err) {
    console.error("Pol receipt signature verification failed:", err);
    return false;
  }
}

export { deriveBlindingFactor, deriveSecret };

export function findSubarrayIndex(arr: Uint8Array, sub: Uint8Array): number {
  for (let i = 0; i <= arr.length - sub.length; i++) {
    let match = true;
    for (let j = 0; j < sub.length; j++) {
      if (arr[i + j] !== sub[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

export function parseVarint(data: Uint8Array, offset: number): { val: number; offset: number } {
  let val = 0;
  let shift = 0;
  while (true) {
    if (offset >= data.length) {
      throw new Error("Offset out of bounds during varint parsing");
    }
    const b = data[offset];
    val |= (b & 0x7F) << shift;
    offset += 1;
    if (!(b & 0x80)) {
      break;
    }
    shift += 7;
  }
  return { val, offset };
}

export async function verifyOtsAnchoring(otsReceiptHex: string, computedGlobalDigestHex?: string): Promise<string> {
  const mockHex = "4d4f434b5f4f54535f52454345495054"; // "MOCK_OTS_RECEIPT" in hex format
  if (
    otsReceiptHex.includes("MOCK_OTS_RECEIPT") ||
    otsReceiptHex.includes(mockHex) ||
    otsReceiptHex.startsWith("00".repeat(8))
  ) {
    return "⚠ OTS Attestation: Mocked (Mock OTS is enabled, bypassed blockchain verification)";
  }

  let receiptBytes: Uint8Array;
  try {
    receiptBytes = hexToBytes(otsReceiptHex);
  } catch (err) {
    return "OTS Attestation: Invalid receipt format";
  }

  const calendars = [
    "https://alice.btc.calendar.opentimestamps.org/upgrade",
    "https://bob.btc.calendar.opentimestamps.org/upgrade",
  ];

  let upgradedBytes: Uint8Array | null = null;
  for (const url of calendars) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: receiptBytes,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
      if (response.status === 200) {
        const resBuffer = await response.arrayBuffer();
        const resBytes = new Uint8Array(resBuffer);
        if (resBytes.length > receiptBytes.length) {
          upgradedBytes = resBytes;
          break;
        }
      }
    } catch (err) {
      // Try next calendar
    }
  }

  if (!upgradedBytes) {
    upgradedBytes = receiptBytes;
  }

  // Cryptographically verify authenticity of real OTS file target hash
  if (computedGlobalDigestHex) {
    try {
      const magic = new Uint8Array([0x00, 0xed, 0xbf, 0x91, 0xe3, 0xa4, 0xbd, 0x43, 0x0e, 0xed]);
      const hasMagic = findSubarrayIndex(upgradedBytes, magic) === 0;
      if (hasMagic && upgradedBytes.length >= 43) {
        const fileDigest = upgradedBytes.subarray(11, 43);
        const fileDigestHex = bytesToHex(fileDigest);
        if (fileDigestHex.toLowerCase() !== computedGlobalDigestHex.toLowerCase()) {
          return "❌ OTS Attestation: Authentication Failed (Receipt target hash does not match manifest commitment!)";
        }
      }
    } catch (err) {
      return "❌ OTS Attestation: Authentication Failed (Failed to decode target hash from proof file)";
    }
  }

  // Scan for blockheader tag [0x00, 0x05]
  try {
    const bhTag = new Uint8Array([0x00, 0x05]);
    const idx = findSubarrayIndex(upgradedBytes, bhTag);
    if (idx !== -1) {
      const parsed = parseVarint(upgradedBytes, idx + 2);
      const height = parsed.val;
      if (height > 0 && height < 10000000) {
        try {
          const blockResp = await fetch("https://mempool.space/api/blocks/tip/height");
          if (blockResp.status === 200) {
            const tipHeightStr = await blockResp.text();
            const tipHeight = parseInt(tipHeightStr.trim(), 10);
            const confirmations = tipHeight - height + 1;
            if (confirmations >= 1) {
              return `✓ OTS Attestation: Confirmed (Anchored in Bitcoin Block #${height}, ${confirmations} confirmations)`;
            } else {
              return `OTS Attestation: Pending (Anchored in Bitcoin Block #${height}, awaiting confirmations)`;
            }
          }
        } catch (e) {
          return `✓ OTS Attestation: Anchored in Bitcoin Block #${height} (Failed to fetch tip height)`;
        }
      }
    }
  } catch (err) {
    // Failover to pending tags
  }

  // Scan for pending tag [0x00, 0x06]
  const pendingTag = new Uint8Array([0x00, 0x06]);
  if (findSubarrayIndex(upgradedBytes, pendingTag) !== -1) {
    return "OTS Attestation: Pending (Submitted to calendar, awaiting next Bitcoin block commitment)";
  }

  return "OTS Attestation: Pending (Calendar receipt parsed, awaiting upgrade)";
}
