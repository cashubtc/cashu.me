import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { ref } from "vue";
import { createI18n } from "vue-i18n";
import { messages as enMessages } from "../src/i18n/en-US/index.ts";
import { useCreatorSubscribersStore } from "../src/stores/creatorSubscribers";
import { useSubscribersStore } from "../src/stores/subscribersStore";

var Chart: any;
const charts: { type: string; inst: any }[] = [];
vi.mock("chart.js", () => {
  Chart = vi.fn((_: any, cfg: any) => {
    const inst = {
      data: JSON.parse(JSON.stringify(cfg.data)),
      update: vi.fn(),
    };
    charts.push({ type: cfg.type, inst });
    return inst;
  });
  Chart.register = vi.fn();
  return {
    Chart,
    LineController: vi.fn(),
    DoughnutController: vi.fn(),
    BarController: vi.fn(),
    LineElement: vi.fn(),
    ArcElement: vi.fn(),
    BarElement: vi.fn(),
    PointElement: vi.fn(),
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    Legend: vi.fn(),
    Tooltip: vi.fn(),
  };
});

vi.mock("@vueuse/core", () => ({
  useDebounceFn: (fn: any) => fn,
  useLocalStorage: (_k: any, v: any) => ref(v),
  onKeyStroke: () => {},
}));
vi.mock("src/utils/clipboard", () => ({ copyNpub: vi.fn() }));
vi.mock("quasar", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuasar: () => ({
      notify: vi.fn(),
      screen: { lt: { md: false }, gt: { xs: true } },
    }),
  };
});
const routerPush = vi.fn();
vi.mock("vue-router", () => ({ useRouter: () => ({ push: routerPush }) }));
vi.mock("src/utils/subscriberCsv", () => ({ default: vi.fn() }));
vi.mock("src/stores/nostr", () => ({
  useNostrStore: () => ({
    initNdkReadOnly: vi.fn().mockResolvedValue(undefined),
    resolvePubkey: (s: string) => s,
    connected: true,
    lastError: null,
  }),
}));
vi.mock("src/composables/useNdk", () => {
  const fetchEvents = vi.fn().mockResolvedValue(new Set());
  return { useNdk: vi.fn().mockResolvedValue({ fetchEvents }) };
});

import { copyNpub } from "src/utils/clipboard";
import downloadCsv from "src/utils/subscriberCsv";
import CreatorSubscribersPage from "../src/pages/CreatorSubscribersPage.vue";

