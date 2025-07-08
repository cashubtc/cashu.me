import { describe, it, expect, vi } from "vitest";
import { nip19 } from "nostr-tools";
import { ensureCompressed } from "src/utils/ecash";

const hex = "11".repeat(32);
const npub = nip19.npubEncode(hex);

const event = {
  tags: [
    ["pubkey", npub],
    ["mint", "https://mint"],
  ],
} as any;

const subMock = {
  on: vi.fn((_evt: string, cb: any) => cb(event)),
  stop: vi.fn(),
};

vi.mock("src/composables/useNdk", () => ({
  useNdk: vi.fn(async () => ({ subscribe: vi.fn(() => subMock) })),
}));

const storeMock = { initNdkReadOnly: vi.fn() };
vi.mock("stores/nostr", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNostrStore: () => storeMock,
    ensureRelayConnectivity: vi.fn(),
  };
});

import { fetchNutzapProfile } from "stores/nostr";

describe("fetchNutzapProfile", () => {
  it("returns compressed hex from npub tag", async () => {
    const prof = await fetchNutzapProfile("npub123");
    expect(prof?.p2pkPubkey).toBe(ensureCompressed(hex));
    expect(prof?.p2pkPubkey?.length).toBe(66);
  });
});
