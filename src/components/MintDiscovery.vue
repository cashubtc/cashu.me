<template>
  <div class="discover-section">
    <div class="discover-card">
      <!-- <div class="discover-header">
        <p class="discover-subtitle">
          {{ $t("MintSettings.discover.caption") }}
        </p>
      </div> -->
      <!-- Only when idle with no results; while loading and once results exist, refreshing is the
           compact action in the results header, so the list never jumps when the button goes. -->
      <!-- Idle, before the first search: a designed empty state that says what discovery does,
           with the one primary action. While loading and once results exist, refreshing
           is the compact action in the results header. -->
      <EmptyState
        v-if="!discovering && discoverList.length === 0"
        class="discover-empty"
        :title="$t('MintSettings.discover.empty.title')"
        :text="$t('MintSettings.discover.empty.text')"
      >
        <template #icon>
          <CompassIcon :size="26" />
        </template>
        <template #actions>
          <q-btn
            color="primary"
            rounded
            unelevated
            :loading="discovering"
            @click="discover"
            class="discover-btn full-width app-empty__action"
          >
            <SearchIcon :size="20" class="discover-btn__icon" />
            <span>{{
              $t("MintSettings.discover.actions.discover.label")
            }}</span>
            <template #loading
              ><BusyLabel>{{
                $t("MintSettings.discover.actions.discover.label")
              }}</BusyLabel></template
            >
          </q-btn>
        </template>
      </EmptyState>
    </div>

    <div
      v-if="discovering && discoverList.length === 0"
      class="discover-skeleton"
    >
      <!-- Same list, item and gap structure as the loaded results below, so the heading,
           note and cards land exactly where they will stay. -->
      <q-list padding aria-hidden="true">
        <q-item class="q-px-none">
          <q-item-section>
            <!-- The heading says what is happening instead of a placeholder bar. -->
            <q-item-label class="discover-count">
              {{ $t("MintSettings.discover.actions.discover.in_progress") }}
            </q-item-label>
            <q-item-label caption>
              {{ $t("MintSettings.discover.recommendations.caption") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <!-- The loaded header's IconButton, busy, so the glyph doesn't move 6px when
                 results arrive (council R83). -->
            <IconButton :label="$t('common.refresh')" loading tabindex="-1">
              <RefreshCwIcon :size="20" />
              <template #loading>
                <RefreshCwIcon :size="20" class="refresh-spin" />
              </template>
            </IconButton>
          </q-item-section>
        </q-item>
        <!-- The loaded card itself in its skeleton form, in the same wrappers, so nothing
             moves as results arrive. -->
        <div class="q-pt-sm">
          <div v-for="n in 5" :key="n" class="q-mb-md">
            <MintCard skeleton />
          </div>
        </div>
      </q-list>
      <div class="discover-skeleton__label visually-hidden" role="status">
        {{ $t("MintSettings.discover.actions.discover.in_progress") }}
      </div>
    </div>

    <div v-if="discoverList.length > 0" class="text-left" on-left>
      <q-list padding>
        <q-item class="q-px-none">
          <q-item-section>
            <q-item-label class="discover-count">
              {{
                $t("MintSettings.discover.recommendations.overline", {
                  length: discoverList.length,
                })
              }}
            </q-item-label>
            <q-item-label caption>
              {{ $t("MintSettings.discover.recommendations.caption") }}
            </q-item-label>
          </q-item-section>
          <!-- Busy until every card has its mint info. -->
          <q-item-section side top>
            <IconButton
              :label="$t('common.refresh')"
              :loading="busy"
              @click="discover"
            >
              <RefreshCwIcon :size="20" />
              <template #loading>
                <RefreshCwIcon :size="20" class="refresh-spin" />
              </template>
            </IconButton>
          </q-item-section>
        </q-item>
        <TransitionGroup name="mint" tag="div" class="q-pt-sm">
          <div
            v-for="rec in discoverList"
            :key="rec.url"
            class="q-px-none q-mb-md"
          >
            <!-- The installed mints' card: identity row with its action
                 on the right, then the rating on the card's right edge. -->
            <MintCard
              :icon-url="getMintIconUrlUrl(rec.url) || undefined"
              :name="getMintDisplayName(rec.url)"
              :url="rec.url"
              :loading="isFetchingMintInfo(rec.url)"
            >
              <template #action>
                <!-- A labelled add, so it doesn't read as a second way into the reviews
                     (council R76). -->
                <MintCardAction
                  v-if="!isFetchingMintInfo(rec.url)"
                  :label="$t('MintSettings.discover.add')"
                  :disable="isExistingMint(rec.url)"
                  @click="addDiscovered(rec.url)"
                >
                  <template #icon><PlusIcon :size="16" /></template>
                </MintCardAction>
              </template>
              <template #meta>
                <MintReviewSummary
                  :average="countFor(rec.url) > 0 ? avgFor(rec.url) : null"
                  :count="countFor(rec.url)"
                  :fallback-label="$t('MintSettings.no_reviews_yet')"
                  @open="openReviews(rec.url)"
                />
              </template>
            </MintCard>
          </div>
        </TransitionGroup>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import MintCardAction from "src/components/ui/MintCardAction.vue";
import IconButton from "src/components/ui/IconButton.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import MintCard from "src/components/MintCard.vue";
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import EmptyState from "src/components/ui/EmptyState.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore, MintClass } from "src/stores/mints";
import MintReviewSummary from "src/components/MintReviewSummary.vue";
import {
  Compass as CompassIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Search as SearchIcon,
} from "lucide-vue-next";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "MintDiscovery",
  components: {
    MintCardAction,
    IconButton,
    BusyLabel,
    MintCard,
    CompassIcon,
    SearchIcon,
    RefreshCwIcon,
    EmptyState,
    MintReviewSummary,
    PlusIcon,
  },
  props: {
    infoTimeoutMs: { type: Number, default: 5000 },
    autoDiscover: { type: Boolean, default: false },
    allowCreateReview: { type: Boolean, default: true },
  },
  setup(props) {
    const router = useRouter();
    const recsStore = useMintRecommendationsStore();
    const mints = useMintsStore();

    // Starts busy when discovery runs on mount, so the first frame is already the skeleton.
    const discovering = ref(props.autoDiscover);

    const recommendations = computed(() => recsStore.recommendations);
    const isExistingMint = (url: string) =>
      mints.mints.some((m) => m.url === url);
    // Each card keeps the position it first appeared at: the store re-sorts recommendations as
    // reviews and mint info arrive, which inserted new cards above ones already on screen.
    const firstSeen = new Map<string, number>();
    const discoverList = computed(() =>
      recommendations.value
        .filter((r) => !isExistingMint(r.url) && !r.error)
        .map((r) => {
          if (!firstSeen.has(r.url)) firstSeen.set(r.url, firstSeen.size);
          return r;
        })
        .sort((a, b) => firstSeen.get(a.url)! - firstSeen.get(b.url)!)
    );

    // Use store-managed HTTP info (Dexie + in-memory), persist only error in localStorage
    const fetchingMintInfo = ref(new Set<string>());
    const getRec = (url: string) =>
      recommendations.value.find((r) => r.url === url);
    const getMintIconUrlUrl = (url: string) =>
      recsStore.getHttpInfoForUrl(url)?.icon_url || null;
    const getMintDisplayName = (url: string) =>
      recsStore.getHttpInfoForUrl(url)?.name;
    const isFetchingMintInfo = (url: string) => {
      const rec = getRec(url);
      return rec
        ? !recsStore.hasHttpInfo(url) && !rec.error
        : fetchingMintInfo.value.has(url);
    };

    const fetchMintInfoForDiscovered = async () => {
      const targets = discoverList.value
        .filter((rec) => !fetchingMintInfo.value.has(rec.url))
        .map((rec) => rec.url);
      targets.forEach((u) => fetchingMintInfo.value.add(u));
      await recsStore.scheduleHttpInfoFetches(
        targets,
        10,
        100,
        (defineComponent as any).props?.infoTimeoutMs?.default ?? 5000
      );
    };
    watch(discoverList, () => fetchMintInfoForDiscovered(), {
      immediate: true,
    });

    // Discovery stays busy while any found mint is still fetching its info.
    const busy = computed(
      () =>
        discovering.value ||
        discoverList.value.some((rec) => isFetchingMintInfo(rec.url))
    );

    const discover = async () => {
      discovering.value = true;
      try {
        // ensure cached reviews from IndexedDB are visible immediately
        await (recsStore as any).hydrateFromDb?.();
        recsStore.clearDiscoveryCaches();
        firstSeen.clear();
        // recsStore.clearRecommendations();
        // Start live updates immediately
        recsStore.startSubscriptions();
        // Kick off initial fetches and keep spinner until both complete
        const pInfos = recsStore.fetchMintInfos();
        const pReviews = recsStore.fetchReviews();
        await Promise.allSettled([pInfos, pReviews]);
      } finally {
        discovering.value = false;
      }
    };

    onMounted(() => {
      if (props.autoDiscover) {
        // Start discovery right away when mounted if enabled
        discover();
      }
    });
    const addDiscovered = async (url: string) => {
      await mints.addMint({ url }, true);
    };
    const openReviews = (url: string) => {
      // Navigate to ratings page
      router.push({
        path: "/mintratings",
        query: {
          mintUrl: url,
          allowCreateReview: "false",
        },
      });
    };

    return {
      busy,
      discovering,
      discover,
      discoverList,
      avgFor: (url: string) => recsStore.getAverageForUrl(url),
      countFor: (url: string) => recsStore.getCountForUrl(url),
      getMintIconUrlUrl,
      isFetchingMintInfo,
      getMintDisplayName,
      isExistingMint,
      addDiscovered,
      openReviews,
    };
  },
});
</script>

