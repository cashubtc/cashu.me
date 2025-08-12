import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCreatorSubscribersStore } from '../../../src/stores/creatorSubscribers';
import type { Subscriber } from '../../../src/types/subscriber';
import { NDKEvent, NDKRelay, NDKRelaySet } from '@nostr-dev-kit/ndk';

// Mock dependencies
const fetchEventsMock = vi.fn();
vi.mock('../../../src/stores/nostr', () => ({
  useNostrStore: () => ({
    initNdkReadOnly: vi.fn().mockResolvedValue(undefined),
    resolvePubkey: (s: string) => s.replace('npub', ''), // simplified for test
    connected: true,
    lastError: null,
  }),
}));
vi.mock('../../../src/composables/useNdk', () => {
  return {
    useNdk: vi.fn().mockResolvedValue({
      fetchEvents: fetchEventsMock,
      pool: {
        getRelay: (url: string) => new NDKRelay(url),
      },
    }),
  };
});
vi.mock('../../../src/stores/dexie', () => ({
    cashuDb: {
        profiles: {
            put: vi.fn().mockResolvedValue(undefined),
        },
    },
}));


describe('creatorSubscribers Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    fetchEventsMock.clear();
  });

  it('fetches profiles in batches', async () => {
    const store = useCreatorSubscribersStore();
    const numSubscribers = 120;
    const batchSize = 50;
    const expectedBatches = Math.ceil(numSubscribers / batchSize);

    // 1. Create a large number of mock subscribers
    const mockSubscribers: Subscriber[] = Array.from({ length: numSubscribers }, (_, i) => ({
      id: `sub${i}`,
      npub: `npub${i}`,
      name: `npub${i}`, // Initially name is the npub
      nip05: '',
      tierId: 't1',
      tierName: 'Tier 1',
      amountSat: 1000,
      frequency: 'monthly',
      intervalDays: 30,
      status: 'active',
      startDate: Date.now() / 1000,
      nextRenewal: Date.now() / 1000 + 30 * 86400,
      lifetimeSat: 1000,
      receivedPeriods: 1,
      totalPeriods: null,
      progress: 0,
      dueSoon: false,
    }));

    store.subscribers = mockSubscribers;

    // 2. Mock fetchEvents to return a dummy profile for each pubkey
    fetchEventsMock.mockImplementation(async (filter) => {
        const authors = filter.authors as string[];
        const events = new Set<NDKEvent>();
        authors.forEach(pubkey => {
            const event = new NDKEvent();
            event.pubkey = pubkey;
            event.content = JSON.stringify({ name: `User ${pubkey}` });
            events.add(event);
        });
        return events;
    });

    // 3. Call fetchProfiles
    await store.fetchProfiles();

    // 4. Assert that fetchEvents was called multiple times
    expect(fetchEventsMock).toHaveBeenCalledTimes(expectedBatches);

    // 5. Assert that the store is updated with the new profile data
    expect(store.subscribers[0].name).toBe('User 0');
    expect(store.subscribers[numSubscribers - 1].name).toBe(`User ${numSubscribers - 1}`);
  });
});
