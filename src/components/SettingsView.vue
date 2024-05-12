<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- ////////////////////// SETTINGS ////////////////// -->
    <div class="q-pb-md q-px-xs text-left" on-left>
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
            <q-item-label overline>Generate P2PK Keys</q-item-label>
            <q-item-label caption
              >Generate a key pair to receive P2PK-locked ecash. Warning: This
              feature is experimental. Only use with small amounts. If you lose
              your private keys, nobody will be able to unlock the ecash locked
              to it anymore.</q-item-label
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

    <!-- theme -->
    <div class="q-py-lg q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Appearance</q-item-label>
            <q-item-label caption>Change how your wallet looks </q-item-label>
            <!-- <div class="row q-py-md">
              <q-btn dense flat rounded @click="toggleDarkMode" size="md"
                >Toggle dark mode<q-icon
                  class="q-ml-sm"
                  :name="$q.dark.isActive ? 'brightness_3' : 'wb_sunny'"
                />
              </q-btn>
            </div> -->
            <div class="row q-pt-md">
              <q-btn
                v-if="themes.includes('classic')"
                dense
                flat
                @click="changeColor('classic')"
                icon="format_color_fill"
                color="deep-purple"
                size="md"
                ><q-tooltip>classic</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('bitcoin')"
                dense
                flat
                @click="changeColor('bitcoin')"
                icon="format_color_fill"
                color="orange"
                size="md"
                ><q-tooltip>bitcoin</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('mint')"
                dense
                flat
                @click="changeColor('mint')"
                icon="format_color_fill"
                color="green"
                size="md"
                ><q-tooltip>mint</q-tooltip> </q-btn
              ><q-btn
                v-if="themes.includes('autumn')"
                dense
                flat
                @click="changeColor('autumn')"
                icon="format_color_fill"
                color="brown"
                size="md"
                ><q-tooltip>autumn</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('monochrome')"
                dense
                flat
                @click="changeColor('monochrome')"
                icon="format_color_fill"
                color="grey"
                size="md"
                ><q-tooltip>monochrome</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('salvador')"
                dense
                flat
                @click="changeColor('salvador')"
                icon="format_color_fill"
                color="blue-10"
                size="md"
                ><q-tooltip>blu</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('freedom')"
                dense
                flat
                @click="changeColor('freedom')"
                icon="format_color_fill"
                color="pink-13"
                size="md"
                ><q-tooltip>freedom</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('cyber')"
                dense
                flat
                @click="changeColor('cyber')"
                icon="format_color_fill"
                color="light-green-9"
                size="md"
                ><q-tooltip>cyber</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('flamingo')"
                dense
                flat
                @click="changeColor('flamingo')"
                icon="format_color_fill"
                color="pink-3"
                size="md"
                ><q-tooltip>flamingo</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- nostr -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline>Link wallet</q-item-label>
            <q-item-label caption
              >Use Nostr Wallet Connect (NWC) to control your wallet from any
              other application.</q-item-label
            >
          </q-item-section>
        </q-item>
        <!-- use a q-toggle to turn nwc on and off -->
        <q-item>
          <q-toggle
            v-model="enableNwc"
            label="Enable Nostr Wallet Connect"
            color="primary"
          />
        </q-item>
        <!-- <q-item>
          <q-btn
            v-if="false"
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            @click="listenToNWCCommands()"
            >Link wallet</q-btn
          >
        </q-item> -->
        <q-item v-if="enableNwc">
          <q-item-section>
            <!-- <q-item-label overline>Connections</q-item-label> -->
            <q-item-label caption
              >These are active connections to your wallet. Note: You can only
              use NWC for payments from your Bitcoin balance. Payments will be
              made from your active mint.
            </q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="enableNwc">
          <q-item
            v-for="connection in connections"
            :key="connection.connectionString"
          >
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="content_copy"
                @click="copyText(connection.connectionString)"
                size="1.3em"
                color="grey"
                class="q-mr-sm cursor-pointer"
                ><q-tooltip>Copy connection string</q-tooltip></q-icon
              >
            </q-item-section>
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="qr_code"
                @click="showNWCEntry(connection.connectionString)"
                size="1.3em"
                color="grey"
                class="q-mr-sm cursor-pointer"
              >
                <q-tooltip>Show QR code</q-tooltip>
              </q-icon>
            </q-item-section>
            <q-item-section>
              <!-- <q-item-label
                caption
                clickable
                style="word-break: break-word"
                @click="showNWCEntry(connection.connectionString)"
                >********************</q-item-label
              > -->
              <!-- input for allowanceleft -->
              <q-input
                type="number"
                outlined
                rounded
                dense
                v-model="connection.allowanceLeft"
                label="Allowance left (sat)"
              >
              </q-input>
              <!-- <q-btn
                flat
                dense
                @click="showNWCEntry(connection.connectionString)"
                >Show qr code
                <q-icon
                  name="qr_code"
                  @click="showNWCEntry(connection.connectionString)"
                  size="1em"
                  color="grey"
                  class="q-ml-sm cursor-pointer"
              /></q-btn> -->
            </q-item-section>
            <!-- <q-item-section side>
              <q-badge
                v-if="connection.allowanceLeft"
                :label="connection.allowanceLeft"
                color="primary"
              />
            </q-item-section> -->
            <!-- <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.05em"
            >
              <q-icon
                name="qr_code"
                @click="showNWCEntry(connection.connectionString)"
                size="1.3em"
                color="grey"
                class="q-mr-xs cursor-pointer"
              />
            </q-item-section> -->
          </q-item>
          <!-- <q-item v-if="false">
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            @click="initNdk"
            >Link to extension</q-btn
          >
        </q-item> -->
        </div>
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
                      >Remove spent proofs</q-btn
                    ></row
                  ><row>
                    <q-item-label class="q-px-sm" caption
                      >Check if the ecash tokens from your active mints are
                      spent and remove the spent ones from your wallet. Only use
                      this if your wallet is stuck.
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
                      >Open the Javascript debug terminal. Never paste anything
                      into this terminal that you don't understand. A thief
                      might try to trick you into pasting malicious code here.
                    </q-item-label>
                  </row>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <row>
                    <q-btn dense flat outline click @click="exportActiveProofs">
                      Export active proofs
                    </q-btn></row
                  ><row>
                    <q-item-label class="q-px-sm" caption
                      >Copy your entire balance from the active mint as a Cashu
                      token into your clipboard. This will only export the
                      tokens from the selected mint and unit. For a full export,
                      select a different mint and unit and export again.
                    </q-item-label>
                  </row>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <row>
                    <!-- add a caption, not a button here -->
                    <q-item-label class="q-pb-sm"
                      >Increment keyset counters</q-item-label
                    ></row
                  >
                  <row>
                    <q-item-label class="q-px-sm" caption
                      >Click the keyset ID to increment the derivation path
                      counters for the keysets in your wallet. This is useful if
                      you see the "outputs have already been signed" error.
                    </q-item-label>
                  </row>
                  <row class="q-pa-sm">
                    <q-btn
                      v-for="(counter, id) in keysetCounters"
                      :key="id"
                      dense
                      flat
                      click
                      @click="increaseKeysetCounter(counter.id, 1)"
                      >{{ counter.id }} - {{ counter.counter }}</q-btn
                    >
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

  <!-- P2PK DIALOG -->
  <P2PKDialog v-model="showP2PKDialog" />

  <!-- NWC DIALOG -->
  <NWCDialog v-model="showNWCDialog" />
