import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { useSettingsStore } from "./settings";
import { useNostrStore } from "./nostr";
import { useLocalStorage } from "@vueuse/core";
import Dexie from "dexie";

export type MintReview = {
  eventId: string;
  pubkey: string;
  created_at: number;
  rating: number | null;
  comment: string;
  raw: any;
};

export type MintRecommendation = {
  url: string;
  reviewsCount: number;
  averageRating: number | null;
  info?: any;
  error?: boolean;
  lastHttpInfoFetchAt?: number; // unix seconds
};

function parseRatingAndComment(content: string): {
  rating: number | null;
  comment: string;
} {
  const m = content.match(/\s*\[(\d)\s*\/\s*5\]\s*(.*)$/s);
  if (!m) return { rating: null, comment: content || "" };
  const rating = parseInt(m[1], 10);
  const comment = (m[2] || "").trim();
  if (isNaN(rating) || rating < 1 || rating > 5)
    return { rating: null, comment };
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
    // Minimal in-memory caches for UI
    urlReviews: new Map() as Map<string, MintReview[]>,
    httpInfoByUrl: new Map() as Map<string, any>,
    infoTimers: new Map() as Map<string, any>,
    inflightInfo: new Set() as Set<string>,
    infoTimeoutMs: 10000,
    httpInfoFetchIntervalSeconds: 60 * 60, // 1 hour
    // Aggregated list by URL (persisted)
    recommendations: useLocalStorage<MintRecommendation[]>(
      "cashu.ndk.mintRecommendations",
      []
    ),
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
    init: function () {
      if (this.connected) return;
      const settings = useSettingsStore();
      const nostr = useNostrStore();
      if (!nostr.ndk || !(nostr.ndk as any).pool) nostr.initNdkReadOnly();
      this.ndk =
        nostr.ndk ||
        new NDK({ explicitRelayUrls: settings.defaultNostrRelays });
      this.ndk.connect();
      this.connected = true;
      this.ensureDbInitialized();
      this.hydrateFromDb();
    },
    // Load all reviews from DB into a lightweight cache for instant UI and build aggregates
    hydrateFromDb: async function () {
      try {
        if (this.dbHydrated) return;
        await this.ensureDbInitialized();
        const rows = await (this.db as MintReviewsDB).reviews.toArray();
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
        for (const [url, list] of map.entries()) {
          list.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
          this.urlReviews.set(url, list);
        }
        this.dbHydrated = true;
        await this.rebuildAggregates();
        // After hydration, opportunistically refetch stale HTTP info within interval
        //void this.refetchStaleHttpInfoForKnownMints();
      } catch {}
    },
    fetchMintInfos: async function () {
      this.init();
      await this.ensureDbInitialized();
      const filter: NDKFilter = { kinds: [38172 as NDKKind], limit: 5000 };
      const events = await this.ndk.fetchEvents(filter);
      for (const ev of events) await this.handleMintInfoEvent(ev);
      await this.rebuildAggregates();
    },
    fetchReviews: async function () {
      this.init();
      await this.ensureDbInitialized();
      const filter: NDKFilter = {
        kinds: [38000 as NDKKind],
        ["#k"]: ["38172"],
        limit: 5000,
      } as any;
      const events = await this.ndk.fetchEvents(filter);
      for (const ev of events) await this.handleReviewEvent(ev);
      await this.rebuildAggregates();
    },
    fetchReviewsForUrl: async function (url: string) {
      try {
        this.init();
        if (!url || typeof url !== "string" || !url.startsWith("http")) return;
        const filter: NDKFilter = {
          kinds: [38000 as NDKKind],
          ["#k"]: ["38172"],
          ["#u"]: [url],
          limit: 5000,
        } as any;
        const events = await this.ndk.fetchEvents(filter);
        for (const ev of events) await this.handleReviewEvent(ev);
        await this.rebuildAggregates();
      } catch {}
    },
    fetchMintInfoForUrl: async function (url: string) {
      try {
        this.init();
        if (!url || typeof url !== "string" || !url.startsWith("http")) return;
        const filter: NDKFilter = {
          kinds: [38172 as NDKKind],
          ["#u"]: [url],
          limit: 1000,
        } as any;
        const events = await this.ndk.fetchEvents(filter);
        for (const ev of events) await this.handleMintInfoEvent(ev);
        await this.rebuildAggregates();
      } catch {}
    },
    clearRecommendations: function () {
      this.recommendations.splice(0, this.recommendations.length);
    },
    clearDiscoveryCaches: async function () {
      try {
        await this.ensureDbInitialized();
        // Do NOT clear HTTP info; preserve last known info across reloads
      } catch {}
      this.inflightInfo.clear();
      this.infoTimers.forEach((t) => clearTimeout(t));
      this.infoTimers.clear();
      await this.rebuildAggregates();
    },
    setInfoTimeoutMs: function (ms: number) {
      this.infoTimeoutMs = ms;
    },
    discover: async function (): Promise<MintRecommendation[]> {
      await this.fetchMintInfos();
      await this.fetchReviews();
      return this.recommendations;
    },
    startSubscriptions: function () {
      if (this.subsActive) return;
      this.init();
      this.hydrateFromDb();
      const subInfos = this.ndk.subscribe(
        { kinds: [38172 as NDKKind] } as NDKFilter,
        { closeOnEose: false, groupable: false }
      );
      subInfos.on("event", async (ev: NDKEvent) => {
        await this.handleMintInfoEvent(ev);
        try {
          const u = ev.tags.find(
            (t) => t[0] === "u" && (t[2] === "cashu" || t.length >= 2)
          )?.[1];
          if (typeof u === "string" && u.startsWith("http")) {
            // Kick off HTTP info fetch (concurrency-limited via scheduler)
            void this.scheduleHttpInfoFetches([u], 20, 100, this.infoTimeoutMs);
          }
        } catch {}
        void this.rebuildAggregates();
      });
      const subReviews = this.ndk.subscribe(
        { kinds: [38000 as NDKKind] } as NDKFilter,
        { closeOnEose: false, groupable: false }
      );
      subReviews.on("event", async (ev: NDKEvent) => {
        await this.handleReviewEvent(ev);
        void this.rebuildAggregates();
      });
      this.subsActive = true;
    },
    requestMintHttpInfo: async function (url: string, timeoutMs?: number) {
      try {
        await this.ensureDbInitialized();
        const existing = await (this.db as MintReviewsDB).httpInfo.get(url);
        const nowSec = Math.floor(Date.now() / 1000);
        const interval = this.httpInfoFetchIntervalSeconds || 0;
        const isFresh =
          !!existing &&
          !!existing.info &&
          !!existing.fetchedAt &&
          nowSec - existing.fetchedAt < interval;
        if (isFresh) {
          await this.rebuildAggregates();
          return;
        }
        if (this.inflightInfo.has(url)) return;
        this.inflightInfo.add(url);
        const ms = timeoutMs ?? this.infoTimeoutMs;
        const tempMint = { url, keys: [], keysets: [] } as any;
        const mod = await import("src/stores/mints");
        console.log("Fetching HTTP info for mint", url);
        // Start timeout timer only when we actually fire the HTTP request
        if (!this.infoTimers.has(url)) {
          const id = setTimeout(async () => {
            try {
              const existing = await (this.db as MintReviewsDB).httpInfo.get(
                url
              );
              const row: HttpInfoRow = {
                url,
                info: existing?.info ?? null,
                fetchedAt: Math.floor(Date.now() / 1000) ?? 0,
                error: false,
              };
              await (this.db as MintReviewsDB).httpInfo.put(row);
              void this.rebuildAggregates();
            } catch {}
            this.infoTimers.delete(url);
          }, ms);
          this.infoTimers.set(url, id);
        }
        const info = await new (mod as any).MintClass(tempMint).api.getInfo();
        console.log("HTTP info for mint", url, info.name);
        const row: HttpInfoRow = {
          url,
          info,
          fetchedAt: Math.floor(Date.now() / 1000),
          error: false,
        };
        // unset error in localstore too:
        await (this.db as MintReviewsDB).httpInfo.put(row);
        // Update in-memory cache only; do not persist info to localStorage
        this.httpInfoByUrl.set(url, info);
        // Rebuild aggregates to reflect fresh fetchedAt and clear error
        await this.rebuildAggregates();
        const t = this.infoTimers.get(url);
        if (t) clearTimeout(t);
        this.infoTimers.delete(url);
        // done
      } catch {
        console.log("Error fetching HTTP info for mint", url);
        // Immediately persist error state (do not wait for timer)
        try {
          const existing = await (this.db as MintReviewsDB).httpInfo.get(url);
          const nowSec = Math.floor(Date.now() / 1000);
          // Failure: keep existing info/fetchedAt if present, only set error
          const row: HttpInfoRow = {
            url,
            info: existing?.info ?? null,
            fetchedAt: existing?.fetchedAt ?? nowSec,
            error: true,
          };
          await (this.db as MintReviewsDB).httpInfo.put(row);
        } catch {}
        const t = this.infoTimers.get(url);
        if (t) clearTimeout(t);
        this.infoTimers.delete(url);
        await this.rebuildAggregates();
      } finally {
        this.inflightInfo.delete(url);
      }
    },
    scheduleHttpInfoFetches: async function (
      urls: string[],
      concurrency: number = 20,
      delayMs: number = 100,
      timeoutMs?: number
    ) {
      try {
        await this.ensureDbInitialized();
        const nowSec = Math.floor(Date.now() / 1000);
        const interval = this.httpInfoFetchIntervalSeconds || 0;
        const seen = new Set<string>();
        const toFetch: string[] = [];
        for (const u of urls) {
          if (typeof u !== "string" || !u.startsWith("http")) continue;
          if (seen.has(u)) continue;
          seen.add(u);
          // Skip if a fetch is already in-flight for this URL
          if (this.inflightInfo.has(u)) continue;
          const existing = await (this.db as MintReviewsDB).httpInfo.get(u);
          const fresh =
            !!existing &&
            !!existing.fetchedAt &&
            nowSec - existing.fetchedAt < interval;
          if (!fresh) toFetch.push(u);
        }
        if (!toFetch.length) return;
        let idx = 0;
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
        const worker = async () => {
          while (true) {
            const i = idx++;
            if (i >= toFetch.length) break;
            const u = toFetch[i];
            try {
              await this.requestMintHttpInfo(u, timeoutMs);
            } catch {}
            await delay(delayMs);
          }
        };
        const workers = Array.from(
          { length: Math.min(concurrency, toFetch.length) },
          () => worker()
        );
        await Promise.all(workers);
      } catch {}
    },
    refetchStaleHttpInfoForKnownMints: async function () {
      try {
        await this.ensureDbInitialized();
        const urls = this.recommendations.map((r) => r.url);
        await this.scheduleHttpInfoFetches(urls, 10, 100);
      } catch {}
    },
    // Expose getters for HTTP info from in-memory cache
    getHttpInfoForUrl: function (url: string): any | undefined {
      return this.httpInfoByUrl.get(url);
    },
    hasHttpInfo: function (url: string): boolean {
      return this.httpInfoByUrl.has(url);
    },
    handleMintInfoEvent: async function (ev: NDKEvent) {
      try {
        if (ev.kind !== 38172) return;
        const u = ev.tags.find(
          (t) => t[0] === "u" && (t[2] === "cashu" || t.length >= 2)
        )?.[1];
        if (!u || typeof u !== "string" || !u.startsWith("http")) return;
        let content: any = undefined;
        try {
          content = ev.content ? JSON.parse(ev.content) : undefined;
        } catch {}
        const row: InfoRow = {
          url: u,
          pubkey: ev.pubkey,
          d: ev.tagValue("d") || "",
          content,
          created_at: ev.created_at || 0,
        };
        await (this.db as MintReviewsDB).infos.add(row);
      } catch {}
    },
    upsertReviewForUrl: async function (url: string, review: MintReview) {
      if (!url || !url.startsWith("http")) return;
      const list = this.urlReviews.get(url) || [];
      if (list.some((r) => r.eventId === review.eventId)) return;
      const withoutSameAuthor = list.filter((r) => r.pubkey !== review.pubkey);
      withoutSameAuthor.push(review);
      withoutSameAuthor.sort(
        (a, b) => (a.created_at || 0) - (b.created_at || 0)
      );
      this.urlReviews.set(url, withoutSameAuthor);
      await this.persistReviewRow(url, review);
    },
    handleReviewEvent: async function (ev: NDKEvent) {
      try {
        if (ev.kind !== 38000) return;
        const kTag = ev.tags.find((t) => t[0] === "k");
        if (!kTag || kTag[1] !== "38172") return;
        const uTags = ev.tags.filter(
          (t) => t[0] === "u" && (t[2] === "cashu" || t.length >= 2)
        );
        if (!uTags.length) return;
        const { rating, comment } = parseRatingAndComment(ev.content || "");
        const review: MintReview = {
          eventId: ev.id,
          pubkey: ev.pubkey,
          created_at: ev.created_at || 0,
          rating,
          comment,
          raw: ev.rawEvent(),
        };
        for (const u of uTags) {
          const url = u[1];
          if (typeof url === "string" && url.startsWith("http")) {
            await this.upsertReviewForUrl(url, review);
          }
        }
      } catch {}
    },
    rebuildAggregates: async function () {
      try {
        await this.ensureDbInitialized();
        const [reviews, infos, httpRows] = await Promise.all([
          (this.db as MintReviewsDB).reviews.toArray(),
          (this.db as MintReviewsDB).infos.toArray(),
          (this.db as MintReviewsDB).httpInfo.toArray(),
        ]);
        const urlSet = new Set<string>();
        reviews.forEach((r) => r.url && urlSet.add(r.url));
        infos.forEach((i) => i.url && urlSet.add(i.url));
        httpRows.forEach((h) => h.url && urlSet.add(h.url));

        // Group reviews by URL
        const grouped = new Map<string, ReviewRow[]>();
        for (const r of reviews) {
          if (!r.url) continue;
          const list = grouped.get(r.url) || [];
          list.push(r);
          grouped.set(r.url, list);
        }

        const httpByUrl = new Map<string, HttpInfoRow>();
        // Refresh in-memory cache from Dexie and build quick lookups
        this.httpInfoByUrl.clear();
        for (const h of httpRows) {
          httpByUrl.set(h.url, h);
          if (h.info) this.httpInfoByUrl.set(h.url, h.info);
        }

        const recs: MintRecommendation[] = [];
        for (const url of urlSet) {
          const list = grouped.get(url) || [];
          const ratings = list
            .map((r) => r.rating)
            .filter((n): n is number => typeof n === "number");
          const avg = ratings.length
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;
          const http = httpByUrl.get(url);
          recs.push({
            url,
            reviewsCount: list.length,
            averageRating: avg,
            reviews: [],
            info: http?.info ?? undefined,
            error: !!http?.error || false,
            lastHttpInfoFetchAt: http?.fetchedAt ?? undefined,
          });
        }
        recs.sort(
          (a, b) =>
            b.reviewsCount - a.reviewsCount ||
            (b.averageRating || 0) - (a.averageRating || 0)
        );
        this.recommendations = recs;
      } catch {}
    },
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
      } catch {}
    },
    getReviewsForUrl: async function (url: string): Promise<MintReview[]> {
      try {
        await this.ensureDbInitialized();
        if (!url) return [];
        const rows = await (this.db as MintReviewsDB).reviews
          .where("url")
          .equals(url)
          .sortBy("created_at");
        const list = rows.map(
          (r) =>
            ({
              eventId: r.eventId,
              pubkey: r.pubkey,
              created_at: r.created_at,
              rating: r.rating,
              comment: r.comment,
              raw: r.raw,
            } as MintReview)
        );
        list.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
        this.urlReviews.set(url, list);
        await this.rebuildAggregates();
        return list;
      } catch {
        return [];
      }
    },
    getAverageForUrl: function (url: string): number | null {
      const rec = this.recommendations.find((r) => r.url === url);
      return rec ? rec.averageRating : null;
    },
    getCountForUrl: function (url: string): number {
      const rec = this.recommendations.find((r) => r.url === url);
      return rec ? rec.reviewsCount : 0;
    },
    clearAllDatabases: async function () {
      try {
        await this.ensureDbInitialized();
        await Promise.all([
          (this.db as MintReviewsDB).reviews.clear(),
          (this.db as MintReviewsDB).infos.clear(),
          (this.db as MintReviewsDB).httpInfo.clear(),
        ]);
      } catch {}
      this.urlReviews.clear();
      this.dbHydrated = false;
      await this.rebuildAggregates();
    },
  },
});

// Dexie DB
class MintReviewsDB extends Dexie {
  reviews!: Dexie.Table<ReviewRow, string>;
  infos!: Dexie.Table<InfoRow, number>;
  httpInfo!: Dexie.Table<HttpInfoRow, string>;
  constructor() {
    super("mintReviews");
    this.version(1).stores({
      reviews: "eventId, url, created_at",
    });
    this.version(2).stores({
      infos: "++id, url, created_at",
      httpInfo: "url",
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

type InfoRow = {
  url: string;
  pubkey: string;
  d: string;
  content?: any;
  created_at: number;
};

type HttpInfoRow = {
  url: string;
  info: any | null;
  fetchedAt: number; // unix seconds
  error?: boolean;
};
