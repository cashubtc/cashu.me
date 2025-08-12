import { defineStore } from "pinia";
import type { Subscriber, Frequency } from "../types/subscriber";
import { useNostrStore } from "./nostr";
import { cashuDb } from "./dexie";
import { liveQuery } from "dexie";
import { nip19 } from "nostr-tools";
import {
  daysToFrequency,
  frequencyToDays,
} from "../constants/subscriptionFrequency";
import { useSubscribersStore } from "./subscribersStore";
import { useNdk } from "../composables/useNdk";
import type { NDKEvent, NDKRelay, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { DEFAULT_RELAYS } from "src/config/relays";

type Tab = "all" | Frequency | "pending" | "ended";

export const useCreatorSubscribersStore = defineStore("creatorSubscribers", {
  state: () => ({
    subscribers: [] as Subscriber[],
    profileCache: {} as Record<string, { name: string; nip05: string }>,
    /** handle returned by Dexie's liveQuery for cleanup */
    _dbSub: null as { unsubscribe(): void } | null,
    activeTab: "all" as Tab,
    loading: false,
    profilesLoading: false,
    error: null as string | null,
  }),
  getters: {
    filtered(state): Subscriber[] {
      const filterStore = useSubscribersStore();
      const { query, status, freq, tier, sort } = filterStore;
      // accessing the active tab here ensures this getter recomputes whenever
      // the user switches tabs in the UI
      const currentTab = state.activeTab;
      let arr = state.subscribers.slice();

      if (status.size) {
        arr = arr.filter((s) => status.has(s.status));
      }

      if (tier.size) {
        arr = arr.filter((s) => tier.has(s.tierId));
      }

      if (freq.size) {
        arr = arr.filter((s) => freq.has(s.frequency));
      }

      if (query.trim()) {
        const q = query.toLowerCase();
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
        if (sort === "amount") {
          const al = typeof a.lifetimeSat === "number" ? a.lifetimeSat : 0;
          const bl = typeof b.lifetimeSat === "number" ? b.lifetimeSat : 0;
          return bl - al;
        }
        if (sort === "first") {
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
      const filterStore = useSubscribersStore();
      // include sort for reactivity even though it doesn't change totals
      void filterStore.sort;
      let arr = state.subscribers.slice();

      if (filterStore.status.size) {
        arr = arr.filter((s) => filterStore.status.has(s.status));
      }
      if (filterStore.tier.size) {
        arr = arr.filter((s) => filterStore.tier.has(s.tierId));
      }
      if (filterStore.freq.size) {
        arr = arr.filter((s) => filterStore.freq.has(s.frequency));
      }
      if (filterStore.query.trim()) {
        const q = filterStore.query.toLowerCase();
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
    loadFromDb() {
      this.loading = true;
      this.error = null;
      // dispose previous subscription if called again
      this._dbSub?.unsubscribe();
      this._dbSub = liveQuery(() =>
        cashuDb.lockedTokens
          .where("owner")
          .equals("creator")
          .and((t) => !!t.subscriptionId && !!t.subscriberNpub)
          .toArray(),
      ).subscribe({
        next: (rows) => {
          try {
            type Agg = {
              id: string;
              npub: string;
              tierId: string;
              tierName: string;
              amountSat: number;
              frequency: Frequency;
              intervalDays: number;
              tokens: { unlockTs: number }[];
              lifetime: number;
              totalPeriods?: number;
            };

            const map = new Map<string, Agg>();
            for (const row of rows) {
              const key = `${row.subscriptionId}-${row.subscriberNpub}`;
              const freq = (row.frequency || daysToFrequency(row.intervalDays || 30)) as Frequency;
              const intervalDays = row.intervalDays ?? frequencyToDays(freq);
              let agg = map.get(key);
              if (!agg) {
                agg = {
                  id: key,
                  npub: row.subscriberNpub!,
                  tierId: row.tierId,
                  tierName: row.tierName || "",
                  amountSat: row.amount,
                  frequency: freq,
                  intervalDays,
                  tokens: [],
                  lifetime: 0,
                  totalPeriods: row.totalPeriods,
                };
                map.set(key, agg);
              }
              if (row.unlockTs != null) {
                agg.tokens.push({ unlockTs: row.unlockTs });
              }
              agg.lifetime += row.amount;
              if (row.totalPeriods != null && agg.totalPeriods == null) {
                agg.totalPeriods = row.totalPeriods;
              }
            }

            const now = Date.now() / 1000;
            this.subscribers = Array.from(map.values()).map((g) => {
              g.tokens.sort((a, b) => a.unlockTs - b.unlockTs);
              const receivedPeriods = g.tokens.length;
              const earliest = g.tokens[0]?.unlockTs ?? 0;
              const latest = g.tokens[g.tokens.length - 1]?.unlockTs;
              const nextRenewal =
                latest != null ? latest + g.intervalDays * 86400 : undefined;

              let status: SubStatus;
              if (g.totalPeriods != null && receivedPeriods >= g.totalPeriods) {
                status = "ended";
              } else {
                const nextUnlock = g.tokens[0]?.unlockTs;
                status =
                  nextUnlock != null && nextUnlock <= now ? "active" : "pending";
              }

              let progress = 0;
              let dueSoon = false;
              if (nextRenewal != null) {
                const period = g.intervalDays * 86400;
                const start = nextRenewal - period;
                progress = Math.min(Math.max((now - start) / period, 0), 1);
                dueSoon = status === "active" && nextRenewal - now < 72 * 3600;
              }

              const npub = nip19.npubEncode(g.npub);

              return {
                id: g.id,
                name: npub,
                npub,
                nip05: "",
                tierId: g.tierId,
                tierName: g.tierName,
                amountSat: g.amountSat,
                frequency: g.frequency,
                intervalDays: g.intervalDays,
                status,
                startDate: earliest,
                nextRenewal,
                lifetimeSat: g.lifetime,
                receivedPeriods,
                totalPeriods: g.totalPeriods,
                progress,
                dueSoon,
              } as Subscriber;
            });
            this.loading = false;
          } catch (e) {
            console.error(e);
            this.error = e instanceof Error ? e.message : String(e);
            this.loading = false;
          }
        },
        error: (e) => {
          console.error(e);
          this.error = e instanceof Error ? e.message : String(e);
          this.loading = false;
        },
      });
    },
    async fetchProfiles() {
      const BATCH_SIZE = 50;
      const nostr = useNostrStore();
      this.profilesLoading = true;
      this.error = null;

      try {
        const unique = Array.from(new Set(this.subscribers.map((s) => s.npub)));
        const uncached = unique.filter((npub) => !this.profileCache[npub]);

        if (!uncached.length) {
          // Apply cached profiles to subscribers
          this.subscribers = this.subscribers.map((s) => {
            const cached = this.profileCache[s.npub];
            return {
              ...s,
              name: cached?.name || s.name || s.npub,
              nip05: cached?.nip05 || s.nip05 || "",
            };
          });
          this.profilesLoading = false;
          return;
        }

        if (!navigator.onLine) {
            this.profilesLoading = false;
            return;
        }

        await nostr.initNdkReadOnly();
        if (!nostr.connected) {
          this.error = nostr.lastError;
          this.profilesLoading = false;
          return;
        }

        const ndk = await useNdk({ requireSigner: false });
        const relays = new Set<NDKRelay>();
        for (const url of DEFAULT_RELAYS) {
            relays.add(ndk.pool.getRelay(url));
        }
        const relaySet = new NDKRelaySet(relays, ndk);

        for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
          const batch = uncached.slice(i, i + BATCH_SIZE);
          const authors = batch.map((npub) => nostr.resolvePubkey(npub));

          try {
            const events: Set<NDKEvent> = await ndk.fetchEvents(
              { kinds: [0], authors },
              { relaySet }
            );

            const found = new Set<string>();

            events.forEach((ev: NDKEvent) => {
              try {
                const profile = JSON.parse(ev.content || "{}");
                const npub = nip19.npubEncode(ev.pubkey);
                this.profileCache[npub] = {
                  name: profile.name || "",
                  nip05: profile.nip05 || "",
                };
                cashuDb.profiles
                  .put({
                    pubkey: ev.pubkey,
                    profile,
                    fetchedAt: Math.floor(Date.now() / 1000),
                  })
                  .catch(console.error);
                found.add(npub);
              } catch (err) {
                console.error(err);
              }
            });

            // Mark profiles that were not found in this batch to avoid re-fetching
            for (const npub of batch) {
              if (!found.has(npub)) {
                this.profileCache[npub] = { name: "", nip05: "" };
              }
            }

            // Incremental update of the subscribers list
            this.subscribers = this.subscribers.map((s) => {
              const cached = this.profileCache[s.npub];
              if (cached) {
                return {
                  ...s,
                  name: cached.name || s.name || s.npub,
                  nip05: cached.nip05 || s.nip05 || "",
                };
              }
              return s;
            });

          } catch (batchError) {
            console.error(`Error fetching batch ${i / BATCH_SIZE + 1}:`, batchError);
          }
        }
      } catch (e) {
        console.error(e);
        this.error = e instanceof Error ? e.message : String(e);
      } finally {
        this.profilesLoading = false;
      }
    },
    setActiveTab(tab: Tab) {
      this.activeTab = tab;
    },
  },
});

export type { Subscriber } from "../types/subscriber";
