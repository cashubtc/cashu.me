import {
  Amount,
  PaymentRequest,
  type PaymentRequestPayload,
  type PaymentRequestTransport,
  type Proof,
} from "@cashu/cashu-ts";
import {
  finalizeEvent,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  nip19,
  nip44,
  verifyEvent,
  type Event,
} from "nostr-tools";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

// Two layers of encryption must each fit NIP-44's 65535-byte plaintext limit.
export const MAX_PAYMENT_MESSAGE_BYTES = 44000;
export const MAX_PAYMENT_PROOFS = 512;
export const MAX_ENVELOPE_BYTES = 128000;
export const RECOVERY_OVERLAP_SECONDS = 172800 + 300;

function verifyWireEvent(event: Event) {
  // nostr-tools caches verification on a symbol. Never trust a cached result on
  // a mutable event supplied by another part of the application.
  return verifyEvent({
    id: event.id,
    pubkey: event.pubkey,
    created_at: event.created_at,
    kind: event.kind,
    tags: event.tags,
    content: event.content,
    sig: event.sig,
  });
}

export function assertMessageSize(content: string) {
  if (new TextEncoder().encode(content).length > MAX_PAYMENT_MESSAGE_BYTES) {
    throw new Error(
      "Payment is too large for Nostr. Split it into smaller payments."
    );
  }
}

export function normalizeMintUrl(value: string): string {
  const url = new URL(value);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash ||
    url.search
  ) {
    throw new Error("Invalid mint URL");
  }
  return url.toString().replace(/\/+$/, "");
}

export function normalizeRelayUrls(values: string[]): string[] {
  return [
    ...new Set(
      values.map((value) => {
        const url = new URL(value);
        const local = ["localhost", "127.0.0.1", "[::1]"].includes(
          url.hostname
        );
        if (
          (url.protocol !== "wss:" && !(local && url.protocol === "ws:")) ||
          url.username ||
          url.password ||
          url.hash
        ) {
          throw new Error("Invalid Nostr relay URL");
        }
        return url.toString();
      })
    ),
  ];
}

export function decodeRecipient(target: string) {
  const decoded = nip19.decode(target);
  if (decoded.type !== "nprofile") throw new Error("Expected a Nostr nprofile");
  return {
    pubkey: decoded.data.pubkey,
    relays: normalizeRelayUrls(decoded.data.relays ?? []),
  };
}

export function selectPaymentTransport(
  request: PaymentRequest
): PaymentRequestTransport {
  const selected = request.transport?.find((transport) =>
    transport.type === "nostr"
      ? transport.tags?.some(
          (tag) => tag[0] === "n" && tag.slice(1).includes("17")
        )
      : transport.type === "post"
  );
  if (!selected)
    throw new Error(
      "No supported payment request transport (NIP-17 or HTTP POST)"
    );
  if (selected.type === "nostr") decodeRecipient(selected.target);
  else {
    const url = new URL(selected.target);
    if (
      url.protocol !== "https:" &&
      !(
        ["localhost", "127.0.0.1"].includes(url.hostname) &&
        url.protocol === "http:"
      )
    ) {
      throw new Error("Payment endpoint must use HTTPS");
    }
    if (url.username || url.password || url.hash)
      throw new Error("Invalid payment endpoint");
  }
  return selected;
}

export function assertRequestSupported(request: PaymentRequest) {
  selectPaymentTransport(request);
  if (
    (request.amount !== undefined || request.supportedMethods?.length) &&
    !request.unit
  ) {
    throw new Error("Payment request amount and methods require a unit");
  }
  if (request.amount !== undefined) assertSupportedAmount(request.amount);
  if (request.nut10 && !request.toP2PKOptions())
    throw new Error("Unsupported payment locking condition");
}

export function assertSupportedAmount(amount: Amount | number): number {
  const value = Amount.from(amount).toNumber();
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new Error("Amount must be a positive, safe integer in base units");
  return value;
}

