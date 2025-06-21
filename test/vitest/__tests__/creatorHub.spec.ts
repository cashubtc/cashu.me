import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreatorHubStore } from "../../../src/stores/creatorHub";

let createdEvents: any[] = [];
const signMock = vi.fn();
const publishMock = vi.fn();

const ndkStub = {
  createEvent: () => ({ sign: signMock, publish: publishMock, kind: undefined, tags: [], content: "" }),
};
vi.mock("../../../src/composables/useNdk", () => ({
  useNdk: vi.fn().mockResolvedValue(ndkStub),
}));

const nostrStoreMock = {
  initSignerIfNotSet: vi.fn(),
  ndk: {},
  signer: "sig",
};

vi.mock("../../../src/stores/nostr", () => ({
  useNostrStore: () => nostrStoreMock,
}));

beforeEach(() => {
  createdEvents = [];
  signMock.mockClear();
  publishMock.mockClear();
  nostrStoreMock.initSignerIfNotSet.mockClear();
  localStorage.clear();
});

describe("CreatorHub store", () => {
  it("addTier stores tier and calls saveTier", () => {
    const store = useCreatorHubStore();
    const spy = vi.spyOn(store, "saveTier").mockResolvedValue();
    store.addTier({ name: "Tier 1", price: 5, perks: "p" });
    const tier = store.getTierArray()[0];
    expect(tier.name).toBe("Tier 1");
    expect(spy).toHaveBeenCalledWith(tier);
  });

  it("saveTier stores tier", async () => {
    const store = useCreatorHubStore();
    const tier = {
      id: "id1",
      name: "T",
      price: 1,
      perks: "p",
      welcomeMessage: "w",
    };
    await store.saveTier(tier);
    expect(store.tiers["id1"]).toBeDefined();
  });

  it("removeTier publishes deletion event", async () => {
    const store = useCreatorHubStore();
    store.tiers["id1"] = {
      id: "id1",
      name: "T",
      price: 1,
      description: "",
      welcomeMessage: "",
    };
    await store.removeTier("id1");
    expect(store.tiers["id1"]).toBeUndefined();
  });
});
