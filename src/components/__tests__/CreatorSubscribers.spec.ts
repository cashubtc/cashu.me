import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';

// mock quasar and its composables
const notifyUpdate = vi.fn();
const qMock = {
  dialog: vi.fn(() => ({ onOk: (cb: (val: string) => void) => cb('hello') })),
  notify: vi.fn(() => notifyUpdate),
  screen: { lt: { md: false } },
};
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuasar: () => qMock,
    QIcon: actual.QIcon || { name: 'QIcon', template: '<i />' },
    Notify: { create: vi.fn() },
  };
});

// mock creator subscriptions store
const subscriptions = ref([
  {
    subscriptionId: 'sub1',
    subscriberNpub: 'pk1',
    tierName: 'Gold',
    startDate: 1,
    nextRenewal: 2,
    receivedMonths: 1,
    totalMonths: 3,
    totalAmount: 1000,
    status: 'active',
  },
  {
    subscriptionId: 'sub2',
    subscriberNpub: 'pk2',
    tierName: 'Silver',
    startDate: 1,
    nextRenewal: 2,
    receivedMonths: 2,
    totalMonths: 4,
    totalAmount: 2000,
    status: 'pending',
  },
]);
const loading = ref(false);
vi.mock('stores/creatorSubscriptions', () => ({
  useCreatorSubscriptionsStore: () => ({ subscriptions, loading }),
}));

// mock messenger store
const messenger = {
  started: true,
  startChat: vi.fn(),
  sendDm: vi.fn(async () => {}),
};
vi.mock('stores/messenger', () => ({
  useMessengerStore: () => messenger,
}));

// mock profile cache
const profilesData: Record<string, any> = {
  pk1: { display_name: 'Alice' },
  pk2: { display_name: 'Bob' },
};
vi.mock('src/js/profile-cache', () => ({
  default: {
    get: (pk: string) => profilesData[pk],
    set: vi.fn(),
  },
}));

// mock nostr store
vi.mock('stores/nostr', () => ({
  useNostrStore: () => ({
    pubkey: 'creator_pk',
    getProfile: vi.fn(async (pk: string) => profilesData[pk]),
  }),
}));

// mock other stores
vi.mock('stores/creators', () => ({
  useCreatorsStore: () => ({ tiersMap: { creator_pk: true }, fetchTierDefinitions: vi.fn() }),
}));
vi.mock('stores/ui', () => ({
  useUiStore: () => ({ formatCurrency: (amt: number) => `${amt}` }),
}));
vi.mock('stores/mints', () => ({
  useMintsStore: () => ({ activeUnit: ref('sat') }),
}));

// mock router
const routerPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}));

// mock nostr-tools
vi.mock('nostr-tools', () => ({
  nip19: { npubEncode: (pk: string) => `npub_${pk}` },
}));

// mock export helper
vi.mock('src/utils/subscriberCsv', () => ({
  exportSubscribers: vi.fn(),
}));
import { exportSubscribers } from 'src/utils/subscriberCsv';

import CreatorSubscribers from '../CreatorSubscribers.vue';
import CreatorSubscribersFilters from '../CreatorSubscribersFilters.vue';
import CreatorSubscribersSummary from '../CreatorSubscribersSummary.vue';

describe('CreatorSubscribers.vue', () => {
  beforeEach(() => {
    routerPush.mockClear();
    messenger.startChat.mockClear();
    messenger.sendDm.mockReset();
    messenger.sendDm.mockImplementation(async () => {});
    qMock.notify.mockClear();
    qMock.dialog.mockClear();
    notifyUpdate.mockClear();
    subscriptions.value = [
      {
        subscriptionId: 'sub1',
        subscriberNpub: 'pk1',
        tierName: 'Gold',
        startDate: 1,
        nextRenewal: 2,
        receivedMonths: 1,
        totalMonths: 3,
        totalAmount: 1000,
        status: 'active',
      },
      {
        subscriptionId: 'sub2',
        subscriberNpub: 'pk2',
        tierName: 'Silver',
        startDate: 1,
        nextRenewal: 2,
        receivedMonths: 2,
        totalMonths: 4,
        totalAmount: 2000,
        status: 'pending',
      },
    ];
  });

  it('renders subscriber rows with profile names', async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('Bob');
  });

  it('filters by tier and status', async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();

    // filter by tier
    wrapper.vm.tierFilter = 'Gold';
    await nextTick();
    let rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0].text()).toContain('Alice');

    // filter by status
    wrapper.vm.tierFilter = null;
    wrapper.vm.statusFilter = 'pending';
    await nextTick();
    rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0].text()).toContain('Bob');
  });

  it('sends messages via actions', async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();

    // direct message
    await wrapper.vm.sendMessage('pk1');
    expect(routerPush).toHaveBeenCalledWith({ path: '/nostr-messenger', query: { pubkey: 'npub_pk1' } });
    expect(messenger.startChat).toHaveBeenCalledWith('pk1');

    // group message
    const resolvers: Array<() => void> = [];
    messenger.sendDm.mockImplementation(
      () => new Promise((resolve) => resolvers.push(resolve)),
    );
    wrapper.vm.selected = subscriptions.value.slice();
    wrapper.vm.sendGroupMessage();
    await Promise.resolve();
    expect(messenger.sendDm).toHaveBeenCalledTimes(2);
    expect(qMock.notify).toHaveBeenCalledTimes(1);
    // resolve all pending sendDm promises
    resolvers.forEach((r) => r());
    await Promise.resolve();
    await Promise.resolve();
    expect(notifyUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'positive',
        message: expect.stringContaining('Sent to 2 subscribers'),
      }),
    );
    expect(wrapper.vm.selected).toHaveLength(0);
  });

  it('exports subscribers via helper', () => {
    const wrapper = mount(CreatorSubscribers);
    const mock = vi.mocked(exportSubscribers);
    mock.mockClear();
    wrapper.vm.downloadCsv();
    expect(mock).toHaveBeenCalledWith(
      wrapper.vm.filteredSubscriptions,
      'subscribers.csv',
    );

    mock.mockClear();
    wrapper.vm.selected = [subscriptions.value[0]];
    wrapper.vm.exportSelected();
    expect(mock).toHaveBeenCalledWith(
      wrapper.vm.selected,
      'subscribers.csv',
    );
  });

  it('mounts filter and summary components', () => {
    const filtersWrapper = mount(CreatorSubscribersFilters, {
      props: {
        filter: '',
        tierFilter: null,
        statusFilter: null,
        startFrom: null,
        startTo: null,
        nextRenewalFrom: null,
        nextRenewalTo: null,
        monthsRemaining: null,
        tierOptions: [],
        statusOptions: [],
        isSmallScreen: false,
        showFilters: true,
      },
    });
    expect(filtersWrapper.exists()).toBe(true);

    const summaryWrapper = mount(CreatorSubscribersSummary, {
      props: {
        totalActiveSubscribers: 1,
        totalReceivedMonths: 2,
        totalRevenue: 3,
        formatCurrency: (a: number) => `${a}`,
      },
    });
    expect(summaryWrapper.exists()).toBe(true);
  });
});
