import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCreatorSubscriptionsStore } from '../src/stores/creatorSubscriptions';
import { cashuDb } from '../src/stores/dexie';

vi.mock('../src/stores/creators', () => ({
  useCreatorsStore: () => ({ tiersMap: {} }),
}));

const WEEK = 7 * 24 * 60 * 60;
const BIWEEK = 14 * 24 * 60 * 60;

beforeEach(async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  await cashuDb.close();
  await cashuDb.delete();
  await cashuDb.open();
});

describe('creatorSubscriptions store', () => {
  it('computes weekly and biweekly subscriptions correctly', async () => {
    const store = useCreatorSubscriptionsStore();

    await cashuDb.lockedTokens.bulkAdd([
      {
        id: 'w1',
        tokenString: 'tokw1',
        amount: 1,
        owner: 'creator',
        subscriberNpub: 'npub',
        tierId: 'tier',
        tierName: 'Tier',
        intervalKey: 'wk1',
        unlockTs: 0,
        status: 'unlockable',
        subscriptionEventId: null,
        subscriptionId: 'subW',
        totalPeriods: 3,
        intervalDays: 7,
      },
      {
        id: 'w2',
        tokenString: 'tokw2',
        amount: 1,
        owner: 'creator',
        subscriberNpub: 'npub',
        tierId: 'tier',
        tierName: 'Tier',
        intervalKey: 'wk2',
        unlockTs: WEEK,
        status: 'unlockable',
        subscriptionEventId: null,
        subscriptionId: 'subW',
        totalPeriods: 3,
        intervalDays: 7,
      },
      {
        id: 'b1',
        tokenString: 'tokb1',
        amount: 1,
        owner: 'creator',
        subscriberNpub: 'npub',
        tierId: 'tier',
        tierName: 'Tier',
        intervalKey: 'bw1',
        unlockTs: 0,
        status: 'unlockable',
        subscriptionEventId: null,
        subscriptionId: 'subB',
        totalPeriods: 2,
        intervalDays: 14,
      },
      {
        id: 'b2',
        tokenString: 'tokb2',
        amount: 1,
        owner: 'creator',
        subscriberNpub: 'npub',
        tierId: 'tier',
        tierName: 'Tier',
        intervalKey: 'bw2',
        unlockTs: BIWEEK,
        status: 'unlockable',
        subscriptionEventId: null,
        subscriptionId: 'subB',
        totalPeriods: 2,
        intervalDays: 14,
      },
    ] as any);

    await new Promise((r) => setTimeout(r, 20));

    const weekly = store.subscriptions.find((s) => s.subscriptionId === 'subW');
    const biweekly = store.subscriptions.find((s) => s.subscriptionId === 'subB');

    expect(weekly?.totalPeriods).toBe(3);
    expect(weekly?.receivedPeriods).toBe(2);
    expect(weekly?.nextRenewal).toBe(WEEK * 2);
    expect(weekly?.status).toBe('pending');

    expect(biweekly?.totalPeriods).toBe(2);
    expect(biweekly?.receivedPeriods).toBe(2);
    expect(biweekly?.nextRenewal).toBe(BIWEEK * 2);
    expect(biweekly?.status).toBe('active');
  });

  it('falls back to Unknown Tier when tier data is missing', async () => {
    const store = useCreatorSubscriptionsStore();

    await cashuDb.lockedTokens.add({
      id: 'u1',
      tokenString: 'tok',
      amount: 1,
      owner: 'creator',
      subscriberNpub: 'npub',
      tierId: 'tier',
      intervalKey: 'int1',
      unlockTs: 0,
      status: 'unlockable',
      subscriptionEventId: null,
      subscriptionId: 'subU',
      totalPeriods: 1,
      intervalDays: 30,
    } as any);

    await new Promise((r) => setTimeout(r, 20));

    const sub = store.subscriptions.find((s) => s.subscriptionId === 'subU');
    expect(sub?.tierName).toBe('Unknown Tier');
  });
});

