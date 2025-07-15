import { beforeEach, describe, expect, it, vi } from "vitest";

var subMock: any;
var filterMock: any;

vi.mock("../../../src/stores/nostr", async (importOriginal) => {
  const actual = await importOriginal();
  subMock = vi.fn();
  return {
    ...actual,
    subscribeToNostr: (...args: any[]) => subMock(...args),
    useNostrStore: () => ({}),
  };
});

vi.mock("../../../src/boot/ndk", () => {
  filterMock = vi.fn();
  return {
    filterHealthyRelays: (...args: any[]) => filterMock(...args),
  };
});

vi.mock("../../../src/stores/settings", () => ({
  useSettingsStore: () => ({
    tiersIndexerUrl: { value: "https://indexer/?pubkey={pubkey}" },
    defaultNostrRelays: { value: [] },
  }),
}));

vi.mock("../../../src/js/notify", () => ({
  notifyWarning: vi.fn(),
}));

import { useCreatorsStore } from "../../../src/stores/creators";
import { cashuDb as db } from "../../../src/stores/dexie";

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  await db.close();
  await db.open();
});

describe("fetchTierDefinitions fallback", () => {
  it("uses indexer when no relays healthy", async () => {
    filterMock.mockResolvedValue([]);
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          event: {
            id: "1",
            created_at: 1,
            content: '[{"id":"t","name":"T","price_sats":1,"description":"d","benefits":[]}]',
            tags: [["d", "tiers"]],
          },
        }),
      } as any);
    const store = useCreatorsStore();
    await store.fetchTierDefinitions("pub");
    expect(subMock).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
    expect(store.tiersMap["pub"].length).toBe(1);
    fetchSpy.mockRestore();
  });

  it("falls back immediately when subscription fails", async () => {
    filterMock.mockResolvedValue(["wss://relay"]);
    subMock.mockResolvedValue(false);
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          event: {
            id: "1",
            created_at: 1,
            content: '[{"id":"t","name":"T","price_sats":1,"description":"d","benefits":[]}]',
            tags: [["d", "tiers"]],
          },
        }),
      } as any);
    const store = useCreatorsStore();
    await store.fetchTierDefinitions("pub");
    expect(subMock).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
    expect(store.tiersMap["pub"].length).toBe(1);
    fetchSpy.mockRestore();
  });

  it("decodes npub and stores using hex", async () => {
    filterMock.mockResolvedValue([]);
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          event: {
            id: "1",
            created_at: 1,
            content:
              '[{"id":"t","name":"T","price_sats":1,"description":"d","benefits":[]}]',
            tags: [["d", "tiers"]],
          },
        }),
      } as any);
    const { nip19 } = await import("nostr-tools");
    const hex = "f".repeat(64);
    const npub = nip19.npubEncode(hex);
    const store = useCreatorsStore();
    await store.fetchTierDefinitions(npub);
    expect(fetchSpy).toHaveBeenCalled();
    expect(store.tiersMap[hex].length).toBe(1);
    fetchSpy.mockRestore();
  });
});
