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
  }),
  getters: {
    displayName(state): string {
      const p = state.profile || {};
      const name = (p.display_name || p.name || "").trim();
      return name || (state.pubkey ? `${state.pubkey.slice(0, 8)}…${state.pubkey.slice(-4)}` : "");
    },
    wotCount(state): number {
      return Object.keys(state.wotHopsByPubkey || {}).length;
    },
    isInWebOfTrust: (state) => (pk: string): boolean => {
      return pk in state.wotHopsByPubkey;
    },
    getHop: (state) => (pk: string): number | null => {
      return state.wotHopsByPubkey[pk] ?? null;
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
      const [follows, wot, last] = await Promise.all([
        db.follows.toArray(),
        db.wot.toArray(),
        db.meta.get("lastUpdatedAt"),
      ]);
      this.follows = follows.map((f) => f.pubkey);
      this.wotHopsByPubkey = Object.fromEntries(
        wot.map((e) => [e.pubkey, e.hop])
      );
      this.lastUpdatedAt = (last?.value as number) || 0;
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
      if (!force && now - this.lastUpdatedAt < this.profileRefreshIntervalSeconds) return; // throttle to profileRefreshIntervalSeconds seconds
      console.log(`[nostrUser] Updating user profile for ${this.pubkey} (force=${force})`);
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
          if (!latest || (e.created_at || 0) > (latest.created_at || 0)) latest = e;
        });
        if (latest) {
          try {
            const content = JSON.parse(latest.content || "{}");
            this.profile = content as NostrProfile;
          } catch { }
        }
      } catch { }
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
          if (!latest || (e.created_at || 0) > (latest.created_at || 0)) latest = e;
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
        console.log(`[nostrUser] Fetched ${follows.length} follows for ${this.pubkey}`);
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
          const wotRows = Object.entries(next).map(([pubkey, hop]) => ({ pubkey, hop }));
          await db.wot.bulkPut(wotRows);
        }
      } catch { }
    },
    crawlWebOfTrust: async function (
      maxHops: number | undefined = undefined,
      sourcePubKey: string | undefined = undefined
    ) {
      await this.ensureDbInitialized();
      maxHops = maxHops || this.wotMaxHops;
      const source = sourcePubKey || this.pubkey;
      if (!source) return;
      if (this.wotLoading) return;
      this.wotLoading = true;
      try {
        console.log(
          `[nostrUser] Crawling web of trust from ${source} up to ${maxHops} hops…`
        );
        // Start from source's follows
        const baseFollows =
          source === this.pubkey
            ? this.follows.length
              ? this.follows
              : await this.fetchFollowsOf(source)
            : await this.fetchFollowsOf(source);
        const wot: Record<string, number> = {};
        // 1 hop: our follows
        const hop1 = Array.from(new Set(baseFollows));
        for (const pk of hop1) {
          if (pk && pk !== source) wot[pk] = 1;
        }
        // Commit 1-hop immediately for UI reflect
        this.wotHopsByPubkey = { ...this.wotHopsByPubkey, ...wot };
        if (Object.keys(wot).length) {
          await db.wot.bulkPut(
            Object.entries(wot).map(([pubkey, hop]) => ({ pubkey, hop }))
          );
        }

        if (maxHops >= 2 && hop1.length) {
          // Sequentially fetch to avoid blocking the UI; short delay between requests
          const stepDelayMs = 20; // ~1 frame
          let processed = 0;
          for (const pk1 of hop1) {
            const followsOfFollow = await this.fetchFollowsOf(pk1);
            for (const pk2 of followsOfFollow) {
              if (!pk2 || pk2 === source) continue;
              if (!(pk2 in wot)) wot[pk2] = 2;
            }
            processed++;
            if (processed % 3 === 0) {
              // Periodically update state so UI reflects progress
              const merged: Record<string, number> = { ...this.wotHopsByPubkey };
              for (const [k, v] of Object.entries(wot)) {
                merged[k] = Math.min(merged[k] ?? v, v);
              }
              this.wotHopsByPubkey = merged;
              await db.wot.bulkPut(
                Object.entries(wot).map(([pubkey, hop]) => ({ pubkey, hop }))
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
            Object.entries(wot).map(([pubkey, hop]) => ({ pubkey, hop }))
          );
        }
        console.log(`[nostrUser] Crawl complete. Known pubkeys: ${Object.keys(this.wotHopsByPubkey).length}`);
      } finally {
        this.wotLoading = false;
      }
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


