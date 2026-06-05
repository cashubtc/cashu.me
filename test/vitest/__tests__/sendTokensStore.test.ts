import { test, describe, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSendTokensStore } from "src/stores/sendTokensStore";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("sendTokensStore.invalidatePreparedPaymentRequestToken", () => {
  test("no-op when there is no active payment request", () => {
    const store = useSendTokensStore();
    store.sendData.tokensBase64 = "cashuB-xxxxxx";
    store.sendData.tokens = "stale-proofs";
    store.sendData.historyToken = { id: "h1" } as any;
    store.sendData.historyAmount = -42;

    const changed = store.invalidatePreparedPaymentRequestToken();

    expect(changed).toBe(false);
    // Regular send flows must keep their cached token until the dialog closes.
    expect(store.sendData.tokensBase64).toBe("cashuB-xxxxxx");
    expect(store.sendData.tokens).toBe("stale-proofs");
    expect(store.sendData.historyToken).toEqual({ id: "h1" });
    expect(store.sendData.historyAmount).toBe(-42);
  });

  test("no-op when there is no cached token to invalidate", () => {
    const store = useSendTokensStore();
    store.sendData.paymentRequest = { id: "pr1" } as any;

    const changed = store.invalidatePreparedPaymentRequestToken();

    expect(changed).toBe(false);
    expect(store.sendData.paymentRequest).toEqual({ id: "pr1" });
  });

  test("clears cached PR token state so the next pay attempt rebuilds", () => {
    const store = useSendTokensStore();
    store.sendData.paymentRequest = {
      id: "pr1",
      mints: ["https://trusted.example"],
    } as any;
    store.sendData.tokensBase64 = "cashuB-from-wrong-mint";
    store.sendData.tokens = "stale-proofs";
    store.sendData.historyToken = { id: "h1" } as any;
    store.sendData.historyAmount = -42;

    const changed = store.invalidatePreparedPaymentRequestToken();

    expect(changed).toBe(true);
    expect(store.sendData.tokensBase64).toBe("");
    expect(store.sendData.tokens).toBe("");
    expect(store.sendData.historyToken).toBeUndefined();
    expect(store.sendData.historyAmount).toBeNull();
    // The payment request itself must stay intact – only the prepared
    // proofs/token are invalidated.
    expect(store.sendData.paymentRequest).toEqual({
      id: "pr1",
      mints: ["https://trusted.example"],
    });
  });
});
