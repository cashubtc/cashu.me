import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Amount,
  JSONInt,
  PaymentRequest,
  getEncodedToken,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { cashuDb } from "src/stores/dexie";
import { encodeGiftWrap } from "src/js/paymentRequestProtocol";

const h = vi.hoisted(() => ({
  wallet: {
    mnemonic: "test wallet",
    seed: new Uint8Array(64).fill(1),
    mintWallet: vi.fn(),
  },
  mints: {
    mints: [{ url: "https://mint.example" }],
    allMintKeysets: [{ id: "0011223344556677" }],
  },
  pr: { receivePaymentRequestsAutomatically: true },
  p2pk: {
    getPrivateKeyForP2PKEncodedToken: vi.fn(async () => ""),
    setPrivateKeyUsed: vi.fn(),
  },
  publish: vi.fn(),
  resolve: vi.fn(async () => ["wss://relay.example/"]),
}));
vi.mock("src/stores/wallet", () => ({ useWalletStore: () => h.wallet }));
vi.mock("src/stores/mints", () => ({ useMintsStore: () => h.mints }));
vi.mock("src/stores/payment-request", () => ({ usePRStore: () => h.pr }));
vi.mock("src/stores/nostr", () => ({
  useNostrStore: () => ({ relays: ["wss://relay.example/"] }),
}));
vi.mock("src/stores/p2pk", () => ({ useP2PKStore: () => h.p2pk }));
vi.mock("src/js/paymentRelay", () => ({
  publishToRelays: h.publish,
  resolveInboxRelays: h.resolve,
}));
vi.mock("src/js/notify", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  notifyApiError: vi.fn(),
}));
vi.mock("src/stores/proofs", () => ({
  useProofsStore: () => ({
    getProofs: () => cashuDb.proofs.toArray(),
    proofsToWalletProofs: (proofs: any[]) =>
      proofs.map((p) => ({
        ...p,
        amount: Amount.from(p.amount).toNumber(),
        reserved: false,
      })),
  }),
}));

import { usePaymentJobsStore } from "src/stores/paymentJobs";

const owner = () => getPublicKey(h.wallet.seed.slice(0, 32));
const proof = (secret: string, amount = 21) => ({
  id: "0011223344556677",
  amount: Amount.from(amount),
  secret,
  C: "02" + owner(),
});
const message = (
  secret = "incoming",
  overrides: Record<string, unknown> = {}
) =>
  JSONInt.stringify({
    id: "ours",
    mint: "https://mint.example",
    unit: "sat",
    proofs: [proof(secret)],
    ...overrides,
  })!;
let received: string[];
let complete: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.restoreAllMocks();
  h.wallet.seed = new Uint8Array(64).fill(1);
  for (const table of cashuDb.tables) await table.clear();
  h.pr.receivePaymentRequestsAutomatically = true;
  h.mints.mints = [{ url: "https://mint.example" }];
  h.publish
    .mockReset()
    .mockResolvedValue({ accepted: ["wss://relay.example/"], failed: [] });
  received = [];
  complete = vi.fn(async (preview) => {
    const name = preview.inputs[0].secret;
    received.push(name);
    return { keep: [proof(`claimed-${name}`, 20)], send: [] };
  });
  h.wallet.mintWallet.mockReset().mockResolvedValue({
    getMintInfo: () => ({
      supportedMethods: () => [{ method: "bolt11", unit: "sat" }],
    }),
    isPaymentRequestSatisfied: (_request: unknown, proofs: any[]) =>
      proofs[0].amount.toNumber() >= 21,
    ops: {
      receive: (payload: any) => ({
        asDeterministic() {
          return this;
        },
        privkey() {
          return this;
        },
        prepare: async () => ({
          amount: Amount.from(20),
          fees: Amount.from(1),
          keysetId: "0011223344556677",
          inputs: payload.proofs,
          keepOutputs: [],
          sendOutputs: [],
        }),
      }),
    },
    completeSwap: complete,
  });
  const request = new PaymentRequest({ id: "ours", amount: 20, unit: "sat" });
  await cashuDb.paymentRequests.put({
    id: "ours",
    identity: owner(),
    encoded: request.toEncodedRequest(),
    createdAt: new Date().toISOString(),
  });
});

