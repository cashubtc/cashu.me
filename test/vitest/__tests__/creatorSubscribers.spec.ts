import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import CreatorSubscribers from '../../../src/pages/CreatorSubscribers.vue';
import type { CreatorSubscription } from '../../../src/stores/creatorSubscriptions';

const mockSubs: CreatorSubscription[] = [
  {
    subscriptionId: 'w2',
    subscriberNpub: 'npub2',
    tierId: 't1',
    tierName: 'Tier1',
    frequency: 'weekly',
    intervalDays: 7,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 100,
    status: 'active',
    nextRenewal: null,
    startDate: 2000,
    endDate: 2000,
  },
  {
    subscriptionId: 'w1',
    subscriberNpub: 'npub1',
    tierId: 't1',
    tierName: 'Tier1',
    frequency: 'weekly',
    intervalDays: 7,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 200,
    status: 'active',
    nextRenewal: null,
    startDate: 1000,
    endDate: 1000,
  },
  {
    subscriptionId: 'b1',
    subscriberNpub: 'npub3',
    tierId: 't2',
    tierName: 'Tier2',
    frequency: 'biweekly',
    intervalDays: 14,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 300,
    status: 'active',
    nextRenewal: null,
    startDate: 3000,
    endDate: 3000,
  },
  {
    subscriptionId: 'm1',
    subscriberNpub: 'npub4',
    tierId: 't3',
    tierName: 'Tier3',
    frequency: 'monthly',
    intervalDays: 30,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 400,
    status: 'active',
    nextRenewal: null,
    startDate: 4000,
    endDate: 4000,
  },
];

vi.mock('../../../src/stores/creatorSubscriptions', () => ({
  useCreatorSubscriptionsStore: () => ({
    subscriptions: ref(mockSubs),
    loading: ref(false),
  }),
}));

vi.mock('../../../src/stores/nostr', () => ({
  useNostrStore: () => ({
    getProfile: vi.fn().mockResolvedValue(null),
  }),
}));

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => {
        const map: Record<string, string> = {
          'CreatorSubscribers.frequency.weekly': 'Weekly',
          'CreatorSubscribers.frequency.biweekly': 'Bi-weekly',
          'CreatorSubscribers.frequency.monthly': 'Monthly',
          'CreatorSubscribers.summary.subscribers': 'Subscribers',
          'CreatorSubscribers.summary.active': 'Active',
          'CreatorSubscribers.summary.revenue': 'Revenue',
        };
        return map[key] || key;
      },
    }),
  };
});

describe('CreatorSubscribers', () => {
  function mountComponent() {
    return mount(CreatorSubscribers, {
      global: {
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          SubscriberCard: {
            props: ['subscription'],
            template:
              '<div class="subscriber-card">{{ subscription.subscriptionId }} {{ subscription.totalAmount }}</div>',
          },
          SubscriberDrawer: true,
          KpiCard: true,
          Sparkline: true,
          'q-virtual-scroll': {
            props: ['items'],
            template: '<div><slot v-for="item in items" :item="item" /></div>',
          },
        },
      },
    });
  }

  it('groups subscriptions by frequency and filters weekly', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const groups = wrapper.findAll('.mb-8');
    expect(groups.length).toBe(3);
    expect(groups[0].find('h6').text()).toContain('Weekly');
    expect(groups[0].findAll('.subscriber-card').length).toBe(2);
    expect(groups[1].find('h6').text()).toContain('Bi-weekly');
    expect(groups[1].findAll('.subscriber-card').length).toBe(1);
    expect(groups[2].find('h6').text()).toContain('Monthly');
    expect(groups[2].findAll('.subscriber-card').length).toBe(1);

    wrapper.vm.toggleFrequency('biweekly');
    wrapper.vm.toggleFrequency('monthly');
    await wrapper.vm.$nextTick();

    const visibleGroups = wrapper
      .findAll('.mb-8')
      .filter((g) => g.findAll('.subscriber-card').length > 0);
    expect(visibleGroups.length).toBe(1);
    expect(visibleGroups[0].find('h6').text()).toContain('Weekly');
    expect(visibleGroups[0].findAll('.subscriber-card').length).toBe(2);
  });

  it('sorts by lifetime sats', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    let weeklyCards = wrapper.findAll('.mb-8')[0].findAll('.subscriber-card');
    expect(weeklyCards.map((c) => c.text())).toEqual(['w2 100', 'w1 200']);

    wrapper.vm.sort = 'amount';
    await wrapper.vm.$nextTick();

    weeklyCards = wrapper.findAll('.mb-8')[0].findAll('.subscriber-card');
    expect(weeklyCards.map((c) => c.text())).toEqual(['w1 200', 'w2 100']);
  });
});

