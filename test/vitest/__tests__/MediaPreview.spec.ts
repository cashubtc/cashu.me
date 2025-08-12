import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MediaPreview from "../../../src/components/MediaPreview.vue";

describe("MediaPreview component", () => {
  it("renders img for image url", () => {
    const wrapper = mount(MediaPreview, {
      props: { url: "https://example.com/img.png" },
    });
    expect(wrapper.find("img").exists()).toBe(true);
  });

  it("renders iframe for youtube url", () => {
    const wrapper = mount(MediaPreview, {
      props: { url: "https://youtu.be/abcd1234efg" },
    });
    expect(wrapper.find("iframe").exists()).toBe(true);
  });

  it("renders video tag for mp4", () => {
    const wrapper = mount(MediaPreview, {
      props: { url: "https://example.com/movie.mp4" },
    });
    expect(wrapper.find("video").exists()).toBe(true);
  });

  it("renders generic iframe for unknown url", () => {
    const wrapper = mount(MediaPreview, {
      props: { url: "https://example.com/page" },
    });
    const iframes = wrapper.findAll("iframe");
    expect(iframes.length).toBe(1);
  });

  it("renders iframe for nostr event link", () => {
    const wrapper = mount(MediaPreview, {
      props: { url: "https://primal.net/e/abc123" },
    });
    expect(wrapper.find("iframe").exists()).toBe(true);
  });
});
