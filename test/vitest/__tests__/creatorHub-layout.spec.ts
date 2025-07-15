import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import * as quasar from 'quasar';

vi.spyOn(quasar, 'useQuasar').mockReturnValue({ screen: { lt: { md: false } } });

const creatorHubStoreMock = {
  loggedInNpub: 'pubkey',
  tiers: {},
  tierOrder: [] as string[],
  getTierArray: () => [] as any[],
  addTier: vi.fn(),
  loginWithNip07: vi.fn(),
  loginWithNsec: vi.fn(),
  logout: vi.fn(),
  loadTiersFromNostr: vi.fn(),
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

vi.mock('../../../src/stores/nostr', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNostrStore: () => nostrStoreMock,
    fetchNutzapProfile: vi.fn(async () => null),
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

import CreatorHubPage from '../../../src/pages/CreatorHubPage.vue';

describe('CreatorHubPage layout', () => {
  it('renders two section cards and PublishBar on desktop', () => {
    const wrapper = shallowMount(CreatorHubPage);
    expect(wrapper.findAll('.section-card').length).toBe(2);
    expect(wrapper.find('publish-bar-stub').exists()).toBe(true);
  });
});

