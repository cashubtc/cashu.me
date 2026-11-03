import { test, describe, expect, vi } from "vitest";
import { PaymentRequest } from "@cashu/cashu-ts";

// The wallet store grabs `t` from useI18n() in its state initializer, which
// only works inside a component setup context.
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

import { usePRStore } from "src/stores/payment-request";
import { useWalletStore } from "src/stores/wallet";
import { useP2PKStore } from "src/stores/p2pk";

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
