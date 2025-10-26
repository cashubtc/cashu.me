import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { useSettingsStore } from "./settings";
import { useNostrStore } from "./nostr";
import { useLocalStorage } from "@vueuse/core";
import Dexie from "dexie";

export type MintIdentifier = string; // `${kind}:${pubkey}:${d}`

export type MintReview = {
  eventId: string;
  pubkey: string;
  created_at: number;
  rating: number | null;
  comment: string;
  raw: any;
};

export type MintInfo = {
  identifier: MintIdentifier;
  kind: number; // 38172
  pubkey: string;
  d: string;
  url?: string;
  content?: any; // parsed JSON if present
  relayHint?: string;
};

export type MintRecommendation = {
  url: string;
  reviewsCount: number;
  averageRating: number | null;
  reviews: MintReview[];
  info?: any;
  error?: boolean;
  // unix seconds of the last successful HTTP info fetch for this mint
  lastHttpInfoFetchAt?: number;
};

function makeIdentifier(kind: number, pubkey: string, d: string): MintIdentifier {
  return `${kind}:${pubkey}:${d}`;
}

function parseRatingAndComment(content: string): { rating: number | null; comment: string } {
  const m = content.match(/\s*\[(\d)\s*\/\s*5\]\s*(.*)$/s);
  if (!m) return { rating: null, comment: content || "" };
  const rating = parseInt(m[1], 10);
  const comment = (m[2] || "").trim();
  if (isNaN(rating) || rating < 1 || rating > 5) return { rating: null, comment };
  return { rating, comment };
}

