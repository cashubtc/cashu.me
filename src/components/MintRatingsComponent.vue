<template>
  <q-card style="min-width: 360px; max-width: 820px; width: 100%">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <q-icon name="reviews" size="sm" color="primary" class="q-mr-sm" />
        <div class="text-h6">Mint Reviews</div>
      </div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <q-card-section>
      <div class="q-mb-sm text-subtitle2 text-grey-6">{{ url }}</div>
      <div class="row items-center justify-between">
        <div class="row items-center">
          <div class="text-body1">
            <span v-if="hasAnyReviews">
              ⭐ {{ averageDisplay }} · {{ totalReviews }} reviews
            </span>
            <span v-else class="text-grey-6">No reviews yet</span>
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn
            v-if="allowCreateReview"
            color="primary"
            rounded
            dense
            class="q-ml-sm q-px-md"
            @click="showCreateReviewDialog = true"
          >
            Write a review
          </q-btn>
          <q-toggle
            v-model="onlyWithComment"
            color="primary"
            label="Comments only"
          />
          <q-select
            dense
            outlined
            color="primary"
            v-model="sortMode"
            :options="sortOptions"
            emit-value
            map-options
            style="min-width: 160px"
          />
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
        <div v-for="r in paged" :key="r.eventId" class="q-pa-md review">
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
              <div class="text-caption text-grey-7 row items-center">
                <span>{{ displayName(r.pubkey) }}</span>
                <span class="monospace q-ml-xs"
                  >({{ shortNpub(r.pubkey) }})</span
                >
                <q-icon
                  name="content_copy"
                  size="14px"
                  class="q-ml-xs cursor-pointer"
                  @click="copyNpub(r.pubkey)"
                />
              </div>
            </div>
            <div class="text-caption text-grey-6">
              {{ formatDate(r.created_at) }}
            </div>
          </div>
          <div class="q-mb-xs">
            <span v-if="r.rating !== null">⭐ {{ r.rating }}/5</span>
            <span v-else class="text-grey-6">No rating</span>
          </div>
          <div class="text-body2" style="white-space: pre-wrap">
            {{ r.comment || "\u00A0" }}
          </div>
        </div>

        <div class="row justify-between items-center q-mt-sm">
          <q-select
            dense
            outlined
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

export default defineComponent({
  name: "MintRatingsComponent",
  props: {
    url: { type: String, required: true },
    reviews: { type: Array, required: true },
    allowCreateReview: { type: Boolean, default: false },
    mintInfo: { type: Object, required: false },
  },
  emits: ["close"],
  components: { CreateMintReview },
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
    hasAnyReviews(): boolean {
      return Array.isArray(this.reviews) && this.reviews.length > 0;
    },
    totalReviews(): number {
      return this.reviews?.length || 0;
    },
    ratingsOnly(): any[] {
      return (this.reviews || []).filter(
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
      let list = (this.reviews || []) as any[];
      if (this.onlyWithComment)
        list = list.filter((r) => (r.comment || "").trim().length > 0);
      return list;
    },
    sorted(): any[] {
      const list = [...this.filtered];
      switch (this.sortMode) {
        case "oldest":
          list.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
          break;
        case "best":
          list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "worst":
          list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        default:
          list.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
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
.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
