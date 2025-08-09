import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import CreatorSubscribersPage from '../src/pages/CreatorSubscribersPage.vue';
import type { CreatorSubscription } from '../src/stores/creatorSubscriptions';

const mockSubs: CreatorSubscription[] = [
  {
    subscriptionId: 'w1',
    subscriberNpub: 'alice',
    tierId: 't1',
    tierName: 'Alpha',
    frequency: 'weekly',
    intervalDays: 7,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 1000,
    status: 'active',
    nextRenewal: 1000,
    startDate: 100,
    endDate: null,
  },
  {
    subscriptionId: 'b1',
    subscriberNpub: 'bob',
    tierId: 't2',
    tierName: 'Beta',
    frequency: 'biweekly',
    intervalDays: 14,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 2000,
    status: 'pending',
    nextRenewal: 2000,
    startDate: 200,
    endDate: null,
  },
  {
    subscriptionId: 'm1',
    subscriberNpub: 'carol',
    tierId: 't3',
    tierName: 'Gamma',
    frequency: 'monthly',
    intervalDays: 30,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 3000,
    status: 'active',
    nextRenewal: 3000,
    startDate: 300,
    endDate: 1,
  },
  {
    subscriptionId: 'w2',
    subscriberNpub: 'dave',
    tierId: 't1',
    tierName: 'Alpha',
    frequency: 'weekly',
    intervalDays: 7,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 4000,
    status: 'active',
    nextRenewal: 1500,
    startDate: 50,
    endDate: null,
  },
];

vi.mock('../src/composables/useNostrProfiles', () => ({
  useNostrProfiles: () => ({ get: () => undefined }),
}));

vi.mock('@vueuse/core', () => ({
  useDebounceFn: (fn: any) => fn,
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
        };
        return map[key] || key;
      },
    }),
  };
});

describe('CreatorSubscribers page', () => {
  function mountPage() {
    return mount(CreatorSubscribersPage, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              creatorSubscriptions: {
                subscriptions: mockSubs,
                loading: false,
              },
            },
          }),
        ],
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          SubscriberCard: {
            props: ['sub', 'profile', 'compact'],
            template: '<div class="subscriber-card">{{ sub.subscriptionId }}</div>',
          },
          SubscriberDrawer: true,
          KpiCard: true,
          Sparkline: true,
          SubscriptionsCharts: true,
          'q-virtual-scroll': {
            props: ['items'],
            template: '<div><slot v-for="item in items" :item="item" /></div>',
          },
        },
      },
    });
  }

  it('groups subscriptions by frequency', () => {
    const wrapper = mountPage();
    const groups = wrapper.findAll('.mb-8');
    expect(groups.length).toBe(3);
    expect(groups[0].find('h6').text()).toContain('Weekly');
    expect(groups[0].findAll('.subscriber-card').length).toBe(2);
    expect(groups[1].find('h6').text()).toContain('Bi-weekly');
    expect(groups[1].findAll('.subscriber-card').length).toBe(1);
    expect(groups[2].find('h6').text()).toContain('Monthly');
    expect(groups[2].findAll('.subscriber-card').length).toBe(1);
  });

  it('filters by search, frequency, status, and tier', async () => {
    const wrapper = mountPage();

    wrapper.vm.search = 'Beta';
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.subscriber-card').length).toBe(1);

    wrapper.vm.search = '';
    await wrapper.vm.$nextTick();

    wrapper.vm.toggleFrequency('biweekly');
    wrapper.vm.toggleFrequency('monthly');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.subscriber-card').length).toBe(2);
    wrapper.vm.toggleFrequency('biweekly');
    wrapper.vm.toggleFrequency('monthly');
    await wrapper.vm.$nextTick();

    wrapper.vm.toggleStatus('pending');
    wrapper.vm.toggleStatus('ended');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.subscriber-card').length).toBe(2);
    wrapper.vm.toggleStatus('pending');
    wrapper.vm.toggleStatus('ended');
    await wrapper.vm.$nextTick();

    wrapper.vm.tierFilter = 't2';
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.subscriber-card').length).toBe(1);
  });

  it('sorts by next renewal, first seen, and lifetime sats', async () => {
    const wrapper = mountPage();

    let weekly = wrapper
      .findAll('.mb-8')[0]
      .findAll('.subscriber-card')
      .map((c) => c.text());
    expect(weekly).toEqual(['w1', 'w2']);

    wrapper.vm.sort = 'first';
    await wrapper.vm.$nextTick();
    weekly = wrapper
      .findAll('.mb-8')[0]
      .findAll('.subscriber-card')
      .map((c) => c.text());
    expect(weekly).toEqual(['w2', 'w1']);

    wrapper.vm.sort = 'amount';
    await wrapper.vm.$nextTick();
    weekly = wrapper
      .findAll('.mb-8')[0]
      .findAll('.subscriber-card')
      .map((c) => c.text());
    expect(weekly).toEqual(['w2', 'w1']);
  });
});

