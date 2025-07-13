import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BucketManager from "../../../src/components/BucketManager.vue";

const mockBuckets = [
  { id: "b1", name: "Alpha" },
  { id: "b2", name: "Beta" },
];

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({ moveProofs: vi.fn() }),
}));

vi.mock("../../../src/stores/buckets", () => ({
  useBucketsStore: () => ({
    bucketList: mockBuckets,
    bucketBalances: {},
    addBucket: vi.fn(),
    editBucket: vi.fn(),
    deleteBucket: vi.fn(),
  }),
  DEFAULT_BUCKET_ID: "b1",
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

describe("BucketManager form", () => {
  it("renders description tooltip", async () => {
    const wrapper = shallowMount(BucketManager);
    const vm: any = wrapper.vm;
    vm.openAdd();
    await wrapper.vm.$nextTick();
    expect(wrapper.find("info-tooltip-stub").exists()).toBe(true);
  });

  it("filters buckets by search term", async () => {
    const wrapper = shallowMount(BucketManager);
    expect(wrapper.findAll("bucket-card-stub").length).toBe(2);
    (wrapper.vm as any).searchTerm = "Beta";
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll("bucket-card-stub").length).toBe(1);
  });
});
