import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BucketManager from "../../../src/components/BucketManager.vue";

const moveProofsMock = vi.fn();

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({ moveProofs: moveProofsMock }),
}));

vi.mock("../../../src/stores/buckets", () => ({
  useBucketsStore: () => ({
    bucketList: [{ id: "b1", name: "Bucket 1" }],
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

beforeEach(() => {
  moveProofsMock.mockReset();
});

describe("BucketManager drag and drop", () => {
  it("moves proofs on drop with JSON data", async () => {
    const wrapper = shallowMount(BucketManager);
    const vm: any = wrapper.vm;
    const event = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: vi.fn(() => '["s1","s2"]') },
    } as any;
    await vm.handleDrop(event, "b1");
    expect(moveProofsMock).toHaveBeenCalledWith(["s1", "s2"], "b1");
  });

  it("moves proofs on drop with comma string", async () => {
    const wrapper = shallowMount(BucketManager);
    const vm: any = wrapper.vm;
    const event = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: vi.fn(() => "s3,s4") },
    } as any;
    await vm.handleDrop(event, "b1");
    expect(moveProofsMock).toHaveBeenCalledWith(["s3", "s4"], "b1");
  });
});
