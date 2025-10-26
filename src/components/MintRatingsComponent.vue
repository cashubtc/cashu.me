<template>
  <q-card style="min-width: 360px; max-width: 820px; width: 100%">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <div class="text-h6">Mint Reviews</div>
      </div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <q-card-section>
      <div class="row items-center justify-between">
        <!-- Mint identity and average rating -->
        <div class="row items-center" style="width: 100%">
          <div class="row items-center" style="flex: 1; min-width: 0">
            <MintInfoContainer
              :iconUrl="mintInfo?.icon_url"
              :name="mintInfo?.name"
              :url="url"
            />
          </div>
          <div class="text-body1 text-right" style="min-width: 200px">
            <span v-if="hasAnyReviews">
              ⭐ {{ averageDisplay }} · {{ totalReviews }} reviews
            </span>
            <span v-else class="text-grey-6">No reviews yet</span>
          </div>
        </div>

        <!-- Write a review button and sort options -->
        <div class="row items-center q-mt-md" style="width: 100%">
          <q-btn
            v-if="allowCreateReview"
            color="primary"
            rounded
            dense
            class="q-px-md"
            @click="showCreateReviewDialog = true"
          >
            Write a review
          </q-btn>
          <q-space />
          <div class="row items-center" style="margin-left: auto">
            <q-toggle
              v-model="onlyWithComment"
              color="primary"
              dense
              label="Comments only"
              class="q-mx-md"
            />
            <q-select
              dense
              outlined
              color="primary"
              v-model="sortMode"
              :options="sortOptions"
              emit-value
              map-options
              rounded
              style="width: 160px"
            />
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section style="max-height: 60vh; overflow-y: auto">
      <div v-if="!hasAnyReviews" class="text-grey-6">
        <div class="row items-center justify-between">
          <div>No reviews to display.</div>
          <q-btn
            v-if="allowCreateReview"
            color="primary"
            rounded
            class="q-ml-sm"
            @click="showCreateReviewDialog = true"
            >Write a review</q-btn
          >
        </div>
      </div>
      <div v-else class="column q-gutter-md">
        <div
          v-for="r in paged"
          :key="r.eventId"
          :class="[
            'q-pa-md',
            'review',
            { 'own-review': r.pubkey === myPubkey },
          ]"
        >
          <div class="row items-center justify-between q-mb-xs">
            <div class="row items-center">
              <q-avatar size="28px" class="q-mr-sm">
                <q-img
                  v-if="profiles[r.pubkey]?.picture"
                  :src="profiles[r.pubkey].picture"
                  spinner-color="white"
                  spinner-size="xs"
                />
                <q-icon v-else name="account_circle" />
              </q-avatar>
              <div class="text-caption row items-center">
                <template v-if="hasProfileName(r.pubkey)">
                  <span class="text-grey-2">{{ displayName(r.pubkey) }}</span>
                  <span class="monospace text-grey-7 q-ml-xs"
                    >({{ shortNpub(r.pubkey) }})</span
                  >
                </template>
                <template v-else>
                  <span class="monospace text-grey-2">{{
                    shortNpub(r.pubkey)
                  }}</span>
                </template>
                <q-icon
                  name="content_copy"
                  size="14px"
                  class="q-ml-xs cursor-pointer text-grey-7"
                  @click="copyNpub(r.pubkey)"
                />
                <q-icon
                  v-if="wotHop(r.pubkey)"
                  name="verified"
                  size="14px"
                  :color="wotColor(wotHop(r.pubkey))"
                  class="q-ml-xs"
                >
                  <q-tooltip
                    >In your web of trust (hop
                    {{ wotHop(r.pubkey) }})</q-tooltip
                  >
                </q-icon>
              </div>
            </div>
            <div class="text-caption text-grey-6">
              {{ formatDate(r.created_at) }}
            </div>
          </div>
          <div class="q-mt-sm">
            <span v-if="r.rating !== null">⭐ {{ r.rating }}/5</span>
            <span v-else class="text-grey-6">No rating</span>
          </div>
          <div
            v-if="r.comment"
            class="text-body2 q-mt-sm"
            style="white-space: pre-wrap"
          >
            {{ r.comment || "\u00A0" }}
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
            label="Rows"
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
    formatDate(ts: number) {
      try {
        return new Date(ts * 1000).toLocaleString();
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
      } catch {}
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
        const recs = useMintRecommendationsStore().recommendations || [];
        const rec = recs.find((r: any) => r.url === this.url);
        return rec?.reviews || [];
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
      return this.average !== null ? this.average.toFixed(2) : "n/a";
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
  mounted() {
    const uniquePks = Array.from(
      new Set((this.reviews || []).map((r: any) => r.pubkey))
    );
    uniquePks.forEach((pk) => this.fetchProfileFor(pk));
  },

  watch: {
    reviews: {
      handler() {
        const uniquePks = Array.from(
          new Set((this.reviews || []).map((r: any) => r.pubkey))
        );
        uniquePks.forEach((pk) => {
          if (!this.profiles[pk]) this.fetchProfileFor(pk);
        });
      },
      deep: true,
      immediate: false,
    },
  },
});
</script>

<style scoped>
.review {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
}
.own-review {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(128, 128, 128, 0.35);
}
.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
