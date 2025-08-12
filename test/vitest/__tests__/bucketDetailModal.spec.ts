import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import BucketDetailModal from "../../../src/components/BucketDetailModal.vue";

var tokenStore: any;

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({
    proofs: [
      {
        secret: "s1",
        amount: 1,
        bucketId: "b1",
        reserved: false,
        label: "foo",
        description: "bar",
      },
    ],
  }),
}));

vi.mock("../../../src/stores/buckets", () => ({
  useBucketsStore: () => ({ bucketList: [{ id: "b1", name: "Bucket" }] }),
}));

vi.mock("../../../src/constants/buckets", () => ({
  DEFAULT_BUCKET_ID: "b1",
}));

import { ref } from "vue";
vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({ activeUnit: ref("sat") }),
}));

vi.mock("../../../src/components/LockedTokensTable.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("../../../src/components/CreatorLockedTokensTable.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("../../../src/components/HistoryTable.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("../../../src/components/SendBucketDmDialog.vue", () => ({
  default: { template: "<div />", methods: { show: vi.fn() } },
}));

vi.mock("../../../src/stores/tokens", () => {
  tokenStore = { editHistoryTokenBySecret: vi.fn() };
  return { useTokensStore: () => tokenStore };
});

vi.mock("../../../src/stores/ui", () => ({
  useUiStore: () => ({ formatCurrency: (a: number) => String(a) }),
}));

vi.mock("../../../src/js/notify", () => ({ notifyError: vi.fn() }));

describe("BucketDetailModal openEdit", () => {
  it("calls editHistoryToken with new values", async () => {
    const wrapper = mount(BucketDetailModal, {
      props: { modelValue: true, bucketId: "b1" },
    });
    const vm: any = wrapper.vm;
    vm.openEdit({ secret: "s1", label: "foo", description: "bar" });
    vm.editDialog.label = "new";
    vm.editDialog.description = "desc";
    vm.saveEdit();
    expect(tokenStore.editHistoryTokenBySecret).toHaveBeenCalledWith("s1", {
      newLabel: "new",
      newDescription: "desc",
    });
  });
});
