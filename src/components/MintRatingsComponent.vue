<template>
  <q-card flat class="bg-transparent full-width mint-ratings-root">
    <q-card-section class="q-pa-none">
      <MintIdentityHeader :url="url" :info="mintInfo" class="q-mb-lg" />

      <!-- Rating summary (app-store style), then the web-of-trust filter. While the first
           fetch runs, the same summary draws its own placeholders, so the page never claims
           "No reviews yet" before it knows and nothing moves when the reviews arrive. -->
      <div v-if="hasAnyReviews || fetchingReviews" class="q-mb-lg">
        <RatingsSummary
          :skeleton="!hasAnyReviews"
          :average="average"
          :distribution="ratingDistribution"
        />
        <!-- The page's one action, right under the score it adds to. It needs no reviews, so
             it shows as it is while they load. -->
        <q-btn
          v-if="allowCreateReview"
          color="primary"
          unelevated
          rounded
          class="full-width write-review-btn q-mt-lg"
          @click="openCreateReview"
        >
          {{ $t("MintRatings.actions.write_review") }}
        </q-btn>
      </div>
      <div v-else class="q-mb-lg">
        <EmptyState
          :title="$t('MintRatings.no_reviews')"
          :text="$t('MintRatings.empty_state_subtitle')"
        >
          <template #icon>
            <MessageCircleIcon :size="26" />
          </template>
          <template #actions>
            <q-btn
              v-if="allowCreateReview"
              color="primary"
              unelevated
              rounded
              class="full-width write-review-btn app-empty__action"
              @click="openCreateReview"
            >
              {{ $t("MintRatings.actions.write_review") }}
            </q-btn>
          </template>
        </EmptyState>
      </div>
    </q-card-section>

    <!-- The list's header: how many reviews, the trust filter when it is on, and one quiet
         control that opens sorting and filtering together. -->
    <div
      v-if="hasAnyReviews || fetchingReviews"
      class="reviews-toolbar row items-center no-wrap"
    >
      <div class="col row items-center no-wrap reviews-toolbar__count">
        <span class="reviews-toolbar__title">
          <template v-if="hasAnyReviews">{{
            $t("MintRatings.reviews_count", sorted.length)
          }}</template>
          <template v-else>{{ $t("MintRatings.reviews_title") }}</template>
        </span>
        <AppBadge v-if="filterByWoT" tone="primary">{{
          $t("Settings.web_of_trust.title")
        }}</AppBadge>
      </div>
      <button
        type="button"
        class="reviews-toolbar__sort"
        :disabled="!hasAnyReviews"
        aria-haspopup="dialog"
        :aria-expanded="showSortSheet"
        :aria-label="`${$t(
          'MintRatings.sort_and_filter'
        )}: ${currentSortLabel}`"
        @click="showSortSheet = true"
      >
        <ListFilterIcon :size="16" aria-hidden="true" />
        <span>{{ currentSortLabel }}</span>
        <ChevronDownIcon :size="16" aria-hidden="true" />
      </button>
    </div>

    <q-card-section v-if="hasAnyReviews || fetchingReviews" class="q-px-none">
      <div v-if="!hasAnyReviews" class="column">
        <ReviewItem
          v-for="n in 3"
          :key="n"
          skeleton
          :skeleton-lines="n === 2 ? 2 : 1"
        />
      </div>
      <div v-else class="column">
        <ReviewItem
          v-for="r in paged"
          :key="r.eventId"
          :author="authorLabel(r.pubkey)"
          :picture="profiles[r.pubkey]?.picture || ''"
          :date="formatDateOnly(r.created_at)"
          :rating="r.rating"
          :comment="r.comment || ''"
          :hop="wotHop(r.pubkey)"
          :hop-color="wotColor(wotHop(r.pubkey))"
          :own="r.pubkey === myPubkey"
          @copy-npub="copyNpub(r.pubkey)"
        />

        <!-- One centred pager with its range count built in, like the history pager; hidden
             when everything fits on one page. -->
        <div v-if="totalPages > 1" class="column items-center q-mt-md">
          <q-pagination
            v-model="page"
            :max="totalPages"
            :max-pages="5"
            direction-links
            round
            flat
            active-design="unelevated"
            active-color="primary"
            size="md"
          />
          <div class="ratings-range q-mt-xs">
            {{
              $t("MintRatings.range", {
                from: (page - 1) * rowsPerPage + 1,
                to: Math.min(page * rowsPerPage, sorted.length),
                total: sorted.length,
              })
            }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>

  <BottomSheet
    v-model="showSortSheet"
    :title="$t('MintRatings.sort_and_filter')"
  >
    <div
      role="listbox"
      :aria-label="$t('MintRatings.sort')"
      class="sort-options"
    >
      <SheetOption
        v-for="option in sortOptions"
        :key="option.value"
        :label="option.label"
        :selected="sortMode === option.value"
        @select="selectSort(option.value)"
      />
    </div>
    <q-list class="settings-menu-group q-mt-lg">
      <SettingsToggleRow
        v-model="filterByWoT"
        :label="$t('Settings.web_of_trust.title')"
        :caption="$t('MintRatings.web_of_trust_caption')"
      />
    </q-list>
  </BottomSheet>
</template>

<script lang="ts">
import {
  ChevronDown as ChevronDownIcon,
  ListFilter as ListFilterIcon,
  MessageCircle as MessageCircleIcon,
} from "lucide-vue-next";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import MintIdentityHeader from "src/components/MintIdentityHeader.vue";
import RatingsSummary from "src/components/RatingsSummary.vue";
import ReviewItem from "src/components/ReviewItem.vue";
import EmptyState from "src/components/ui/EmptyState.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import { defineComponent } from "vue";
import { notifyCopied } from "src/js/notify";
import { useNostrStore } from "src/stores/nostr";
import NDK from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useNostrUserStore } from "src/stores/nostrUser";

export default defineComponent({
  name: "MintRatingsComponent",
  props: {
    url: { type: String, required: true },
    reviews: { type: Array, required: true },
    allowCreateReview: { type: Boolean, default: false },
    mintInfo: { type: Object, required: false },
  },
  emits: ["close"],
  components: {
    MessageCircleIcon,
    ListFilterIcon,
    ChevronDownIcon,
    AppBadge,
    SettingsToggleRow,
    BottomSheet,
    SheetOption,
    MintIdentityHeader,
    RatingsSummary,
    ReviewItem,
    EmptyState,
  },
  methods: {
    formatDate(ts: number) {
      try {
        return new Date(ts * 1000).toLocaleString(this.$i18n.locale, {
          numberingSystem: "latn",
        });
      } catch {
        return "";
      }
    },
    formatDateOnly(ts: number) {
      try {
        const date = new Date(ts * 1000);
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return "";
      }
    },
    shortPubkey(pk: string) {
      if (!pk) return "";
      return `${pk.slice(0, 8)}…${pk.slice(-4)}`;
    },
    npub(pk: string) {
      try {
        return nip19.npubEncode(pk);
      } catch {
        return this.shortPubkey(pk);
      }
    },
    shortNpub(pk: string) {
      const v = this.npub(pk);
      if (!v) return "";
      return `${v.slice(0, 6)}…${v.slice(-6)}`;
    },
    copyNpub(pk: string) {
      try {
        const v = this.npub(pk);
        navigator.clipboard.writeText(v);
        notifyCopied(this.$t("common.copied") as string);
      } catch {}
    },
    displayName(pk: string) {
      const p = (this as any).profiles[pk];
      return p?.name || this.shortPubkey(pk);
    },
    authorLabel(pk: string) {
      return this.hasProfileName(pk)
        ? this.displayName(pk)
        : this.shortNpub(pk);
    },
    hasProfileName(pk: string) {
      const p = (this as any).profiles[pk];
      return !!(p && p.name && String(p.name).trim().length > 0);
    },
    wotHop(pk: string): number | null {
      try {
        const store = useNostrUserStore();
        return store.getHop(pk);
      } catch {
        return null;
      }
    },
    wotColor(hop: number | null): string {
      if (!hop) return "";
      if (hop === 1) return "positive";
      if (hop === 2) return "warning";
      return "";
    },
    async ensureNdk() {
      const nostr = useNostrStore();
      if (!nostr.connected || !nostr.ndk) nostr.initNdkReadOnly();
      return nostr.ndk as unknown as NDK;
    },
    async fetchProfileFor(pk: string) {
      // Skip if already loaded or currently loading
      if (this.profiles[pk] || this.loadingProfiles.has(pk)) return;

      this.loadingProfiles.add(pk);
      try {
        const ndk = await this.ensureNdk();
        // @ts-ignore
        const user = ndk.getUser({ pubkey: pk });
        // @ts-ignore
        await user.fetchProfile();
        const name =
          (user.profile as any)?.name ||
          (user.profile as any)?.display_name ||
          "";
        const picture =
          (user.profile as any)?.image || (user.profile as any)?.picture || "";
        this.profiles = { ...this.profiles, [pk]: { name, picture } };
      } catch (error) {
        console.warn(`Failed to fetch profile for ${pk}:`, error);
      } finally {
        this.loadingProfiles.delete(pk);
      }
    },
    loadProfilesForPagedReviews() {
      // Load profiles only for users currently shown in pagination
      const uniquePks = Array.from(
        new Set((this.paged || []).map((r: any) => r.pubkey))
      );
      uniquePks.forEach((pk) => {
        if (pk && !this.profiles[pk] && !this.loadingProfiles.has(pk)) {
          this.fetchProfileFor(pk);
        }
      });
    },
    closeSortSheet() {
      this.showSortSheet = false;
    },
    selectSort(value: string) {
      this.sortMode = value as "newest" | "oldest" | "highest" | "lowest";
      this.closeSortSheet();
    },
    openCreateReview() {
      // Navigate to create review page
      this.$router.push({
        path: "/createreview",
        query: {
          mintUrl: this.url,
        },
      });
    },
  },
  data() {
    return {
      sortMode: "newest" as "newest" | "oldest" | "highest" | "lowest",
      sortOptions: [
        { label: this.$t("MintRatings.sort_options.newest"), value: "newest" },
        { label: this.$t("MintRatings.sort_options.oldest"), value: "oldest" },
        {
          label: this.$t("MintRatings.sort_options.highest"),
          value: "highest",
        },
        { label: this.$t("MintRatings.sort_options.lowest"), value: "lowest" },
      ],
      onlyWithComment: false,
      filterByWoT: false, // Default: show all reviews
      rowsPerPage: 10,
      rowsPerPageOptions: [5, 10, 20, 50].map((v) => ({
        label: String(v),
        value: v,
      })),
      page: 1,
      profiles: {} as Record<string, { name?: string; picture?: string }>,
      loadingProfiles: new Set<string>(),
      showSortSheet: false,
      fetchingReviews: true,
    };
  },
  computed: {
    myPubkey(): string {
      try {
        const nostr = useNostrStore();
        return nostr.pubkey || nostr.seedSignerPublicKey || "";
      } catch {
        return "";
      }
    },
    storeReviews(): any[] {
      try {
        const store = useMintRecommendationsStore();
        const list = store.urlReviews?.get?.(this.url) || [];
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    allReviews(): any[] {
      const a = Array.isArray(this.reviews) ? this.reviews : [];
      const b = Array.isArray(this.storeReviews) ? this.storeReviews : [];
      // merge and de-duplicate by eventId
      const map = new Map<string, any>();
      [...a, ...b].forEach((r: any) => {
        if (r && r.eventId) map.set(r.eventId, r);
      });
      return Array.from(map.values());
    },
    hasAnyReviews(): boolean {
      return Array.isArray(this.allReviews) && this.allReviews.length > 0;
    },
    totalReviews(): number {
      // Show count based on current filter state
      return this.filtered?.length || 0;
    },
    ratingsOnly(): any[] {
      // Use filtered reviews instead of all reviews
      return (this.filtered || []).filter(
        (r: any) => typeof r.rating === "number"
      );
    },
    average(): number | null {
      const rs = this.ratingsOnly;
      if (rs.length === 0) return null;
      const sum = rs.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      return sum / rs.length;
    },
    currentSortLabel(): string {
      const option = this.sortOptions.find(
        (opt) => opt.value === this.sortMode
      );
      return option ? option.label : "";
    },
    // Rating distribution for star bars (count of each rating 1-5)
    ratingDistribution(): Record<number, number> {
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      this.ratingsOnly.forEach((r: any) => {
        const rating = Math.floor(r.rating || 0);
        if (rating >= 1 && rating <= 5) {
          dist[rating]++;
        }
      });
      return dist;
    },
    filtered(): any[] {
      let list = (this.allReviews || []) as any[];
      if (this.onlyWithComment)
        list = list.filter((r) => (r.comment || "").trim().length > 0);
      // Filter by Web of Trust if enabled
      if (this.filterByWoT) {
        list = list.filter((r) => {
          // Always include the user's own review
          if (r.pubkey === this.myPubkey) return true;
          // Include if in Web of Trust
          const hop = this.wotHop(r.pubkey);
          return typeof hop === "number";
        });
      }
      return list;
    },
    sorted(): any[] {
      const list = [...this.filtered];
      // Sort based on selected sort mode only
      list.sort((a, b) => {
        switch (this.sortMode) {
          case "oldest":
            return (a.created_at || 0) - (b.created_at || 0);
          case "highest":
            return (b.rating || 0) - (a.rating || 0);
          case "lowest":
            return (a.rating || 0) - (b.rating || 0);
          default: // "newest"
            return (b.created_at || 0) - (a.created_at || 0);
        }
      });
      // Pin our own review to the top if present in the filtered list
      if (this.myPubkey) {
        const idx = list.findIndex((r) => r.pubkey === this.myPubkey);
        if (idx > 0) {
          const [mine] = list.splice(idx, 1);
          list.unshift(mine);
        }
      }
      return list;
    },
    totalPages(): number {
      return Math.max(1, Math.ceil(this.sorted.length / this.rowsPerPage));
    },
    paged(): any[] {
      const start = (this.page - 1) * this.rowsPerPage;
      return this.sorted.slice(start, start + this.rowsPerPage);
    },
  },
  async mounted() {
    try {
      // Ensure WoT data is hydrated from IndexedDB on first load
      const nostrUser = useNostrUserStore();
      await nostrUser.ensureDbInitialized();
      // If no WoT data yet, proactively load first-hop follows so review sorting has minimal context
      if (!nostrUser.wotCount && !nostrUser.wotLoading) {
        // Let the store decide the source based on signerType:
        // - SEED -> defaultWoTSeedPubkey (ODELL)
        // - otherwise -> user's pubkey
        void nostrUser.shallowCrawlWebOfTrust();
      }
    } catch {}

    // Load local reviews immediately to show them instantly
    try {
      const recs = useMintRecommendationsStore();
      await recs.getReviewsForUrl(this.url);
    } catch {}

    // Load profiles for currently visible reviews (non-blocking)
    this.$nextTick(() => {
      this.loadProfilesForPagedReviews();
    });

    // Fetch latest reviews from Nostr in background (non-blocking)
    try {
      const recs = useMintRecommendationsStore();
      // Stop showing the skeleton after the fetch, or after 8s if relays never answer.
      const done = () => (this.fetchingReviews = false);
      setTimeout(done, 8000);
      Promise.resolve(recs.fetchReviewsForUrl(this.url)).finally(done);
    } catch {
      this.fetchingReviews = false;
    }
  },

  watch: {
    filterByWoT() {
      // Reset to first page when filter changes
      this.page = 1;
    },
    paged: {
      handler() {
        // Load profiles when pagination changes (new page, different reviews shown)
        this.$nextTick(() => {
          this.loadProfilesForPagedReviews();
        });
      },
      deep: true,
      immediate: false,
    },
    allReviews: {
      handler() {
        // Load profiles when reviews change (including from store)
        this.$nextTick(() => {
          this.loadProfilesForPagedReviews();
        });
      },
      deep: true,
      immediate: false,
    },
    url: {
      async handler(newUrl: string) {
        try {
          if (newUrl) {
            const recs = useMintRecommendationsStore();
            // Load local reviews immediately
            await recs.getReviewsForUrl(newUrl);
            // Load profiles for new reviews
            this.$nextTick(() => {
              this.loadProfilesForPagedReviews();
            });
            // Fetch latest from Nostr in background
            recs.fetchReviewsForUrl(newUrl);
          }
        } catch {}
      },
      immediate: true,
    },
  },
});
</script>

<style scoped>
/* One surface level like mint details: no grey wrapper behind the cards. */
body[data-theme] .q-card--dark.mint-ratings-root {
  background: transparent !important;
}

.write-review-btn {
  font-weight: 600;
}

/* The list header: the count on the start edge, the sort-and-filter control on the end,
   one line, no rule (the reviews below are spaced by air). */
.reviews-toolbar {
  gap: 12px;
  margin-bottom: 4px;
  min-height: 44px;
}
.reviews-toolbar__count {
  gap: 8px;
  min-width: 0;
}
.reviews-toolbar__title {
  color: var(--app-text);
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
}
/* A quiet pill: the current order, with the filter glyph and a chevron. */
.reviews-toolbar__sort {
  align-items: center;
  background: var(--app-tint);
  border: 0;
  border-radius: var(--app-radius-pill);
  color: var(--app-text);
  cursor: pointer;
  display: inline-flex;
  flex: none;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
}
@media (hover: hover) {
  .reviews-toolbar__sort:hover {
    background: var(--app-tint-strong);
  }
}
.reviews-toolbar__sort:focus-visible {
  outline: 2px solid var(--app-text);
  outline-offset: 2px;
}
/* Nothing to sort until reviews arrive. */
.reviews-toolbar__sort:disabled {
  cursor: default;
  opacity: 0.5;
}
.ratings-range {
  color: var(--app-text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
</style>
