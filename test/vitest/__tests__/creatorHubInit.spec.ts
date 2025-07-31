import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCreatorHub } from '../../../src/composables/useCreatorHub';

const creatorHubStoreMock = {
  loggedInNpub: 'pubkey',
  tiers: {},
  tierOrder: [] as string[],
  getTierArray: () => [] as any[],
  addTier: vi.fn(),
  loginWithNip07: vi.fn(),
  loginWithNsec: vi.fn(),
  logout: vi.fn(),
  loadTiersFromNostr: vi.fn(async () => {}),
  updateTier: vi.fn(),
  saveTier: vi.fn(),
  removeTier: vi.fn(),
  publishTierDefinitions: vi.fn(),
  setTierOrder: vi.fn(),
};

vi.mock('../../../src/stores/creatorHub', () => ({
  useCreatorHubStore: () => creatorHubStoreMock,
}));

const nostrStoreMock = {
  initSignerIfNotSet: vi.fn(),
  getProfile: vi.fn(async () => null),
  relays: [] as string[],
};

const fetchNutzapProfileMock = vi.fn(async () => null);

vi.mock('../../../src/stores/nostr', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNostrStore: () => nostrStoreMock,
    fetchNutzapProfile: (...args: any[]) => fetchNutzapProfileMock(...args),
    publishDiscoveryProfile: vi.fn(),
    RelayConnectionError: class RelayConnectionError extends Error {},
  };
});

vi.mock('../../../src/stores/p2pk', () => ({
  useP2PKStore: () => ({ firstKey: null }),
}));

vi.mock('../../../src/stores/mints', () => ({
  useMintsStore: () => ({ mints: [] }),
}));

const profileStoreMock = {
  display_name: '',
  picture: '',
  about: '',
  pubkey: '',
  mints: [] as string[],
  relays: [] as string[],
  setProfile: vi.fn(),
  markClean: vi.fn(),
};

vi.mock('../../../src/stores/creatorProfile', () => ({
  useCreatorProfileStore: () => profileStoreMock,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual: any = await importOriginal();
  const vue = await import('vue');
  return {
    ...actual,
    storeToRefs(store: any) {
      const result: any = {};
      for (const key of Object.keys(store)) {
        result[key] = vue.ref((store as any)[key]);
      }
      return result;
    },
  };
});

vi.mock('nostr-tools', () => ({
  nip19: { npubEncode: (s: string) => `npub${s}` },
}));

describe('useCreatorHub initPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches profile, nutzap profile and tiers', async () => {
    const { initPage, loadingProfile, loadingNutzap, loadingTiers } = useCreatorHub();
    await initPage();
    expect(nostrStoreMock.getProfile).toHaveBeenCalled();
    expect(fetchNutzapProfileMock).toHaveBeenCalled();
    expect(creatorHubStoreMock.loadTiersFromNostr).toHaveBeenCalled();
    expect(loadingProfile.value).toBe(false);
    expect(loadingNutzap.value).toBe(false);
    expect(loadingTiers.value).toBe(false);
  });
});
