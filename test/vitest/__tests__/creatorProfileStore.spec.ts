import { describe, it, expect, beforeEach } from "vitest";
import { useCreatorProfileStore } from "../../../src/stores/creatorProfile";

beforeEach(() => {
  localStorage.clear();
});

describe("CreatorProfileStore isDirty", () => {
  it("becomes true when any field changes", () => {
    const store = useCreatorProfileStore();
    store.setProfile({
      display_name: "name",
      picture: "pic",
      about: "about",
      pubkey: "pub",
      mints: ["m1"],
      relays: ["r1"],
    });
    store.markClean();
    expect(store.isDirty).toBe(false);

    store.display_name = "changed";
    expect(store.isDirty).toBe(true);
    store.markClean();

    store.picture = "newpic";
    expect(store.isDirty).toBe(true);
    store.markClean();

    store.about = "new about";
    expect(store.isDirty).toBe(true);
    store.markClean();

    store.pubkey = "newpub";
    expect(store.isDirty).toBe(true);
    store.markClean();

    store.mints = ["m1", "m2"];
    expect(store.isDirty).toBe(true);
    store.markClean();

    store.relays = ["r1", "r2"];
    expect(store.isDirty).toBe(true);
  });
});
