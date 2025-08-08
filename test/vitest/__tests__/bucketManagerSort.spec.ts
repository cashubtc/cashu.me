import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import BucketManager from "../../../src/components/BucketManager.vue";

const mockBuckets = [
  { id: "b1", name: "Alpha", isArchived: false },
  { id: "b2", name: "Beta", isArchived: false },
  { id: "b3", name: "Gamma", isArchived: false },
];

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({ moveProofs: vi.fn() }),
}));

vi.mock("../../../src/stores/buckets", () => ({
  useBucketsStore: () => ({
    bucketList: mockBuckets,
    bucketBalances: { b1: 2, b2: 3, b3: 1 },
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
  useMintsStore: () => ({ activeUnit: ref("sat") }),
}));

vi.mock("../../../src/stores/ui", () => ({
  useUiStore: () => ({ formatCurrency: (a: number) => String(a) }),
}));

vi.mock("../../../src/js/notify", () => ({
  notifyError: vi.fn(),
}));

describe("BucketManager sorting", () => {
  it("sorts by name ascending", () => {
    const wrapper = shallowMount(BucketManager);
    const ids = (wrapper.vm as any).filteredBuckets.map((b: any) => b.id);
    expect(ids).toEqual(["b1", "b2", "b3"]);
  });

  it("sorts by balance descending", async () => {
    const wrapper = shallowMount(BucketManager);
    (wrapper.vm as any).sortBy = "balance";
    await wrapper.vm.$nextTick();
    const ids = (wrapper.vm as any).filteredBuckets.map((b: any) => b.id);
    expect(ids).toEqual(["b2", "b1", "b3"]);
  });
});
