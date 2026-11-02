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
          <MintCard
            data-testid="mint-card"
            clickable
            class="q-mb-md cursor-pointer"
            :active="mint.url == activeMintUrl"
            :selected="mint.url == activeMintUrl"
            show-selection-status
            :busy="mint.url == activatingMintUrl"
            :icon-url="mintIconUrl(mint)"
            :name="mint.nickname || mint.info?.name"
            :url="mint.url"
            :balances="
              visibleUnits(mint).map((unit) =>
                formatCurrency(mintClass(mint).unitBalance(unit), unit)
              )
            "
            @click="activateMintUrlInternal(mint.url)"
          >
            <template #overlay>
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
                  <AppBadge tone="danger" class="q-mt-sm">
                    <CircleAlertIcon :size="14" aria-hidden="true" />
                    {{ $t("MintSettings.error_badge") }}
                  </AppBadge>
                </div>
              </transition>
            </template>
            <template #action>
              <IconButton
                data-testid="mint-details"
                class="mint-card-more"
                :icon="EllipsisVerticalIcon"
                :label="$t('MintDetailsDialog.details.title')"
                @click.stop="showMintInfo(mint)"
              />
            </template>
            <!-- The card only knows a score from a Nostr discovery scan; reviews load on
                 the ratings page, so without a score it links there instead of claiming
                 none ("No reviews yet" sat beside a mint rated 4.7). -->
            <template #meta>
              <MintReviewSummary
                v-if="!isMintExcludedFromReviews(mint.url)"
                :average="getRecommendation(mint.url)?.averageRating ?? null"
                :count="getRecommendation(mint.url)?.reviewsCount ?? 0"
                :fallback-label="$t('MintSettings.see_reviews')"
                @open="openReviews(mint.url, mint)"
              />
            </template>
          </MintCard>
        </div>
      </q-list>

      <!-- Mint discovery -->
      <div class="q-mb-md row justify-center">
        <!-- One filled action at a time (owner 2026-10-29, item 2): Discover leads until a
             mint URL is typed, then Add mint takes the fill. -->
        <q-btn
          :outline="hasManualMintUrl"
          :unelevated="!hasManualMintUrl"
          rounded
          color="primary"
          class="discover-mints-btn full-width"
          data-testid="discover-mints"
          @click="$router.push('/discoverMints')"
        >
          <SearchIcon :size="20" class="q-mr-sm" />
          <span>{{ $t("MintSettings.discover_mints_button") }}</span>
        </q-btn>
      </div>
    </div>

    <!-- Add mint section -->
    <div class="q-pt-xs q-px-sm" ref="addMintDiv">
      <div class="add-mint-container">
        <!-- With no mint yet, the wallet's empty state above already says "Add a mint": the
             form keeps only its description, so the label doesn't repeat (council R83). -->
        <SectionDivider
          class="q-mt-sm"
          :label="mints.length ? $t('MintSettings.add.title') : ''"
          :caption="$t('MintSettings.add.description')"
        />

        <div class="add-mint-inputs">
          <q-input
            outlined
            data-testid="add-mint-url"
            v-model="addMintData.url"
            :label="$t('global.inputs.mint_url.label')"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintInput"
            class="q-mb-md mint-input url-input"
          >
            <template v-slot:append>
              <IconButton
                :label="$t('MintSettings.add.actions.scan.label')"
                @click="showCamera"
              >
                <ScanIcon :size="20" />
              </IconButton>
            </template>
          </q-input>

          <q-input
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
          :outline="!hasManualMintUrl"
          :unelevated="hasManualMintUrl"
          class="full-width add-mint-submit q-mt-md"
          data-testid="add-mint-submit"
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
      <SectionDivider
        class="q-mt-sm"
        :label="$t('MintSettings.swap.title')"
        :caption="$t('MintSettings.swap.caption')"
      />
      <!-- From and To are the wallet's mint picker (icons, balances, the same sheet). -->
      <ChooseMint
        test-id="swap-from"
        dense
        allow-empty
        :require-active-mint="false"
        :label="$t('MintSettings.swap.inputs.from.label')"
        :model-value="swapData.fromUrl?.url ?? ''"
        :disable="swapBlocking"
        @update:model-value="swapData.fromUrl = swapOptionFor($event)"
      />
      <ChooseMint
        test-id="swap-to"
        dense
        allow-empty
        :require-active-mint="false"
        :label="$t('MintSettings.swap.inputs.to.label')"
        :model-value="swapData.toUrl?.url ?? ''"
        :disable="swapBlocking"
        @update:model-value="swapData.toUrl = swapOptionFor($event)"
      />
      <!-- Amount, then the full-width Swap action, the same shape as Add mint above. -->
      <div>
        <q-input
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
          class="full-width q-mt-md swap-btn"
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
          <template #loading
            ><BusyLabel>{{
              $t("MintSettings.swap.actions.swap.in_progress")
            }}</BusyLabel></template
          >
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import MintCard from "src/components/MintCard.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import {
  CircleAlert as CircleAlertIcon,
  EllipsisVertical as EllipsisVerticalIcon,
  Plus as PlusIcon,
  ScanLine as ScanIcon,
  Search as SearchIcon,
} from "lucide-vue-next";
import { ref, defineComponent, markRaw, onMounted, onBeforeUnmount } from "vue";
import { getShortUrl, mintIconUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useCameraStore } from "src/stores/camera";
import { useWorkersStore } from "src/stores/workers";
import { useSwapStore } from "src/stores/swap";
import { useUiStore } from "src/stores/ui";
import { notifyError } from "src/js/notify";
import { EventBus } from "../js/eventBus";
import AddMintDialog from "src/components/AddMintDialog.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import MintReviewSummary from "src/components/MintReviewSummary.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";

