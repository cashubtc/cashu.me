<template>
  <AddMintDialog
    :addMintData="addMintData"
    :showAddMintDialog="showAddMintDialog"
    @update:showAddMintDialog="showAddMintDialog = $event"
    :addMintBlocking="addMintBlocking"
    @add="addMintInternal"
  />

  <div style="max-width: 800px; margin: 0 auto">
    <!-- ////////////////////// SETTINGS ////////////////// -->
    <div class="q-py-md q-px-sm text-left" on-left>
      <q-list padding>
        <!-- <q-item-label header>Your mints</q-item-label> -->
        <!-- MINT CARDS -->
        <div v-for="mint in mints" :key="mint.url">
          <q-item
            data-testid="mint-card"
            :active="mint.url == activeMintUrl"
            active-class="mint-card--active"
            clickable
            @click="activateMintUrlInternal(mint.url)"
            class="mint-card q-mb-md cursor-pointer"
            :style="{
              'border-radius': '12px',
              border:
                mint.url == activeMintUrl
                  ? '1px solid var(--app-accent) !important'
                  : '1px solid var(--app-border-strong) !important',
              padding: '0px',
              position: 'relative',
            }"
            :loading="mint.url == activatingMintUrl"
          >
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
              name="fade"
            >
              <div
                v-if="mint.url != activatingMintUrl && mint.errored"
                class="error-badge"
              >
                <q-badge
                  color="red"
                  outline
                  class="q-mr-xs q-mt-sm text-weight-bold"
                >
                  {{ $t("MintSettings.error_badge") }}
                  <q-icon name="error" class="q-ml-xs" size="xs" />
                </q-badge>
              </div>
            </transition>

            <!-- One 16px inset: the identity row with its trailing actions centred on it, then
                 the holdings and the rating on the same left and right edges (R41 card pass). -->
            <div class="mint-card__body">
              <div class="mint-card__head">
                <MintInfoContainer
                  class="col"
                  :iconUrl="getMintIconUrl(mint)"
                  :name="mint.nickname || mint.info?.name"
                  :url="mint.url"
                />
                <!-- The active-mint slot: a spinner while switching, then the check. -->
                <q-spinner
                  v-if="mint.url == activatingMintUrl"
                  size="18px"
                  class="mint-card__status"
                />
                <CircleCheckIcon
                  v-else-if="mint.url == activeMintUrl"
                  :size="18"
                  class="mint-card__status mint-card__check"
                  aria-hidden="true"
                />
                <q-btn
                  flat
                  round
                  dense
                  data-testid="mint-details"
                  class="mint-card-more"
                  :aria-label="$t('MintDetailsDialog.details.title')"
                  @click.stop="showMintInfo(mint)"
                >
                  <q-icon name="more_horiz" size="1.3rem" />
                </q-btn>
              </div>

              <div class="mint-card__foot">
                <div class="mint-card__balances">
                  <template v-for="(unit, i) in visibleUnits(mint)" :key="unit">
                    <!-- Several unit balances read as separate holdings, not a conversion. -->
                    <span
                      v-if="i > 0"
                      class="mint-card__plus"
                      aria-hidden="true"
                      >+</span
                    >
                    <bdi dir="ltr" class="currency-unit-text">{{
                      formatCurrency(mintClass(mint).unitBalance(unit), unit)
                    }}</bdi>
                  </template>
                </div>
                <div
                  class="mint-review"
                  v-if="!isMintExcludedFromReviews(mint.url)"
                >
                  <button
                    type="button"
                    class="mint-review-link"
                    @click.stop="openReviews(mint.url, mint)"
                  >
                    <template
                      v-if="
                        getRecommendation(mint.url) &&
                        getRecommendation(mint.url).averageRating !== null
                      "
                    >
                      <q-icon name="star" size="14px" class="rating-star" />
                      <span class="mint-review__score">{{
                        getRecommendation(mint.url).averageRating.toFixed(1)
                      }}</span>
                      <span aria-hidden="true">·</span>
                      {{ getRecommendation(mint.url).reviewsCount }}
                      {{
                        $t(
                          "MintSettings.reviews_text",
                          getRecommendation(mint.url).reviewsCount
                        )
                      }}
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
      </q-list>

      <!-- Mint discovery -->
      <div class="q-mb-md row justify-center">
        <q-btn
          outline
          rounded
          color="primary"
          class="discover-mints-btn"
          @click="$router.push('/discoverMints')"
          style="width: 100%"
        >
          <SearchIcon :size="20" class="q-mr-sm" />
          <span>{{ $t("MintSettings.discover_mints_button") }}</span>
        </q-btn>
      </div>
    </div>

    <!-- Add mint section -->
    <div class="q-pt-xs q-px-sm" ref="addMintDiv">
      <div class="add-mint-container">
        <div class="mints-section-title">
          {{ $t("MintSettings.add.title") }}
        </div>

        <div class="add-mint-description q-mb-md text-left text-app-muted">
          {{ $t("MintSettings.add.description") }}
        </div>

        <div class="add-mint-inputs">
          <q-input
            rounded
            outlined
            data-testid="add-mint-url"
            v-model="addMintData.url"
            :label="$t('global.inputs.mint_url.label')"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintInput"
            class="q-mb-md mint-input url-input"
          >
            <template v-slot:append>
              <q-btn
                flat
                round
                class="touch-target-44"
                :aria-label="$t('MintSettings.add.actions.scan.label')"
                @click="showCamera"
              >
                <ScanIcon :size="20" />
              </q-btn>
            </template>
          </q-input>

          <q-input
            rounded
            outlined
            data-testid="add-mint-nickname"
            v-model="addMintData.nickname"
            :label="$t('EditMintDialog.inputs.nickname.label')"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintNicknameInput"
            class="mint-input"
          />
        </div>

        <q-btn
          color="primary"
          rounded
          unelevated
          no-caps
          class="full-width add-mint-submit q-mt-md"
          :disable="addMintData.url.length === 0"
          @click="sanitizeMintUrlAndShowAddDialog"
        >
          <PlusIcon :size="18" class="q-mr-sm" />
          <span>{{ $t("MintSettings.add.actions.add_mint.label") }}</span>
        </q-btn>
      </div>
    </div>

    <!-- Swap section -->

    <div v-if="mints.length > 1" class="q-px-sm q-pb-lg text-left swap-section">
      <div class="mints-section-title">
        {{ $t("MintSettings.swap.title") }}
      </div>
      <div class="swap-caption q-mb-md">
        {{ $t("MintSettings.swap.caption") }}
      </div>
      <!-- From and To are the wallet's mint picker (icons, balances, the same sheet). -->
      <ChooseMint
        test-id="swap-from"
        allow-empty
        :require-active-mint="false"
        :label="$t('MintSettings.swap.inputs.from.label')"
        :model-value="swapData.fromUrl?.url ?? ''"
        :disable="swapBlocking"
        @update:model-value="swapData.fromUrl = swapOptionFor($event)"
      />
      <ChooseMint
        test-id="swap-to"
        allow-empty
        :require-active-mint="false"
        :label="$t('MintSettings.swap.inputs.to.label')"
        :model-value="swapData.toUrl?.url ?? ''"
        :disable="swapBlocking"
        @update:model-value="swapData.toUrl = swapOptionFor($event)"
      />
      <div class="row no-wrap items-center" style="gap: 8px">
        <q-input
          class="col"
          rounded
          outlined
          v-model.number="swapData.amount"
          type="number"
          :label="
            $t('MintSettings.swap.inputs.amount.label', {
              ticker: tickerShort,
            })
          "
          @keydown.enter.prevent="extractAndMintAmountSwap(swapAmountData)"
          :disable="
            !swapData.fromUrl ||
            !swapData.toUrl ||
            swapData.fromUrl == swapData.toUrl ||
            swapBlocking
          "
        ></q-input>
        <q-btn
          class="col-auto q-px-lg swap-btn"
          color="primary"
          rounded
          unelevated
          no-caps
          @click="extractAndMintAmountSwap(swapAmountData)"
          :disable="
            !swapData.fromUrl ||
            !swapData.toUrl ||
            !(swapData.amount > 0) ||
            swapData.fromUrl == swapData.toUrl
          "
          :loading="swapBlocking"
        >
          {{ $t("MintSettings.swap.actions.swap.label") }}
          <template v-slot:loading>
            <q-spinner size="xs" />
            {{ $t("MintSettings.swap.actions.swap.in_progress") }}
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  CircleCheck as CircleCheckIcon,
  Plus as PlusIcon,
  Scan as ScanIcon,
  Search as SearchIcon,
} from "lucide-vue-next";
import { ref, defineComponent, onMounted, onBeforeUnmount } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { map } from "underscore";
import { currentDateStr } from "src/js/utils";
import { useSettingsStore } from "src/stores/settings";
import { useNostrStore } from "src/stores/nostr";
import { useP2PKStore } from "src/stores/p2pk";
import { useWorkersStore } from "src/stores/workers";
import { useSwapStore } from "src/stores/swap";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifyWarning } from "src/js/notify";
import { EventBus } from "../js/eventBus";
import AddMintDialog from "src/components/AddMintDialog.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import MintInfoContainer from "./MintInfoContainer.vue";

