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

  it("counts only settled payments in the received total", () => {
    const currentPayments = [
      { amount: 8, unit: "sat", status: "paid" },
      { amount: 5, unit: "sat", status: "pending" },
    ];
    expect(
      PaymentRequestDialog.computed.totalsByUnit.call({ currentPayments })
    ).toEqual({ sat: 8 });
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

  const storedMint = (url: string, units: string[]) => ({
    url,
    keys: [],
    keysets: units.map((unit, i) => ({
      id: `00${unit}${i}`,
      unit,
      active: true,
    })),
  });

  // Saves a request for mint A, then makes mint B and sats active.
  function savedRequest(unit: string, mintBUnits = ["sat", "usd"]) {
    useNostrStore().seedSignerPublicKey = "11".repeat(32);
    const mints = useMintsStore();
    mints.mints = [
      storedMint(mintA, ["sat", "usd"]),
      storedMint(mintB, mintBUnits),
    ];
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

  const shown = (requests: ReturnType<typeof usePRStore>) =>
    decodePaymentRequest(requests.showPRKData);

  it.each(["description", "lock"])(
    "keeps a saved request's unit and mint (%s)",
    async (action) => {
      const { mints, requests } = savedRequest("usd", ["sat"]);
      const dialog = mountDialog().vm as any;
      if (action === "description") dialog.memo = "updated";
      else dialog.locked = true;
      dialog.onDetailsChanged();
      await nextTick();

      expect(shown(requests).unit).toBe("usd");
      expect(shown(requests).amount?.toNumber()).toBe(100);
      expect(shown(requests).mints).toEqual([mintA]);
      expect(dialog.unit).toBe("usd");
      expect(dialog.chosenMintUrl).toBe(mintA);
      expect(mints.activeUnit).toBe("sat");
      expect(mints.activeMintUrl).toBe(mintB);
    }
  );

  it("starts a new request on any mint, in the same unit", async () => {
    const { requests } = savedRequest("usd", ["sat"]);
    const dialog = mountDialog().vm as any;
    dialog.newRequest();
    await nextTick();

    expect(shown(requests).mints).toBeUndefined();
    expect(shown(requests).unit).toBe("usd");
    expect(dialog.chosenMintUrl).toBeUndefined();
    expect(requests.ourPaymentRequests).toHaveLength(2);
  });

  it.each(["paging", "deleting"])(
    "shows a saved request's unit and mint after %s",
    async (action) => {
      const { mints, requests } = savedRequest("usd");
      requests.createPaymentRequest(21, "newer", mintB);
      const dialog = mountDialog().vm as any;
      expect(dialog.unit).toBe("sat");

      if (action === "paging") requests.selectPrevRequest();
      else requests.deletePaymentRequest(requests.currentPaymentRequest!.id);
      await nextTick();

      expect(dialog.unit).toBe("usd");
      expect(dialog.chosenMintUrl).toBe(mintA);
      expect(mints.activeUnit).toBe("sat");
    }
  );

  it("enters an amount in the request's unit", async () => {
    const { requests } = savedRequest("usd");
    const dialog = mountDialog().vm as any;
    dialog.isEditingAmount = true;
    dialog.amountInputValue = "5";
    dialog.finishEditingAmount();
    await nextTick();

    expect(shown(requests).unit).toBe("usd");
    expect(shown(requests).amount?.toNumber()).toBe(500);
  });

  it("toggles through the units of the request's mint", async () => {
    const { mints, requests } = savedRequest("sat", ["sat", "eur"]);
    const dialog = mountDialog().vm as any;
    dialog.toggleUnit();
    await nextTick();

    expect(shown(requests).unit).toBe("usd");
    expect(shown(requests).amount).toBeUndefined();
    expect(shown(requests).mints).toEqual([mintA]);
    expect(mints.activeUnit).toBe("sat");
  });

  it("leaves the request alone when its mint has one unit", async () => {
    const { mints, requests } = savedRequest("sat");
    mints.mints = [storedMint(mintA, ["sat"])];
    const dialog = mountDialog().vm as any;
    const before = requests.showPRKData;
    dialog.toggleUnit();
    await nextTick();

    expect(requests.showPRKData).toBe(before);
  });

  it("drops the amount when the active mint lacks the request's unit", async () => {
    const { requests } = savedRequest("usd", ["sat"]);
    const dialog = mountDialog().vm as any;
    dialog.setActiveMintUrl();
    await nextTick();

    expect(shown(requests).mints).toEqual([mintB]);
    expect(shown(requests).unit).toBe("sat");
    expect(shown(requests).amount).toBeUndefined();
  });

  it("keeps the amount when the active mint has the request's unit", async () => {
    const { requests } = savedRequest("usd");
    const dialog = mountDialog().vm as any;
    dialog.setActiveMintUrl();
    await nextTick();

    expect(shown(requests).mints).toEqual([mintB]);
    expect(shown(requests).unit).toBe("usd");
    expect(shown(requests).amount?.toNumber()).toBe(100);
  });

  it("rounds floating-point fiat amounts to integer cents without throwing", async () => {
    const { requests } = savedRequest("usd");
    const dialog = mountDialog().vm as any;
    dialog.isEditingAmount = true;
    dialog.amountInputValue = "19.99";
    dialog.finishEditingAmount();
    await nextTick();

    expect(shown(requests).unit).toBe("usd");
    expect(shown(requests).amount?.toNumber()).toBe(1999);
    expect(requests.ourPaymentRequests).toHaveLength(1);
    expect(dialog.isEditingAmount).toBe(false);

    // A trailing blur after Enter must not wipe the amount
    dialog.finishEditingAmount();
    await nextTick();
    expect(shown(requests).amount?.toNumber()).toBe(1999);
  });

  it("updates description live without blur and deletes the targeted paid request", async () => {
    const { requests } = savedRequest("sat");
    const paidId = requests.ourPaymentRequests[0].id;
    requests.ourPaymentRequests[0].receivedPaymentIds.push("tx-1");

    const wrapper = shallowMount(PaymentRequestDialog, {
      global: {
        plugins: [getActivePinia()!],
        mocks: {
          $i18n: { t: (key: string) => key },
          $t: (key: string) => key,
          $q: { dark: { isActive: true } },
        },
        stubs: {
          QDialog: { template: "<div><slot /></div>" },
          QCard: { template: "<div><slot /></div>" },
          QCardSection: { template: "<div><slot /></div>" },
          QResponsive: { template: "<div><slot /></div>" },
          QItemLabel: { template: "<div><slot /></div>" },
          QInput: {
            props: ["modelValue"],
            emits: ["update:modelValue", "blur"],
            template:
              '<input class="desc-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />',
          },
          QBtn: {
            emits: ["click"],
            template: "<button @click=\"$emit('click')\"><slot /></button>",
          },
          QIcon: {
            props: ["name"],
            template: '<span :data-icon="name" />',
          },
          QChip: true,
          QToggle: true,
          VueQrcode: true,
          PaymentRequestPayments: true,
        },
      },
    });
    wrappers.push(wrapper);

    // 1. Typing description updates the displayed request QR immediately without blur
    const descInput = wrapper.find("input.desc-input");
    expect(descInput.exists()).toBe(true);
    await descInput.setValue("updated note");
    await nextTick();
    expect(shown(requests).description).toBe("updated note");
    expect(requests.ourPaymentRequests).toHaveLength(2);

    // 2. Selecting the paid request and clicking Delete (even if blur fires first) deletes the paid request
    requests.selectRequestByIndex(0);
    await nextTick();
    expect(requests.currentPaymentRequest?.id).toBe(paidId);
    const dialog = wrapper.vm as any;
    dialog.memo = "uncommitted change";
    await descInput.trigger("blur");
    const deleteBtn = wrapper
      .findAll("button")
      .find((b) => b.html().includes("delete_outline"));
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.trigger("click");
    dialog.deleteCurrentRequest();
    await nextTick();

    expect(requests.ourPaymentRequests.map((r) => r.id)).not.toContain(paidId);
  });
});