describe("durable incoming payment jobs", () => {
  it("deduplicates rewrapped payments and records actual net value and fees", async () => {
    const store = usePaymentJobsStore();
    const sender = generateSecretKey();
    await store.ingestEnvelope(encodeGiftWrap(message(), sender, owner()));
    await store.ingestEnvelope(encodeGiftWrap(message(), sender, owner()));
    expect(await cashuDb.paymentEnvelopes.count()).toBe(2);
    expect(await cashuDb.paymentJobs.count()).toBe(1);
    const [job] = await cashuDb.paymentJobs.toArray();
    expect(await cashuDb.ecashHistory.count()).toBe(0);
    await store.redeemReceipt(job.id);
    await store.redeemReceipt(job.id);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(await cashuDb.ecashHistory.get(job.historyId)).toMatchObject({
      amount: 20,
      fee: 1,
      status: "paid",
      paymentMatching: true,
    });
  });
  it("never marks an envelope processed when durable ingestion fails", async () => {
    const store = usePaymentJobsStore();
    const event = encodeGiftWrap(message(), generateSecretKey(), owner());
    vi.spyOn(store, "ingestContent").mockRejectedValueOnce(
      new Error("disk full")
    );
    await expect(store.ingestEnvelope(event)).rejects.toThrow("disk full");
    expect((await cashuDb.paymentEnvelopes.get(event.id))?.state).toBe(
      "stored"
    );
    await store.ingestEnvelope(event);
    expect((await cashuDb.paymentEnvelopes.get(event.id))?.state).toBe(
      "processed"
    );
    expect(await cashuDb.paymentJobs.count()).toBe(1);
  });
  it("keeps A and B immutable while concurrent receives wait on the wallet mutex", async () => {
    const store = usePaymentJobsStore();
    const [a] = await store.ingestContent(message("A"));
    const [b] = await store.ingestContent(message("B"));
    await Promise.all([store.redeemReceipt(a), store.redeemReceipt(b)]);
    expect(received.sort()).toEqual(["A", "B"]);
    expect(await cashuDb.proofs.count()).toBe(2);
  });
  it("keeps plaintext envelopes retryable after a storage failure and deduplicates concurrent delivery", async () => {
    const store = usePaymentJobsStore();
    const encoded = getEncodedToken({
      mint: "https://mint.example",
      unit: "sat",
      proofs: [proof("legacy-storage")],
    });
    const event = encodeGiftWrap(encoded, generateSecretKey(), owner());
    vi.spyOn(cashuDb.paymentJobs, "add").mockRejectedValueOnce(
      new Error("disk full")
    );
    await expect(store.ingestEnvelope(event)).rejects.toThrow("disk full");
    expect((await cashuDb.paymentEnvelopes.get(event.id))?.state).toBe(
      "stored"
    );
    await Promise.all([
      store.ingestEnvelope(event),
      store.ingestEnvelope(event),
    ]);
    expect((await cashuDb.paymentEnvelopes.get(event.id))?.state).toBe(
      "processed"
    );
    const jobs = await cashuDb.paymentJobs.toArray();
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).not.toContain(encoded);
  });
  it("does not attribute a receipt to a seed selected during an awaited database read", async () => {
    const store = usePaymentJobsStore();
    const event = encodeGiftWrap(message(), generateSecretKey(), owner());
    const owned = await cashuDb.paymentRequests.get("ours");
    vi.spyOn(cashuDb.paymentRequests, "get").mockImplementationOnce(
      async () => {
        h.wallet.seed = new Uint8Array(64).fill(2);
        return owned;
      }
    );
    await expect(store.ingestEnvelope(event)).rejects.toThrow("Wallet changed");
    expect(await cashuDb.paymentJobs.count()).toBe(0);
    expect((await cashuDb.paymentEnvelopes.get(event.id))?.state).toBe(
      "stored"
    );
  });
  it("stops before swapping if the seed changes while the mint wallet loads", async () => {
    const store = usePaymentJobsStore();
    const [id] = await store.ingestContent(message());
    const mintWallet = await h.wallet.mintWallet();
    h.wallet.mintWallet.mockImplementationOnce(async () => {
      h.wallet.seed = new Uint8Array(64).fill(2);
      return mintWallet;
    });
    await expect(store.redeemReceipt(id)).rejects.toThrow("Wallet changed");
    expect(complete).not.toHaveBeenCalled();
    expect((await cashuDb.paymentJobs.get(id))?.preview).toBeUndefined();
    h.wallet.seed = new Uint8Array(64).fill(1);
    await store.redeemReceipt(id);
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it("retains preparation after a commit failure and retries without generating fresh outputs", async () => {
    const store = usePaymentJobsStore();
    const [id] = await store.ingestContent(message());
    vi.spyOn(cashuDb.proofs, "bulkPut").mockRejectedValueOnce(
      new Error("disk full")
    );
    await expect(store.redeemReceipt(id)).rejects.toThrow("disk full");
    const pending = await cashuDb.paymentJobs.get(id);
    expect(pending?.state).toBe("prepared");
    expect(pending?.preview).toBeDefined();
    expect(await cashuDb.ecashHistory.count()).toBe(0);
    await store.redeemReceipt(id);
    expect((await cashuDb.paymentJobs.get(id))?.preview).toEqual(
      pending?.preview
    );
    expect(await cashuDb.ecashHistory.count()).toBe(1);
  });
  it.each([
    { id: "unknown" },
    { mint: "https://untrusted.example" },
    { unit: "usd" },
    { proofs: [proof("small", 1)] },
  ])(
    "quarantines a mismatched payment without crediting it: %j",
    async (overrides) => {
      const store = usePaymentJobsStore();
      const [id] = await store.ingestContent(message("incoming", overrides));
      await store.redeemReceipt(id);
      expect((await cashuDb.paymentJobs.get(id))?.state).toBe("review");
      expect(complete).not.toHaveBeenCalled();
      expect(await cashuDb.ecashHistory.count()).toBe(0);
      if (overrides.mint) expect(h.wallet.mintWallet).not.toHaveBeenCalled();
    }
  );
  it("preserves pending jobs while automatic claiming is off", async () => {
    h.pr.receivePaymentRequestsAutomatically = false;
    const store = usePaymentJobsStore();
    const [id] = await store.ingestContent(message());
    await store.redeemReceipt(id);
    expect(complete).not.toHaveBeenCalled();
    await store.redeemReceipt(id, true);
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it("keeps plaintext tokens reviewable without contacting their mint", async () => {
    const encoded = getEncodedToken({
      mint: "https://untrusted.example",
      unit: "sat",
      proofs: [proof("plain")],
    });
    const [id] = await usePaymentJobsStore().ingestContent(
      `Here is your ecash: ${encoded}`
    );
    expect(await cashuDb.paymentJobs.get(id)).toMatchObject({
      token: encoded,
      state: "review",
    });
    expect(h.wallet.mintWallet).not.toHaveBeenCalled();
  });
  it("does not count a claimed legacy history row twice after full-history recovery", async () => {
    const payload = PaymentRequest.decodePayload(message());
    await cashuDb.ecashHistory.put({
      id: "legacy",
      token: getEncodedToken(payload),
      amount: 20,
      fee: 1,
      status: "paid",
      paymentRequestId: "ours",
    });
    const [id] = await usePaymentJobsStore().ingestContent(message());
    await usePaymentJobsStore().redeemReceipt(id);
    expect(complete).not.toHaveBeenCalled();
    expect(await cashuDb.ecashHistory.count()).toBe(1);
  });
});

describe("durable outgoing payment publication", () => {
  it("does not debit a different wallet after an awaited preflight", async () => {
    const store = usePaymentJobsStore();
    vi.spyOn(store, "preflight").mockImplementationOnce(async () => {
      h.wallet.seed = new Uint8Array(64).fill(2);
      return { transport: { type: "post", target: "https://pay.example" } };
    });
    await expect(
      store.prepareOutgoing(
        new PaymentRequest({ amount: 21, unit: "sat" }),
        21,
        "https://mint.example",
        "sat"
      )
    ).rejects.toThrow("Wallet changed");
    expect(h.wallet.mintWallet).not.toHaveBeenCalled();
    expect(await cashuDb.paymentJobs.count()).toBe(0);
  });
  it("adopts a pending legacy payment without preparing or debiting it again", async () => {
    const request = new PaymentRequest({
      id: "legacy-target",
      amount: 21,
      unit: "sat",
      transport: [
        {
          type: PaymentRequestTransportType.NOSTR,
          target: nip19.nprofileEncode({
            pubkey: getPublicKey(generateSecretKey()),
            relays: ["wss://relay.example/"],
          }),
          tags: [["n", "17"]],
        },
      ],
    });
    const encoded = getEncodedToken({
      mint: "https://mint.example",
      unit: "sat",
      proofs: [proof("legacy-outgoing")],
    });
    await cashuDb.ecashHistory.put({
      id: "legacy-outgoing",
      token: encoded,
      amount: -21,
      status: "pending",
      date: new Date().toISOString(),
      paymentRequestEncoded: request.toEncodedRequest(),
    });
    const store = usePaymentJobsStore();
    const job = await store.adoptLegacyOutgoing(request, encoded);
    expect(job.state).toBe("ready");
    expect(job.token).toBe(encoded);
    expect(h.wallet.mintWallet).not.toHaveBeenCalled();
    expect((await store.adoptLegacyOutgoing(request, encoded)).id).toBe(job.id);
    expect(await cashuDb.paymentJobs.count()).toBe(1);
  });
  it("reuses a saved debit when the request is reopened with another active mint", async () => {
    const request = new PaymentRequest({
      id: "target",
      amount: 21,
      unit: "sat",
    });
    await cashuDb.paymentJobs.add({
      id: "saved",
      identity: owner(),
      direction: "outgoing",
      state: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mint: "https://mint.example",
      unit: "sat",
      token: "saved-token",
      requestEncoded: request.toEncodedRequest(),
      historyId: "saved",
      attempts: 0,
    });
    const resumed = await usePaymentJobsStore().prepareOutgoing(
      request,
      99,
      "https://another.example",
      "usd"
    );
    expect(resumed.id).toBe("saved");
    expect(resumed.token).toBe("saved-token");
    expect(h.wallet.mintWallet).not.toHaveBeenCalled();
    expect(await cashuDb.paymentJobs.count()).toBe(1);
  });
  it("retains the same token and signed envelope across rejected publication and reload", async () => {
    const store = usePaymentJobsStore();
    const request = new PaymentRequest({
      id: "target",
      amount: 21,
      unit: "sat",
    });
    await cashuDb.paymentJobs.add({
      id: "out",
      identity: owner(),
      direction: "outgoing",
      state: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mint: "https://mint.example",
      unit: "sat",
      token: "saved-token",
      payload: message(),
      requestEncoded: request.toEncodedRequest(),
      historyId: "out",
      attempts: 0,
      transport: {
        type: "nostr",
        target: (
          await import("nostr-tools")
        ).nip19.nprofileEncode({
          pubkey: getPublicKey(generateSecretKey()),
          relays: ["wss://relay.example/"],
        }),
      },
      relays: ["wss://relay.example/"],
    });
    h.publish.mockRejectedValueOnce(new Error("relay unavailable"));
    await expect(store.publishPayment("out")).rejects.toThrow(
      "relay unavailable"
    );
    const failed = await cashuDb.paymentJobs.get("out");
    expect(failed?.state).toBe("ready");
    expect(failed?.envelope).toBeDefined();
    await store.publishPayment("out");
    const published = await cashuDb.paymentJobs.get("out");
    expect(published?.state).toBe("published");
    expect(published?.token).toBe(failed?.token);
    expect(h.publish.mock.calls[1][0].id).toBe(h.publish.mock.calls[0][0].id);
    expect(h.wallet.mintWallet).not.toHaveBeenCalled();
  });
});