<style scoped>
/* Avatar (34px) plus its 16px gap. */

@import "src/css/mintlist.css";

.discover-section {
  width: 100%;
  margin-bottom: 24px;
}

/* The gap belongs to the idle button; once results show, the count sits right under the page
   caption. */
.discover-card {
  padding: 0;
}

.discover-header {
  margin-bottom: 20px;
}

.discover-title {
  font-size: 15.2px;
  font-family: inherit;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 8px 0;
  text-transform: none;
}

.discover-subtitle {
  font-size: 0.9rem;
  color: var(--app-text-muted);
  margin: 0;
  line-height: 1.4;
}

.discover-empty {
  margin-bottom: 24px;
}

/* Skeleton rows match the loaded mint cards: same height, gap, radius and outline, no fill. */

.discover-skeleton__label {
  font-size: 13px;
  color: var(--app-text-muted);
  text-align: center;
  margin-top: 8px;
}

/* One exact height in every state, and a spinner the size of the search icon, so pressing
   Discover never shifts the page. */
.discover-btn {
  min-height: 52px;
  width: 100%;
}
.discover-btn__icon {
  margin-inline-end: 8px;
}
.discover-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  line-height: 20px;
}

/* The rating sits on the card's end edge, where the installed cards keep it. */

.discover-count {
  font-size: 14px;
  font-weight: 600;
}

/* A row still fetching its mint info reads as loading, not disabled. */

/* Per-row loading sits in the trailing slot, clear of the mint name and URL. */

/* Smooth list animations for discovered mints */
.mint-move {
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}
.mint-enter-active,
.mint-leave-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}
.mint-enter-from,
.mint-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
/* Prevent layout jump during leave */
.mint-leave-active {
  position: absolute;
  width: 100%;
}
</style>
