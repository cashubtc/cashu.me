<template>
  <MintDetailsDialog />
  <div style="max-width: 800px; margin: 0 auto">
    <!-- ////////////////////// SETTINGS ////////////////// -->
    <div class="q-py-md q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Mints</q-item-label>
          </q-item-section>
        </q-item>

        <!-- <q-item-label header>Your mints</q-item-label> -->
        <div v-for="mint in mints" :key="mint.url">
          <q-item
            :active="mint.url == activeMintUrl"
            active-class="text-weight-bold text-primary"
            clickable
            @click="activateMintUrlInternal(mint.url)"
            class="mint-card q-mb-md cursor-pointer"
            :class="$q.dark.isActive ? 'bg-info' : 'bg-dark'"
            :style="{
              'border-radius': '8px',
              border:
                mint.url == activeMintUrl
                  ? '2px solid var(--q-primary)'
                  : '2px solid rgba(128, 128, 128, 0.2)',
              padding: '0px',
            }"
            :loading="mint.url == activatingMintUrl"
          >
            <div class="full-width" style="position: relative">
              <transition-group
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
              </transition-group>
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
                        :src="getMintIconUrl(mint)"
                        alt="Mint Icon"
                        style="height: 34px; max-width: 34px; font-size: 12px"
                      />
                    </q-avatar>

                    <div class="column q-gutter-y-sm">
                      <div
                        v-if="mint.nickname || mint.info?.name"
                        class="text-weight-medium"
                        style="font-size: 14px; line-height: 16px"
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

              <div class="row justify-between q-pa-md">
                <div class="col">
                  <!-- Currency units with regular text styling -->
                  <div class="row q-gutter-x-sm">
                    <div
                      v-for="unit in mintClass(mint).units"
                      :key="unit"
                      style="
                        border-radius: 4px;
                        background-color: #1d1d1d;
                        padding: 8px;
                        display: inline-block;
                      "
                    >
                      <span
                        style="
                          color: white;
                          font-size: 12px;
                          font-family: monospace;
                          font-weight: 500;
                        "
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
                    name="info_outline"
                    @click.stop="showMintInfo(mint)"
                    color="grey"
                    class="cursor-pointer q-mr-sm"
                    size="1.3rem"
                  />
                  <q-icon
                    name="edit"
                    @click.stop="editMint(mint)"
                    class="cursor-pointer"
                    color="grey"
                    size="1.3rem"
                  />
                </div>
              </div>
            </div>
          </q-item>
        </div>
      </q-list>
    </div>
    <div class="q-pt-xs q-px-xs" ref="addMintDiv">
      <q-list padding>
        <div class="row-12 text-left">
          <q-item>
            <q-item-section>
              <q-item-label overline>Add mint</q-item-label>
              <q-item-label caption
                >Enter the URL of a Cashu mint to connect to it. This wallet is
                not affiliated with any mint.
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="row-12">
          <q-input
            bottom-slots
            rounded
            dense
            outlined
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            v-model="addMintData.url"
            placeholder="https://"
            ref="mintInput"
            class="q-pb-none q-mb-sm q-px-md"
            style="font-family: monospace"
          >
            <!-- <template v-slot:hint> Enter Mint URL</template> -->
            <!-- "addMint(mintToAdd)" -->
            <!-- <template v-slot:append>
            <q-btn
              round
              dense
              flat
              color="primary"
              icon="add"
              click
              @click="setShowAddMintDialog(true)"
            />
          </template> -->
          </q-input>
        </div>
        <div class="row-12">
          <q-input
            bottom-slots
            rounded
            dense
            outlined
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            v-model="addMintData.nickname"
            label="Nickname (e.g. Testnet)"
            ref="mintNicknameInput"
            class="q-pb-sm q-px-md"
          >
          </q-input>
        </div>
        <div class="row-12">
          <q-btn
            v-if="addMintData.url.length == 0"
            rounded
            class="q-px-lg q-mt-xs"
            color="primary"
            @click="showCamera"
          >
            <q-icon size="xs" name="qr_code" class="q-pr-xs" />
            Scan QR code
          </q-btn>
          <q-btn
            v-if="addMintData.url.length > 0"
            rounded
            class="q-px-lg q-mt-xs"
            color="primary"
            :disabled="addMintData.url.length == 0"
            :loading="addMintBlocking"
            @click="sanitizeMintUrlAndShowAddDialog"
          >
            <q-icon size="xs" name="add" class="q-pr-xs" />
            Add mint
            <template v-slot:loading>
              <q-spinner-hourglass />
              Adding mint
            </template>
          </q-btn>
        </div>
      </q-list>
    </div>

    <!-- nostr -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Discover</q-item-label>
            <q-item-label caption
              >Discover mints other users have recommended on
              nostr.</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item>
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            :loading="discoveringMints"
            @click="fetchMintsFromNdk"
            >Discover mints
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Loading...
            </template>
          </q-btn>
        </q-item>
        <div v-if="mintRecommendations.length > 0">
          <!-- for each entry in mintRecommendations, display the url and the count how often it was recommended -->
          <q-item>
            <q-item-section>
              <q-item-label overline
                >Found {{ mintRecommendations.length }} mints</q-item-label
              >
              <q-item-label caption
                >These mints were recommended by other Nostr users. Read reviews
                at
                <a
                  href="https://bitcoinmints.com"
                  target="_blank"
                  class="text-primary"
                  >bitcoinmints.com</a
                >. Be careful and do your own research before using a mint.
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item
            dense
            dense-toggle
            class="text-left"
            label="Click to browse mints"
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

    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Multimint Swaps</q-item-label>
            <q-item-label caption
              >Swap funds between mints via Lightning. Note: Leave room for
              potential Lightning fees. If the incoming payment does not
              succeed, check the invoice manually.
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
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
            label="From"
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
            label="To"
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
            :label="'Amount (' + tickerShort + ')'"
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
            Swap
            <template v-slot:loading>
              <q-spinner-hourglass size="xs" />
              Swap
            </template>
          </q-btn>
        </q-item>
      </q-list>
    </div>

    <q-dialog
      v-model="showEditMintDialog"
      backdrop-filter="blur(2px) brightness(60%)"
    >
      <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
        <h6 class="q-mt-none q-mb-md">Edit mint</h6>
        <q-input
          outlined
          v-model="editMintData.url"
          label="Mint URL"
          type="textarea"
          autogrow
          class="q-mb-xs"
          style="font-family: monospace; font-size: 0.9em"
        ></q-input>
        <q-input
          outlined
          v-model="editMintData.nickname"
          label="Nickname"
          type="textarea"
          autogrow
          class="q-mb-xs"
        ></q-input>
        <div class="row q-mt-lg">
          <q-btn
            class="float-left"
            v-close-popup
            rounded
            color="primary"
            @click="updateMint(mintToEdit, editMintData)"
            >Update</q-btn
          >
          <q-btn
            icon="delete"
            flat
            class="float-left item-left text-left"
            @click="showRemoveMintDialogWrapper(mintToEdit.url)"
          />
          <q-btn v-close-popup flat class="q-ml-auto" color="grey"
            >Cancel</q-btn
          >
        </div>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showAddMintDialog"
      @keydown.enter.prevent="addMintInternal(addMintData, (verbose = true))"
      backdrop-filter="blur(2px) brightness(60%)"
    >
      <q-card class="q-pa-lg">
        <h6 class="q-mt-none q-mb-md">Do you trust this mint?</h6>
        <p>
          Before using this mint, make sure you trust it. Mints could become
          malicious or cease operation at any time.
        </p>
        <q-input
          outlined
          readonly
          v-model="addMintData.url"
          label="Mint URL"
          type="textarea"
          autogrow
          class="q-mb-xs"
          style="font-family: monospace; font-size: 0.9em"
        ></q-input>
        <div class="row q-mt-lg">
          <div class="col">
            <q-btn
              class="float-left"
              rounded
              v-close-popup
              color="primary"
              icon="check"
              :loading="addMintBlocking"
              @click="addMintInternal(addMintData, (verbose = true))"
              >Add mint
              <template v-slot:loading>
                <q-spinner-hourglass />
                Adding mint
              </template>
            </q-btn>
          </div>
          <div class="col">
            <q-btn v-close-popup flat class="float-right" color="grey"
              >Cancel</q-btn
            >
          </div>
        </div>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="showRemoveMintDialog"
      backdrop-filter="blur(2px) brightness(60%)"
    >
      <q-card class="q-pa-lg">
        <h6 class="q-my-md">Are you sure you want to delete this mint?</h6>
        <div v-if="mintToRemove.nickname">
          <span class="text-weight-bold"> Nickname: </span>
          <span class="text-weight-light"> {{ mintToRemove.nickname }}</span>
        </div>
        <div class="row q-my-md">
          <div class="col">
            <span class="text-weight-bold">Balances:</span>
            <q-badge
              v-for="unit in mintClass(mintToRemove).units"
              :key="unit"
              color="primary"
              :label="
                formatCurrency(mintClass(mintToRemove).unitBalance(unit), unit)
              "
              class="q-mx-xs"
            />
          </div>
        </div>
        <q-input
          outlined
          readonly
          v-model="mintToRemove.url"
          label="Mint URL"
          type="textarea"
          autogrow
          class="q-mb-xs"
        ></q-input>
        <div class="row q-my-md">
          <div class="col">
            <span class="text-caption"
              >Note: Because this wallet is paranoid, your ecash from this mint
              will not be actually deleted but will remain stored on your
              device. You will see it reappear if you re-add this mint later
              again.</span
            >
          </div>
        </div>
        <div class="row q-mt-lg">
          <div class="col">
            <q-btn
              v-close-popup
              class="float-left"
              color="primary"
              @click="
                showEditMintDialog = false;
                removeMint(mintToRemove.url, (verbose = true));
              "
              >Remove mint</q-btn
            >
          </div>
          <div class="col">
            <q-btn v-close-popup flat color="grey" class="float-right"
              >Cancel</q-btn
            >
          </div>
        </div>
      </q-card>
    </q-dialog>
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

