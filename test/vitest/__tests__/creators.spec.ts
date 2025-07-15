import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCreatorsStore,
  FEATURED_CREATORS,
} from "../../../src/stores/creators";

const fetchProfile = vi.fn();
const userProfile = { name: "Alice" };
const getUserMock = vi.fn(() => ({ fetchProfile, profile: userProfile }));
const nostrStoreMock = {
  initNdkReadOnly: vi.fn(),
  ndk: { getUser: getUserMock },
  fetchFollowerCount: vi.fn().mockResolvedValue(10),
  fetchFollowingCount: vi.fn().mockResolvedValue(5),
  fetchJoinDate: vi.fn().mockResolvedValue(123456),
};

vi.mock("../../../src/stores/nostr", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNostrStore: () => nostrStoreMock };
});

vi.mock("nostr-tools", () => ({
  nip19: { decode: vi.fn() },
}));

const { nip19 } = require("nostr-tools");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Creators store", () => {
  it("populates searchResults for valid npub", async () => {
    (nip19.decode as any).mockReturnValue({ data: "f".repeat(64) });
    const creators = useCreatorsStore();
    await creators.searchCreators("npub123");

    expect(creators.error).toBe("");
    expect(creators.searchResults.length).toBe(1);
    expect(creators.searchResults[0].pubkey).toBe("f".repeat(64));
    expect(creators.searchResults[0].profile).toEqual(userProfile);
    expect(creators.searchResults[0].followers).toBe(10);
    expect(creators.searchResults[0].following).toBe(5);
    expect(creators.searchResults[0].joined).toBe(123456);
  });

  it("populates searchResults for hex pubkey", async () => {
    const creators = useCreatorsStore();
    await creators.searchCreators("a".repeat(64));

    expect(creators.error).toBe("");
    expect(creators.searchResults.length).toBe(1);
    expect(creators.searchResults[0].pubkey).toBe("a".repeat(64));
  });

  it("handles invalid npub", async () => {
    (nip19.decode as any).mockImplementation(() => {
      throw new Error("bad");
    });
    const creators = useCreatorsStore();
    await creators.searchCreators("npubbad");

    expect(creators.searchResults.length).toBe(0);
    expect(creators.error).toBe("Invalid npub");
  });

  it("handles invalid hex", async () => {
    const creators = useCreatorsStore();
    await creators.searchCreators("badhex");

    expect(creators.searchResults.length).toBe(0);
    expect(creators.error).toBe("Invalid pubkey");
  });

  it("loads featured creators", async () => {
    (nip19.decode as any).mockReturnValue({ data: "f".repeat(64) });
    const creators = useCreatorsStore();
    await creators.loadFeaturedCreators();

    expect(creators.error).toBe("");
    expect(creators.searchResults.length).toBe(FEATURED_CREATORS.length);
  });
});