const stubs = {
  "q-layout": { template: "<div><slot /></div>" },
  "q-header": { template: "<div><slot /></div>" },
  "q-toolbar": { template: "<div><slot /></div>" },
  "q-toolbar-title": { template: "<div><slot /></div>" },
  "q-btn-group": { template: "<div><slot /></div>" },
  "q-btn-toggle": { template: "<div></div>" },
  "q-page-container": { template: "<div><slot /></div>" },
  "q-page": { template: "<div><slot /></div>" },
  "q-footer": { template: "<div><slot /></div>" },
  "q-input": {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  "q-btn": {
    props: ["label", "ariaLabel"],
    template:
      '<button :data-label="label" :aria-label="ariaLabel" @click="$emit(\'click\', $event)"><slot /></button>',
  },
  "q-chip": {
    template: '<div class="q-chip" @click="$emit(\'click\')"><slot /></div>',
  },
  "q-select": {
    props: ["modelValue", "options"],
    emits: ["update:model-value"],
    template:
      '<select @change="$emit(\'update:model-value\', $event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
  },
  "q-tabs": { template: '<div class="q-tabs"><slot /></div>' },
  "q-tab": {
    props: ["name"],
    template: '<div class="q-tab" :data-name="name"><slot /></div>',
  },
  "q-badge": { template: '<span class="q-badge"><slot /></span>' },
  "q-table": {
    props: ["rows"],
    template:
      '<div class="q-table"><div v-for="r in rows" :key="r.id" class="tbody-row">{{ r.name }}</div></div>',
  },
  "q-pagination": { template: "<div></div>" },
  "q-avatar": { template: '<span class="q-avatar"><slot /></span>' },
  "q-td": { template: "<td><slot /></td>" },
  "q-drawer": {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template: '<div class="drawer" v-show="modelValue"><slot /></div>',
  },
  "q-space": { template: '<span class="q-space"></span>' },
  "q-banner": { template: '<div><slot /><slot name="action" /></div>' },
  SubscriberFilters: { template: "<div></div>" },
  SubscriptionsCharts: { template: "<div></div>" },
};

function mountPage() {
  const i18n = createI18n({
    locale: "en-US",
    messages: { "en-US": enMessages },
  });
  return mount(CreatorSubscribersPage, {
    global: {
      plugins: [
        createTestingPinia({ createSpy: vi.fn, stubActions: false }),
        i18n,
      ],
      stubs,
    },
  });
}

describe("CreatorSubscribersPage", () => {
  it("shows correct tab counts", () => {
    const wrapper = mountPage();
    const badges = wrapper.findAll(".q-badge");
    expect(badges.map((b) => b.text())).toEqual(["6", "2", "2", "2", "2", "1"]);
  });

  it("converts npub to bech32", () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore(wrapper.vm.$pinia);
    expect(store.subscribers[0].npub).toMatch(/^npub1/);
  });

  it("filters by search, status and tier", async () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore(wrapper.vm.$pinia);
    const viewStore = useSubscribersStore(wrapper.vm.$pinia);
    const rows = () => wrapper.findAll(".tbody-row").map((r) => r.text());

    wrapper.vm.search = "bob";
    await wrapper.vm.$nextTick();
    expect(rows()).toEqual(["Bob"]);

    wrapper.vm.search = "";
    await wrapper.vm.$nextTick();

    viewStore.applyFilters({
      status: new Set(["pending"]),
      tier: new Set(),
      sort: "next",
    });
    await wrapper.vm.$nextTick();
    expect(rows()).toEqual(["Bob", "Frank"]);

    viewStore.applyFilters({
      status: new Set(["pending"]),
      tier: new Set(["t3"]),
      sort: "next",
    });
    await wrapper.vm.$nextTick();
    expect(rows()).toEqual(["Frank"]);
  });

  it("sorts subscribers", async () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore(wrapper.vm.$pinia);
    const viewStore = useSubscribersStore(wrapper.vm.$pinia);
    const rows = () => wrapper.findAll(".tbody-row").map((r) => r.text());

    viewStore.applyFilters({ sort: "first" });
    await wrapper.vm.$nextTick();
    expect(rows()[0]).toBe("Dave");

    viewStore.applyFilters({ sort: "amount" });
    await wrapper.vm.$nextTick();
    expect(rows()[0]).toBe("Eve");
  });

  it("computes progress and dueSoon correctly", () => {
    vi.useFakeTimers();
    const now = new Date(1700000000000);
    vi.setSystemTime(now);
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore(wrapper.vm.$pinia);
    const alice = store.subscribers[0];

    const periodSec = alice.intervalDays * 86400;
    const start = (alice.nextRenewal ?? 0) - periodSec;
    const expectedProgress = Math.min(
      Math.max((now.getTime() / 1000 - start) / periodSec, 0),
      1,
    );
    const expectedDueSoon =
      alice.status === "active" &&
      typeof alice.nextRenewal === "number" &&
      alice.nextRenewal - now.getTime() / 1000 < 72 * 3600;

    expect(alice.progress).toBeCloseTo(expectedProgress);
    expect(alice.dueSoon).toBe(expectedDueSoon);
    expect(wrapper.vm.progressPercent(alice)).toBe(
      Math.round(alice.progress * 100),
    );
    expect(wrapper.vm.dueSoon(alice)).toBe(alice.dueSoon);
    vi.useRealTimers();
  });

  it("exports all or selected rows to CSV", async () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore();
    (downloadCsv as unknown as vi.Mock).mockClear();

    await wrapper.find('button[data-label="Export CSV"]').trigger("click");
    expect(downloadCsv).toHaveBeenCalledWith();

    (downloadCsv as unknown as vi.Mock).mockClear();
    wrapper.vm.selected = [store.subscribers[0]];
    await wrapper.vm.$nextTick();
    await wrapper
      .find('button[data-label="Export selection"]')
      .trigger("click");
    expect(downloadCsv).toHaveBeenCalledWith([store.subscribers[0]]);
  });

  it("retries loading when retry button clicked", async () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore(wrapper.vm.$pinia);
    wrapper.vm.error = "oops";
    await wrapper.vm.$nextTick();
    const loadSpy = vi.spyOn(store, "loadFromDb");
    const fetchSpy = vi.spyOn(store, "fetchProfiles");
    await wrapper.find('button[data-label="Retry"]').trigger("click");
    expect(loadSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("opens filters when filter button clicked", async () => {
    const wrapper = mountPage();
    expect(wrapper.vm.filtersOpen).toBe(false);
    await wrapper.find('button[aria-label="Filters"]').trigger("click");
    expect(wrapper.vm.filtersOpen).toBe(true);
  });

  it("clears selection when clear button clicked", async () => {
    const wrapper = mountPage();
    const store = useCreatorSubscribersStore();
    wrapper.vm.selected = [store.subscribers[0]];
    await wrapper.vm.$nextTick();
    await wrapper.find('button[data-label="Clear"]').trigger("click");
    expect(wrapper.vm.selected).toEqual([]);
  });

  it("copies npub when drawer action used", async () => {
    const wrapper = mountPage();
    const npub = "npubtest";
    wrapper.vm.openDrawer({
      npub,
      name: "",
      tierName: "",
      status: "active",
      frequency: "monthly",
      amountSat: 0,
      nextRenewal: 0,
      lifetimeSat: 0,
      startDate: 0,
    } as any);
    await wrapper.vm.$nextTick();
    (copyNpub as any).mockReset();
    wrapper.vm.copyCurrentNpub();
    expect(copyNpub).toHaveBeenCalledWith(npub);
  });

  it("updates KPI numbers when searching, switching tabs and applying filters", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1700000000000));
    const wrapper = mountPage();
    await wrapper.vm.$nextTick();
    const store = useCreatorSubscribersStore(wrapper.vm.$pinia);
    const viewStore = useSubscribersStore(wrapper.vm.$pinia);

    const values = () => [
      String(wrapper.vm.counts.all),
      `${wrapper.vm.activeCount} / ${wrapper.vm.pendingCount}`,
      `${wrapper.vm.lifetimeRevenue} sat`,
      `${wrapper.vm.formattedKpiThisPeriodSat} sat`,
    ];

    expect(values()).toEqual(["6", "3 / 2", "27000 sat", "3,000 sat"]);

    wrapper.vm.search = "bob";
    await wrapper.vm.$nextTick();
    expect(values()).toEqual(["1", "0 / 1", "1000 sat", "0 sat"]);

    wrapper.vm.search = "";
    await wrapper.vm.$nextTick();

    store.setActiveTab("weekly");
    await wrapper.vm.$nextTick();
    expect(values()).toEqual(["6", "1 / 1", "6000 sat", "1,000 sat"]);

    store.setActiveTab("all");
    await wrapper.vm.$nextTick();
    viewStore.applyFilters({
      status: new Set(["pending"]),
      tier: new Set(["t3"]),
      sort: "next",
    });
    await wrapper.vm.$nextTick();
    expect(values()).toEqual(["1", "0 / 1", "5000 sat", "0 sat"]);

    vi.useRealTimers();
  });

  it("updates charts without re-instantiating on filter and period changes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1700000000000));
    const wrapper = mountPage();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const initialCalls = charts.length;

    wrapper.vm.search = "bob";
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filtered.map((s: any) => s.name)).toEqual(["Bob"]);
    expect(charts.length).toBe(initialCalls);

    wrapper.vm.search = "";
    await wrapper.vm.$nextTick();
    wrapper.vm.togglePeriod();
    await wrapper.vm.$nextTick();

    expect(charts.length).toBe(initialCalls);
    vi.useRealTimers();
  });

  it("keeps KPI counts when paginating table rows", async () => {
    const wrapper = mountPage();
    const table = wrapper.findComponent({ name: "SubscribersTable" });
    (table.vm as any).pagination.rowsPerPage = 2;
    (table.vm as any).pagination.page = 1;
    await wrapper.vm.$nextTick();
    expect((table.vm as any).paginatedRows.length).toBe(2);
    expect(wrapper.vm.counts.all).toBe(6);
  });
});
