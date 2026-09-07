import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { reactive } from "vue";
import { cashuDb } from "src/stores/dexie";
import { usePRStore } from "src/stores/payment-request";
import { useTokensStore } from "src/stores/tokens";

const h = vi.hoisted(() => ({
  nostr: {
    seedSignerPublicKey: "",
    seedSignerNprofile: "",
    walletSeedGenerateKeyPair: vi.fn(async () => {}),
  },
  mints: {
    activeUnit: "sat",
    activeMintUrl: "https://active.example",
    activeUnitCurrencyMultiplyer: 1,
    mints: [{ url: "https://active.example", keysets: [{ unit: "sat" }] }],
  },
}));
vi.mock("src/stores/nostr", () => ({ useNostrStore: () => h.nostr }));
vi.mock("src/stores/mints", () => ({ useMintsStore: () => h.mints }));
vi.mock("src/stores/paymentJobs", () => ({ usePaymentJobsStore: () => ({}) }));
vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

beforeEach(async () => {
  localStorage.clear();
  for (const table of cashuDb.tables) await table.clear();
  h.nostr.seedSignerPublicKey = getPublicKey(generateSecretKey());
  h.nostr.seedSignerNprofile = nip19.nprofileEncode({
    pubkey: h.nostr.seedSignerPublicKey,
    relays: ["wss://relay.example/"],
  });
  h.mints.activeUnit = "sat";
});

describe("owned payment requests and persistence", () => {
  it("creates a new ID and QR when terms change while retaining the shared request", async () => {
    const store = usePRStore();
    const original = await store.newPaymentRequest();
    const changed = await store.newPaymentRequest(42);
    expect(changed).not.toBe(original);
    expect(PaymentRequest.fromEncodedRequest(changed).amount?.toNumber()).toBe(
      42
    );
    expect(PaymentRequest.fromEncodedRequest(changed).id).not.toBe(
      PaymentRequest.fromEncodedRequest(original).id
    );
    expect(await cashuDb.paymentRequests.count()).toBe(2);
    expect(await store.newPaymentRequest()).toBe(changed);
  });
  it("uses the explicitly requested mint rather than the globally active mint", async () => {
    const encoded = await usePRStore().createPaymentRequest(
      7,
      "memo",
      "https://requested.example/"
    );
    const decoded = PaymentRequest.fromEncodedRequest(encoded);
    expect(decoded.mints).toEqual(["https://requested.example"]);
    expect(decoded.id).toHaveLength(36);
  });
  it("keeps creation timestamps and history links during an idempotent upsert", async () => {
    const store = usePRStore();
    const encoded = await store.createPaymentRequest(7);
    const request = PaymentRequest.fromEncodedRequest(encoded);
    const before = await cashuDb.paymentRequests.get(request.id!);
    await cashuDb.ecashHistory.put({
      id: "receipt",
      paymentRequestId: request.id,
      amount: 7,
      status: "paid",
    });
    await store.ensureStoredRequest(request, encoded);
    expect(await cashuDb.paymentRequests.get(request.id!)).toEqual(before);
    expect((await cashuDb.ecashHistory.get("receipt")).paymentRequestId).toBe(
      request.id
    );
  });
  it("does not store a scanned foreign request as our receiving address", async () => {
    const store = usePRStore();
    const own = await store.createPaymentRequest();
    const foreign = new PaymentRequest({
      id: "foreign",
      amount: 7,
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
    await store.decodePaymentRequest(foreign.toEncodedRequest());
    expect(await cashuDb.paymentRequests.count()).toBe(1);
    expect(store.showPRKData).toBe(own);
  });
  it("archives foreign legacy entries and migrates owned request links", async () => {
    const own = PaymentRequest.fromEncodedRequest(
      await usePRStore().createPaymentRequest()
    );
    await cashuDb.paymentRequests.clear();
    await cashuDb.ecashHistory.put({
      id: "receipt",
      amount: 7,
      status: "paid",
    });
    localStorage.setItem(
      "cashu.pr.ours",
      JSON.stringify([
        {
          id: own.id,
          encoded: own.toEncodedRequest(),
          createdAt: "2020-01-01",
          receivedPaymentIds: ["receipt"],
        },
        {
          id: "foreign",
          encoded: new PaymentRequest({ id: "foreign" }).toEncodedRequest(),
        },
      ])
    );
    await usePRStore().initOwnedRequests();
    expect(usePRStore().ourPaymentRequests).toHaveLength(1);
    expect((await cashuDb.paymentRequests.get("foreign"))?.archived).toBe(true);
    expect((await cashuDb.ecashHistory.get("receipt")).paymentRequestId).toBe(
      own.id
    );
    expect(localStorage.getItem("cashu.pr.ours")).toBeNull();
  });
  it("persists reactive request objects without DataCloneError and rehydrates their API", async () => {
    const request = reactive(
      new PaymentRequest({ id: "request", amount: 21, unit: "sat" })
    );
    const store = useTokensStore();
    await store.persistHistoryToken({
      id: "out",
      status: "pending",
      amount: -21,
      date: "2020-01-01",
      mint: "https://active.example",
      unit: "sat",
      token: "synthetic-token",
      paymentRequest: request as PaymentRequest,
    });
    const raw = await cashuDb.ecashHistory.get("out");
    expect(raw.paymentRequest).toBeUndefined();
    expect(raw.paymentRequestEncoded).toMatch(/^creqA/);
    await store.refreshEcashHistory();
    expect(store.historyTokens[0].paymentRequest?.amount?.toNumber()).toBe(21);
  });
});