export default defineComponent({
  name: "MintSettings",
  mixins: [windowMixin],
  components: { MintDetailsDialog },
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
      mintToEdit: {
        url: "",
        nickname: "",
      },
      mintToRemove: {
        url: "",
        nickname: "",
        balances: {},
      },
      editMintData: {
        url: "",
        nickname: "",
      },
      addMintDialog: {
        show: false,
      },
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
      showEditMintDialog: false,
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
      "showRemoveMintDialog",
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
    editMint: function (mint) {
      // copy object to avoid changing the original
      this.mintToEdit = Object.assign({}, mint);
      this.editMintData = Object.assign({}, mint);
      this.showEditMintDialog = true;
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
        notifyError("Invalid URL");
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
    showRemoveMintDialogWrapper: function (mint) {
      // select the mint from this.mints and add its balances
      let mintToRemove = this.mints.find((m) => m.url == mint);

      this.mintToRemove = mintToRemove;
      this.showRemoveMintDialog = true;
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
        this.notifyError("No mints found");
      } else {
        this.notifySuccess("Found " + mintUrls.length + " mints");
      }
      console.log(mintUrls);
      this.discoveringMints = false;
    },
    showMintInfo: async function (mint) {
      this.showMintInfoData = mint;
      this.showMintInfoDialog = true;
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
</style>
