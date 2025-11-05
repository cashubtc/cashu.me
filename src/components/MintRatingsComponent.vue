<template>
  <q-card style="min-width: 360px; max-width: 820px; width: 100%">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <div class="text-h6">{{ $t("MintRatings.title") }}</div>
      </div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <q-card-section class="q-pb-md">
      <!-- Mint Info -->
      <div class="row items-center q-mb-lg">
        <MintInfoContainer
          :iconUrl="mintInfo?.icon_url"
          :name="mintInfo?.name"
          :url="url"
        />
      </div>

      <!-- Rating Summary Section - Apple Podcasts Style -->
      <div v-if="hasAnyReviews" class="q-mb-lg">
        <div class="row items-start q-mb-md" style="gap: 24px">
          <!-- Large Rating Display on Left -->
          <div class="column items-center" style="min-width: 100px">
            <div class="text-h2" style="font-weight: 600; line-height: 1">
              {{ averageDisplay }}
            </div>
            <div
              class="text-caption text-grey-5"
              style="font-weight: 400; margin-top: 4px"
            >
              {{ $t("MintRatings.out_of") }} 5
            </div>
          </div>

          <!-- Star Distribution Bars on Right -->
          <div class="col column justify-center" style="gap: 6px">
            <div
              v-for="star in [5, 4, 3, 2, 1]"
              :key="star"
              class="row items-center no-wrap"
              style="gap: 8px"
            >
              <!-- Star Icon -->
              <q-icon name="star" size="14px" class="text-grey-6" />
              <!-- Distribution Bar -->
              <div
                class="col"
                style="
                  height: 4px;
                  background: rgba(128, 128, 128, 0.2);
                  border-radius: 2px;
                  overflow: hidden;
                "
              >
                <div
                  :style="{
                    width: ratingPercentage(star) + '%',
                    height: '100%',
                    background: 'var(--q-primary)',
                    transition: 'width 0.3s ease',
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Total Ratings Count -->
        <div class="text-body2 text-grey-5" style="font-weight: 500">
          {{ totalReviews }} {{ $t("MintRatings.ratings") }}
        </div>
      </div>

      <!-- No Reviews State -->
      <div v-else class="q-mb-lg">
        <div class="text-h4 text-grey-6" style="font-weight: 500">
          {{ $t("MintRatings.no_reviews") }}
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="row items-center q-mt-md" style="gap: 12px">
        <q-btn
          v-if="allowCreateReview"
          color="primary"
          unelevated
          rounded
          class="q-px-lg"
          style="font-weight: 500"
          @click="showCreateReviewDialog = true"
        >
          {{ $t("MintRatings.actions.write_review") }}
        </q-btn>
        <q-space />
        <q-select
          dense
          color="primary"
          v-model="sortMode"
          :options="sortOptions"
          emit-value
          map-options
          borderless
          style="min-width: 120px"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section style="max-height: 60vh; overflow-y: auto">
      <div v-if="!hasAnyReviews" class="text-grey-6">
        <div class="row items-center justify-center">
          <div>{{ $t("MintRatings.no_reviews_to_display") }}</div>
        </div>
      </div>
      <div v-if="hasAnyReviews" class="column">
        <div
          v-for="r in paged"
          :key="r.eventId"
          :class="['review-item', { 'own-review': r.pubkey === myPubkey }]"
        >
          <div class="row items-start" style="gap: 12px">
            <!-- Avatar on the left -->
            <q-avatar size="40px" class="review-avatar">
              <q-img
                v-if="profiles[r.pubkey]?.picture"
                :src="profiles[r.pubkey].picture"
                spinner-color="white"
                spinner-size="xs"
              />
              <q-icon v-else name="account_circle" size="40px" />
            </q-avatar>

            <!-- Content on the right -->
            <div class="col">
              <!-- Name and verified badge -->
              <div class="row items-center" style="gap: 6px; margin-bottom: 2px">
                <span
                  v-if="hasProfileName(r.pubkey)"
                  class="text-body1"
                  style="font-weight: 600"
                  >{{ displayName(r.pubkey) }}</span
                >
                <span
                  v-else
                  class="text-body1 monospace"
                  style="font-weight: 600"
                  >{{ shortNpub(r.pubkey) }}</span
                >
                <q-icon
                  v-if="wotHop(r.pubkey)"
                  name="verified"
                  size="14px"
                  :color="wotColor(wotHop(r.pubkey))"
                >
                  <q-tooltip
                    >In your web of trust (hop {{ wotHop(r.pubkey) }})</q-tooltip
                  >
                </q-icon>
                <q-icon
                  name="content_copy"
                  size="14px"
                  class="cursor-pointer text-grey-7"
                  @click="copyNpub(r.pubkey)"
                  style="margin-left: 4px"
                >
                  <q-tooltip>Copy npub</q-tooltip>
                </q-icon>
              </div>

              <!-- Date and Star Rating on same line -->
              <div class="row items-center" style="gap: 8px; margin-bottom: 8px">
                <span class="text-caption text-grey-6">
                  {{ formatDateOnly(r.created_at) }}
                </span>
                <q-rating
                  v-if="r.rating !== null"
                  :model-value="r.rating"
                  readonly
                  size="12px"
                  color="amber"
                  icon="star"
                  icon-selected="star"
                  icon-half="star_half"
                />
                <span v-else class="text-caption text-grey-6">{{
                  $t("MintRatings.no_rating")
                }}</span>
              </div>

              <!-- Review Comment -->
              <div
                v-if="r.comment"
                class="text-body2"
                style="white-space: pre-wrap; line-height: 1.5; color: rgba(255, 255, 255, 0.87)"
              >
                {{ r.comment }}
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-between items-center q-mt-sm">
          <q-select
            dense
            class="q-ml-sm"
            color="primary"
            v-model="rowsPerPage"
            :options="rowsPerPageOptions"
            emit-value
            map-options
            :label="$t('MintRatings.rows')"
            style="width: 100px"
          />
          <q-pagination
            v-model="page"
            :max="totalPages"
            color="primary"
            max-pages="6"
            boundary-numbers
            direction-links
            rounded
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-dialog v-model="showCreateReviewDialog" persistent>
    <CreateMintReview
      :mintUrl="url"
      :mintInfo="mintInfo"
      @published="showCreateReviewDialog = false"
      @close="showCreateReviewDialog = false"
    />
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useNostrStore } from "src/stores/nostr";
import NDK from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import CreateMintReview from "./CreateMintReview.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import MintInfoContainer from "./MintInfoContainer.vue";
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
  components: { CreateMintReview, MintInfoContainer },
  methods: {
    // Calculate percentage for star rating bars
    ratingPercentage(star: number): number {
      const total = this.ratingsOnly.length;
      if (total === 0) return 0;
      const count = this.ratingDistribution[star] || 0;
      return (count / total) * 100;
    },
    formatDate(ts: number) {
      try {
        return new Date(ts * 1000).toLocaleString();
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
      return `${v.slice(0, 12)}…${v.slice(-6)}`;
    },
    copyNpub(pk: string) {
      try {
        const v = this.npub(pk);
        navigator.clipboard.writeText(v);
        // @ts-ignore
        this.$q?.notify &&
          this.$q.notify({
            message: "Copied",
            color: "positive",
            position: "top",
            timeout: 800,
          });
      } catch {}
    },
    displayName(pk: string) {
      const p = (this as any).profiles[pk];
      return p?.name || this.shortPubkey(pk);
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
      if (hop === 1) return "light-green-5";
      if (hop === 2) return "amber-5";
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
  },
  data() {
    return {
      sortMode: "newest" as "newest" | "oldest" | "best" | "worst",
      sortOptions: [
        { label: "Newest", value: "newest" },
        { label: "Oldest", value: "oldest" },
        { label: "Best rating", value: "best" },
        { label: "Worst rating", value: "worst" },
      ],
      onlyWithComment: false,
      rowsPerPage: 10,
      rowsPerPageOptions: [5, 10, 20, 50].map((v) => ({
        label: String(v),
        value: v,
      })),
      page: 1,
      profiles: {} as Record<string, { name?: string; picture?: string }>,
      loadingProfiles: new Set<string>(),
      showCreateReviewDialog: false,
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
      return this.allReviews?.length || 0;
    },
    ratingsOnly(): any[] {
      return (this.allReviews || []).filter(
        (r: any) => typeof r.rating === "number"
      );
    },
    average(): number | null {
      const rs = this.ratingsOnly;
      if (rs.length === 0) return null;
      const sum = rs.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      return sum / rs.length;
    },
    averageDisplay(): string {
      return this.average !== null ? this.average.toFixed(1) : "n/a";
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
      return list;
    },
    sorted(): any[] {
      const list = [...this.filtered];
      // Sort: by hop distance (1 before 2, etc.; non-WOT last), then by selected mode
      const hopValue = (pk: string) => {
        const hop = this.wotHop(pk);
        return typeof hop === "number" ? hop : Number.POSITIVE_INFINITY;
      };
      list.sort((a, b) => {
        const ah = hopValue(a.pubkey);
        const bh = hopValue(b.pubkey);
        if (ah !== bh) return ah - bh; // closer hops first; non-WOT last
        switch (this.sortMode) {
          case "oldest":
            return (a.created_at || 0) - (b.created_at || 0);
          case "best":
            return (b.rating || 0) - (a.rating || 0);
          case "worst":
            return (a.rating || 0) - (b.rating || 0);
          default:
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
      recs.fetchReviewsForUrl(this.url);
    } catch {}
  },

  watch: {
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
.review-item {
  padding: 20px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.review-item:last-child {
  border-bottom: none;
}

.review-item:first-child {
  padding-top: 0;
}

.own-review {
  background: rgba(255, 255, 255, 0.02);
  padding: 20px 16px;
  margin: 0 -16px;
  border-radius: 8px;
  border-bottom: none;
}

.review-avatar {
  flex-shrink: 0;
}

.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
