import { mount, flushPromises } from "@vue/test-utils";
import {
  Fragment,
  createCommentVNode,
  createElementBlock,
  createElementVNode,
  defineComponent,
  h,
  openBlock,
} from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it, vi } from "vitest";

// The real FullscreenLayout and real <transition>: Back to or from a page whose
// template compiles to a fragment (a leading comment in dev builds) must still render the
// destination, never an empty placeholder. The browser spec (ui-route-back) covers the CSS.

vi.hoisted(() => {
  (globalThis as unknown as { windowMixin: object }).windowMixin = {};
});
const { default: FullscreenLayout } = await import(
  "src/layouts/FullscreenLayout.vue"
);

const Shell = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h("div", slots.default?.()),
});

const page = (name: string) =>
  defineComponent({
    name,
    render: () => h("section", { class: "page" }, name),
  });

// What the dev compiler emits for `<template><!-- note --><section>…</section></template>`:
// a stable dev-root fragment (patch flags 64 | 2048).
const CommentRoot = defineComponent({
  name: "CommentRoot",
  render: () => (
    openBlock(),
    createElementBlock(
      Fragment,
      null,
      [
        createCommentVNode(" a leading comment "),
        createElementVNode("section", { class: "page" }, "comment-root"),
      ],
      64 | 2048
    )
  ),
});

const tick = () => new Promise((r) => setTimeout(r, 30));

async function settle() {
  for (let i = 0; i < 6; i++) {
    await flushPromises();
    await tick();
  }
}

function mountLayout() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/plain", component: page("plain") },
      { path: "/other", component: page("other") },
      { path: "/comment", component: CommentRoot },
      { path: "/lazy", component: () => Promise.resolve(page("lazy")) },
      { path: "/redirect", redirect: "/plain" },
    ],
  });
  const wrapper = mount(FullscreenLayout, {
    global: {
      plugins: [router],
      stubs: {
        transition: false,
        FullscreenHeader: true,
        QLayout: Shell,
        QPageContainer: Shell,
      },
    },
    attachTo: document.body,
  });
  expect(wrapper.find("transition-stub").exists()).toBe(false);
  return { router, wrapper };
}

/** The rendered pages, and the route wrappers around them. */
const current = (wrapper: ReturnType<typeof mountLayout>["wrapper"]) => ({
  pages: wrapper.findAll(".page").map((page) => page.text()),
  routes: wrapper
    .findAll('[data-testid="fullscreen-route"]')
    .map((route) => route.attributes("data-route-path")),
});

describe("FullscreenLayout route transitions", () => {
  it("renders each destination going forward and back, through a comment-root page", async () => {
    const { router, wrapper } = mountLayout();
    const steps: [string, string][] = [
      ["/plain", "plain"],
      ["/comment", "comment-root"],
      ["/plain", "plain"],
      ["/lazy", "lazy"],
      ["/comment", "comment-root"],
      ["/redirect", "plain"],
    ];
    for (const [path, text] of steps) {
      await router.push(path);
      await settle();
      expect(current(wrapper)).toEqual({
        pages: [text],
        routes: [router.currentRoute.value.path],
      });
    }
    router.back();
    await settle();
    expect(current(wrapper)).toEqual({
      pages: ["comment-root"],
      routes: ["/comment"],
    });
    wrapper.unmount();
  });

  it("ends on the last destination when a navigation interrupts a leave", async () => {
    const { router, wrapper } = mountLayout();
    await router.push("/plain");
    await settle();
    router.push("/comment");
    await flushPromises();
    router.push("/other");
    await flushPromises();
    router.push("/comment");
    await settle();
    expect(current(wrapper)).toEqual({
      pages: ["comment-root"],
      routes: ["/comment"],
    });
    wrapper.unmount();
  });
});
