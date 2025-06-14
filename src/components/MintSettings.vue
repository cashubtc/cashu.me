<template>
  <MintDetailsDialog @update:mintToRemove="mintToRemove = $event" />
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
                  ? '1px solid var(--q-primary)'
                  : '1px solid rgba(128, 128, 128, 0.2)',
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
              <q-spinner-hourglass
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
                  Error
                  <q-icon name="error" class="q-ml-xs" size="xs" />
                </q-badge>
              </div>
            </transition>
            <div class="full-width" style="position: relative">
              <!-- <transition-group
                appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut"
                name="fade"
              >
                <q-item-section
                  v-if="mint.url == activatingMintUrl"
                  style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1; /* Ensure spinner is on top */
                    background-color: rgba(
                      15,
                      15,
                      15,
                      0.8
                    ); /* Semi-transparent background */
                    border-radius: 8px; /* Match q-item's border-radius */
                    padding: 0px;
                  "
                >
                  <q-spinner-hourglass
                    class="q-my-auto"
                    color="white"
                    size="2em"
                  />
                </q-item-section>
              </transition-group> -->
              <div class="row items-center q-pa-md">
                <div class="col">
                  <div class="row items-center">
                    <q-avatar
                      v-if="getMintIconUrl(mint)"
                      size="34px"
                      class="q-mr-sm"
                    >
                      <q-img
                        spinner-color="white"
                        spinner-size="xs"
                        :src="getMintIconUrl(mint)"
                        alt="Mint Icon"
                        style="height: 34px; max-width: 34px; font-size: 12px"
                      />
                    </q-avatar>

                    <div class="column q-gutter-y-sm">
                      <div
                        v-if="mint.nickname || mint.info?.name"
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          line-height: 16px;
                        "
                      >
                        {{ mint.nickname || mint.info?.name }}
                      </div>
                      <div
                        class="text-grey-6"
                        style="
                          font-size: 12px;
                          line-height: 16px;
                          font-family: monospace;
                          margin-top: 4px;
                        "
                      >
                        {{ mint.url }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row justify-between q-pb-md q-px-md">
                <div class="col">
                  <!-- Currency units with regular text styling -->
                  <div class="row q-gutter-x-sm">
                    <div
                      v-for="unit in mintClass(mint).units"
                      :key="unit"
                      class="q-py-xs q-px-sm q-my-xs"
                      style="
                        border-radius: 4px;
                        background-color: #1d1d1d;
                        display: inline-block;
                      "
                    >
                      <span
                        style="color: white; font-size: 14px; font-weight: 500"
                      >
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

                <div class="col-auto">
                  <q-icon
                    name="more_vert"
                    @click.stop="showMintInfo(mint)"
                    color="white"
                    class="cursor-pointer q-mr-sm"
                    size="1.3rem"
                  />
                </div>
              </div>
            </div>
          </q-item>
        </div>
      </q-list>
    </div>
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
              aria-label="Add mint"
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

            <q-btn
              aria-label="Scan"
              flat
              @click="showCamera"
              class="text-white"
            >
              <q-icon name="qr_code" size="20px" class="q-mr-sm" />
              <span>{{ $t("MintSettings.add.actions.scan.label") }}</span>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- nostr -->
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
            aria-label="Discover mints"
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            :loading="discoveringMints"
            @click="fetchMintsFromNdk"
            >{{ $t("MintSettings.discover.actions.discover.label") }}
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              {{ $t("MintSettings.discover.actions.discover.in_progress") }}
            </template>
          </q-btn>
        </q-item>
        <div v-if="mintRecommendations.length > 0">
          <!-- for each entry in mintRecommendations, display the url and the count how often it was recommended -->
          <q-item>
            <q-item-section>
              <q-item-label overline>
                {{
                  $t("MintSettings.discover.recommendations.overline", {
                    length: mintRecommendations.length,
                  })
                }}</q-item-label
              >
              <q-item-label caption
                ><i18n-t
                  keypath="MintSettings.discover.recommendations.caption"
                >
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
          <q-expansion-item
            dense
            dense-toggle
            class="text-left"
            :label="
              $t('MintSettings.discover.recommendations.actions.browse.label')
            "
          >
            <q-item v-for="mint in mintRecommendations" :key="mint.url">
              <q-item-section
                class="q-mx-none q-pl-none"
                style="max-width: 1.05em"
              >
                <q-icon
                  name="content_copy"
                  @click="copyText(mint.url)"
                  size="1em"
                  color="grey"
                  class="q-mr-xs cursor-pointer"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption style="word-break: break-word">{{
                  mint.url
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :label="mint.count" color="primary" />
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </div>
      </q-list>
    </div>

    <div class="section-divider q-mb-md">
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
            aria-label="Swap"
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
              <q-spinner-hourglass size="xs" />
              {{ $t("MintSettings.swap.actions.swap.in_progress") }}
            </template>
          </q-btn>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script>
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
import MintDetailsDialog from "src/components/MintDetailsDialog.vue";
import { EventBus } from "../js/eventBus";
import AddMintDialog from "src/components/AddMintDialog.vue";

export default defineComponent({
  name: "MintSettings",
  mixins: [windowMixin],
  components: {
    MintDetailsDialog,
    AddMintDialog,
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
    ...mapState(useNostrStore, ["pubkey", "mintRecommendations"]),
    ...mapState(useWorkersStore, ["invoiceWorkerRunning"]),
    ...mapWritableState(useMintsStore, [
      "addMintData",
      "showAddMintDialog",
      "showMintInfoDialog",
      "showMintInfoData",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapState(useSwapStore, ["swapAmountData"]),
    ...mapWritableState(useSwapStore, ["swapBlocking"]),
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
      "fetchMints",
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
      await this.initNdkReadOnly();
      console.log("### fetch mints");
      let maxTries = 5;
      let tries = 0;
      let mintUrls = [];
      while (mintUrls.length == 0 && tries < maxTries) {
        try {
          mintUrls = await this.fetchMints();
        } catch (e) {
          console.log("Error fetching mints", e);
        }
        tries++;
      }
      if (mintUrls.length == 0) {
        this.notifyError(
          this.$i18n.t("MintSettings.discover.actions.discover.error_no_mints")
        );
      } else {
        this.notifySuccess(
          this.$i18n.t("MintSettings.discover.actions.discover.success", {
            length: mintUrls.length,
          })
        );
      }
      console.log(mintUrls);
      this.discoveringMints = false;
    },
    showMintInfo: async function (mint) {
      this.showMintInfoData = mint;
      this.showMintInfoDialog = true;

      this.fetchMintInfo(mint).then((newMintInfo) => {
        this.triggerMintInfoMotdChanged(newMintInfo, mint);
        this.mints.filter((m) => m.url === mint.url)[0].info = newMintInfo;
        this.showMintInfoData = mint;
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
  },
  created: function () {},
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: transform 1s ease, opacity 1s ease;
}
.mint-card.q-loading {
  opacity: 0.5; /* Reduce opacity when loading */
  pointer-events: none;
}
.error-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
.mint-loading-spinner {
  position: absolute;
  top: 18px;
  right: 24px;
  z-index: 10;
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
</style>
