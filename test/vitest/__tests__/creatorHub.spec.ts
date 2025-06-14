import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreatorHubStore } from "../../../src/stores/creatorHub";

let createdEvents: any[] = [];
const signMock = vi.fn();
const publishMock = vi.fn();

vi.mock("@nostr-dev-kit/ndk", () => {
  return {
    NDKEvent: class {
      kind: number | undefined;
      tags: any[] = [];
      content = "";
      constructor(public ndk?: any) {
        createdEvents.push(this);
      }
      async sign(signer?: any) {
        signMock(signer);
      }
      async publish() {
        publishMock();
      }
    },
    NDKKind: {},
  };
});

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

  it("saveTier creates proper nostr event", async () => {
    const store = useCreatorHubStore();
    const tier = {
      id: "id1",
      name: "T",
      price: 1,
      perks: "p",
      welcomeMessage: "w",
    };
    await store.saveTier(tier);
    expect(nostrStoreMock.initSignerIfNotSet).toHaveBeenCalled();
    expect(createdEvents).toHaveLength(1);
    const ev = createdEvents[0];
    expect(ev.kind).toBe(38100);
    expect(ev.tags).toEqual([["d", "id1"]]);
    expect(ev.content).toBe(JSON.stringify(tier));
    expect(signMock).toHaveBeenCalledWith(nostrStoreMock.signer);
    expect(publishMock).toHaveBeenCalled();
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
    expect(nostrStoreMock.initSignerIfNotSet).toHaveBeenCalled();
    expect(createdEvents).toHaveLength(1);
    const ev = createdEvents[0];
    expect(ev.kind).toBe(38100);
    expect(ev.tags).toEqual([["d", "id1"]]);
    expect(ev.content).toBe("");
    expect(signMock).toHaveBeenCalledWith(nostrStoreMock.signer);
    expect(publishMock).toHaveBeenCalled();
  });
});
