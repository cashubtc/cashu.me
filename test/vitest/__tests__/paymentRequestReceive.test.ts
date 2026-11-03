import { test, describe, expect, vi } from "vitest";
import { PaymentRequest } from "@cashu/cashu-ts";

// The wallet store grabs `t` from useI18n() in its state initializer, which
// only works inside a component setup context.
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

const notifyWarning = vi.hoisted(() => vi.fn());
vi.mock("src/js/notify", async (importOriginal) => ({
  ...(await importOriginal<typeof import("src/js/notify")>()),
  notifyWarning,
}));

import { usePRStore } from "src/stores/payment-request";
import { useWalletStore } from "src/stores/wallet";
import { useP2PKStore } from "src/stores/p2pk";
import { useNostrStore } from "src/stores/nostr";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";

describe("prStore.paymentSatisfiesRequest", () => {
  const setup = (check: () => boolean) => {
    const prStore = usePRStore();
    const request = new PaymentRequest(undefined, "pr1", 21, "sat");
    prStore.ourPaymentRequests = [
      {
        id: "pr1",
        encoded: request.toEncodedRequest(),
        createdAt: "",
        receivedPaymentIds: [],
      },
    ];
    const isPaymentRequestSatisfied = vi.fn(check);
    const mintWallet = vi
      .spyOn(useWalletStore(), "mintWallet")
      .mockResolvedValue({ isPaymentRequestSatisfied } as any);
    useP2PKStore().p2pkKeys = [
      { publicKey: "pub", privateKey: "priv", used: false, usedCount: 0 },
    ];
    const payload = {
      id: "pr1",
      mint: "https://mint.example",
      unit: "sat",
      proofs: [],
    };
    return { prStore, payload, isPaymentRequestSatisfied, mintWallet };
  };

  test("checks the payment against our stored request", async () => {
    const { prStore, payload, isPaymentRequestSatisfied, mintWallet } = setup(
      () => true
    );
    await expect(prStore.paymentSatisfiesRequest(payload)).resolves.toBe(true);
    expect(mintWallet).toHaveBeenCalledWith(
      "https://mint.example",
      "sat",
      true
    );
    const [request, , floor, opts] = isPaymentRequestSatisfied.mock
      .calls[0] as any[];
    expect(request.id).toBe("pr1");
    expect(request.amount.toNumber()).toBe(21);
    expect(floor).toBe(0);
    expect(opts).toEqual({ privkeys: ["priv"] });
  });

  test("is false for an underpaid or inadmissible payment", async () => {
    const { prStore, payload } = setup(() => {
      throw new Error("wrong lock");
    });
    await expect(prStore.paymentSatisfiesRequest(payload)).resolves.toBe(false);
  });

  test("is false for a payment to a request we don't know", async () => {
    const { prStore, payload, mintWallet } = setup(() => true);
    await expect(
      prStore.paymentSatisfiesRequest({ ...payload, id: "other" })
    ).resolves.toBe(false);
    expect(mintWallet).not.toHaveBeenCalled();
  });
});

describe("nostrStore.parseMessageForEcash with a payment payload", () => {
  const C =
    "02a9acc1e48c25eeeb9289b5031cc57da9fe72f3fe2861d264bdc074209b107ba2";

  const receive = async (requestId: string, satisfied: boolean) => {
    notifyWarning.mockClear();
    const prStore = usePRStore();
    prStore.receivePaymentRequestsAutomatically = true;
    prStore.ourPaymentRequests = [
      { id: "ours", encoded: "", createdAt: "", receivedPaymentIds: [] },
    ];
    const check = vi
      .spyOn(prStore, "paymentSatisfiesRequest")
      .mockResolvedValue(satisfied);
    const receiveStore = useReceiveTokensStore();
    vi.spyOn(receiveStore, "knowThisMintOfTokenJson").mockReturnValue(true);
    const autoReceive = vi
      .spyOn(receiveStore, "receiveIfDecodes")
      .mockResolvedValue(true);
    const nostr = useNostrStore();
    vi.spyOn(nostr, "addPendingTokenToHistory").mockReturnValue("history-id");
    const message = new PaymentRequest(
      undefined,
      requestId,
      21,
      "sat"
    ).encodePayload("https://mint.example", [
      { id: "009a1f293253e41e", amount: 21 as any, secret: "s1", C },
    ]);
    await nostr.parseMessageForEcash(message);
    return { check, autoReceive, receiveStore };
  };

  test("auto-receives a payment that satisfies our request", async () => {
    const { check, autoReceive } = await receive("ours", true);
    expect(check).toHaveBeenCalled();
    expect(autoReceive).toHaveBeenCalled();
    expect(notifyWarning).not.toHaveBeenCalled();
  });

  test("warns and leaves a mismatched payment for manual receive", async () => {
    const { autoReceive, receiveStore } = await receive("ours", false);
    expect(autoReceive).not.toHaveBeenCalled();
    expect(receiveStore.showReceiveTokens).toBe(true);
    expect(notifyWarning).toHaveBeenCalledWith(
      "Payment does not match the request"
    );
  });

  test("auto-receives a payment for a request stored elsewhere", async () => {
    const { check, autoReceive } = await receive("other-device", false);
    expect(check).not.toHaveBeenCalled();
    expect(autoReceive).toHaveBeenCalled();
    expect(notifyWarning).not.toHaveBeenCalled();
  });
});
