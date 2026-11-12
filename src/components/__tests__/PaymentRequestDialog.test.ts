import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { getActivePinia } from "pinia";
import { decodePaymentRequest, PaymentRequest } from "@cashu/cashu-ts";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { usePRStore } from "src/stores/payment-request";

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

let PaymentRequestDialog: any;
const wrappers: VueWrapper[] = [];

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

beforeAll(async () => {
  (globalThis as any).windowMixin = {};
  PaymentRequestDialog = (
    await import("src/components/PaymentRequestDialog.vue")
  ).default;
});

describe("PaymentRequestDialog", () => {
  const request = new PaymentRequest(
    undefined,
    "pr1",
    21,
    "sat",
    ["https://mint.example"],
    "coffee",
    false,
    { kind: "P2PK", data: "02" + "11".repeat(32), tags: [] }
  );

  it("shows the terms of the displayed request", () => {
    const context: any = {
      amountLabelDefault: "Add amount",
      activeUnit: "sat",
    };
    PaymentRequestDialog.watch.shownRequest.handler.call(context, request);
    expect(context.paymentRequestAmount).toBe(21);
    expect(context.chosenMintUrl).toBe("https://mint.example");
    expect(context.memo).toBe("coffee");
    expect(context.locked).toBe(true);
  });

  it("only replaces the request when its description or lock changed", () => {
    const context: any = {
      shownRequest: request,
      memo: "coffee",
      locked: true,
      updatePaymentRequest: vi.fn(),
    };
    PaymentRequestDialog.methods.onDetailsChanged.call(context);
    expect(context.updatePaymentRequest).not.toHaveBeenCalled();
    context.locked = false;
    PaymentRequestDialog.methods.onDetailsChanged.call(context);
    expect(context.updatePaymentRequest).toHaveBeenCalledOnce();
  });

  const mintA = "https://mint-a.example";
  const mintB = "https://mint-b.example";

  function savedRequest(unit: string) {
    useNostrStore().seedSignerPublicKey = "11".repeat(32);
    const mints = useMintsStore();
    mints.$patch({ activeUnit: unit, activeMintUrl: mintA });
    const requests = usePRStore();
    requests.ourPaymentRequests = [];
    requests.createPaymentRequest(100, "original", mintA);
    mints.$patch({ activeUnit: "sat", activeMintUrl: mintB });
    return { mints, requests };
  }

  function mountDialog() {
    const wrapper = shallowMount(PaymentRequestDialog, {
      global: {
        plugins: [getActivePinia()!],
        mocks: { $i18n: { t: (key: string) => key } },
        stubs: { QDialog: true },
      },
    });
    wrappers.push(wrapper);
    return wrapper;
  }

  function editDetails(wrapper: VueWrapper, detail: string) {
    const dialog = wrapper.vm as any;
    if (detail === "description") dialog.memo = "updated";
    else dialog.locked = true;
    dialog.onDetailsChanged();
  }

  it.each(["description", "lock"])(
    "preserves a saved request's unit when editing its %s",
    async (detail) => {
      const { requests } = savedRequest("usd");
      const wrapper = mountDialog();
      editDetails(wrapper, detail);
      await nextTick();

      const updated = decodePaymentRequest(requests.showPRKData);
      expect(updated.unit).toBe("usd");
      expect(updated.amount?.toNumber()).toBe(100);
      expect((wrapper.vm as any).activeUnit).toBe("usd");
    }
  );

  it.each(["description", "lock"])(
    "preserves a saved request's mint when editing its %s",
    async (detail) => {
      const { mints, requests } = savedRequest("sat");
      const wrapper = mountDialog();
      editDetails(wrapper, detail);
      await nextTick();

      const updated = decodePaymentRequest(requests.showPRKData);
      expect(updated.mints).toEqual([mintA]);
      expect((wrapper.vm as any).chosenMintUrl).toBe(mintA);
      expect(mints.activeMintUrl).toBe(mintB);
    }
  );

  it.each(["paging", "deleting"])(
    "syncs the unit control after %s to a saved request",
    async (action) => {
      const { requests } = savedRequest("usd");
      requests.createPaymentRequest(21, "newer", mintB);
      const wrapper = mountDialog();
      expect((wrapper.vm as any).activeUnit).toBe("sat");

      if (action === "paging") requests.selectPrevRequest();
      else requests.deletePaymentRequest(requests.currentPaymentRequest!.id);
      await nextTick();

      expect((wrapper.vm as any).activeUnit).toBe("usd");
      expect((wrapper.vm as any).chosenMintUrl).toBe(mintA);
    }
  );
});
