import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BucketManager from "../../../src/components/BucketManager.vue";

const mockBuckets = [
  { id: "b1", name: "Active", isArchived: false },
  { id: "b2", name: "Old", isArchived: true },
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
  COLOR_PALETTE: ["#fff"],
  hashColor: () => "#fff",
}));

vi.mock("../../../src/constants/buckets", () => ({
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

describe("BucketManager view mode", () => {
  it("switching viewMode filters buckets", async () => {
    const wrapper = shallowMount(BucketManager);
    expect(wrapper.findAll("bucket-card-stub").length).toBe(1);
    (wrapper.vm as any).viewMode = "archived";
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll("bucket-card-stub").length).toBe(1);
    expect((wrapper.vm as any).filteredBuckets[0].id).toBe("b2");
    (wrapper.vm as any).viewMode = "all";
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll("bucket-card-stub").length).toBe(1);
    expect((wrapper.vm as any).filteredBuckets[0].id).toBe("b1");
  });
});
