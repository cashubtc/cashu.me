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
    <div class="q-py-md q-px-xs text-left" on-left>
      <q-list padding>
        <!-- <q-item-label header>Your mints</q-item-label> -->
        <!-- MINT CARDS -->
        <div v-for="mint in mints" :key="mint.url" class="q-px-md">
          <q-item
            :active="mint.url == activeMintUrl"
            active-class="text-weight-bold text-primary"
            clickable
            @click="activateMintUrlInternal(mint.url)"
            class="mint-card q-mb-md cursor-pointer"
            :style="{
              'border-radius': '10px',
              border:
                mint.url == activeMintUrl
                  ? '1px solid var(--q-primary) !important'
                  : '1px solid rgba(128, 128, 128, 0.2) !important',
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
                color="white"
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

            <!-- Top right more_vert icon -->
            <div class="more-vert-icon">
              <q-icon
                name="more_vert"
                @click.stop="showMintInfo(mint)"
                color="white"
                class="cursor-pointer"
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
                      v-for="unit in mintClass(mint).units"
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
                  class="text-grey-5"
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
                        class="text-primary cursor-pointer"
                        style="text-decoration: underline"
                        @click.stop="openReviews(mint.url, mint)"
                        >{{ $t("MintSettings.reviews_text") }}</span
                      >
                    </span>
                  </template>
                  <template v-else>
                    <span
                      class="text-primary cursor-pointer"
                      style="text-decoration: underline"
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
      <div class="q-px-md q-mb-md row justify-center">
        <q-btn
          color="primary"
          rounded
          @click="$router.push('/discoverMints')"
          style="width: 100%"
        >
          <q-icon name="search" size="20px" class="q-mr-sm" />
          <span>{{ $t("MintSettings.discover_mints_button") }}</span>
        </q-btn>
      </div>
    </div>

    <!-- Add mint section -->
    <div class="q-pt-xs q-px-md" ref="addMintDiv">
      <div class="add-mint-container">
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("MintSettings.add.title") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <div
          class="add-mint-description q-mb-lg text-left"
          style="color: rgba(255, 255, 255, 0.7)"
        >
          {{ $t("MintSettings.add.description") }}
        </div>

        <div class="add-mint-inputs">
          <q-input
            rounded
            outlined
            v-model="addMintData.url"
            placeholder="https://"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintInput"
            class="q-mb-md mint-input url-input"
          />

          <q-input
            rounded
            outlined
            v-model="addMintData.nickname"
            :placeholder="$t('MintSettings.add.inputs.nickname.placeholder')"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintNicknameInput"
            class="mint-input"
          />
        </div>

        <div class="add-mint-actions">
          <div class="row justify-between items-center q-mt-xs">
            <q-btn
              flat
              :disable="addMintData.url.length === 0"
              @click="
                addMintData.url.length > 0
                  ? sanitizeMintUrlAndShowAddDialog()
                  : null
              "
              class="text-white"
              :class="{ 'text-grey-7': addMintData.url.length === 0 }"
            >
              <q-icon name="add" size="20px" class="q-mr-sm" />
              <span>{{ $t("MintSettings.add.actions.add_mint.label") }}</span>
            </q-btn>

            <q-btn flat @click="showCamera" class="text-white">
              <q-icon name="qr_code" size="20px" class="q-mr-sm" />
              <span>{{ $t("MintSettings.add.actions.scan.label") }}</span>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Swap section -->

    <div class="section-divider q-mb-md q-px-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("MintSettings.swap.title") }}
      </div>
      <div class="divider-line"></div>
    </div>
    <div class="q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>
              {{ $t("MintSettings.swap.overline") }}</q-item-label
            >
            <q-item-label caption>
              {{ $t("MintSettings.swap.caption") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-pt-sm">
          <q-select
            clearable
            rounded
            outlined
            dense
            color="primary"
            v-model="swapData.fromUrl"
            :options="swapAmountDataOptions()"
            option-value="url"
            option-label="optionLabel"
            :label="$t('MintSettings.swap.inputs.from.label')"
            style="
              min-width: 200px;
              width: 100%;
              font-family: monospace;
              font-size: 0.9em;
            "
            :disable="swapBlocking"
          />
        </q-item>
        <q-item>
          <q-select
            clearable
            rounded
            outlined
            dense
            color="primary"
            v-model="swapData.toUrl"
            :options="swapAmountDataOptions()"
            option-value="url"
            option-label="optionLabel"
            :label="$t('MintSettings.swap.inputs.to.label')"
            style="
              min-width: 200px;
              width: 100%;
              font-family: monospace;
              font-size: 0.9em;
            "
            :disable="swapBlocking"
          />
        </q-item>
        <q-item>
          <q-input
            rounded
            outlined
            dense
            v-model.number="swapData.amount"
            type="number"
            :label="
              $t('MintSettings.swap.inputs.amount.label', {
                ticker: tickerShort,
              })
            "
            style="min-width: 200px"
            @keydown.enter.prevent="extractAndMintAmountSwap(swapAmountData)"
            :disable="
              !swapData.fromUrl ||
              !swapData.toUrl ||
              swapData.fromUrl == swapData.toUrl ||
              swapBlocking
            "
          ></q-input>
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            @click="extractAndMintAmountSwap(swapAmountData)"
            :disable="
              !swapData.fromUrl ||
              !swapData.toUrl ||
              !(swapData.amount > 0) ||
              swapData.fromUrl == swapData.toUrl
            "
            :loading="swapBlocking"
          >
            <q-icon size="xs" name="swap_horiz" class="q-pr-xs" />
            {{ $t("MintSettings.swap.actions.swap.label") }}
            <template v-slot:loading>
              <q-spinner size="xs" />
              {{ $t("MintSettings.swap.actions.swap.in_progress") }}
            </template>
          </q-btn>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
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
      let urlObj = new URL(this.addMintData.url);
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
      let options = [];
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
@import "src/css/mintlist.css";

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

/* More vert icon positioning */
.more-vert-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}
</style>
