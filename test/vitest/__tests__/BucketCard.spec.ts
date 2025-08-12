import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BucketCard from "../../../src/components/BucketCard.vue";
import { hashColor } from "../../../src/stores/buckets";

describe("BucketCard progress section", () => {
  const base = { id: "b1", name: "Test", isArchived: false };
  it("reserves space when goal missing", () => {
    const wrapper = mount(BucketCard, {
      props: { bucket: base, balance: 0, activeUnit: "sat" },
    });
    expect(wrapper.find('[data-test="progress-section"]').exists()).toBe(true);
    expect(wrapper.find("q-linear-progress-stub").exists()).toBe(false);
  });
});

describe("hashColor util", () => {
  it("returns hex color", () => {
    const c = hashColor("My Bucket");
    expect(c).toMatch(/^#([0-9a-fA-F]{6})$/);
  });
});