describe('creatorSubscriptions store (refactored)', () => {
  const now = Math.floor(Date.now() / 1000);
  const mockSubscriptions = [
      {
        id: 's1',
        subscriptionId: 'sub1',
        subscriberNpub: 'npub1',
        tierId: 'tier1',
        tierName: 'Gold',
        intervalDays: 7,
        totalPeriods: null,
        unlockTs: now - WEEK,
        amount: 1000,
        owner: 'creator',
        status: 'unlockable',
      },
      {
        id: 's2',
        subscriptionId: 'sub2',
        subscriberNpub: 'npub2',
        tierId: 'tier2',
        tierName: 'Silver',
        intervalDays: 30,
        totalPeriods: 3,
        unlockTs: now - 60 * 60 * 24 * 30,
        amount: 500,
        owner: 'creator',
        status: 'unlockable',
      },
      {
        id: 's3',
        subscriptionId: 'sub3',
        subscriberNpub: 'npub3',
        tierId: 'tier1',
        tierName: 'Gold',
        intervalDays: 14,
        totalPeriods: 2,
        unlockTs: now - 60 * 60 * 24 * 30, // ended
        amount: 750,
        owner: 'creator',
        status: 'unlockable',
      },
      {
        id: 's4',
        subscriptionId: 'sub4',
        subscriberNpub: 'npub4',
        tierId: 'tier3',
        tierName: 'Bronze',
        intervalDays: 7,
        totalPeriods: 5,
        unlockTs: now - 60, // due soon
        amount: 100,
        owner: 'creator',
        status: 'unlockable',
      },
  ];

  beforeEach(async () => {
      await cashuDb.lockedTokens.bulkAdd(mockSubscriptions as any);
      await new Promise((r) => setTimeout(r, 50));
  });

  it('computes nextRenewalProgress and dueSoon', () => {
      const store = useCreatorSubscriptionsStore();
      const subDueSoon = store.subscriptions.find(s => s.subscriptionId === 'sub4');
      expect(subDueSoon?.dueSoon).toBe(true);

      const subNotDueSoon = store.subscriptions.find(s => s.subscriptionId === 'sub1');
      expect(subNotDueSoon?.dueSoon).toBe(false);

      expect(subNotDueSoon?.nextRenewalProgress).toBeCloseTo(1);

      const subHalfWay = store.subscriptions.find(s => s.subscriptionId === 'sub3');
      // this is ended, so progress is not relevant.
      // let's test sub2 instead, which is active and monthly
      const sub2 = store.subscriptions.find(s => s.subscriptionId === 'sub2');
      expect(sub2?.nextRenewalProgress).toBeCloseTo(1);
  });

  it('computes status correctly, including ended', () => {
      const store = useCreatorSubscriptionsStore();
      const endedSub = store.subscriptions.find(s => s.subscriptionId === 'sub3');
      expect(endedSub?.status).toBe('ended');
      const activeSub = store.subscriptions.find(s => s.subscriptionId === 'sub1');
      expect(activeSub?.status).toBe('active');
      const pendingSub = store.subscriptions.find(s => s.subscriptionId === 'sub2');
      expect(pendingSub?.status).toBe('pending');
  });

  it('provides correct getters for frequencies and statuses', () => {
      const store = useCreatorSubscriptionsStore();
      expect(store.weekly().length).toBe(2);
      expect(store.biweekly().length).toBe(1);
      expect(store.monthly().length).toBe(1);
      expect(store.ended().length).toBe(1);
      expect(store.pending().length).toBe(1);
      // 2 active subs
      const activeSubs = store.all.value.filter(s => s.status === 'active');
      expect(activeSubs.length).toBe(2);
  });

  it('filters with sliceBy method', () => {
      const store = useCreatorSubscriptionsStore();

      // Filter by frequency
      let result = store.sliceBy({ frequency: 'weekly' });
      expect(result.length).toBe(2);
      expect(result.every(s => s.frequency === 'weekly')).toBe(true);

      // Filter by status
      result = store.sliceBy({ statuses: ['ended'] });
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('ended');

      // Filter by tier
      result = store.sliceBy({ tiers: ['Gold'] });
      expect(result.length).toBe(2);
      expect(result.every(s => s.tierName === 'Gold')).toBe(true);

      // Filter by query
      result = store.sliceBy({ query: 'npub1' });
      expect(result.length).toBe(1);
      expect(result[0].subscriberNpub).toBe('npub1');

      // Combined filters
      result = store.sliceBy({ frequency: 'weekly', tiers: ['Bronze'] });
      expect(result.length).toBe(1);
      expect(result[0].tierName).toBe('Bronze');
      expect(result[0].frequency).toBe('weekly');

      // Sort
      result = store.sliceBy({ sortKey: 'lifetime' });
      expect(result.map(r => r.totalAmount)).toEqual([1000, 750, 500, 100]);
  });
});
