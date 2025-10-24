import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKFilter, NDKKind } from "@nostr-dev-kit/ndk";
import { useSettingsStore } from "./settings";
import { useNostrStore } from "./nostr";
import { useLocalStorage } from "@vueuse/core";

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
    // Maps
    mintsByIdentifier: new Map() as Map<MintIdentifier, MintInfo>,
    urlByIdentifier: new Map() as Map<MintIdentifier, string>,
    reviewsByIdentifier: new Map() as Map<MintIdentifier, MintReview[]>,
    // Aggregated list by URL
    recommendations: useLocalStorage<MintRecommendation[]>(
      "cashu.ndk.mintRecommendations.v2",
      []
    ),
    // Subscriptions running
    subsActive: false,
  }),
  actions: {
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
    },
    fetchMintInfos: async function () {
      this.init();
      const filter: NDKFilter = { kinds: [38172 as NDKKind], limit: 5000 };
      const events = await this.ndk.fetchEvents(filter);
      for (const ev of events) this.handleMintInfoEvent(ev);
      this.rebuildAggregates();
    },
    fetchReviews: async function () {
      this.init();
      const filter: NDKFilter = { kinds: [38000 as NDKKind], limit: 5000 };
      const events = await this.ndk.fetchEvents(filter);
      for (const ev of events) this.handleReviewEvent(ev);
      this.rebuildAggregates();
    },
    discover: async function (): Promise<MintRecommendation[]> {
      await this.fetchMintInfos();
      await this.fetchReviews();
      return this.recommendations;
    },
    startSubscriptions: function () {
      if (this.subsActive) return;
      this.init();
      // Mint infos (38172)
      const subInfos = this.ndk.subscribe(
        { kinds: [38172 as NDKKind] } as NDKFilter,
        { closeOnEose: false, groupable: false }
      );
      subInfos.on("event", (ev: NDKEvent) => {
        this.handleMintInfoEvent(ev);
        this.rebuildAggregates();
      });
      // Reviews (38000)
      const subReviews = this.ndk.subscribe(
        { kinds: [38000 as NDKKind] } as NDKFilter,
        { closeOnEose: false, groupable: false }
      );
      subReviews.on("event", (ev: NDKEvent) => {
        this.handleReviewEvent(ev);
        this.rebuildAggregates();
      });
      this.subsActive = true;
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
    },
    handleReviewEvent: function (ev: NDKEvent) {
      if (ev.kind !== 38000) return;
      const aTag = ev.tags.find((t) => t[0] === "a");
      if (!aTag) return;
      const a = aTag[1] || "";
      const parts = a.split(":");
      if (parts.length < 3) return;
      const kind = parseInt(parts[0], 10);
      const pubkey = parts[1];
      const d = parts.slice(2).join(":");
      if (kind !== 38172) return; // only cashu mints
      const identifier = makeIdentifier(kind, pubkey, d);
      const { rating, comment } = parseRatingAndComment(ev.content || "");
      const review: MintReview = {
        eventId: ev.id,
        pubkey: ev.pubkey,
        created_at: ev.created_at || 0,
        rating,
        comment,
        raw: ev.rawEvent(),
      };
      const existing = this.reviewsByIdentifier.get(identifier) || [];
      // dedupe by same author and same identifier keeping latest created_at
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
      // Build recommendations per URL
      const recs: MintRecommendation[] = [];
      for (const [url, reviews] of urlToReviews.entries()) {
        const ratings = reviews.map((r) => r.rating).filter((n): n is number => typeof n === "number");
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
        recs.push({
          url,
          reviewsCount: reviews.length,
          averageRating: avg,
          reviews: reviews.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)),
        });
      }
      recs.sort((a, b) => (b.reviewsCount - a.reviewsCount) || ((b.averageRating || 0) - (a.averageRating || 0)));
      this.recommendations = recs;
    },
  },
});


