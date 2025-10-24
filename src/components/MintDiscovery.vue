<template>
  <div>
    <div class="section-divider q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("MintSettings.discover.title") }}
      </div>
      <div class="divider-line"></div>
    </div>
    <div class="q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>
              {{ $t("MintSettings.discover.overline") }}</q-item-label
            >
            <q-item-label caption>{{
              $t("MintSettings.discover.caption")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-pt-sm">
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            :loading="discovering"
            @click="discover"
            >{{ $t("MintSettings.discover.actions.discover.label") }}
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              {{ $t("MintSettings.discover.actions.discover.in_progress") }}
            </template>
          </q-btn>
        </q-item>
        <div v-if="discoverList.length > 0">
          <q-item>
            <q-item-section>
              <q-item-label overline>
                {{
                  $t("MintSettings.discover.recommendations.overline", {
                    length: discoverList.length,
                  })
                }}
              </q-item-label>
              <q-item-label caption>
                <i18n-t keypath="MintSettings.discover.recommendations.caption">
                  <template v-slot:link>
                    <a
                      href="https://bitcoinmints.com"
                      target="_blank"
                      class="text-primary"
                      >bitcoinmints.com</a
                    >
                  </template>
                </i18n-t>
              </q-item-label>
            </q-item-section>
          </q-item>
          <div class="q-pt-sm">
            <div
              v-for="rec in discoverList"
              :key="rec.url"
              class="q-px-md q-mb-md"
            >
              <q-item
                class="mint-card"
                :style="{
                  'border-radius': '10px',
                  border: '1px solid rgba(128,128,128,0.2)',
                  padding: '0px',
                  position: 'relative',
                }"
              >
                <div class="full-width" style="position: relative">
                  <div class="row items-center q-pa-md">
                    <div class="col">
                      <div class="row items-center">
                        <q-avatar
                          v-if="getMintIconUrlUrl(rec.url)"
                          size="34px"
                          class="q-mr-sm"
                        >
                          <q-img
                            spinner-color="white"
                            spinner-size="xs"
                            :src="getMintIconUrlUrl(rec.url)"
                            alt="Mint Icon"
                            style="
                              height: 34px;
                              max-width: 34px;
                              font-size: 12px;
                            "
                          />
                        </q-avatar>
                        <q-spinner-dots
                          v-else-if="isFetchingMintInfo(rec.url)"
                          size="34px"
                          color="grey-5"
                          class="q-mr-sm"
                        />
                        <div class="mint-info-container">
                          <div class="mint-name">
                            {{ getMintDisplayName(rec.url) }}
                          </div>
                          <div class="text-grey-6 mint-url">{{ rec.url }}</div>
                          <div
                            class="text-grey-5 q-mt-xs"
                            v-if="rec.averageRating !== null"
                          >
                            <span>
                              ⭐ {{ rec.averageRating.toFixed(2) }} ·
                              {{ rec.reviewsCount }}
                              <span
                                class="text-primary cursor-pointer"
                                style="text-decoration: underline"
                                @click.stop="openReviews(rec.url)"
                                >reviews</span
                              >
                            </span>
                          </div>
                          <div class="text-grey-5 q-mt-xs" v-else>
                            <span>No reviews yet</span>
                          </div>
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
                        :disable="isExistingMint(rec.url)"
                      />
                    </div>
                  </div>
                </div>
              </q-item>
            </div>
          </div>
        </div>
      </q-list>
    </div>

    <q-dialog v-model="showRatingsDialog" persistent>
      <MintRatingsComponent
        :url="selectedRatingsUrl"
        :reviews="selectedReviews"
        @close="showRatingsDialog = false"
      />
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore, MintClass } from "src/stores/mints";
import MintRatingsComponent from "../components/MintRatingsComponent.vue";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "MintDiscovery",
  components: { MintRatingsComponent },
  props: {
    infoTimeoutMs: { type: Number, default: 5000 },
  },
  setup() {
    const recsStore = useMintRecommendationsStore();
    const mints = useMintsStore();

    const discovering = ref(false);
    const showRatingsDialog = ref(false);
    const selectedRatingsUrl = ref("");
    const selectedReviews = ref<any[]>([]);

    const recommendations = computed(() => recsStore.recommendations);
    const isExistingMint = (url: string) =>
      mints.mints.some((m) => m.url === url);
    const discoverList = computed(() =>
      recommendations.value.filter((r) => !isExistingMint(r.url))
    );

    // Fetch mint info and cache it for discovered mints
    const mintInfoCache = ref(new Map<string, any>());
    const fetchingMintInfo = ref(new Set<string>());
    const errorMints = ref(new Set<string>());
    const infoTimers = ref(new Map<string, any>());
    const getMintInfo = (url: string) => mintInfoCache.value.get(url);
    const getMintIconUrlUrl = (url: string) => {
      const info = getMintInfo(url);
      return info && info.icon_url ? info.icon_url : null;
    };
    const getMintDisplayName = (url: string) => {
      const info = getMintInfo(url);
      return info && info.name ? info.name : url.replace(/^https?:\/\//, "");
    };
    const isFetchingMintInfo = (url: string) => fetchingMintInfo.value.has(url);
    const fetchMintInfo = async (url: string) => {
      try {
        const tempMint = { url, keys: [], keysets: [] } as any;
        const info = await new MintClass(tempMint).api.getInfo();
        mintInfoCache.value.set(url, info);
        if (infoTimers.value.has(url)) {
          clearTimeout(infoTimers.value.get(url));
          infoTimers.value.delete(url);
        }
      } catch (e) {
        mintInfoCache.value.set(url, null);
      } finally {
        fetchingMintInfo.value.delete(url);
      }
    };
    const scheduleInfoTimeout = (url: string) => {
      if (errorMints.value.has(url) || infoTimers.value.has(url)) return;
      const id = setTimeout(() => {
        if (!mintInfoCache.value.has(url)) {
          errorMints.value.add(url);
        }
        infoTimers.value.delete(url);
      }, (defineComponent as any).props?.infoTimeoutMs?.default ?? 5000);
      infoTimers.value.set(url, id);
    };
    const fetchMintInfoForDiscovered = () => {
      discoverList.value.forEach((rec) => {
        if (
          !mintInfoCache.value.has(rec.url) &&
          !fetchingMintInfo.value.has(rec.url) &&
          !errorMints.value.has(rec.url)
        ) {
          fetchingMintInfo.value.add(rec.url);
          scheduleInfoTimeout(rec.url);
          fetchMintInfo(rec.url);
        }
      });
    };
    watch(discoverList, () => fetchMintInfoForDiscovered(), {
      immediate: true,
    });

    const discover = async () => {
      discovering.value = true;
      try {
        // reset local caches and timers
        mintInfoCache.value.clear();
        fetchingMintInfo.value.clear();
        errorMints.value.clear();
        infoTimers.value.forEach((t) => clearTimeout(t));
        infoTimers.value.clear();
        recsStore.clearRecommendations();
        // Start live updates immediately
        recsStore.startSubscriptions();
        // Fetch in background without blocking UI
        void recsStore.fetchMintInfos();
        void recsStore.fetchReviews();
      } finally {
        // release spinner quickly; content will stream in
        discovering.value = false;
      }
    };
    const addDiscovered = async (url: string) => {
      await mints.addMint({ url }, true);
    };
    const openReviews = (url: string) => {
      const rec = recommendations.value.find((r) => r.url === url);
      if (!rec) return;
      selectedRatingsUrl.value = url;
      selectedReviews.value = rec.reviews;
      showRatingsDialog.value = true;
    };

    return {
      discovering,
      discover,
      discoverList: computed(() =>
        recommendations.value.filter(
          (r) => !isExistingMint(r.url) && !errorMints.value.has(r.url)
        )
      ),
      getMintIconUrlUrl,
      isFetchingMintInfo,
      getMintDisplayName,
      isExistingMint,
      addDiscovered,
      openReviews,
      showRatingsDialog,
      selectedRatingsUrl,
      selectedReviews,
      errorMints,
    };
  },
});
</script>

<style scoped>
@import "src/css/mintlist.css";
.section-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background-color: #48484a;
}
.divider-text {
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
}
.mint-card {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}
</style>
