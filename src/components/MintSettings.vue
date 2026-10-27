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
            active-class="text-weight-bold"
            clickable
            @click="activateMintUrlInternal(mint.url)"
            class="mint-card q-mb-md cursor-pointer"
            :style="{
              'border-radius': '10px',
              border:
                mint.url == activeMintUrl
                  ? '1px solid var(--app-accent) !important'
                  : '1px solid var(--app-border-strong) !important',
              padding: '0px',
              position: 'relative',
            }"
            :loading="mint.url == activatingMintUrl"
          >
            <!-- hourglass spinner if mint is being activated -->
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
              name="fade"
            >
              <q-spinner
                v-if="mint.url == activatingMintUrl"
                size="1.3rem"
                class="mint-loading-spinner"
              />
            </transition>
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

            <!-- Top right: active marker and mint details -->
            <div class="more-vert-icon row items-center no-wrap">
              <CircleCheckIcon
                v-if="mint.url == activeMintUrl"
                :size="18"
                class="text-primary q-mr-sm"
                aria-hidden="true"
              />
              <q-icon
                name="more_horiz"
                data-testid="mint-details"
                @click.stop="showMintInfo(mint)"
                class="cursor-pointer mint-card-more"
                size="1.3rem"
              />
            </div>
            <div class="full-width" style="position: relative">
              <div class="row items-center q-pa-md">
                <div class="col">
                  <div class="row items-center">
                    <MintInfoContainer
                      :iconUrl="getMintIconUrl(mint)"
                      :name="mint.nickname || mint.info?.name"
                      :url="mint.url"
                    />
                  </div>
                </div>
              </div>

              <div
                class="row items-center justify-between q-pb-md q-pl-lg q-pr-md"
              >
                <div class="col">
                  <!-- Currency units with regular text styling -->
                  <div class="row q-gutter-x-sm">
                    <div
                      v-for="unit in visibleUnits(mint)"
                      :key="unit"
                      class="currency-unit-badge"
                    >
                      <span class="currency-unit-text">
                        {{
                          formatCurrency(
                            mintClass(mint).unitBalance(unit),
                            unit
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  class="mint-review"
                  v-if="!isMintExcludedFromReviews(mint.url)"
                >
                  <template
                    v-if="
                      getRecommendation(mint.url) &&
                      getRecommendation(mint.url).averageRating !== null
                    "
                  >
                    <span>
                      ⭐
                      {{ getRecommendation(mint.url).averageRating.toFixed(1) }}
                      ·
                      {{ getRecommendation(mint.url).reviewsCount }}
                      <span
                        class="mint-review-link cursor-pointer"
                        @click.stop="openReviews(mint.url, mint)"
                        >{{
                          $t(
                            "MintSettings.reviews_text",
                            getRecommendation(mint.url).reviewsCount
                          )
                        }}</span
                      >
                    </span>
                  </template>
                  <template v-else>
                    <span
                      class="mint-review-link mint-review-link--empty cursor-pointer"
                      @click.stop="openReviews(mint.url, mint)"
                    >
                      {{ $t("MintSettings.no_reviews_yet") }}
                    </span>
                  </template>
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
          <SearchIcon :size="18" class="q-mr-sm" />
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
            placeholder="https://"
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
                <ScanLineIcon :size="20" />
              </q-btn>
            </template>
          </q-input>

          <q-input
            rounded
            outlined
            data-testid="add-mint-nickname"
            v-model="addMintData.nickname"
            :placeholder="$t('MintSettings.add.inputs.nickname.placeholder')"
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
      <q-select
        :clearable="!!swapData.fromUrl?.url"
        rounded
        outlined
        color="primary"
        dropdown-icon="expand_more"
        clear-icon="close"
        class="q-mb-md"
        :class="{ 'select--placeholder': !swapData.fromUrl?.url }"
        v-model="swapData.fromUrl"
        :display-value="
          swapData.fromUrl?.url ? undefined : $t('ChooseMint.placeholder')
        "
        :options="swapAmountDataOptions()"
        option-value="url"
        option-label="optionLabel"
        :label="$t('MintSettings.swap.inputs.from.label')"
        :disable="swapBlocking"
      />
      <q-select
        :clearable="!!swapData.toUrl?.url"
        rounded
        outlined
        color="primary"
        dropdown-icon="expand_more"
        clear-icon="close"
        class="q-mb-md"
        :class="{ 'select--placeholder': !swapData.toUrl?.url }"
        v-model="swapData.toUrl"
        :display-value="
          swapData.toUrl?.url ? undefined : $t('ChooseMint.placeholder')
        "
        :options="swapAmountDataOptions()"
        option-value="url"
        option-label="optionLabel"
        :label="$t('MintSettings.swap.inputs.to.label')"
        :disable="swapBlocking"
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
  ScanLine as ScanLineIcon,
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
    ScanLineIcon,
    SearchIcon,
    AddMintDialog,
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
    swapAmountDataOptions: function () {
      const options = [];
      for (const [i, m] of Object.entries(this.mints)) {
        const unitStr = "sat";
        const unitBalance = this.mintClass(m).unitBalance(unitStr);
        const balanceStr = useUiStore().formatCurrency(unitBalance, unitStr);
        options.push({
          url: m.url,
          optionLabel:
            (m.nickname || getShortUrl(m.url)) + " (" + balanceStr + ")",
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
  text-align: left;
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

.swap-btn {
  min-height: 56px;
}

.mint-review {
  color: var(--app-text-muted);
  font-size: 13px;
}

.mint-review-link {
  color: var(--app-text-muted);
  font-weight: 400;
  text-decoration: underline;
  text-underline-offset: 2px;
}
/* "No reviews yet" is a state, not a link label. */
.mint-review-link--empty {
  text-decoration: none;
}

/* Several unit balances on one card read as separate holdings, not a conversion. */
.currency-unit-badge + .currency-unit-badge::before {
  content: "+";
  margin-right: 8px;
  color: var(--app-text-subtle);
}

.discover-mints-btn {
  min-height: 44px;
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
  text-align: left;
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

/* More vert icon positioning */
.mint-card-more {
  box-sizing: content-box;
  margin: -10px;
  padding: 10px;
}

.more-vert-icon {
  position: absolute;
  top: 10px;
  right: 14px;
  z-index: 10;
}
html[dir="rtl"] .more-vert-icon {
  left: 14px;
  right: auto;
}
</style>
