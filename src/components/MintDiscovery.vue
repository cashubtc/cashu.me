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
           with the one primary action (R42). While loading and once results exist, refreshing
           is the compact action in the results header. -->
      <div
        v-if="!discovering && discoverList.length === 0"
        class="app-empty app-box discover-empty"
      >
        <div class="app-icon-circle app-icon-circle--lg">
          <q-icon name="travel_explore" size="28px" />
        </div>
        <div class="app-empty__title">
          {{ $t("MintSettings.discover.empty.title") }}
        </div>
        <div class="app-empty__text">
          {{ $t("MintSettings.discover.empty.text") }}
        </div>
        <q-btn
          color="primary"
          rounded
          unelevated
          no-caps
          :loading="discovering"
          @click="discover"
          class="discover-btn full-width app-empty__action"
        >
          <q-icon name="search" size="20px" class="discover-btn__icon" />
          <span>{{ $t("MintSettings.discover.actions.discover.label") }}</span>
          <template v-slot:loading
            ><q-spinner-dots size="20px" class="on-left" />{{
              $t("MintSettings.discover.actions.discover.label")
            }}</template
          >
        </q-btn>
      </div>
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
            <q-item-label class="discover-count">
              <q-skeleton type="text" width="30%" />
            </q-item-label>
            <q-item-label caption>
              {{ $t("MintSettings.discover.recommendations.caption") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <div class="row flex-center" style="width: 44px; height: 44px">
              <q-icon name="refresh" size="24px" class="refresh-spin" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <div
        class="discover-skeleton__row"
        v-for="n in 5"
        :key="n"
        aria-hidden="true"
      >
        <!-- The loaded card's 34px avatar, so the text column doesn't move. -->
        <SkeletonRow avatar="34px" :lines="['55%', '35%', '25%']" class="col" />
      </div>
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
            <q-btn
              flat
              round
              icon="refresh"
              color="primary"
              class="touch-target-44"
              :loading="busy"
              :aria-label="$t('common.refresh')"
              @click="discover"
            >
              <template v-slot:loading>
                <q-icon name="refresh" size="24px" class="refresh-spin" />
              </template>
            </q-btn>
          </q-item-section>
        </q-item>
        <TransitionGroup name="mint" tag="div" class="q-pt-sm">
          <div
            v-for="rec in discoverList"
            :key="rec.url"
            class="q-px-none q-mb-md"
          >
            <!-- The installed mints' card (user direction, R46): identity row with its action
                 on the right, then the rating on the card's right edge. -->
            <q-item class="mint-card">
              <div class="mint-card__body">
                <div class="mint-card__head">
                  <MintInfoContainer
                    class="col"
                    :iconUrl="getMintIconUrlUrl(rec.url) || undefined"
                    :name="getMintDisplayName(rec.url)"
                    :url="rec.url"
                    :loading="isFetchingMintInfo(rec.url)"
                    :unnamed-label="$t('MintSettings.discover.unnamed')"
                  />
                  <q-spinner
                    v-if="isFetchingMintInfo(rec.url)"
                    size="18px"
                    class="mint-card__status"
                  />
                  <q-btn
                    v-else
                    flat
                    round
                    dense
                    class="mint-card-more"
                    :aria-label="$t('global.actions.add_mint.label')"
                    :disable="isExistingMint(rec.url)"
                    @click="addDiscovered(rec.url)"
                  >
                    <PlusIcon :size="22" />
                  </q-btn>
                </div>
                <div class="mint-card__foot discover-card-foot">
                  <div class="mint-review">
                    <button
                      type="button"
                      class="mint-review-link"
                      @click.stop="openReviews(rec.url)"
                    >
                      <template
                        v-if="avgFor(rec.url) !== null && countFor(rec.url) > 0"
                      >
                        <q-icon name="star" size="14px" class="rating-star" />
                        <span class="mint-review__score">{{
                          (avgFor(rec.url) ?? 0).toFixed(1)
                        }}</span>
                        <span aria-hidden="true">·</span>
                        {{ countFor(rec.url) }}
                        {{ $t("MintSettings.reviews_text", countFor(rec.url)) }}
                      </template>
                      <template v-else>{{
                        $t("MintSettings.no_reviews_yet")
                      }}</template>
                    </button>
                  </div>
                </div>
              </div>
            </q-item>
          </div>
        </TransitionGroup>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import SkeletonRow from "src/components/SkeletonRow.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore, MintClass } from "src/stores/mints";
import MintInfoContainer from "./MintInfoContainer.vue";
import { Plus as PlusIcon } from "lucide-vue-next";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "MintDiscovery",
  components: { MintInfoContainer, PlusIcon, SkeletonRow },
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
.discover-skeleton__row {
  display: flex;
  align-items: center;
  min-height: 100px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: var(--app-card-fill);
  border: 1px solid var(--app-card-edge);
}

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

/* Review counts link the same way as on the mint cards. */
.rating-star {
  color: var(--app-text);
  vertical-align: -2px;
}

/* The rating sits on the card's end edge, where the installed cards keep it. */
.discover-card-foot {
  justify-content: flex-end;
}

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
