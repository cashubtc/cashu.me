import { defineStore } from "pinia";
import type { Subscriber, Frequency, SubStatus } from "../types/subscriber";
import { useNostrStore } from "./nostr";
import { cashuDb } from "./dexie";
import {
  daysToFrequency,
  frequencyToDays,
} from "../constants/subscriptionFrequency";

type Tab = "all" | Frequency | "pending" | "ended";

export type SortOption = "next" | "first" | "amount";

export const useCreatorSubscribersStore = defineStore("creatorSubscribers", {
  state: () => ({
    subscribers: [] as Subscriber[],
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
    async loadFromDb() {
      this.loading = true;
      this.error = null;
      try {
        const rows = await cashuDb.lockedTokens
          .where("owner")
          .equals("creator")
          .and((t) => !!t.subscriptionId && !!t.subscriberNpub)
          .toArray();

        type Agg = {
          id: string;
          npub: string;
          tierId: string;
          tierName: string;
          amountSat: number;
          frequency: Frequency;
          earliest: number | null;
          latest: number | null;
          lifetime: number;
          allPending: boolean;
        };

        const map = new Map<string, Agg>();
        for (const row of rows) {
          const key = `${row.subscriptionId}-${row.subscriberNpub}`;
          let agg = map.get(key);
          const freq = (row.frequency || daysToFrequency(row.intervalDays || 30)) as Frequency;
          if (!agg) {
            agg = {
              id: key,
              npub: row.subscriberNpub!,
              tierId: row.tierId,
              tierName: row.tierName || "",
              amountSat: row.amount,
              frequency: freq,
              earliest: row.unlockTs ?? null,
              latest: row.unlockTs ?? null,
              lifetime: 0,
              allPending: true,
            };
            map.set(key, agg);
          }
          agg.lifetime += row.amount;
          agg.allPending &&= row.status === "pending";
          if (row.unlockTs != null) {
            if (agg.earliest == null || row.unlockTs < agg.earliest) {
              agg.earliest = row.unlockTs;
            }
            if (agg.latest == null || row.unlockTs > agg.latest) {
              agg.latest = row.unlockTs;
            }
          }
        }

        const now = Date.now() / 1000;
        this.subscribers = Array.from(map.values()).map((g) => {
          const period = frequencyToDays(g.frequency) * 86400;
          const nextRenewal =
            g.latest != null ? g.latest + period : undefined;
          let status: SubStatus = "active";
          if (g.allPending) {
            status = "pending";
          } else if (!nextRenewal || nextRenewal <= now) {
            status = "ended";
          }
          return {
            id: g.id,
            name: g.npub,
            npub: g.npub,
            nip05: "",
            tierId: g.tierId,
            tierName: g.tierName,
            amountSat: g.amountSat,
            frequency: g.frequency,
            status,
            startDate: g.earliest || 0,
            nextRenewal,
            lifetimeSat: g.lifetime,
          } as Subscriber;
        });
      } catch (e) {
        console.error(e);
        this.error = e instanceof Error ? e.message : String(e);
      } finally {
        this.loading = false;
      }
    },
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