export const useMintRecommendationsStore = defineStore("mintRecommendations", {
  state: () => ({
    ndk: {} as NDK,
    connected: false,
    // Dexie DB handle
    dbInitialized: false,
    dbHydrated: false,
    db: null as MintReviewsDB | null,
    // Maps
    mintsByIdentifier: new Map() as Map<MintIdentifier, MintInfo>,
    urlByIdentifier: new Map() as Map<MintIdentifier, string>,
    reviewsByIdentifier: new Map() as Map<MintIdentifier, MintReview[]>,
    dToIdentifiers: new Map() as Map<string, Set<MintIdentifier>>, // d -> identifiers
    urlReviews: new Map() as Map<string, MintReview[]>, // fallback direct url reviews
    urlHttpInfo: new Map() as Map<string, any>,
    urlHttpInfoFetchedAt: new Map() as Map<string, number>,
    urlError: new Set() as Set<string>,
    infoTimers: new Map() as Map<string, any>,
    inflightInfo: new Set() as Set<string>,
    infoTimeoutMs: 5000,
    httpInfoFetchIntervalSeconds: 60 * 60 * 24, // 24 hours
    // cached averages for performance (not persisted)
    avgByUrl: new Map() as Map<string, { avg: number | null; count: number }>,
    // Aggregated list by URL
    recommendations: useLocalStorage<MintRecommendation[]>(
      "cashu.ndk.mintRecommendations",
      []
    ),
    // Subscriptions running
    subsActive: false,
  }),
  actions: {
    initDb: async function () {
      if (this.dbInitialized && this.db) return;
      this.db = new MintReviewsDB();
      await this.db.open();
      this.dbInitialized = true;
    },
    ensureDbInitialized: async function () {
      if (!this.dbInitialized || !this.db) await this.initDb();
    },
    migrateFromLocalStorage: async function () {
      try {
        await this.ensureDbInitialized();
        const key = "cashu.ndk.mintRecommendations";
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const arr: any[] = JSON.parse(raw || "[]");
        if (!Array.isArray(arr) || arr.length === 0) return;
        const rows: { url: string; review: MintReview }[] = [];
        const pruned: any[] = [];
        arr.forEach((rec) => {
          if (rec && typeof rec.url === "string") {
            const url = rec.url as string;
            const reviews = Array.isArray(rec.reviews) ? rec.reviews : [];
            for (const r of reviews) {
              if (r && r.eventId) {
                rows.push({ url, review: r as MintReview });
              }
            }
            // prune reviews from localStorage entry to keep only metadata
            const { reviews: _omit, ...rest } = rec || {};
            pruned.push({ ...rest, reviews: [] });
          }
        });
        if (rows.length) {
          const unique = new Map<string, { url: string; review: MintReview }>();
          rows.forEach((row) => {
            if (row.review && row.review.eventId && !unique.has(row.review.eventId)) {
              unique.set(row.review.eventId, row);
            }
          });
          const toPut = Array.from(unique.values()).map((row) => ({
            eventId: row.review.eventId,
            url: row.url,
            pubkey: row.review.pubkey,
            created_at: row.review.created_at,
            rating: row.review.rating,
            comment: row.review.comment,
            raw: row.review.raw,
          } as ReviewRow));
          await (this.db as MintReviewsDB).reviews.bulkPut(toPut);
        }
        // Write pruned recommendations back (without reviews payload)
        try {
          localStorage.setItem(key, JSON.stringify(pruned));
        } catch { }
      } catch { }
    },
    init: function () {
      if (this.connected) return;
      const settings = useSettingsStore();
      const nostr = useNostrStore();
      if (!nostr.ndk || !(nostr.ndk as any).pool) {
        nostr.initNdkReadOnly();
      }
      this.ndk = nostr.ndk || new NDK({ explicitRelayUrls: settings.defaultNostrRelays });
      this.ndk.connect();
      this.connected = true;
      // kick off DB and migration in background
      this.ensureDbInitialized();
      this.migrateFromLocalStorage();
      // hydrate recommendations/averages from IndexedDB so UI shows cached data immediately
      this.hydrateFromDb();
    },
    // Load all reviews from IndexedDB into in-memory caches and rebuild aggregates
    hydrateFromDb: async function () {
      try {
        if (this.dbHydrated) return;
        await this.ensureDbInitialized();
        if (!this.db) return;
        const rows = await (this.db as MintReviewsDB).reviews.toArray();
        if (!rows || rows.length === 0) {
          this.dbHydrated = true;
          return;
        }
        const map = new Map<string, MintReview[]>();
        for (const r of rows) {
          if (!r || !r.url || !r.eventId) continue;
          const list = map.get(r.url) || [];
          list.push({
            eventId: r.eventId,
            pubkey: r.pubkey,
            created_at: r.created_at,
            rating: r.rating,
            comment: r.comment,
            raw: r.raw,
          });
          map.set(r.url, list);
        }
        // sort and commit to caches
        for (const [url, list] of map.entries()) {
          list.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
          this.urlReviews.set(url, list);
          const ratings = list
            .map((r) => r.rating)
            .filter((n): n is number => typeof n === "number");
          const avg = ratings.length
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;
          this.avgByUrl.set(url, { avg, count: list.length });
        }
        this.dbHydrated = true;
        this.rebuildAggregates();
      } catch {
        // ignore hydration failures
      }
    },
    fetchMintInfos: async function () {
      this.init();
      await this.hydrateFromDb();
      const filter: NDKFilter = { kinds: [38172 as NDKKind], limit: 5000 };
      const events = await this.ndk.fetchEvents(filter);
      console.log(`[mintRecs] fetched ${events.size} cashu info events (38172)`);
      for (const ev of events) this.handleMintInfoEvent(ev);
      this.rebuildAggregates();
    },
    fetchReviews: async function () {
      this.init();
      await this.hydrateFromDb();
      const filter: NDKFilter = { kinds: [38000 as NDKKind], limit: 5000 };
      const events = await this.ndk.fetchEvents(filter);
      console.log(`[mintRecs] fetched ${events.size} review events (38000)`);
      for (const ev of events) this.handleReviewEvent(ev);
      this.rebuildAggregates();
    },
    // Fetch only the reviews relevant to a single mint URL.
    // This queries by two strategies and merges results:
    // 1) by '#u' (URL) with k=38172; 2) by '#a' identifiers discovered for this URL (38172:pubkey:d)
    fetchReviewsForUrl: async function (url: string) {
      try {
        this.init();
        if (!url || typeof url !== "string" || !url.startsWith("http")) return;

        // Ensure we know identifiers for this URL; fetch infos if needed
        const identifiersForUrl = () =>
          Array.from(this.urlByIdentifier.entries())
            .filter(([, u]) => u === url)
            .map(([id]) => id);

        let aIdentifiers = identifiersForUrl();
        if (aIdentifiers.length === 0) {
          await this.fetchMintInfoForUrl?.(url);
          aIdentifiers = identifiersForUrl();
        }

        // Build filters
        const filters: any[] = [];
        // Strategy 1: events that tag the URL directly
        filters.push({ kinds: [38000 as NDKKind], ['#k']: ['38172'], ['#u']: [url], limit: 5000 });
        // Strategy 2: events that reference known identifiers for this URL
        if (aIdentifiers.length > 0) {
          const chunkSize = 256;
          for (let i = 0; i < aIdentifiers.length; i += chunkSize) {
            const chunk = aIdentifiers.slice(i, i + chunkSize);
            filters.push({ kinds: [38000 as NDKKind], ['#a']: chunk, limit: 5000 });
          }
        }

        // Execute all filters sequentially (few) and merge
        for (const f of filters) {
          const events = await this.ndk.fetchEvents(f as NDKFilter);
          for (const ev of events) this.handleReviewEvent(ev);
        }
        this.rebuildAggregates();
      } catch { }
    },
    // Fetch 38172 info events for a single URL to learn (pubkey,d) identifiers
    fetchMintInfoForUrl: async function (url: string) {
      try {
        this.init();
        if (!url || typeof url !== "string" || !url.startsWith("http")) return;
        const filter: any = { kinds: [38172 as NDKKind], ['#u']: [url], limit: 1000 };
        const events = await this.ndk.fetchEvents(filter as NDKFilter);
        for (const ev of events) this.handleMintInfoEvent(ev);
        this.rebuildAggregates();
      } catch { }
    },
    clearRecommendations: function () {
      this.recommendations.splice(0, this.recommendations.length);
    },
    clearDiscoveryCaches: function () {
      this.urlHttpInfo.clear();
      this.urlHttpInfoFetchedAt.clear();
      this.urlError.clear();
      this.inflightInfo.clear();
      this.infoTimers.forEach((t) => clearTimeout(t));
      this.infoTimers.clear();
    },
    setInfoTimeoutMs: function (ms: number) {
      this.infoTimeoutMs = ms;
    },
    discover: async function (): Promise<MintRecommendation[]> {
      await this.fetchMintInfos();
      await this.fetchReviews();
      console.log(`[mintRecs] discovered ${this.recommendations.length} mints after aggregation`);
      this.recommendations.forEach((r) =>
        console.log(`[mintRecs] rec: ${r.url} | avg=${r.averageRating?.toFixed?.(2) ?? 'n/a'} | reviews=${r.reviewsCount}`)
      );
      return this.recommendations;
    },
    startSubscriptions: function () {
      if (this.subsActive) return;
      this.init();
      // ensure cached DB data is reflected before live updates
      this.hydrateFromDb();
      // Mint infos (38172)
      const subInfos = this.ndk.subscribe(
        { kinds: [38172 as NDKKind] } as NDKFilter,
        { closeOnEose: false, groupable: false }
      );
      subInfos.on("event", (ev: NDKEvent) => {
        // console.log(`[mintRecs] live 38172 info ${ev.id} pubkey=${ev.pubkey} d=${ev.tagValue("d")}`);
        this.handleMintInfoEvent(ev);
        this.rebuildAggregates();
      });
      // Reviews (38000)
      const subReviews = this.ndk.subscribe(
        { kinds: [38000 as NDKKind] } as NDKFilter,
        { closeOnEose: false, groupable: false }
      );
      subReviews.on("event", (ev: NDKEvent) => {
        // console.log(`[mintRecs] live 38000 review ${ev.id} from ${ev.pubkey}`);
        this.handleReviewEvent(ev);
        this.rebuildAggregates();
      });
      this.subsActive = true;
    },
    requestMintHttpInfo: async function (url: string, timeoutMs?: number) {
      // Gate by last successful fetch time
      const nowSec = Math.floor(Date.now() / 1000);
      const last = this.urlHttpInfoFetchedAt.get(url) || 0;
      const interval = this.httpInfoFetchIntervalSeconds || 0;
      const isFresh = this.urlHttpInfo.has(url) && last > 0 && (nowSec - last) < interval;
      if (isFresh) {
        // Use stored info; surface timestamp via aggregates
        this.rebuildAggregates();
        return;
      }
      if (this.urlError.has(url) || this.inflightInfo.has(url)) return;
      this.inflightInfo.add(url);
      const ms = timeoutMs ?? this.infoTimeoutMs;
      if (!this.infoTimers.has(url)) {
        const id = setTimeout(() => {
          if (!this.urlHttpInfo.has(url)) {
            this.urlError.add(url);
            this.rebuildAggregates();
          }
          this.infoTimers.delete(url);
        }, ms);
        this.infoTimers.set(url, id);
      }
      try {
        const tempMint = { url, keys: [], keysets: [] } as any;
        const mod = await import("src/stores/mints");
        console.log(`[mintRecs] fetching info for ${url}`);
        const info = await new (mod as any).MintClass(tempMint).api.getInfo();
        this.urlHttpInfo.set(url, info);
        this.urlHttpInfoFetchedAt.set(url, Math.floor(Date.now() / 1000));
        const t = this.infoTimers.get(url);
        if (t) clearTimeout(t);
        this.infoTimers.delete(url);
        this.rebuildAggregates();
      } catch (e) {
        // wait for timeout to mark error
      } finally {
        this.inflightInfo.delete(url);
      }
    },
    handleMintInfoEvent: function (ev: NDKEvent) {
      if (ev.kind !== 38172) return; // cashu only
      const d = ev.tagValue("d");
      const u = ev.tags.find((t) => t[0] === "u" && (t[2] === "cashu" || t.length === 2))?.[1];
      if (!d) return;
      const identifier = makeIdentifier(38172, ev.pubkey, d);
      let content: any = undefined;
      try {
        content = ev.content ? JSON.parse(ev.content) : undefined;
      } catch { }
      const info: MintInfo = {
        identifier,
        kind: 38172,
        pubkey: ev.pubkey,
        d,
        url: typeof u === "string" ? u : undefined,
        content,
      };
      this.mintsByIdentifier.set(identifier, info);
      if (info.url) this.urlByIdentifier.set(identifier, info.url);
      // map d -> identifiers
      if (!this.dToIdentifiers.has(d)) this.dToIdentifiers.set(d, new Set());
      this.dToIdentifiers.get(d)!.add(identifier);
      // console.log(`[mintRecs] info: d=${d} url=${info.url ?? 'n/a'} id=${identifier}`);
    },
    // Upsert helpers keep store consistent without full rebuilds
    upsertReviewForUrl: function (url: string, review: MintReview) {
      if (!url || !url.startsWith("http")) return;
      // Update urlReviews map (dedupe by pubkey)
      const list = this.urlReviews.get(url) || [];
      // Hard dedupe by eventId to avoid double counting from multiple filters
      if (list.some((r) => r.eventId === review.eventId)) {
        return;
      }
      const withoutSameAuthor = list.filter((r) => r.pubkey !== review.pubkey);
      withoutSameAuthor.push(review);
      withoutSameAuthor.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      this.urlReviews.set(url, withoutSameAuthor);
      // Persist to DB as one row per review
      this.persistReviewRow(url, review);

      // Update aggregated recommendation entry in-place
      const existingIdx = this.recommendations.findIndex((r) => r.url === url);
      const aggregated = [...(withoutSameAuthor || [])];
      const ratings = aggregated
        .map((r) => r.rating)
        .filter((n): n is number => typeof n === "number");
      const avg = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
      this.avgByUrl.set(url, { avg, count: aggregated.length });
      const updated: MintRecommendation = {
        url,
        reviewsCount: aggregated.length,
        averageRating: avg,
        // avoid persisting large review arrays into localStorage-backed recommendations
        reviews: [],
        info: this.urlHttpInfo.get(url),
        error: this.urlError.has(url),
        lastHttpInfoFetchAt: this.urlHttpInfoFetchedAt.get(url),
      };
      if (existingIdx >= 0) {
        this.recommendations.splice(existingIdx, 1, updated);
      } else {
        this.recommendations.push(updated);
      }
      // keep global order roughly stable: high reviewsCount then avg
      this.recommendations.sort(
        (a, b) => b.reviewsCount - a.reviewsCount || (b.averageRating || 0) - (a.averageRating || 0)
      );
    },

    handleReviewEvent: function (ev: NDKEvent) {
      if (ev.kind !== 38000) return;
      const { rating, comment } = parseRatingAndComment(ev.content || "");
      const review: MintReview = {
        eventId: ev.id,
        pubkey: ev.pubkey,
        created_at: ev.created_at || 0,
        rating,
        comment,
        raw: ev.rawEvent(),
      };

      let attached = false;
      const aTag = ev.tags.find((t) => t[0] === "a");
      if (aTag) {
        const a = aTag[1] || "";
        const parts = a.split(":");
        if (parts.length >= 3) {
          const kind = parseInt(parts[0], 10);
          const maybePubkey = parts[1];
          const d = parts.slice(2).join(":");
          if (kind === 38172) {
            if (/^[0-9a-fA-F]{64}$/.test(maybePubkey)) {
              const identifier = makeIdentifier(kind, maybePubkey, d);
              this.attachReviewToIdentifier(identifier, review);
              const url = this.urlByIdentifier.get(identifier);
              if (url) this.upsertReviewForUrl(url, review);
              attached = true;
              // console.log(`[mintRecs] review ${ev.id} -> identifier ${identifier} (exact)`);
            } else {
              const set = this.dToIdentifiers.get(d);
              if (set && set.size > 0) {
                set.forEach((identifier) => {
                  this.attachReviewToIdentifier(identifier, review);
                  const url = this.urlByIdentifier.get(identifier);
                  if (url) this.upsertReviewForUrl(url, review);
                });
                attached = true;
                // console.log(`[mintRecs] review ${ev.id} -> d ${d} mapped to ${set.size} identifiers`);
              }
            }
          }
        }
      }

      // Fallback: attach by URL(s) on review when available and k=38172
      const kTag = ev.tags.find((t) => t[0] === "k");
      if (!attached && kTag && kTag[1] === "38172") {
        const uTags = ev.tags.filter((t) => t[0] === "u" && (t[2] === "cashu" || t.length >= 2));
        for (const u of uTags) {
          const url = u[1];
          if (typeof url === "string" && url.startsWith("http")) {
            this.upsertReviewForUrl(url, review);
            attached = true;
            // console.log(`[mintRecs] review ${ev.id} -> url ${url} (fallback via u tag)`);
          }
        }
      }

      // if (!attached) {
      //   console.log(`[mintRecs] review ${ev.id} could not be attached to any mint`);
      // }
    },
    attachReviewToIdentifier: function (identifier: MintIdentifier, review: MintReview) {
      const existing = this.reviewsByIdentifier.get(identifier) || [];
      // Hard dedupe by eventId to avoid double counting from multiple filters
      if (existing.some((r) => r.eventId === review.eventId)) {
        return;
      }
      const withoutSameAuthor = existing.filter((r) => r.pubkey !== review.pubkey);
      withoutSameAuthor.push(review);
      withoutSameAuthor.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      this.reviewsByIdentifier.set(identifier, withoutSameAuthor);
    },
    rebuildAggregates: function () {
      const urlToReviews: Map<string, MintReview[]> = new Map();
      // Map all identifiers that have a known URL
      for (const [identifier, url] of this.urlByIdentifier.entries()) {
        const reviews = this.reviewsByIdentifier.get(identifier) || [];
        if (!urlToReviews.has(url)) urlToReviews.set(url, []);
        urlToReviews.get(url)!.push(...reviews);
      }
      // Merge in url-attached reviews
      for (const [url, list] of this.urlReviews.entries()) {
        if (!urlToReviews.has(url)) urlToReviews.set(url, []);
        urlToReviews.get(url)!.push(...list);
      }
      // Merge new aggregates into existing recommendations to avoid wiping others
      const currentByUrl = new Map(this.recommendations.map((r) => [r.url, r] as [string, MintRecommendation]));
      for (const [url, reviews] of urlToReviews.entries()) {
        // Dedupe by eventId across identifier- and url-attached reviews
        const uniqMap = new Map<string, MintReview>();
        for (const r of reviews) if (r && r.eventId && !uniqMap.has(r.eventId)) uniqMap.set(r.eventId, r);
        const uniq = Array.from(uniqMap.values());
        // schedule HTTP info if missing
        if (!this.urlHttpInfo.has(url) && !this.inflightInfo.has(url) && !this.urlError.has(url)) {
          this.requestMintHttpInfo(url);
        }
        const ratings = uniq.map((r) => r.rating).filter((n): n is number => typeof n === "number");
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
        this.avgByUrl.set(url, { avg, count: uniq.length });
        const rec: MintRecommendation = {
          url,
          reviewsCount: uniq.length,
          averageRating: avg,
          // keep reviews out of localStorage-backed state
          reviews: [],
          info: this.urlHttpInfo.get(url),
          error: this.urlError.has(url),
          lastHttpInfoFetchAt: this.urlHttpInfoFetchedAt.get(url),
        };
        currentByUrl.set(url, rec);
      }
      // Keep entries that were not part of this aggregate pass
      const merged = Array.from(currentByUrl.values()).filter((r) => !r.error);
      merged.sort((a, b) => b.reviewsCount - a.reviewsCount || (b.averageRating || 0) - (a.averageRating || 0));
      this.recommendations = merged;
    },
    // Persist a single review row to DB
    persistReviewRow: async function (url: string, review: MintReview) {
      try {
        await this.ensureDbInitialized();
        const row: ReviewRow = {
          eventId: review.eventId,
          url,
          pubkey: review.pubkey,
          created_at: review.created_at,
          rating: review.rating,
          comment: review.comment,
          raw: review.raw,
        };
        await (this.db as MintReviewsDB).reviews.put(row);
      } catch { }
    },
    // Load reviews for URL from DB; cache results in memory for UI
    getReviewsForUrl: async function (url: string): Promise<MintReview[]> {
      try {
        await this.ensureDbInitialized();
        if (!url) return [];
        const rows = await (this.db as MintReviewsDB).reviews.where("url").equals(url).sortBy("created_at");
        const list = rows.map((r) => ({
          eventId: r.eventId,
          pubkey: r.pubkey,
          created_at: r.created_at,
          rating: r.rating,
          comment: r.comment,
          raw: r.raw,
        } as MintReview));
        // sort ascending then we will reverse where needed for UI
        list.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
        this.urlReviews.set(url, list);
        // update cached avg/count
        const ratings = list.map((r) => r.rating).filter((n): n is number => typeof n === "number");
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
        this.avgByUrl.set(url, { avg, count: list.length });
        this.rebuildAggregates();
        return list;
      } catch {
        return [];
      }
    },
    // Average helper computed on-demand (not persisted)
    getAverageForUrl: function (url: string): number | null {
      const cached = this.avgByUrl.get(url);
      if (cached) return cached.avg;
      const list = this.urlReviews.get(url) || [];
      const ratings = list.map((r) => r.rating).filter((n): n is number => typeof n === "number");
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      this.avgByUrl.set(url, { avg, count: list.length });
      return avg;
    },
    getCountForUrl: function (url: string): number {
      const cached = this.avgByUrl.get(url);
      if (cached) return cached.count;
      const list = this.urlReviews.get(url) || [];
      this.avgByUrl.set(url, { avg: this.getAverageForUrl(url), count: list.length });
      return list.length;
    },
    clearAllDatabases: async function () {
      try {
        await this.ensureDbInitialized();
        await (this.db as MintReviewsDB).reviews.clear();
      } catch { }
      // reset in-memory caches
      this.urlReviews.clear();
      this.avgByUrl.clear();
      this.dbHydrated = false;
      // keep recommendations (mints) but zero out counts/averages quickly
      this.rebuildAggregates();
    },
  },
});

// Dexie DB for mint reviews persistence (one review per row)
class MintReviewsDB extends Dexie {
  reviews!: Dexie.Table<ReviewRow, string>;
  constructor() {
    super("mintReviews");
    this.version(1).stores({
      // primary key: eventId, indexes for url and created_at
      reviews: "eventId, url, created_at",
    });
  }
}

type ReviewRow = {
  eventId: string;
  url: string;
  pubkey: string;
  created_at: number;
  rating: number | null;
  comment: string;
  raw: any;
};
