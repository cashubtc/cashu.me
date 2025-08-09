import { defineStore } from "pinia";
import type { Subscriber, Frequency, SubStatus } from "../types/subscriber";

type Tab = "all" | Frequency | "pending" | "ended";

type SortOption = "next" | "first" | "amount";

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
    query: "",
    activeTab: "all" as Tab,
    statuses: new Set<SubStatus>(),
    tiers: new Set<string>(),
    sort: "next" as SortOption,
  }),
  getters: {
    filtered(state): Subscriber[] {
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
          return b.lifetimeSat - a.lifetimeSat;
        }
        if (state.sort === "first") {
          return a.startDate - b.startDate;
        }
        const an = a.nextRenewal ?? 0;
        const bn = b.nextRenewal ?? 0;
        return an - bn;
      });

      return arr;
    },
    counts(state) {
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
});

export type { Subscriber } from "../types/subscriber";