// Mints that should not show reviews
const EXCLUDED_FROM_REVIEWS = [
  "http://localhost*", // localhost with any port
  "https://*cashu.space", // exact match and subdomains
];

export default defineComponent({
  name: "MintSettings",
  mixins: [windowMixin],
  components: {
    CircleCheckIcon,
    PlusIcon,
    ScanIcon,
    SearchIcon,
    AddMintDialog,
    ChooseMint,
    MintInfoContainer,
  },
  props: {},
  setup() {
    const addMintDiv = ref(null);

    const scrollToAddMintDiv = () => {
      if (addMintDiv.value) {
        // addMintDiv.value.scrollIntoView({ behavior: "smooth" });
        // const top = addMintDiv.value.offsetTop;
        const rect = addMintDiv.value.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top,
          behavior: "smooth",
        });
      }
    };

    onMounted(() => {
      EventBus.on("scrollToAddMintDiv", scrollToAddMintDiv);
    });

    onBeforeUnmount(() => {
      EventBus.off("scrollToAddMintDiv", scrollToAddMintDiv);
    });
    return {
      addMintDiv,
    };
  },
  data: function () {
    return {
      discoveringMints: false,
      addingMint: false,
      swapData: {
        fromUrl: {
          url: "",
          optionLabel: "",
        },
        toUrl: {
          url: "",
          optionLabel: "",
        },
        amount: undefined,
      },
      activatingMintUrl: "",
      mintInfoCache: new Map(),
      fetchingMintInfo: new Set(),
    };
  },
  computed: {
    ...mapWritableState(useSettingsStore, ["getBitcoinPrice"]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeUnit",
      "mints",
      "activeProofs",
      "addMintBlocking",
    ]),
    ...mapState(useNostrStore, ["pubkey"]),
    ...mapState(useMintRecommendationsStore, ["recommendations"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useSwapStore, ["swapAmountData"]),
    ...mapWritableState(useSwapStore, ["swapBlocking"]),
    discoverList() {
      return this.recommendations.filter((r) => !this.isExistingMint(r.url));
    },
    getRecommendation() {
      return (url) => this.recommendations.find((r) => r.url === url);
    },
  },
  watch: {
    // if swapBlocking is true and invoiceWorkerRunning changes to false, then swapBlocking should be set to false
    invoiceWorkerRunning: function (val) {
      if (this.swapBlocking && !val) {
        this.swapBlocking = false;
      }
    },
  },
  methods: {
    // Hide zero balances in units the user has never funded at this mint.
    visibleUnits(mint) {
      const mintClass = this.mintClass(mint);
      // sat leads on every card, as in the mint picker (R20).
      const units = [...mintClass.units].sort(
        (a, b) => Number(b === "sat") - Number(a === "sat")
      );
      const funded = units.filter((unit) => mintClass.unitBalance(unit) > 0);
      return funded.length ? funded : units.slice(0, 1);
    },
    ...mapActions(useNostrStore, [
      "init",
      "initNdkReadOnly",
      "getUserPubkey",
      "fetchEventsFromUser",
    ]),
    ...mapActions(useMintRecommendationsStore, [
      "discover",
      "startSubscriptions",
    ]),
    ...mapActions(useP2PKStore, ["generateKeypair", "showKeyDetails"]),
    ...mapActions(useMintsStore, [
      "addMint",
      "removeMint",
      "activateMintUrl",
      "updateMint",
      "triggerMintInfoMotdChanged",
      "fetchMintInfo",
    ]),
    ...mapActions(useWalletStore, ["decodeRequest", "mintOnPaid"]),
    ...mapActions(useWorkersStore, ["clearAllWorkers"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    ...mapActions(useSwapStore, ["mintAmountSwap"]),
    isMintExcludedFromReviews: function (mintUrl) {
      // Check if mint URL should be excluded from reviews using regex matching
      return EXCLUDED_FROM_REVIEWS.some((pattern) => {
        // Convert asterisk pattern to regex
        const regexPattern = pattern.replace(/\*/g, ".*");
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(mintUrl);
      });
    },
    activateMintUrlInternal: async function (mintUrl) {
      this.activatingMintUrl = mintUrl;
      console.log(`Activating mint ${this.activatingMintUrl}`);
      try {
        await this.activateMintUrl(mintUrl, false, true);
      } catch (e) {
        console.log("#### Error activating mint:", e);
      } finally {
        this.activatingMintUrl = "";
      }
    },
    validateMintUrl: function (url) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    },
    sanitizeMintUrlAndShowAddDialog: function () {
      // if no protocol is given, add https
      if (!this.addMintData.url.match(/^[a-zA-Z]+:\/\//)) {
        this.addMintData.url = "https://" + this.addMintData.url;
      }
      if (!this.validateMintUrl(this.addMintData.url)) {
        notifyError(
          this.$i18n.t("MintSettings.add.actions.add_mint.error_invalid_url")
        );
        return;
      }
      const urlObj = new URL(this.addMintData.url);
      urlObj.hostname = urlObj.hostname.toLowerCase();
      this.addMintData.url = urlObj.toString();
      this.addMintData.url = this.addMintData.url.replace(/\/$/, "");
      this.showAddMintDialog = true;
    },
    addMintInternal: function (mintToAdd, verbose) {
      this.addingMint = true;
      try {
        this.addMint(mintToAdd, verbose);
        this.addMintData = { url: "", nickname: "" };
      } finally {
        this.addingMint = false;
      }
    },
    mintClass(mint) {
      return new MintClass(mint);
    },
    swapOptionFor(url: string) {
      return this.swapAmountDataOptions().find((o) => o.url === url) ?? null;
    },
    swapAmountDataOptions: function () {
      const options = [];
      for (const [i, m] of Object.entries(this.mints)) {
        const unitStr = "sat";
        const unitBalance = this.mintClass(m).unitBalance(unitStr);
        const balanceStr = this.formatCurrency(unitBalance, unitStr);
        options.push({
          url: m.url,
          optionLabel: m.nickname || getShortUrl(m.url),
          balance: balanceStr,
        });
      }
      return options;
    },
    clearSwapData: function () {
      this.swapData.fromUrl = "";
      this.swapData.toUrl = "";
      this.swapData.amount = undefined;
    },
    extractAndMintAmountSwap: async function (swapAmountData) {
      swapAmountData.fromUrl = this.swapData.fromUrl.url;
      swapAmountData.toUrl = this.swapData.toUrl.url;
      swapAmountData.amount = this.swapData.amount;
      await this.mintAmountSwap(swapAmountData);
      this.clearSwapData();
    },
    fetchMintsFromNdk: async function () {
      this.discoveringMints = true;
      try {
        const recs = await this.discover();
        if (!recs || recs.length === 0) {
          this.notifyError(
            this.$i18n.t(
              "MintSettings.discover.actions.discover.error_no_mints"
            )
          );
        } else {
          this.notifySuccess(
            this.$i18n.t("MintSettings.discover.actions.discover.success", {
              length: recs.length,
            })
          );
        }
        this.startSubscriptions();
      } finally {
        this.discoveringMints = false;
      }
    },
    showMintInfo: async function (mint) {
      // Navigate to mint details page with mint URL as query parameter
      this.$router.push({
        path: "/mintdetails",
        query: { mintUrl: mint.url },
      });
    },
    getMintIconUrl: function (mint) {
      if (mint.info) {
        if (mint.info.icon_url) {
          return mint.info.icon_url;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    },
    // Discovery helpers
    isExistingMint(url) {
      return this.mints.some((m) => m.url === url);
    },
    async addDiscoveredMint(url) {
      try {
        await this.addMint({ url }, true);
      } catch (e) {
        console.error(e);
      }
    },
    openReviews(url, mint) {
      // Navigate to ratings page
      this.$router.push({
        path: "/mintratings",
        query: {
          mintUrl: url,
          allowCreateReview: "true",
        },
      });
    },
    getMintInfoFromCache(url) {
      return this.mintInfoCache.get(url);
    },
    getMintIconUrlUrl(url) {
      const info = this.getMintInfoFromCache(url);
      return info && info.icon_url ? info.icon_url : null;
    },
    getMintDisplayName(url) {
      const info = this.getMintInfoFromCache(url);
      return info && info.name ? info.name : url.replace(/^https?:\/\//, "");
    },
    isFetchingMintInfo(url) {
      return this.fetchingMintInfo.has(url);
    },
    async fetchMintInfoForUrl(url) {
      try {
        const tempMint = { url, keys: [], keysets: [] };
        const info = await new MintClass(tempMint).api.getInfo();
        this.mintInfoCache.set(url, info);
      } catch (e) {
        this.mintInfoCache.set(url, null);
      } finally {
        this.fetchingMintInfo.delete(url);
      }
    },
    fetchMintInfoForDiscoverList() {
      this.discoverList.forEach((rec) => {
        if (
          !this.mintInfoCache.has(rec.url) &&
          !this.fetchingMintInfo.has(rec.url)
        ) {
          this.fetchingMintInfo.add(rec.url);
          this.fetchMintInfoForUrl(rec.url);
        }
      });
    },
  },
  created: function () {},
});
</script>

<style>
.mints-section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text);
  text-align: start;
  margin: 8px 0 8px;
}

.add-mint-submit {
  min-height: 48px;
  font-size: 15px;
  font-weight: 600;
}

@import "src/css/mintlist.css";

.swap-caption {
  color: var(--app-text-muted);
  font-size: 15px;
  line-height: 1.5;
  margin-top: 4px;
}

/* Swap sits beside the 56px amount field, with the 1rem label of the other mint actions. */
.q-btn.swap-btn {
  font-size: 1rem;
  min-height: 56px;
}

/* Add mint matches the height and label size of Discover mints and Swap. */
.q-btn.add-mint-submit {
  font-size: 1rem !important;
  height: 48px;
  min-height: 48px;
}

/* Discover mints, Add mint and Swap share one 48px button height and 1rem label. */
.discover-mints-btn {
  font-size: 1rem;
  height: 48px;
  min-height: 48px;
}

/* Add Mint Section Styles */
.add-mint-container {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}

.add-mint-description {
  font-size: 14px;
  line-height: 24px;
  font-weight: 500;
  text-align: start;
  margin-bottom: 24px;
}

.add-mint-inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mint-input {
  width: 100%;
  font-family: "Inter", sans-serif;
}

.mint-input .q-field__control {
  height: 54px;
  border-radius: 100px;
}

.mint-input .q-field__native,
.mint-input .q-field__input,
.mint-input .q-placeholder {
  font-family: "Inter", sans-serif;
}

.add-mint-actions {
  width: 100%;
  margin-top: 16px;
}

/* Section Divider */
.section-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
}
</style>
