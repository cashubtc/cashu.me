import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, nextTick } from "vue";

// mock quasar and its composables
const notifyUpdate = vi.fn();
const qMock = {
  dialog: vi.fn(() => ({ onOk: (cb: (val: string) => void) => cb("hello") })),
  notify: vi.fn(() => notifyUpdate),
  screen: { lt: { md: false } },
};
vi.mock("quasar", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuasar: () => qMock,
    QIcon: actual.QIcon || { name: "QIcon", template: "<i />" },
    Notify: { create: vi.fn() },
  };
});

// mock creator subscriptions store
const subscriptions = ref([
  {
    subscriptionId: "sub1",
    subscriberNpub: "pk1",
    tierName: "Gold",
    startDate: 1,
    nextRenewal: 2,
    receivedPeriods: 1,
    totalPeriods: 3,
    totalAmount: 1000,
    status: "active",
    frequency: "monthly",
  },
  {
    subscriptionId: "sub2",
    subscriberNpub: "pk2",
    tierName: "Silver",
    startDate: 1,
    nextRenewal: 2,
    receivedPeriods: 2,
    totalPeriods: 4,
    totalAmount: 2000,
    status: "pending",
    frequency: "monthly",
  },
]);
vi.mock("stores/creatorSubscriptions", () => ({
  useCreatorSubscriptionsStore: () => ({ subscriptions, loading: ref(false) }),
}));

// mock messenger store
const messenger = {
  started: true,
  startChat: vi.fn(),
  sendDm: vi.fn(async () => {}),
};
vi.mock("stores/messenger", () => ({ useMessengerStore: () => messenger }));

// mock profile cache
const profilesData: Record<string, any> = {
  pk1: { display_name: "Alice" },
  pk2: { display_name: "Bob" },
};
vi.mock("src/js/profile-cache", () => ({
  default: {
    get: (pk: string) => profilesData[pk],
    set: vi.fn(),
  },
}));

// mock nostr store
vi.mock("stores/nostr", () => ({
  useNostrStore: () => ({ pubkey: "creator_pk", initNdkReadOnly: vi.fn() }),
}));

// mock useNdk
vi.mock("src/composables/useNdk", () => ({
  useNdk: vi.fn(async () => ({ fetchEvents: vi.fn(async () => new Set()) })),
}));

// mock other stores
vi.mock("stores/creators", () => ({
  useCreatorsStore: () => ({
    tiersMap: { creator_pk: true },
    fetchTierDefinitions: vi.fn(),
  }),
}));
vi.mock("stores/ui", () => ({
  useUiStore: () => ({ formatCurrency: (amt: number) => `${amt}` }),
}));
vi.mock("stores/mints", () => ({
  useMintsStore: () => ({ activeUnit: ref("sat") }),
}));

// mock nostr-tools
vi.mock("nostr-tools", () => ({
  nip19: { npubEncode: (pk: string) => `npub_${pk}` },
}));

// mock export helper
vi.mock("src/utils/subscriberCsv", () => ({
  exportSubscribers: vi.fn(),
}));
import { exportSubscribers } from "src/utils/subscriberCsv";

import CreatorSubscribers from "../CreatorSubscribers.vue";
import CreatorSubscribersSummary from "../CreatorSubscribersSummary.vue";

describe("CreatorSubscribers.vue", () => {
  beforeEach(() => {
    messenger.sendDm.mockReset();
    messenger.sendDm.mockImplementation(async () => {});
    qMock.notify.mockClear();
    qMock.dialog.mockClear();
    notifyUpdate.mockClear();
    subscriptions.value = [
      {
        subscriptionId: "sub1",
        subscriberNpub: "pk1",
        tierName: "Gold",
        startDate: 1,
        nextRenewal: 2,
        receivedPeriods: 1,
        totalPeriods: 3,
        totalAmount: 1000,
        status: "active",
        frequency: "monthly",
      },
      {
        subscriptionId: "sub2",
        subscriberNpub: "pk2",
        tierName: "Silver",
        startDate: 1,
        nextRenewal: 2,
        receivedPeriods: 2,
        totalPeriods: 4,
        totalAmount: 2000,
        status: "pending",
        frequency: "monthly",
      },
    ];
  });

  it("renders subscriber cards", async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();
    const cards = wrapper.findAll("div.cursor-pointer");
    expect(cards).toHaveLength(2);
    expect(cards[0].text()).toContain("pk1");
    expect(cards[1].text()).toContain("pk2");
  });

  it("filters by tier and status", async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();

    wrapper.vm.tierFilter = "Gold";
    await nextTick();
    expect(wrapper.text()).toContain("pk1");
    expect(wrapper.text()).not.toContain("pk2");

    wrapper.vm.tierFilter = null;
    wrapper.vm.statusFilter = "pending";
    await nextTick();
    expect(wrapper.text()).toContain("pk2");
    expect(wrapper.text()).not.toContain("pk1");
  });

  it("sends group messages", async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();
    const resolvers: Array<() => void> = [];
    messenger.sendDm.mockImplementation(
      () => new Promise((resolve) => resolvers.push(resolve))
    );
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes[0].setValue(true);
    await checkboxes[1].setValue(true);
    await wrapper.vm.sendGroupMessage();
    await Promise.resolve();
    expect(messenger.sendDm).toHaveBeenCalledTimes(2);
    resolvers.forEach((r) => r());
    await nextTick();
    await nextTick();
    expect(notifyUpdate).toHaveBeenCalled();
    expect(wrapper.vm.selected).toHaveLength(0);
  });

  it("exports subscribers via helper", () => {
    const wrapper = mount(CreatorSubscribers);
    const mock = vi.mocked(exportSubscribers);
    mock.mockClear();
    wrapper.vm.downloadCsv();
    expect(mock).toHaveBeenCalledWith(
      wrapper.vm.filteredSubscriptions,
      "subscribers.csv"
    );

    mock.mockClear();
    wrapper.vm.selected = [subscriptions.value[0]];
    wrapper.vm.exportSelected();
    expect(mock).toHaveBeenCalledWith(wrapper.vm.selected, "subscribers.csv");
  });

  it("toggleSelection adds and removes", async () => {
    const wrapper = mount(CreatorSubscribers);
    await nextTick();
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);
    expect(wrapper.vm.selected).toHaveLength(1);
    await checkbox.setValue(false);
    expect(wrapper.vm.selected).toHaveLength(0);
  });

  it("mounts summary component", () => {
    const summaryWrapper = mount(CreatorSubscribersSummary, {
      props: {
        activeCount: 1,
        pendingCount: 1,
        totalReceivedPeriods: 2,
        totalRevenue: 3,
        formatCurrency: (a: number) => `${a}`,
      },
    });
    expect(summaryWrapper.exists()).toBe(true);
  });

  it("resets filters", () => {
    const wrapper = mount(CreatorSubscribers);
    wrapper.vm.tierFilter = "Gold";
    wrapper.vm.statusFilter = "active";
    wrapper.vm.resetAllFilters();
    expect(wrapper.vm.tierFilter).toBeNull();
    expect(wrapper.vm.statusFilter).toBeNull();
  });
});