export function encodeGiftWrap(
  content: string,
  senderKey: Uint8Array,
  recipient: string
): Event {
  assertMessageSize(content);
  const now = Math.floor(Date.now() / 1000);
  const randomTime = () => now - Math.floor(Math.random() * 172800);
  const rumor = {
    kind: 14,
    pubkey: getPublicKey(senderKey),
    created_at: now,
    tags: [["p", recipient]],
    content,
  };
  const seal = finalizeEvent(
    {
      kind: 13,
      tags: [],
      created_at: randomTime(),
      content: nip44.v2.encrypt(
        JSON.stringify({ ...rumor, id: getEventHash(rumor) }),
        nip44.v2.utils.getConversationKey(bytesToHex(senderKey), recipient)
      ),
    },
    senderKey
  );
  const wrapperKey = generateSecretKey();
  return finalizeEvent(
    {
      kind: 1059,
      tags: [["p", recipient]],
      created_at: randomTime(),
      content: nip44.v2.encrypt(
        JSON.stringify(seal),
        nip44.v2.utils.getConversationKey(bytesToHex(wrapperKey), recipient)
      ),
    },
    wrapperKey
  );
}

export function decodeGiftWrap(
  event: Event,
  recipientKey: Uint8Array
): { content: string; sender: string } {
  if (JSON.stringify(event).length > MAX_ENVELOPE_BYTES)
    throw new Error("Oversized Nostr envelope");
  const recipient = getPublicKey(recipientKey);
  if (
    event.kind !== 1059 ||
    !verifyWireEvent(event) ||
    !event.tags.some((tag) => tag[0] === "p" && tag[1] === recipient)
  ) {
    throw new Error("Invalid Nostr gift wrap");
  }
  const seal = JSON.parse(
    nip44.v2.decrypt(
      event.content,
      nip44.v2.utils.getConversationKey(bytesToHex(recipientKey), event.pubkey)
    )
  );
  if (seal.kind !== 13 || !verifyWireEvent(seal) || seal.tags.length !== 0)
    throw new Error("Invalid Nostr seal");
  const rumor = JSON.parse(
    nip44.v2.decrypt(
      seal.content,
      nip44.v2.utils.getConversationKey(bytesToHex(recipientKey), seal.pubkey)
    )
  );
  if (
    rumor.kind !== 14 ||
    rumor.sig !== undefined ||
    rumor.pubkey !== seal.pubkey ||
    rumor.id !== getEventHash(rumor) ||
    typeof rumor.content !== "string" ||
    !rumor.tags.some((tag: string[]) => tag[0] === "p" && tag[1] === recipient)
  ) {
    throw new Error("Invalid Nostr payment rumor");
  }
  assertMessageSize(rumor.content);
  return { content: rumor.content, sender: rumor.pubkey };
}

export function decodePaymentPayload(content: string): PaymentRequestPayload {
  assertMessageSize(content);
  const payload = PaymentRequest.decodePayload(content);
  payload.mint = normalizeMintUrl(payload.mint);
  if (payload.proofs.length > MAX_PAYMENT_PROOFS)
    throw new Error("Too many payment proofs");
  const secrets = new Set<string>();
  for (const proof of payload.proofs) {
    if (
      !proof.id ||
      !proof.secret ||
      !/^(?:[0-9a-f]{66}|[0-9a-f]{96})$/i.test(proof.C)
    )
      throw new Error("Invalid payment proof");
    // Keep arbitrary-precision amounts in storage; automatic credit has a safe-number guard.
    if (Amount.from(proof.amount).toBigInt() <= 0n || secrets.has(proof.secret))
      throw new Error("Invalid or duplicate payment proof");
    secrets.add(proof.secret);
  }
  return payload;
}

export function proofIdentity(
  mint: string,
  proof: Pick<Proof, "secret">
): string {
  return bytesToHex(
    sha256(
      new TextEncoder().encode(
        JSON.stringify([normalizeMintUrl(mint), proof.secret])
      )
    )
  );
}

export function payloadIdentity(payload: PaymentRequestPayload): string {
  return bytesToHex(
    sha256(
      new TextEncoder().encode(
        JSON.stringify([
          payload.mint,
          payload.unit,
          payload.proofs.map((p) => proofIdentity(payload.mint, p)).sort(),
        ])
      )
    )
  );
}