</template>
<script>
import { defineComponent } from "vue";
import P2PKDialog from "./P2PKDialog.vue";
import NWCDialog from "./NWCDialog.vue";

import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { map } from "underscore";
import { currentDateStr } from "src/js/utils";
import { useSettingsStore } from "src/stores/settings";
import { useNostrStore } from "src/stores/nostr";
import { useP2PKStore } from "src/stores/p2pk";
import { useNWCStore } from "src/stores/nwc";
import { useWorkersStore } from "src/stores/workers";
import { useProofsStore } from "src/stores/proofs";

export default defineComponent({
  name: "SettingsView",
  mixins: [windowMixin],
  components: {
    P2PKDialog,
    NWCDialog,
  },
  props: {},
  data: function () {
    return {
      themes: [
        "monochrome",
        "classic",
        "bitcoin",
        "mint",
        "autumn",
        "salvador",
        "freedom",
        "cyber",
        "flamingo",
      ],
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
    ...mapWritableState(useP2PKStore, ["showP2PKDialog"]),
    ...mapWritableState(useNWCStore, ["showNWCDialog", "showNWCData"]),
    ...mapState(useMintsStore, ["activeMintUrl", "mints", "activeProofs"]),
    ...mapState(useNostrStore, ["pubkey", "mintRecommendations"]),
    ...mapState(useWalletStore, ["mnemonic"]),
    ...mapWritableState(useWalletStore, ["keysetCounters"]),
    ...mapWritableState(useMintsStore, [
      "addMintData",
      "showAddMintDialog",
      "showRemoveMintDialog",
    ]),
    ...mapWritableState(useNWCStore, ["nwcEnabled", "connections"]),
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
    enableNwc: {
      get() {
        return this.nwcEnabled;
      },
      set(value) {
        this.nwcEnabled = value;
      },
    },
  },
  watch: {
    enableNwc: function () {
      if (this.enableNwc) {
        this.listenToNWCCommands();
      } else {
        this.unsubscribeNWC();
      }
    },
  },
  methods: {
    ...mapActions(useNostrStore, [
      "init",
      "connect",
      "getUserPubkey",
      "fetchEventsFromUser",
      "fetchMints",
    ]),
    ...mapActions(useNWCStore, [
      "generateNWCConnection",
      "listenToNWCCommands",
      "unsubscribeNWC",
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
      "melt",
      "requestMint",
      "increaseKeysetCounter",
    ]),
    ...mapActions(useWorkersStore, ["invoiceCheckWorker"]),
    ...mapActions(useProofsStore, ["serializeProofs"]),
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
    showNWCEntry: async function (connectionString) {
      this.showNWCData.connectionString = connectionString;
      this.showNWCDialog = true;
    },
    exportActiveProofs: async function () {
      // export active proofs
      const token = await this.serializeProofs(this.activeProofs);
      this.copyText(token);
    },
  },
  created: function () {},
});
</script>
