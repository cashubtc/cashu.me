import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import CreatorSubscribersPage from "../../../src/pages/CreatorSubscribersPage.vue";
import type { CreatorSubscription } from "../../../src/stores/creatorSubscriptions";
import { useCreatorSubscribersStore } from "../../../src/stores/creatorSubscribers";

const mockSubs: CreatorSubscription[] = [
  {
    subscriptionId: "w2",
    subscriberNpub: "npub2",
    tierId: "t1",
    tierName: "Tier1",
    frequency: "weekly",
    intervalDays: 7,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 100,
    status: "active",
    nextRenewal: null,
    startDate: 2000,
    endDate: 2000,
  },
  {
    subscriptionId: "w1",
    subscriberNpub: "npub1",
    tierId: "t1",
    tierName: "Tier1",
    frequency: "weekly",
    intervalDays: 7,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 200,
    status: "active",
    nextRenewal: null,
    startDate: 1000,
    endDate: 1000,
  },
  {
    subscriptionId: "b1",
    subscriberNpub: "npub3",
    tierId: "t2",
    tierName: "Tier2",
    frequency: "biweekly",
    intervalDays: 14,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 300,
    status: "active",
    nextRenewal: null,
    startDate: 3000,
    endDate: 3000,
  },
  {
    subscriptionId: "m1",
    subscriberNpub: "npub4",
    tierId: "t3",
    tierName: "Tier3",
    frequency: "monthly",
    intervalDays: 30,
    totalPeriods: null,
    receivedPeriods: 1,
    remainingPeriods: 0,
    totalAmount: 400,
    status: "active",
    nextRenewal: null,
    startDate: 4000,
    endDate: 4000,
  },
];

vi.mock("../../../src/stores/creatorSubscriptions", () => ({
  useCreatorSubscriptionsStore: () => ({
    subscriptions: ref(mockSubs),
    loading: ref(false),
  }),
}));

var fetchEventsMock: any;
vi.mock("../../../src/stores/nostr", () => ({
  useNostrStore: () => ({
    initNdkReadOnly: vi.fn().mockResolvedValue(undefined),
    resolvePubkey: (s: string) => s,
    connected: true,
    lastError: null,
  }),
}));
vi.mock("../../../src/composables/useNdk", () => {
  fetchEventsMock = vi.fn().mockResolvedValue(new Set());
  return {
    useNdk: vi.fn().mockResolvedValue({ fetchEvents: fetchEventsMock }),
  };
});

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => {
        const map: Record<string, string> = {
          "CreatorSubscribers.frequency.weekly": "Weekly",
          "CreatorSubscribers.frequency.biweekly": "Bi-weekly",
          "CreatorSubscribers.frequency.monthly": "Monthly",
          "CreatorSubscribers.summary.subscribers": "Subscribers",
          "CreatorSubscribers.summary.active": "Active",
          "CreatorSubscribers.summary.revenue": "Revenue",
        };
        return map[key] || key;
      },
    }),
  };
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("quasar", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuasar: () => ({
      clipboard: { writeText: vi.fn() },
      notify: vi.fn(),
      screen: { lt: { md: false }, gt: { xs: true } },
    }),
  };
});

describe("CreatorSubscribersPage", () => {
  function mountComponent() {
    return mount(CreatorSubscribersPage, {
      global: {
        stubs: {
          "q-page": { template: "<div><slot /></div>" },
          SubscriberCard: {
            props: ["sub", "profile", "compact"],
            template:
              '<div class="subscriber-card">{{ sub.subscriptionId }} {{ sub.totalAmount }}</div>',
          },
          SubscriberDrawer: true,
          KpiCard: true,
          SubscriptionsCharts: true,
          "q-virtual-scroll": {
            props: ["items"],
            template: '<div><slot v-for="item in items" :item="item" /></div>',
          },
        },
      },
    });
  }

  it("groups subscriptions by frequency and filters weekly", async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const groups = wrapper.findAll(".mb-8");
    expect(groups.length).toBe(3);
    expect(groups[0].find("h6").text()).toContain("Weekly");
    expect(groups[0].findAll(".subscriber-card").length).toBe(2);
    expect(groups[1].find("h6").text()).toContain("Bi-weekly");
    expect(groups[1].findAll(".subscriber-card").length).toBe(1);
    expect(groups[2].find("h6").text()).toContain("Monthly");
    expect(groups[2].findAll(".subscriber-card").length).toBe(1);

    wrapper.vm.toggleFrequency("biweekly");
    wrapper.vm.toggleFrequency("monthly");
    await wrapper.vm.$nextTick();

    const visibleGroups = wrapper
      .findAll(".mb-8")
      .filter((g) => g.findAll(".subscriber-card").length > 0);
    expect(visibleGroups.length).toBe(1);
    expect(visibleGroups[0].find("h6").text()).toContain("Weekly");
    expect(visibleGroups[0].findAll(".subscriber-card").length).toBe(2);
  });

  it("sorts by lifetime sats", async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    let weeklyCards = wrapper.findAll(".mb-8")[0].findAll(".subscriber-card");
    expect(weeklyCards.map((c) => c.text())).toEqual(["w2 100", "w1 200"]);

    wrapper.vm.sort = "amount";
    await wrapper.vm.$nextTick();

    weeklyCards = wrapper.findAll(".mb-8")[0].findAll(".subscriber-card");
    expect(weeklyCards.map((c) => c.text())).toEqual(["w1 200", "w2 100"]);
  });

  it("fetches and caches profiles for unique subscribers", async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchEventsMock).toHaveBeenCalledTimes(1);

    const store = useCreatorSubscribersStore();
    await store.fetchProfiles();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchEventsMock).toHaveBeenCalledTimes(1);
  });
});
