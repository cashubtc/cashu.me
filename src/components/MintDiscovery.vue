<template>
  <div class="discover-section">
    <div class="discover-card">
      <!-- <div class="discover-header">
        <p class="discover-subtitle">
          {{ $t("MintSettings.discover.caption") }}
        </p>
      </div> -->
      <div class="discover-button">
        <!-- Once results are listed, the button steps back to an outline so the list leads. -->
        <q-btn
          color="primary"
          rounded
          unelevated
          :outline="discoverList.length > 0 && !discovering"
          no-caps
          :loading="discovering"
          @click="discover"
          class="discover-btn full-width"
        >
          <q-icon name="search" size="20px" class="q-mr-sm" />
          <span>{{ $t("MintSettings.discover.actions.discover.label") }}</span>
          <template v-slot:loading>
            <q-spinner size="20px" class="on-left" />
            {{ $t("MintSettings.discover.actions.discover.in_progress") }}
          </template>
        </q-btn>
      </div>
      <div
        v-if="discovering && discoverList.length === 0"
        class="discover-skeleton q-mt-md"
      >
        <div
          class="discover-skeleton__row"
          v-for="n in 3"
          :key="n"
          aria-hidden="true"
        >
          <q-skeleton type="QAvatar" size="40px" />
          <div class="col q-ml-md">
            <q-skeleton type="text" width="55%" />
            <q-skeleton type="text" width="35%" />
          </div>
        </div>
        <div class="discover-skeleton__label visually-hidden" role="status">
          {{ $t("MintSettings.discover.actions.discover.in_progress") }}
        </div>
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
        </q-item>
        <TransitionGroup name="mint" tag="div" class="q-pt-sm">
          <div
            v-for="rec in discoverList"
            :key="rec.url"
            class="q-px-none q-mb-md"
          >
            <q-item
              class="mint-card"
              :class="{ dimmed: isFetchingMintInfo(rec.url) }"
              :style="{
                'border-radius': '10px',
                border: '1px solid rgba(128,128,128,0.2)',
                padding: '0px',
                position: 'relative',
              }"
            >
              <div class="full-width" style="position: relative">
                <!-- Centered spinner overlay -->
                <div v-if="isFetchingMintInfo(rec.url)" class="spinner-overlay">
                  <q-spinner-dots size="34px" color="grey-5" />
                </div>

                <div class="row items-center q-pa-md">
                  <div class="col">
                    <div class="row items-center">
                      <MintInfoContainer
                        :iconUrl="getMintIconUrlUrl(rec.url) || undefined"
                        :name="getMintDisplayName(rec.url)"
                        :url="rec.url"
                      />
                    </div>
                    <div class="row">
                      <div
                        class="text-grey-5 q-mt-xs"
                        v-if="avgFor(rec.url) !== null && countFor(rec.url) > 0"
                      >
                        <span>
                          ⭐ {{ (avgFor(rec.url) ?? 0).toFixed(1) }} ·
                          {{ countFor(rec.url) }}
                          <span
                            class="mint-review-link cursor-pointer"
                            @click.stop="openReviews(rec.url)"
                            >{{
                              $t("MintSettings.reviews_text", countFor(rec.url))
                            }}</span
                          >
                        </span>
                      </div>
                      <div class="text-grey-7 q-mt-xs" v-else>
                        <span>{{ $t("MintRatings.no_reviews") }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      dense
                      round
                      flat
                      icon="add"
                      @click="addDiscovered(rec.url)"
                      :disable="
                        isFetchingMintInfo(rec.url) || isExistingMint(rec.url)
                      "
                    />
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
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore, MintClass } from "src/stores/mints";
import MintInfoContainer from "./MintInfoContainer.vue";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "MintDiscovery",
  components: { MintInfoContainer },
  props: {
    infoTimeoutMs: { type: Number, default: 5000 },
    autoDiscover: { type: Boolean, default: false },
    allowCreateReview: { type: Boolean, default: true },
  },
  setup(props) {
    const router = useRouter();
    const recsStore = useMintRecommendationsStore();
    const mints = useMintsStore();

    const discovering = ref(false);

    const recommendations = computed(() => recsStore.recommendations);
    const isExistingMint = (url: string) =>
      mints.mints.some((m) => m.url === url);
    const discoverList = computed(() =>
      recommendations.value
        .filter((r) => !isExistingMint(r.url) && !r.error)
        .sort((a, b) => {
          const aFetching = isFetchingMintInfo(a.url);
          const bFetching = isFetchingMintInfo(b.url);

          // If one is fetching and the other isn't, put the fetching one at the bottom
          if (aFetching && !bFetching) return 1;
          if (!aFetching && bFetching) return -1;

          // If both are in the same state, maintain original order
          return 0;
        })
    );

    // Use store-managed HTTP info (Dexie + in-memory), persist only error in localStorage
    const fetchingMintInfo = ref(new Set<string>());
    const getRec = (url: string) =>
      recommendations.value.find((r) => r.url === url);
    const getMintIconUrlUrl = (url: string) =>
      recsStore.getHttpInfoForUrl(url)?.icon_url || null;
    const getMintDisplayName = (url: string) =>
      recsStore.getHttpInfoForUrl(url)?.name || url.replace(/^https?:\/\//, "");
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

    const discover = async () => {
      discovering.value = true;
      try {
        // ensure cached reviews from IndexedDB are visible immediately
        await (recsStore as any).hydrateFromDb?.();
        recsStore.clearDiscoveryCaches();
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
@import "src/css/mintlist.css";

.discover-section {
  width: 100%;
  margin-bottom: 24px;
}

.discover-card {
  padding: 0;
  margin-bottom: 24px;
}

.discover-header {
  margin-bottom: 20px;
}

.discover-title {
  font-size: 15.2px;
  font-family: Inter, -apple-system, "system-ui", "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
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

.discover-button {
  margin-top: 0;
}

/* Skeleton rows match the loaded mint cards: same height, gap, radius and outline, no fill. */
.discover-skeleton__row {
  display: flex;
  align-items: center;
  min-height: 100px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid var(--app-border);
}

.discover-skeleton__label {
  font-size: 13px;
  color: var(--app-text-muted);
  text-align: center;
  margin-top: 8px;
}

.discover-btn {
  width: 100%;
}

.mint-card {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}

/* Review counts link the same way as on the mint cards. */
.mint-review-link {
  color: var(--app-text-muted);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.discover-count {
  font-size: 14px;
  font-weight: 600;
}

/* A row still fetching its mint info reads as loading, not disabled. */
.mint-card.dimmed {
  opacity: 0.8;
}

/* Per-row loading sits in the trailing slot, clear of the mint name and URL. */
.spinner-overlay {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

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
