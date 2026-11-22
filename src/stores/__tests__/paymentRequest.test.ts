import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { usePRStore, isOwnPaymentRequest } from "src/stores/payment-request";
import { useNostrStore } from "src/stores/nostr";

vi.mock("src/js/notify", () => ({
  notifyApiError: vi.fn(),
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  notifyWarning: vi.fn(),
}));

const relays = ["wss://relay.example"];

function requestTo(pubkey: string, id: string) {
  return new PaymentRequest(
    [
      {
        type: PaymentRequestTransportType.NOSTR,
        target: nip19.nprofileEncode({ pubkey, relays }),
        tags: [["n", "17"]],
      },
    ],
    id
  );
}

describe("payment request store", () => {
  let ownPubkey: string;
  let otherPubkey: string;

  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    ownPubkey = getPublicKey(generateSecretKey());
    otherPubkey = getPublicKey(generateSecretKey());
    const nostr = useNostrStore();
    nostr.seedSignerPublicKey = ownPubkey;
    nostr.relays = relays;
  });

  it("identifies requests that pay to our own key", () => {
    expect(isOwnPaymentRequest(requestTo(ownPubkey, "a"), ownPubkey)).toBe(
      true
    );
    expect(isOwnPaymentRequest(requestTo(otherPubkey, "a"), ownPubkey)).toBe(
      false
    );
    const post = new PaymentRequest(
      [{ type: PaymentRequestTransportType.POST, target: "https://x.test" }],
      "a"
    );
    expect(isOwnPaymentRequest(post, ownPubkey)).toBe(false);
    expect(isOwnPaymentRequest(requestTo(ownPubkey, "a"), "")).toBe(false);
  });

  it("does not store a request that is being paid as our own", async () => {
    const prStore = usePRStore();
    const own = prStore.createPaymentRequest();
    const ownId = prStore.ourPaymentRequests[0].id;

    const foreign = requestTo(otherPubkey, ownId).toEncodedRequest();
    await prStore.decodePaymentRequest(foreign);

    expect(prStore.ourPaymentRequests).toHaveLength(1);
    expect(prStore.ourPaymentRequests[0].encoded).toBe(own);

    prStore.newPaymentRequest();
    expect(prStore.showPRKData).toBe(own);
  });

  it("refuses to store foreign requests directly", () => {
    const prStore = usePRStore();
    const foreign = requestTo(otherPubkey, "deadbeef");
    prStore.ensureStoredRequest(foreign, foreign.toEncodedRequest());
    expect(prStore.ourPaymentRequests).toHaveLength(0);
  });

  it("prunes previously stored foreign requests before showing one", () => {
    const prStore = usePRStore();
    const own = prStore.createPaymentRequest();
    const foreign = requestTo(otherPubkey, "deadbeef").toEncodedRequest();
    prStore.ourPaymentRequests.push({
      id: "deadbeef",
      encoded: foreign,
      createdAt: new Date().toISOString(),
      receivedPaymentIds: [],
    });
    prStore.selectedPRIndex = 1;

    prStore.newPaymentRequest();

    expect(prStore.ourPaymentRequests.map((r) => r.encoded)).toEqual([own]);
    expect(prStore.selectedPRIndex).toBe(0);
    expect(prStore.showPRKData).toBe(own);
  });

  it("keeps stored requests when our key is unknown", () => {
    const prStore = usePRStore();
    prStore.createPaymentRequest();
    useNostrStore().seedSignerPublicKey = "";
    prStore.pruneForeignRequests();
    expect(prStore.ourPaymentRequests).toHaveLength(1);
  });
});
