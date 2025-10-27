import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { useLocalStorage } from "@vueuse/core";
import { useNostrStore } from "./nostr";
import Dexie from "dexie";

type NostrProfile = {
  name?: string;
  display_name?: string;
  picture?: string;
  image?: string; // sometimes used instead of picture
  about?: string;
  nip05?: string;
  lud16?: string;
};

export const useNostrUserStore = defineStore("nostrUser", {
  state: () => ({
    pubkey: useLocalStorage<string>("cashu.nostrUser.pubkey", ""),
    profile: null as NostrProfile | null,
    follows: [] as string[],
    wotHopsByPubkey: {} as Record<string, number>,
    lastUpdatedAt: 0,
    ndkConnected: false,
    wotLoading: false,
    wotMaxHops: 2,
    profileRefreshIntervalSeconds: 60, // 1 minute
    dbInitialized: false,
    crawlProcessed: 0,
    crawlTotal: 0,
    crawlCheckpointNextIndex: 0,
    crawlCheckpointTotal: 0,
    wotCancelRequested: false,
    defaultWoTSeedPubkey:
      "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9",
    defaultShallowWoTPubkeys: [
      "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9", // ODELL
      "50d94fc2d8580c682b071a542f8b1e31a200b0508bab95a33bef0855df281d63", // Calle
      "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2", // jack
      "b33bf9e97b78f35694a02e6bbef8e77059373e42b0a85a63f25a50ebfdadf50d", // Minibits
      "1afe0c74e3d7784eba93a5e3fa554a6eeb01928d12739ae8ba4832786808e36d", // AmericanHodl
      "c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11", // Walker
      "c43bbb58e2e6bc2f9455758257f6ba5329107bd4e8274068c2936c69d9980b7d", // roya
    ],
  }),
  getters: {
    displayName(state): string {
      const p = state.profile || {};
      const name = (p.display_name || p.name || "").trim();
      return (
        name ||
        (state.pubkey
          ? `${state.pubkey.slice(0, 8)}…${state.pubkey.slice(-4)}`
          : "")
      );
    },
    wotCount(state): number {
      return Object.keys(state.wotHopsByPubkey || {}).length;
    },
    isInWebOfTrust:
      (state) =>
      (pk: string): boolean => {
        return pk in state.wotHopsByPubkey;
      },
    getHop:
      (state) =>
      (pk: string): number | null => {
        return state.wotHopsByPubkey[pk] ?? null;
      },
    hasCrawlCheckpoint(state): boolean {
      return (
        typeof state.crawlCheckpointNextIndex === "number" &&
        typeof state.crawlCheckpointTotal === "number" &&
        state.crawlCheckpointTotal > 0 &&
        state.crawlCheckpointNextIndex > 0 &&
        state.crawlCheckpointNextIndex < state.crawlCheckpointTotal
      );
    },
  },
  actions: {
    initDb: async function () {
      if (db.isOpen()) return;
      await db.open();
    },
    ensureDbInitialized: async function () {
      if (this.dbInitialized) return;
      await this.initDb();
      // Load persisted data
      const [follows, wot, last, nextIdx, hop1Saved] = await Promise.all([
        db.follows.toArray(),
        db.wot.toArray(),
        db.meta.get("lastUpdatedAt"),
        db.meta.get("wot.crawl.nextIndex"),
        db.meta.get("wot.crawl.hop1"),
      ]);
      this.follows = follows.map((f) => f.pubkey);
      this.wotHopsByPubkey = Object.fromEntries(
        wot.map((e) => [e.pubkey, e.hop])
      );
      this.lastUpdatedAt = (last?.value as number) || 0;
      this.crawlCheckpointNextIndex = (nextIdx?.value as number) || 0;
      this.crawlCheckpointTotal = Array.isArray(hop1Saved?.value)
        ? (hop1Saved?.value as string[]).length
        : 0;
      this.dbInitialized = true;
    },
    ensureNdk: function (): NDK {
      // Use the global NDK instance managed by the nostr store to avoid stuck fetches
      const nostr = useNostrStore();
      if (!nostr.connected || !nostr.ndk) nostr.initNdkReadOnly();
      return nostr.ndk as unknown as NDK;
    },
    sleep: async function (ms: number) {
      return await new Promise<void>((resolve) => setTimeout(resolve, ms));
    },
    setPubkey: function (pubkey: string) {
      this.pubkey = pubkey || "";
    },
    updateUserProfile: async function (force = false) {
      await this.ensureDbInitialized();
      if (!this.pubkey) return;
      const now = Math.floor(Date.now() / 1000);
      if (
        !force &&
        now - this.lastUpdatedAt < this.profileRefreshIntervalSeconds
      )
        return; // throttle to profileRefreshIntervalSeconds seconds
      console.log(
        `[nostrUser] Updating user profile for ${this.pubkey} (force=${force})`
      );
      await this.fetchProfile();
      await this.fetchFollows();
      this.lastUpdatedAt = now;
      await db.meta.put({ key: "lastUpdatedAt", value: now });
    },
    fetchProfile: async function () {
      if (!this.pubkey) return;
      const ndk = this.ensureNdk();
      const filter: NDKFilter = {
        kinds: [NDKKind.Metadata],
        authors: [this.pubkey],
        limit: 1,
      };
      try {
        console.log(`[nostrUser] Fetching kind:0 profile for ${this.pubkey}`);
        const events = await ndk.fetchEvents(filter);
        let latest: NDKEvent | undefined;
        events.forEach((e) => {
          if (!latest || (e.created_at || 0) > (latest.created_at || 0))
            latest = e;
        });
        if (latest) {
          try {
            const content = JSON.parse(latest.content || "{}");
            this.profile = content as NostrProfile;
          } catch {}
        }
      } catch {}
    },
    fetchFollowsOf: async function (pk: string): Promise<string[]> {
      const ndk = this.ensureNdk();
      const filter: NDKFilter = {
        kinds: [NDKKind.Contacts],
        authors: [pk],
        limit: 1,
      };
      try {
        console.log(`[nostrUser] Fetching follows (kind:3) for ${pk}`);
        const events = await ndk.fetchEvents(filter);
        let latest: NDKEvent | undefined;
        events.forEach((e) => {
          if (!latest || (e.created_at || 0) > (latest.created_at || 0))
            latest = e;
        });
        if (!latest) return [];
        const follows = (latest.tags || [])
          .filter((t) => t[0] === "p" && typeof t[1] === "string")
          .map((t) => t[1]);
        console.log(`[nostrUser] Fetched ${follows.length} follows for ${pk}`);
        return Array.from(new Set(follows));
      } catch {
        return [];
      }
    },
    fetchFollows: async function () {
      await this.ensureDbInitialized();
      if (!this.pubkey) return;
      try {
        console.log(`[nostrUser] Fetching follows (kind:3) for ${this.pubkey}`);
        const follows = await this.fetchFollowsOf(this.pubkey);
        this.follows = follows;
        console.log(
          `[nostrUser] Fetched ${follows.length} follows for ${this.pubkey}`
        );
        await db.follows.clear();
        if (follows.length) {
          await db.follows.bulkPut(follows.map((pk) => ({ pubkey: pk })));
        }
        // Immediately reflect 1-hop WOT with follows
        const next: Record<string, number> = { ...this.wotHopsByPubkey };
        for (const pk of follows) {
          if (pk && pk !== this.pubkey) next[pk] = 1;
        }
        this.wotHopsByPubkey = next;
        if (Object.keys(next).length) {
          // Upsert WOT entries with hop=1
          const wotRows = Object.entries(next).map(([pubkey]) => ({
            pubkey,
            hop: next[pubkey],
          }));
          await db.wot.bulkPut(wotRows);
        }
      } catch {}
    },
    shallowCrawlWebOfTrust: async function () {
      // call 1-hop crawlWebOfTrust for each of the defaultShallowWoTPubkeys
      for (const pubkey of this.defaultShallowWoTPubkeys) {
        await this.crawlWebOfTrust(1, pubkey);
      }
    },
    crawlWebOfTrust: async function (
      maxHops: number | undefined = undefined,
      sourcePubKey: string | undefined = undefined
    ) {
      await this.ensureDbInitialized();
      maxHops = maxHops || this.wotMaxHops;
      const nostr = useNostrStore();
      const source =
        sourcePubKey ||
        (nostr.signerType === "SEED" ? this.defaultWoTSeedPubkey : this.pubkey);
      if (!source) return;
      if (this.wotLoading) return;
      this.wotLoading = true;
      this.wotCancelRequested = false;
      try {
        console.log(
          `[nostrUser] Crawling web of trust from ${source} up to ${maxHops} hops…`
        );
        // Determine resume vs fresh crawl
        let hop1Saved = (await db.meta.get("wot.crawl.hop1"))?.value as
          | string[]
          | undefined;
        let nextIndexSaved = (await db.meta.get("wot.crawl.nextIndex"))
          ?.value as number | undefined;
        let hop1: string[] = [];
        let startIndex = 0;
        if (
          Array.isArray(hop1Saved) &&
          typeof nextIndexSaved === "number" &&
          nextIndexSaved >= 0 &&
          nextIndexSaved < hop1Saved.length
        ) {
          // Resume
          hop1 = hop1Saved;
          startIndex = nextIndexSaved;
        } else {
          // Fresh start from source's follows
          const baseFollows =
            source === this.pubkey
              ? this.follows.length
                ? this.follows
                : await this.fetchFollowsOf(source)
              : await this.fetchFollowsOf(source);
          hop1 = Array.from(new Set(baseFollows));
          startIndex = 0;
          await db.meta.put({ key: "wot.crawl.hop1", value: hop1 });
          await db.meta.put({ key: "wot.crawl.nextIndex", value: 0 });
        }

        const wot: Record<string, number> = {};
        // Ensure 1 hop are reflected immediately
        for (const pk of hop1) {
          if (pk && pk !== source) wot[pk] = 1;
        }
        // Update progress counters for UI
        this.crawlTotal = hop1.length;
        this.crawlProcessed = startIndex;
        this.crawlCheckpointTotal = hop1.length;
        this.crawlCheckpointNextIndex = startIndex;
        // Commit 1-hop immediately, keeping shortest hop in both state and DB
        const mergedInitial: Record<string, number> = {
          ...this.wotHopsByPubkey,
        };
        for (const [k, v] of Object.entries(wot)) {
          mergedInitial[k] = Math.min(mergedInitial[k] ?? v, v);
        }
        this.wotHopsByPubkey = mergedInitial;
        if (Object.keys(wot).length) {
          await db.wot.bulkPut(
            Object.keys(wot).map((pubkey) => ({
              pubkey,
              hop: this.wotHopsByPubkey[pubkey],
            }))
          );
        }

        if (maxHops >= 2 && hop1.length) {
          // Sequentially fetch to avoid blocking the UI; short delay between requests
          const stepDelayMs = 20; // ~1 frame
          for (let i = startIndex; i < hop1.length; i++) {
            if (this.wotCancelRequested) break;
            const pk1 = hop1[i];
            const followsOfFollow = await this.fetchFollowsOf(pk1);
            for (const pk2 of followsOfFollow) {
              if (!pk2 || pk2 === source) continue;
              if (!(pk2 in wot)) wot[pk2] = 2;
            }
            this.crawlProcessed = i + 1;
            // Persist checkpoint so we can resume later
            await db.meta.put({ key: "wot.crawl.nextIndex", value: i + 1 });
            this.crawlCheckpointNextIndex = i + 1;
            if (this.crawlProcessed % 3 === 0) {
              // Periodically update state so UI reflects progress
              const merged: Record<string, number> = {
                ...this.wotHopsByPubkey,
              };
              for (const [k, v] of Object.entries(wot)) {
                merged[k] = Math.min(merged[k] ?? v, v);
              }
              this.wotHopsByPubkey = merged;
              await db.wot.bulkPut(
                Object.keys(wot).map((pubkey) => ({
                  pubkey,
                  hop: this.wotHopsByPubkey[pubkey],
                }))
              );
            }
            await this.sleep(stepDelayMs);
          }
        }
        // Merge with existing to retain shorter hops and previous entries
        const merged: Record<string, number> = { ...this.wotHopsByPubkey };
        for (const [k, v] of Object.entries(wot)) {
          merged[k] = Math.min(merged[k] ?? v, v);
        }
        this.wotHopsByPubkey = merged;
        if (Object.keys(wot).length) {
          await db.wot.bulkPut(
            Object.keys(wot).map((pubkey) => ({
              pubkey,
              hop: this.wotHopsByPubkey[pubkey],
            }))
          );
        }
        if (!this.wotCancelRequested) {
          console.log(
            `[nostrUser] Crawl complete. Known pubkeys: ${
              Object.keys(this.wotHopsByPubkey).length
            }`
          );
          // Clear checkpoint upon completion
          await db.meta.delete("wot.crawl.hop1");
          await db.meta.delete("wot.crawl.nextIndex");
          this.crawlCheckpointNextIndex = 0;
          this.crawlCheckpointTotal = 0;
        } else {
          console.log(
            `[nostrUser] Crawl cancelled at ${this.crawlProcessed}/${this.crawlTotal}`
          );
        }
      } finally {
        this.wotLoading = false;
        // Reset progress counters when done
        if (!this.wotCancelRequested) {
          this.crawlTotal = 0;
          this.crawlProcessed = 0;
        }
        this.wotCancelRequested = false;
      }
    },
    cancelCrawl: function () {
      if (!this.wotLoading) return;
      this.wotCancelRequested = true;
    },
    resetWebOfTrust: async function () {
      await this.ensureDbInitialized();
      if (this.wotLoading) return;
      this.wotHopsByPubkey = {};
      await db.wot.clear();
      await db.meta.delete("wot.crawl.hop1");
      await db.meta.delete("wot.crawl.nextIndex");
      this.crawlCheckpointNextIndex = 0;
      this.crawlCheckpointTotal = 0;
    },
    clearAllDatabases: function () {
      db.wot.clear();
      db.follows.clear();
      db.meta.clear();
    },
  },
});

// Dexie DB setup for web-of-trust persistence
class NostrUserDB extends Dexie {
  wot!: Dexie.Table<{ pubkey: string; hop: number }, string>;
  follows!: Dexie.Table<{ pubkey: string }, string>;
  meta!: Dexie.Table<{ key: string; value: any }, string>;
  constructor() {
    super("nostrUserDB");
    this.version(1).stores({
      wot: "pubkey",
      follows: "pubkey",
      meta: "key",
    });
  }
}

const db = new NostrUserDB();
