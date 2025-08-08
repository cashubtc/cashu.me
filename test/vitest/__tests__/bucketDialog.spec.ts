import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import BucketDialog from "../../../src/components/BucketDialog.vue";
import BucketManager from "../../../src/components/BucketManager.vue";
import { createI18n } from "vue-i18n";

const addBucketMock = vi.fn();

vi.mock("../../../src/stores/buckets", () => ({
  useBucketsStore: () => ({
    bucketList: [],
    bucketBalances: {},
    addBucket: addBucketMock,
    editBucket: vi.fn(),
    deleteBucket: vi.fn(),
  }),
  COLOR_PALETTE: ["#fff"],
  hashColor: () => "#fff",
}));

vi.mock("../../../src/constants/buckets", () => ({
  DEFAULT_BUCKET_ID: "b1",
}));

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({ moveProofs: vi.fn() }),
}));

vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({ activeUnit: "sat" }),
}));

vi.mock("../../../src/stores/ui", () => ({
  useUiStore: () => ({ formatCurrency: (a: number) => String(a) }),
}));

vi.mock("../../../src/js/notify", () => ({
  notifyError: vi.fn(),
}));

beforeEach(() => {
  addBucketMock.mockReset();
});

describe("BucketDialog", () => {
  it("adds bucket and closes dialog", async () => {
    const wrapper = mount(BucketDialog, { props: { modelValue: true } });
    const vm: any = wrapper.vm;
    vm.form.name = "Test bucket";
    await wrapper.vm.$nextTick();

    await vm.save();

    expect(addBucketMock).toHaveBeenCalled();
    expect(wrapper.emitted()["update:modelValue"][0]).toEqual([false]);
  });
});

describe("BucketManager", () => {
  it("renders add button label", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "en",
      messages: { en: { bucketManager: { actions: { add: "Add bucket" } } } },
    });
    const wrapper = mount(BucketManager, {
      global: { plugins: [i18n] },
    });
    expect(wrapper.text()).toContain("Add bucket");
  });
});
