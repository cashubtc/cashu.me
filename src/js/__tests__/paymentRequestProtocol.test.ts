import { describe, expect, it } from "vitest";
import {
  Amount,
  JSONInt,
  PaymentRequest,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import {
  finalizeEvent,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  nip19,
  nip44,
} from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import {
  assertRequestSupported,
  decodeGiftWrap,
  decodePaymentPayload,
  encodeGiftWrap,
  payloadIdentity,
  normalizeRelayUrls,
  MAX_PAYMENT_MESSAGE_BYTES,
} from "src/js/paymentRequestProtocol";

const alice = generateSecretKey();
const bob = generateSecretKey();
const recipient = getPublicKey(bob);
const payload = () => ({
  id: "request",
  mint: "https://mint.example",
  unit: "sat",
  proofs: [
    {
      id: "0011223344556677",
      secret: "test-proof",
      C: "02" + getPublicKey(alice),
      amount: 21,
    },
  ],
});
const transport = [
  {
    type: PaymentRequestTransportType.NOSTR,
    target: nip19.nprofileEncode({
      pubkey: recipient,
      relays: ["wss://relay.example"],
    }),
    tags: [["n", "17"]],
  },
];

function wrapRumor(
  overrides: Record<string, unknown>,
  sealOverrides: Record<string, unknown> = {}
) {
  const rumor = {
    kind: 14,
    created_at: 1,
    pubkey: getPublicKey(alice),
    tags: [["p", recipient]],
    content: JSONInt.stringify(payload())!,
    ...overrides,
  };
  const content = JSON.stringify({
    ...rumor,
    id: getEventHash(rumor as any),
    ...("id" in overrides ? { id: overrides.id } : {}),
  });
  const seal = finalizeEvent(
    {
      kind: 13,
      tags: [],
      created_at: 1,
      content: nip44.v2.encrypt(
        content,
        nip44.v2.utils.getConversationKey(bytesToHex(alice), recipient)
      ),
      ...sealOverrides,
    },
    alice
  );
  const ephemeral = generateSecretKey();
  return finalizeEvent(
    {
      kind: 1059,
      tags: [["p", recipient]],
      created_at: 1,
      content: nip44.v2.encrypt(
        JSON.stringify(seal),
        nip44.v2.utils.getConversationKey(bytesToHex(ephemeral), recipient)
      ),
    },
    ephemeral
  );
}

describe("Nostr payment protocol", () => {
  it("round-trips real signed envelopes with an intentionally unsigned rumor", () => {
    const message = JSONInt.stringify(payload())!;
    expect(
      decodeGiftWrap(encodeGiftWrap(message, alice, recipient), bob)
    ).toEqual({ content: message, sender: getPublicKey(alice) });
  });
  it("accepts an independently assembled historical envelope without an age cutoff", () => {
    expect(decodeGiftWrap(wrapRumor({}), bob).sender).toBe(getPublicKey(alice));
  });
  it.each([
    { pubkey: recipient },
    { kind: 1 },
    { tags: [["p", getPublicKey(alice)]] },
    { id: "f".repeat(64) },
    { sig: "f".repeat(128) },
  ])("rejects malformed or unauthenticated rumor %j", (overrides) => {
    expect(() => decodeGiftWrap(wrapRumor(overrides), bob)).toThrow();
  });
  it.each([{ kind: 14 }, { tags: [["p", recipient]] }])(
    "rejects invalid seal %j",
    (overrides) => {
      expect(() => decodeGiftWrap(wrapRumor({}, overrides), bob)).toThrow();
    }
  );
  it("rejects invalid wrapper signatures and wrong recipient keys", () => {
    const event = encodeGiftWrap("hello", alice, recipient);
    expect(() =>
      decodeGiftWrap({ ...event, sig: "0".repeat(128) }, bob)
    ).toThrow();
    expect(() => decodeGiftWrap(event, alice)).toThrow();
  });
  it("rejects oversize messages before encryption", () => {
    expect(() =>
      encodeGiftWrap(
        "a".repeat(MAX_PAYMENT_MESSAGE_BYTES + 1),
        alice,
        recipient
      )
    ).toThrow("too large");
  });
  it("keeps large integer payload amounts exact", () => {
    const decoded = decodePaymentPayload(
      JSONInt.stringify({
        ...payload(),
        proofs: [{ ...payload().proofs[0], amount: 9007199254740993n }],
      })!
    );
    expect(decoded.proofs[0].amount.toBigInt()).toBe(9007199254740993n);
  });
  it.each([
    null,
    [],
    {},
    { ...payload(), unit: "" },
    { ...payload(), proofs: [] },
    { ...payload(), proofs: [payload().proofs[0], payload().proofs[0]] },
    { ...payload(), proofs: [{ ...payload().proofs[0], amount: "21" }] },
  ])("rejects malformed payload %j", (value) => {
    expect(() => decodePaymentPayload(JSON.stringify(value))).toThrow();
  });
  it("deduplicates value independently of request ID, memo, ordering and amount claims", () => {
    const a = decodePaymentPayload(JSON.stringify(payload()));
    const b = {
      ...a,
      id: "other",
      memo: "changed",
      proofs: a.proofs.map((proof) => ({ ...proof, amount: Amount.from(42) })),
    };
    expect(payloadIdentity(a)).toBe(payloadIdentity(b));
  });
  it("does not silently downgrade unsupported NIPs or locks", () => {
    expect(() =>
      assertRequestSupported(
        new PaymentRequest({
          transport: [{ ...transport[0], tags: [["n", "4"]] }],
        })
      )
    ).toThrow("No supported");
    expect(() =>
      assertRequestSupported(
        new PaymentRequest({
          transport,
          nut10: { kind: "DLC", data: "unsupported" },
        })
      )
    ).toThrow("Unsupported");
  });
  it("round-trips mint preferences and method fees in both request encodings", () => {
    const request = new PaymentRequest({
      transport,
      id: "id",
      amount: 21,
      unit: "sat",
      mints: ["https://mint.example"],
      mintsPreferred: true,
      supportedMethods: [{ method: "bolt11", fee: 3 }],
    });
    for (const encoded of [
      request.toEncodedCreqA(),
      request.toEncodedCreqB(),
    ]) {
      const decoded = PaymentRequest.fromEncodedRequest(encoded);
      expect(decoded.isMintListStrict).toBe(false);
      expect(decoded.supportedMethods?.[0].fee?.toNumber()).toBe(3);
    }
  });
  it("permits local test relays but rejects insecure remote relays and credentials", () => {
    expect(
      normalizeRelayUrls(["ws://127.0.0.1:7777", "wss://relay.example/"])
    ).toHaveLength(2);
    expect(() => normalizeRelayUrls(["ws://relay.example"])).toThrow();
    expect(() =>
      normalizeRelayUrls(["wss://user:secret@relay.example"])
    ).toThrow();
  });
});
