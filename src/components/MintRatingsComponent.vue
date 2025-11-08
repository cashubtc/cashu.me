<template>
  <q-card
    class="bg-dark"
    style="min-width: 360px; max-width: 820px; width: 100%"
  >
    <q-card-section class="q-pt-md q-pb-md">
      <!-- Mint Header - Matching MintDetailsPage style -->
      <div class="mint-header-container q-mb-lg">
        <div class="mint-header q-pa-md">
          <q-avatar size="56px" class="q-mb-sm">
            <img
              v-if="mintInfo?.icon_url"
              :src="mintInfo.icon_url"
              alt="Mint Profile"
            />
            <q-icon v-else name="account_balance" size="36px" color="grey-7" />
          </q-avatar>
          <div class="mint-name q-mb-xs">
            {{ mintInfo?.name || "Mint" }}
          </div>
          <div class="mint-url text-grey-6">
            {{ url }}
          </div>
        </div>
      </div>

      <!-- Rating Summary Section - Apple Podcasts Style -->
      <div v-if="hasAnyReviews" class="q-mb-lg">
        <div class="row items-start q-mb-sm" style="gap: 24px">
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
          <div class="col column" style="gap: 6px">
            <div
              v-for="star in [5, 4, 3, 2, 1]"
              :key="star"
              class="row items-center no-wrap"
              style="gap: 8px"
            >
              <!-- Star Icons (show only the number of stars for this rating level) -->
              <div class="row items-center" style="gap: 1px">
                <q-icon
                  v-for="i in star"
                  :key="i"
                  name="star"
                  size="12px"
                  class="text-grey-6"
                />
              </div>
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
        <!-- WoT Filter and Total Ratings Count -->
        <div class="col-12 row items-center justify-end" style="gap: 6px">
          <div class="row items-center" style="gap: 6px">
            <span class="text-caption text-grey-6" style="font-size: 0.7rem">
              {{ $t("Settings.web_of_trust.title") }}
            </span>
            <q-toggle v-model="filterByWoT" size="xs" color="primary" dense />
          </div>
          <div class="text-body2 text-grey-5" style="font-weight: 500">
            {{ totalReviews }} {{ $t("MintRatings.ratings") }}
          </div>
        </div>
      </div>

      <!-- No Reviews State -->
      <div v-else class="q-mb-lg">
        <div
          class="empty-state section-card q-pa-xl column items-center text-center"
        >
          <q-icon
            name="chat_bubble_outline"
            size="26px"
            class="empty-icon q-mb-sm"
          />
          <div class="empty-title q-mb-sm">
            {{ $t("MintRatings.no_reviews") }}
          </div>
          <div class="empty-subtitle q-mb-lg">
            {{ $t("MintRatings.empty_state_subtitle") }}
          </div>
          <q-btn
            v-if="allowCreateReview"
            color="primary"
            unelevated
            rounded
            class="q-px-xl q-mt-md"
            style="font-weight: 600"
            @click="openCreateReview"
          >
            {{ $t("MintRatings.actions.write_review") }}
          </q-btn>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div
        v-if="allowCreateReview && hasAnyReviews"
        class="row q-mt-md justify-center"
        style="gap: 12px"
      >
        <q-btn
          color="primary"
          unelevated
          rounded
          class="q-px-lg"
          style="font-weight: 500; width: 100%"
          @click="openCreateReview"
        >
          {{ $t("MintRatings.actions.write_review") }}
        </q-btn>
      </div>
    </q-card-section>

    <q-separator v-if="hasAnyReviews" />

    <!-- Sort Section -->
    <q-card-section v-if="hasAnyReviews" class="q-py-sm">
      <div
        class="sort-trigger row items-center justify-between"
        @click="showSortSheet = true"
      >
        <div class="row items-center" style="gap: 8px">
          <q-icon name="sort" size="14px" class="text-grey-7" />
          <span class="text-body2" style="font-weight: 600">{{
            $t("MintRatings.sort")
          }}</span>
          <span class="text-body2 text-grey-5">{{ currentSortLabel }}</span>
        </div>
        <q-icon name="keyboard_arrow_down" size="20px" class="text-grey-5" />
      </div>
    </q-card-section>

    <q-separator v-if="hasAnyReviews" />

    <q-card-section v-if="hasAnyReviews">
      <div class="column">
        <div
          v-for="r in paged"
          :key="r.eventId"
          :class="['review-item', { 'own-review': r.pubkey === myPubkey }]"
        >
          <div
            v-if="r.pubkey === myPubkey"
            class="own-review-badge currency-unit-badge"
          >
            <span class="currency-unit-text">{{
              $t("MintRatings.your_review")
            }}</span>
          </div>
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
              <div
                class="row items-center"
                style="gap: 6px; margin-bottom: 2px"
              >
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
                    >In your web of trust (hop
                    {{ wotHop(r.pubkey) }})</q-tooltip
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
              <div
                class="row items-center"
                style="gap: 8px; margin-bottom: 8px"
              >
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
                style="
                  white-space: pre-wrap;
                  line-height: 1.5;
                  color: rgba(255, 255, 255, 0.87);
                "
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

  <!-- Sort Bottom Sheet - Outside card, positioned to viewport -->
  <teleport to="body">
    <div
      v-if="showSortSheet"
      class="sort-sheet-overlay"
      @click="closeSortSheet"
    >
      <div class="sort-sheet" @click.stop>
        <div class="sort-sheet-header">
          <h3>{{ $t("MintRatings.sort") }}</h3>
          <q-btn
            flat
            round
            icon="close"
            @click="closeSortSheet"
            class="close-btn"
          />
        </div>
        <div class="sort-options">
          <div
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-option"
            :class="{ active: sortMode === option.value }"
            @click="selectSort(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
  components: {},
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
      return `${v.slice(0, 6)}…${v.slice(-6)}`;
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
    averageDisplay(): string {
      return this.average !== null ? this.average.toFixed(1) : "n/a";
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
      recs.fetchReviewsForUrl(this.url);
    } catch {}
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
/* Mint Header - Matching MintDetailsPage style */
.mint-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 50px;
}

.mint-header {
  width: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.mint-name {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: white;
}

.mint-url {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
}

.section-card {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.empty-state {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.25);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.empty-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  max-width: 320px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.6);
}

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
  position: relative;
}

.review-avatar {
  flex-shrink: 0;
}

.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

/* Sort trigger */
.sort-trigger {
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 8px 0;
}

.sort-trigger:hover {
  opacity: 0.8;
}

/* Sort bottom sheet */
.sort-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.sort-sheet {
  width: 100%;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
  max-height: 50vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sort-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sort-sheet-header h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  color: rgba(255, 255, 255, 0.7) !important;
}

.sort-options {
  flex: 1;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.sort-option {
  padding: 16px 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.sort-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.sort-option.active {
  background: rgba(var(--q-primary-rgb), 0.2);
  color: var(--q-primary);
}

.sort-option:last-child {
  border-bottom: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Match balance badges style from MintSettings.vue */
.currency-unit-badge {
  border-radius: 4px;
  background-color: #1d1d1d;
  display: inline-block;
  padding: 4px 8px;
  margin: 4px 4px 4px 0;
}

.currency-unit-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.own-review-badge {
  position: absolute;
  top: -2px;
  right: 12px;
  z-index: 1;
}
</style>