// Mints that should not show reviews
const EXCLUDED_FROM_REVIEWS = [
  "http://localhost*", // localhost with any port
  "https://*cashu.space", // exact match and subdomains
];

export default defineComponent({
  name: "MintSettings",
  mixins: [windowMixin],
  components: {
    IconButton,
    BusyLabel,
    MintCard,
    AppBadge,
    CircleAlertIcon,
    PlusIcon,
    ScanIcon,
    SearchIcon,
    AddMintDialog,
    ChooseMint,
    MintReviewSummary,
    SectionDivider,
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
      EllipsisVerticalIcon: markRaw(EllipsisVerticalIcon),
    };
  },
  data: function () {
    return {
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
    };
  },
  computed: {
    // Presentation only: which of Discover and Add mint is the filled action.
    hasManualMintUrl(): boolean {
      return this.addMintData.url.trim().length > 0;
    },
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "mints",
      "addMintBlocking",
      "activatingMintUrl",
    ]),
    ...mapState(useMintRecommendationsStore, ["recommendations"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useSwapStore, ["swapAmountData"]),
    ...mapWritableState(useSwapStore, ["swapBlocking"]),
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
      // sat leads on every card, as in the mint picker.
      const units = [...mintClass.units].sort(
        (a, b) => Number(b === "sat") - Number(a === "sat")
      );
      const funded = units.filter((unit) => mintClass.unitBalance(unit) > 0);
      return funded.length ? funded : units.slice(0, 1);
    },
    ...mapActions(useMintsStore, ["addMint", "activateMintUrl"]),
    ...mapActions(useCameraStore, ["showCamera"]),
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
      console.log(`Activating mint ${mintUrl}`);
      try {
        await this.activateMintUrl(mintUrl, false, true);
      } catch (e) {
        console.log("#### Error activating mint:", e);
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
      this.addMint(mintToAdd, verbose);
      this.addMintData = { url: "", nickname: "" };
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
    showMintInfo: async function (mint) {
      // Navigate to mint details page with mint URL as query parameter
      this.$router.push({
        path: "/mintdetails",
        query: { mintUrl: mint.url },
      });
    },
    mintIconUrl,
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
  },
  created: function () {},
});
</script>

<style>
@import "src/css/mintlist.css";

/* Swap sits beside the 56px amount field, with the 1rem label of the other mint actions. */

/* Add mint matches the height and label size of Discover mints and Swap. */
/* Discover mints, Add mint and Swap are full-width actions: the shared 52px height. */
/* Add Mint Section Styles */
.add-mint-container {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}

.add-mint-inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mint-input {
  width: 100%;
  font-family: inherit;
}

.mint-input .q-field__native,
.mint-input .q-field__input {
  font-family: inherit;
}
</style>
