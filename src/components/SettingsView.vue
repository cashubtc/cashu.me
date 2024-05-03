<template>
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
          >
            <q-item-section avatar>
              <q-icon
                :color="mint.url == activeMintUrl ? 'primary' : 'grey'"
                :name="
                  mint.url == activeMintUrl
                    ? 'check_circle'
                    : 'radio_button_unchecked'
                "
                @click="activateMintUrl(mint.url, (verbose = false))"
                class="cursor-pointer"
              />
            </q-item-section>
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
              <q-item-label
                lines="1"
                v-if="mint.nickname"
                @click="activateMintUrl(mint.url, (verbose = false))"
                class="cursor-pointer"
                style="word-break: break-word"
                >{{ mint.nickname }}</q-item-label
              >
              <q-item-label
                lines="1"
                @click="activateMintUrl(mint.url, (verbose = false))"
                class="cursor-pointer"
                style="word-break: break-word"
                >{{ mint.url }}</q-item-label
              >
              <q-item-label>
                <q-badge
                  v-for="unit in mintClass(mint).units"
                  :key="unit"
                  :color="mint.url == activeMintUrl ? 'primary' : 'grey'"
                  :label="
                    formatCurrency(mintClass(mint).unitBalance(unit), unit)
                  "
                  class="q-mx-xs"
                />
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="edit"
                @click="editMint(mint)"
                class="cursor-pointer"
              />
            </q-item-section>
          </q-item>

          <q-separator spaced inset="item" />
        </div>
      </q-list>
    </div>
    <div class="q-pt-xs q-px-xs">
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
            @keydown.enter.prevent="showAddMintDialog = true"
            v-model="addMintData.url"
            placeholder="https://"
            ref="mintInput"
            class="q-pb-none q-mb-sm q-px-md"
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
            v-model="addMintData.nickname"
            label="Nickname (e.g. Testnet)"
            ref="mintNicknameInput"
            class="q-pb-sm q-px-md"
          >
          </q-input>
        </div>
        <div class="row-12">
          <q-btn
            rounded
            class="q-px-lg q-mt-xs"
            color="primary"
            :disabled="addMintData.url.length == 0"
            :loading="addingMint"
            @click="showAddMintDialog = true"
          >
            <q-icon size="xs" name="add" class="q-pr-xs" />
            Add mint
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Loading...
            </template>
          </q-btn>
        </div>
      </q-list>
    </div>

    <div class="q-py-md q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Backup seed phrase</q-item-label>
            <q-item-label caption
              >Your seed phrase can restore your wallet. Keep it safe and
              private. Warning: this wallet does not support seed phrase
              recovery yet. Use a different Cashu wallet to recover from seed
              phrase.
            </q-item-label>
            <div class="row q-pt-md">
              <div class="col-12">
                <q-input
                  outlined
                  readonly
                  v-model="hiddenMnemonic"
                  label="Seed phrase"
                  autogrow
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="visibility"
                      color="primary"
                      class="cursor-pointer q-mt-md"
                      @click="toggleMnemonicVisibility"
                    ></q-btn>
                    <q-btn
                      flat
                      dense
                      icon="content_copy"
                      color="primary"
                      class="cursor-pointer q-mt-md"
                      @click="copyText(mnemonic)"
                    ></q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <!-- P2PK -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Generate Keys</q-item-label>
            <q-item-label caption
              >Generate keys to be able to receive P2PK-locked
              ecash.</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item>
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            @click="generateKeypair"
            >Generate keys</q-btn
          >
        </q-item>
      </q-list>
    </div>

    <q-item class="text-left" v-if="p2pkKeys.length">
      <q-item-section>
        <q-item-label overline
          >You have {{ p2pkKeys.length }} keys</q-item-label
        >
        <q-item-label caption
          >You can use these keys to receive ecash.
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-expansion-item
      dense
      dense-toggle
      v-if="p2pkKeys.length"
      class="text-left"
      label="Click to browse your keys"
    >
      <q-item v-for="key in p2pkKeys" :key="key.privakey">
        <q-item-section class="q-mx-none q-pl-none" style="max-width: 1.05em">
          <q-icon
            name="content_copy"
            @click="copyText(key.publicKey)"
            size="1em"
            color="grey"
            class="q-mr-xs cursor-pointer"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            caption
            clickable
            style="word-break: break-word"
            @click="showP2PKKeyEntry(key.publicKey)"
            >{{ key.publicKey }}</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <q-badge v-if="key.used" label="used" color="primary" />
        </q-item-section>
        <q-item-section class="q-mx-none q-pl-none" style="max-width: 1.05em">
          <q-icon
            name="qr_code"
            @click="showP2PKKeyEntry(key.publicKey)"
            size="1em"
            color="grey"
            class="q-mr-xs cursor-pointer"
          />
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <!-- nostr -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Nostr</q-item-label>
            <q-item-label caption
              >Connect your wallet with nostr and discover mints recommended by
              other users.</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item v-if="false">
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            @click="initNdk"
            >Link to extension</q-btn
          >
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
              >Swap funds from one mint to another via Lightning. Note: Leave
              room for potential Lightning fees.</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item>
          <q-select
            clearable
            rounded
            outlined
            dense
            color="primary"
            v-model="swapData.from_url"
            :options="swapDataOptions()"
            option-value="url"
            option-label="shorturl"
            label="From"
            style="min-width: 200px; width: 100%"
          />
        </q-item>
        <q-item>
          <q-select
            clearable
            rounded
            outlined
            dense
            color="primary"
            v-model="swapData.to_url"
            :options="swapDataOptions()"
            option-value="url"
            option-label="shorturl"
            label="To"
            style="min-width: 200px; width: 100%"
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
          ></q-input>
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            @click="
              mintSwap(
                swapData.from_url.url,
                swapData.to_url.url,
                swapData.amount
              )
            "
            :disable="
              !swapData.from_url || !swapData.to_url || !(swapData.amount > 0)
            "
          >
            <q-icon size="xs" name="swap_horiz" class="q-pr-xs" />
            Swap</q-btn
          >
        </q-item>
      </q-list>
    </div>
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Privacy</q-item-label>
            <q-item-label caption>
              These settings affect your privacy.
            </q-item-label>
          </q-item-section>
        </q-item>
        <div>
          <!-- check outgoing token state setting -->
          <q-item>
            <q-toggle
              v-model="checkSentTokens"
              label="Check sent token state"
              color="primary"
            /> </q-item
          ><q-item class="q-pt-none">
            <q-item-label caption
              >If enabled, the wallet will periodically request the state of
              tokens you've sent and mark them as paid. You can manually check
              pending tokens in the history tab.
            </q-item-label>
          </q-item>
          <!-- price check setting -->
          <q-item>
            <q-toggle
              v-model="getBitcoinPrice"
              label="Get exchange rate from Coinbase"
              color="primary"
            /> </q-item
          ><q-item class="q-pt-none">
            <q-item-label caption
              >If enabled, the current Bitcoin exchange rate will be fetched
              from the coinbase.com API and your converted balance will be
              displayed.
            </q-item-label>
          </q-item>
        </div>
        <q-expansion-item
          class="q-pt-lg"
          dense
          dense-toggle
          icon="code"
          label="Advanced"
        >
          <div>
            <q-item class="q-pt-lg">
              <q-item-section>
                <q-item-label overline>Developer settings</q-item-label>
                <q-item-label caption
                  >The following settings are for development and
                  debugging.</q-item-label
                >
              </q-item-section>
            </q-item>
            <div>
              <!-- check proofs spendable setting -->
              <q-item>
                <q-item-section>
                  <div class="row q-pt-md">
                    <div class="col-12" v-if="!confirmMnemonic">
                      <q-btn
                        flat
                        dense
                        @click="confirmMnemonic = !confirmMnemonic"
                        >Generate new seed phrase</q-btn
                      >
                      <row>
                        <q-item-label class="q-px-sm" caption
                          >This will generate a new seed phrase. You must send
                          your entire balance to yourself in order to be able to
                          restore it with a new seed.
                        </q-item-label>
                      </row>
                    </div>
                    <div class="col-12" v-if="confirmMnemonic">
                      <span
                        >Are you sure you want to generate a new seed phrase?
                      </span>
                      <q-btn
                        flat
                        dense
                        class="q-ml-sm"
                        color="warning"
                        @click="confirmMnemonic = false"
                        >Cancel</q-btn
                      >
                      <q-btn
                        flat
                        dense
                        class="q-ml-sm"
                        color="secondary"
                        @click="
                          confirmMnemonic = false;
                          generateNewMnemonic();
                        "
                        >Confirm</q-btn
                      >
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <row>
                    <q-btn
                      dense
                      flat
                      outline
                      click
                      @click="checkActiveProofsSpendable"
                      >Check proofs spendable</q-btn
                    ></row
                  ><row>
                    <q-item-label class="q-px-sm" caption
                      >Check if all proofs of your active mints are spendable
                      and remove the spent ones from your wallet. Only use this
                      if your wallet is stuck.
                    </q-item-label>
                  </row>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <row>
                    <q-btn dense flat outline click @click="enable_terminal">
                      Open debug terminal
                    </q-btn> </row
                  ><row>
                    <q-item-label class="q-px-sm" caption
                      >Open a debug terminal.
                    </q-item-label>
                  </row>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <row>
                    <q-btn
                      dense
                      flat
                      outline
                      click
                      @click="getLocalstorageToFile"
                    >
                      Export wallet data
                    </q-btn></row
                  ><row>
                    <q-item-label class="q-px-sm" caption
                      >Download a dump of your wallet. You can restore your
                      wallet from this file in the welcome screen of a new
                      wallet. This file will be out of sync if you keep using
                      your wallet after exporting it.
                    </q-item-label>
                  </row>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-expansion-item>
      </q-list>
    </div>

    <q-dialog
      v-model="showEditMintDialog"
      backdrop-filter="blur(2px) brightness(60%)"
    >
      <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
        <h6 class="q-my-md">Edit mint</h6>
        <q-input
          outlined
          v-model="editMintData.url"
          label="Mint URL"
          type="textarea"
          autogrow
          class="q-mb-xs"
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
        <h6 class="q-my-md">Do you trust this mint?</h6>
        <p>
          A Cashu mint controls the funds you send to it. Make sure that you
          trust the operator of this mint.
        </p>
        <q-input
          outlined
          readonly
          v-model="addMintData.url"
          label="Mint URL"
          type="textarea"
          autogrow
          class="q-mb-xs"
        ></q-input>
        <div class="row q-mt-lg">
          <div class="col">
            <q-btn
              class="float-left"
              v-close-popup
              color="primary"
              icon="check"
              :loading="addingMint"
              @click="addMintInternal(addMintData, (verbose = true))"
              >Add mint
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
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { map } from "underscore";
import { currentDateStr } from "src/js/utils";
import { useSettingsStore } from "src/stores/settings";
import { useNdkStore } from "src/stores/ndk";
import { useP2PKStore } from "src/stores/p2pk";
export default defineComponent({
  name: "SettingsView",
  mixins: [windowMixin],
  props: {
    tickerShort: String,
    requestMint: Function,
    melt: Function,
    invoiceCheckWorker: Function,
    payInvoiceData: Object,
    showMintDialog: Boolean,
  },
  data: function () {
    return {
      discoveringMints: false,
      addingMint: false,
      hideMnemonic: true,
      confirmMnemonic: false,
      swapData: {
        from_url: "",
        to_url: "",
        amount: 0,
      },
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
      showEditMintDialog: false,
    };
  },
  computed: {
    ...mapWritableState(useSettingsStore, [
      "getBitcoinPrice",
      "checkSentTokens",
    ]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    ...mapState(useMintsStore, ["activeMintUrl", "mints", "activeProofs"]),
    ...mapState(useNdkStore, ["pubkey", "mintRecommendations"]),
    ...mapState(useWalletStore, ["mnemonic"]),
    ...mapWritableState(useMintsStore, [
      "addMintData",
      "showAddMintDialog",
      "showRemoveMintDialog",
    ]),
    hiddenMnemonic() {
      if (this.hideMnemonic) {
        return this.mnemonic
          .split(" ")
          .map((w) => "*".repeat(w.length))
          .join(" ");
      } else {
        return this.mnemonic;
      }
    },
  },
  watch: {
    showMintDialog: function () {
      this.addMintDialog.show = this.showMintDialog;
    },
    // mintToAddWalletPage: function () {
    //   if (this.mintToAddWalletPage.length > 0) {
    //     this.mintToAdd = this.mintToAddWalletPage;
    //   }
    // },
  },
  methods: {
    ...mapActions(useNdkStore, [
      "init",
      "connect",
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
    ...mapActions(useWalletStore, [
      "newMnemonic",
      "decodeRequest",
      "checkProofsSpendable",
    ]),
    editMint: function (mint) {
      // copy object to avoid changing the original
      this.mintToEdit = Object.assign({}, mint);
      this.editMintData = Object.assign({}, mint);
      this.showEditMintDialog = true;
    },
    addMintInternal: function (mintToAdd, verbose) {
      this.addingMint = true;
      try {
        this.addMint(mintToAdd, verbose);
      } finally {
        this.addingMint = false;
      }
    },
    generateNewMnemonic() {
      this.newMnemonic();
    },
    toggleMnemonicVisibility: function () {
      this.hideMnemonic = !this.hideMnemonic;
    },
    mintClass(mint) {
      return new MintClass(mint);
    },
    swapDataOptions: function () {
      let options = [];
      for (const [i, m] of Object.entries(this.mints)) {
        options.push({
          url: m.url,
          shorturl: m.nickname || getShortUrl(m.url),
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
    //
    mintSwap: async function (from_url, to_url, amount) {
      // get invoice
      await this.activateMintUrl(to_url);
      let invoice = await this.requestMint(amount);

      // pay invoice
      await this.activateMintUrl(from_url);
      await this.decodeRequest(invoice.request);
      await this.melt();

      // settle invoice on other side
      await this.activateMintUrl(to_url);
      await this.invoiceCheckWorker();
      this.notifySuccess("Swap successful");
    },
    enable_terminal: function () {
      // enable debug terminal
      var script = document.createElement("script");
      script.src = "//cdn.jsdelivr.net/npm/eruda";
      document.body.appendChild(script);
      script.onload = function () {
        eruda.init();
      };
    },
    getLocalstorageToFile: async function () {
      // https://stackoverflow.com/questions/24263682/save-restore-local-storage-to-a-local-file
      const fileName = `cashu_backup_${currentDateStr()}.json`;
      var a = {};
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        a[k] = v;
      }
      var textToSave = JSON.stringify(a);
      var textToSaveAsBlob = new Blob([textToSave], {
        type: "text/plain",
      });
      var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

      var downloadLink = document.createElement("a");
      downloadLink.download = fileName;
      downloadLink.innerHTML = "Download File";
      downloadLink.href = textToSaveAsURL;
      downloadLink.onclick = function () {
        document.body.removeChild(event.target);
      };
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
    },
    toggleGetBitcoinPrice: function () {
      this.getBitcoinPrice = !this.getBitcoinPrice;
    },
    checkActiveProofsSpendable: async function () {
      // iterate over this.activeProofs in batches of 50 and check if they are spendable
      let proofs = this.activeProofs.flat();
      console.log("Checking proofs", proofs);
      let allSpentProofs = [];
      let batch_size = 50;
      for (let i = 0; i < proofs.length; i += batch_size) {
        console.log("Checking proofs", i, i + batch_size);
        let batch = proofs.slice(i, i + batch_size);
        let spent = await this.checkProofsSpendable(batch, true);
        allSpentProofs.push(spent);
      }
      let spentProofs = allSpentProofs.flat();
      if (spentProofs.length > 0) {
        console.log("Spent proofs", spentProofs);
        this.notifySuccess("Removed " + spentProofs.length + " spent proofs");
      } else {
        this.notifySuccess("No spent proofs found");
      }
    },
    initNdk: async function () {
      await this.connect();
      console.log(await this.getUserPubkey());
      // console.log("### fetch events");
      // console.log(await this.fetchEventsFromUser());
      // console.log("### fetch mints");
      // console.log(await this.fetchMints());
    },
    fetchMintsFromNdk: async function () {
      this.discoveringMints = true;
      await this.connect();
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
    showP2PKKeyEntry: async function (pubKey) {
      this.showKeyDetails(pubKey);
      this.showP2PKDialog = true;
    },
  },
  created: function () {},
});
</script>
