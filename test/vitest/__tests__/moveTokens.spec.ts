import { describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import MoveTokens from "../../../src/components/MoveTokensModal.vue";

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({ proofs: [] }),
}));

vi.mock("../../../src/stores/buckets", () => ({
  useBucketsStore: () => ({
    bucketList: [
      { id: "b1", name: "Bucket 1" },
      { id: "b2", name: "Bucket 2" },
    ],
  }),
  COLOR_PALETTE: ["#fff"],
  hashColor: () => "#fff",
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

describe("MoveTokens component", () => {
  it("toggles token selection", () => {
    const wrapper = shallowMount(MoveTokens, { props: { modelValue: true } });
    const vm: any = wrapper.vm;

    vm.toggleProof("s1", true);
    expect(vm.selectedSecrets).toContain("s1");

    vm.toggleProof("s1", false);
    expect(vm.selectedSecrets).not.toContain("s1");
  });

  it("moves selected tokens", async () => {
    const wrapper = shallowMount(MoveTokens, { props: { modelValue: true } });
    const vm: any = wrapper.vm;
    vm.selectedSecrets = ["a", "b"];
    vm.targetBucketId = "b2";

    await vm.moveSelected();

    expect(wrapper.emitted("move")?.[0]).toEqual([
      { secrets: ["a", "b"], bucketId: "b2" },
    ]);
    expect(vm.selectedSecrets.length).toBe(0);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
  });

  it("reflects modelValue via showLocal", async () => {
    const wrapper = shallowMount(MoveTokens, { props: { modelValue: true } });
    const vm: any = wrapper.vm;
    expect(vm.showLocal).toBe(true);
    await wrapper.setProps({ modelValue: false });
    expect((wrapper.vm as any).showLocal).toBe(false);
  });
});
