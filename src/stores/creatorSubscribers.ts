import { defineStore } from "pinia";
import type { Subscriber, Frequency, SubStatus } from "../types/subscriber";
import { useNostrStore } from "./nostr";

type Tab = "all" | Frequency | "pending" | "ended";

export type SortOption = "next" | "first" | "amount";

const mockSubscribers: Subscriber[] = [
  {
    id: "1",
    name: "Alice",
    npub: "npub1alice",
    nip05: "alice@example.com",
    tierId: "t1",
    tierName: "Bronze",
    amountSat: 1000,
    frequency: "weekly",
    status: "active",
    startDate: 1700000000,
    nextRenewal: 1700000000 + 7 * 86400,
    lifetimeSat: 5000,
  },
  {
    id: "2",
    name: "Bob",
    npub: "npub1bob",
    nip05: "bob@example.com",
    tierId: "t1",
    tierName: "Bronze",
    amountSat: 1000,
    frequency: "weekly",
    status: "pending",
    startDate: 1700001000,
    nextRenewal: 1700001000 + 7 * 86400,
    lifetimeSat: 1000,
  },
  {
    id: "3",
    name: "Carol",
    npub: "npub1carol",
    nip05: "carol@example.com",
    tierId: "t2",
    tierName: "Silver",
    amountSat: 2000,
    frequency: "biweekly",
    status: "active",
    startDate: 1700002000,
    nextRenewal: 1700002000 + 14 * 86400,
    lifetimeSat: 4000,
  },
  {
    id: "4",
    name: "Dave",
    npub: "npub1dave",
    nip05: "dave@example.com",
    tierId: "t2",
    tierName: "Silver",
    amountSat: 2000,
    frequency: "biweekly",
    status: "ended",
    startDate: 1690000000,
    lifetimeSat: 2000,
  },
  {
    id: "5",
    name: "Eve",
    npub: "npub1eve",
    nip05: "eve@example.com",
    tierId: "t3",
    tierName: "Gold",
    amountSat: 5000,
    frequency: "monthly",
    status: "active",
    startDate: 1700003000,
    nextRenewal: 1700003000 + 30 * 86400,
    lifetimeSat: 10000,
  },
  {
    id: "6",
    name: "Frank",
    npub: "npub1frank",
    nip05: "frank@example.com",
    tierId: "t3",
    tierName: "Gold",
    amountSat: 5000,
    frequency: "monthly",
    status: "pending",
    startDate: 1700004000,
    nextRenewal: 1700004000 + 30 * 86400,
    lifetimeSat: 5000,
  },
];

export const useCreatorSubscribersStore = defineStore("creatorSubscribers", {
  state: () => ({
    subscribers: mockSubscribers as Subscriber[],
    profileCache: {} as Record<string, { name: string; nip05: string }>,
    query: "",
    activeTab: "all" as Tab,
    statuses: new Set<SubStatus>(),
    tiers: new Set<string>(),
    sort: "next" as SortOption,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    filtered(state): Subscriber[] {
      // accessing the active tab here ensures this getter recomputes whenever
      // the user switches tabs in the UI
      const currentTab = state.activeTab;
      let arr = state.subscribers.slice();

      if (state.statuses.size) {
        arr = arr.filter((s) => state.statuses.has(s.status));
      }

      if (state.tiers.size) {
        arr = arr.filter((s) => state.tiers.has(s.tierId));
      }

      if (state.query.trim()) {
        const q = state.query.toLowerCase();
        arr = arr.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.npub.toLowerCase().includes(q) ||
            s.nip05.toLowerCase().includes(q)
        );
      }

      switch (state.activeTab) {
        case "weekly":
        case "biweekly":
        case "monthly":
          arr = arr.filter((s) => s.frequency === state.activeTab);
          break;
        case "pending":
        case "ended":
          arr = arr.filter((s) => s.status === state.activeTab);
          break;
        default:
          break;
      }

      arr.sort((a, b) => {
        if (state.sort === "amount") {
          const al = typeof a.lifetimeSat === "number" ? a.lifetimeSat : 0;
          const bl = typeof b.lifetimeSat === "number" ? b.lifetimeSat : 0;
          return bl - al;
        }
        if (state.sort === "first") {
          return a.startDate - b.startDate;
        }
        const an =
          typeof a.nextRenewal === "number" ? a.nextRenewal : Number.POSITIVE_INFINITY;
        const bn =
          typeof b.nextRenewal === "number" ? b.nextRenewal : Number.POSITIVE_INFINITY;
        return an - bn;
      });

      return arr;
    },
    counts(state) {
      // state.sort is included to make the getter reactive to sort changes,
      // even though the sorting itself does not affect the totals
      void state.sort;
      let arr = state.subscribers.slice();

      if (state.statuses.size) {
        arr = arr.filter((s) => state.statuses.has(s.status));
      }
      if (state.tiers.size) {
        arr = arr.filter((s) => state.tiers.has(s.tierId));
      }
      if (state.query.trim()) {
        const q = state.query.toLowerCase();
        arr = arr.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.npub.toLowerCase().includes(q) ||
            s.nip05.toLowerCase().includes(q)
        );
      }

      return {
        all: arr.length,
        weekly: arr.filter((s) => s.frequency === "weekly").length,
        biweekly: arr.filter((s) => s.frequency === "biweekly").length,
        monthly: arr.filter((s) => s.frequency === "monthly").length,
        pending: arr.filter((s) => s.status === "pending").length,
        ended: arr.filter((s) => s.status === "ended").length,
      };
    },
  },
  actions: {
    async fetchProfiles() {
      const nostr = useNostrStore();
      this.loading = true;
      this.error = null;
      try {
        const unique = Array.from(new Set(this.subscribers.map((s) => s.npub)));
        for (const npub of unique) {
          if (!this.profileCache[npub]) {
            const profile = await nostr.getProfile(npub);
            this.profileCache[npub] = {
              name: profile?.name || "",
              nip05: profile?.nip05 || "",
            };
          }
        }
        this.subscribers = this.subscribers.map((s) => {
          const cached = this.profileCache[s.npub];
          return {
            ...s,
            name: cached?.name || s.name || s.npub,
            nip05: cached?.nip05 || s.nip05 || "",
          };
        });
      } catch (e) {
        console.error(e);
        this.error = e instanceof Error ? e.message : String(e);
      } finally {
        this.loading = false;
      }
    },
    setActiveTab(tab: Tab) {
      this.activeTab = tab;
    },
    setQuery(q: string) {
      this.query = q;
    },
    applyFilters(opts: { statuses: Set<SubStatus>; tiers: Set<string>; sort: SortOption }) {
      this.statuses = new Set(opts.statuses);
      this.tiers = new Set(opts.tiers);
      this.sort = opts.sort;
    },
    clearFilters() {
      this.statuses.clear();
      this.tiers.clear();
      this.sort = "next";
    },
  },
});

export type { Subscriber } from "../types/subscriber";
