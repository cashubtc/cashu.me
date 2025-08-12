import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import BucketCard from "../../../src/components/BucketCard.vue";
import * as quasar from "quasar";

const qMenuStub = {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<div v-if="modelValue" :class="$attrs.class" data-test="q-menu"><slot /></div>',
};

const bucket = { id: "b1", name: "Bucket", isArchived: false };

describe("BucketCard menu actions", () => {
  it("emits menu-action for each option", async () => {
    const wrapper = mount(BucketCard, {
      props: { bucket, balance: 0, activeUnit: "sat" },
      global: {
        stubs: { "q-menu": { template: "<div><slot /></div>" } },
      },
    });

    await wrapper.find('[data-test="bucket-menu-btn"]').trigger("click");
    await wrapper.find('[data-test="manage"]').trigger("click");
    await wrapper.find('[data-test="edit"]').trigger("click");
    await wrapper.find('[data-test="archive"]').trigger("click");
    await wrapper.find('[data-test="delete"]').trigger("click");

    const events = wrapper.emitted("menu-action");
    expect(events).toHaveLength(4);
    expect(events?.[0][0].action).toBe("manage");
    expect(events?.[1][0].action).toBe("edit");
    expect(events?.[2][0].action).toBe("archive");
    expect(events?.[3][0].action).toBe("delete");
  });
});

describe("BucketCard menu responsive behaviour", () => {
  const spy = vi.spyOn(quasar, "useQuasar");

  afterEach(() => {
    spy.mockReset();
  });

  it("toggles menu on large and small screens", async () => {
    for (const small of [false, true]) {
      spy.mockReturnValue({ screen: { lt: { sm: small } } });
      const wrapper = mount(BucketCard, {
        props: { bucket, balance: 0, activeUnit: "sat" },
        global: { stubs: { "q-menu": qMenuStub } },
      });
      expect(wrapper.vm.menu).toBe(false);
      expect(wrapper.find(".elevated-menu").exists()).toBe(false);
      await wrapper.find('[data-test="bucket-menu-btn"]').trigger("click");
      expect(wrapper.vm.menu).toBe(true);
      const menuEl = wrapper.find(".elevated-menu");
      expect(menuEl.exists()).toBe(true);
      await wrapper.find('[data-test="bucket-menu-btn"]').trigger("click");
      expect(wrapper.vm.menu).toBe(false);
      expect(wrapper.find(".elevated-menu").exists()).toBe(false);
      wrapper.unmount();
    }
  });
});
