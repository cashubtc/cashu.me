<template>
  <div class="row q-col-gutter-y-md justify-center q-pt-sm q-pb-md">
    <div class="col-12 col-sm-11 col-md-8 text-center q-gutter-y-md">
      <NoMintWarnBanner v-if="mints.length == 0" />
      <BalanceView v-else :set-tab="setTab" />
      <div
        class="row items-center justify-center no-wrap q-mb-none q-mx-none q-px-none q-pt-lg q-pb-md"
      >
        <div class="col-5 q-mb-md">
          <q-btn
            rounded
            dense
            class="q-px-md"
            style="width: 140px"
            color="primary"
            @click="showSendDialog = true"
            size="1.2rem"
          >
            <q-icon name="north_east" size="1.2rem" class="q-mr-xs" />
            Send</q-btn
          >
        </div>

        <div class="col-2 q-mb-md q-mx-none">
          <q-btn
            align="center"
            size="lg"
            icon="qr_code_scanner"
            outline
            color="primary"
            flat
            @click="showCamera"
          />
        </div>
        <!-- button to showSendDialog -->
        <div class="col-5 q-mb-md">
          <q-btn
            rounded
            dense
            class="q-px-md"
            color="primary"
            style="width: 140px"
            @click="showReceiveDialog = true"
            size="1.2rem"
          >
            <q-icon name="south_west" size="1.2rem" class="q-mr-xs" />
            Receive</q-btn
          >
        </div>
        <ReceiveDialog v-model="showReceiveDialog" />
        <SendDialog v-model="showSendDialog" />
      </div>
      <!-- ///////////////////////////////////////////
      ////////////////// TABLES /////////////////
      /////////////////////////////////////////// -->
      <q-expansion-item expand-icon-class="hidden" v-model="expandHistory">
        <template v-slot:header="{ expanded }">
          <q-item-section class="item-center text-center">
            <span
              ><q-icon
                color="primary"
                :name="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            /></span>
          </q-item-section>
        </template>
        <q-tabs
          v-model="tab"
          no-caps
          :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        >
          <q-tab name="history" class="text-secondary" label="History"></q-tab>
          <q-tab
            name="invoices"
            class="text-secondary"
            label="Invoices"
          ></q-tab>
          <!-- <q-tab name="tokens" label="Tokens"></q-tab> -->
          <q-tab name="mints" class="text-secondary" label="Mints"></q-tab>
        </q-tabs>

        <q-tab-panels
          :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
          v-model="tab"
          animated
        >
          <!-- ////////////////// HISTORY LIST ///////////////// -->

          <q-tab-panel name="history">
            <HistoryTable
              :show-token-dialog="showTokenDialog"
              :check-token-spendable="checkTokenSpendable"
            />
          </q-tab-panel>

          <!-- ////////////////// INVOICE LIST ///////////////// -->

          <q-tab-panel name="invoices">
            <InvoicesTable :check-invoice="checkInvoice" />
          </q-tab-panel>

          <!-- ////////////////////// SETTINGS ////////////////// -->

          <q-tab-panel name="mints" class="q-px-sm">
            <MintSettings />
          </q-tab-panel>
        </q-tab-panels>
      </q-expansion-item>
      <!-- LIGHTNING BUTTONS  -->

      <div style="margin-bottom: 0rem">
        <div class="row q-pt-sm">
          <div class="col-12 q-pt-xs">
            <q-btn
              class="q-mx-xs q-px-sm q-my-sm"
              outline
              size="0.6rem"
              v-if="
                getPwaDisplayMode() == 'browser' &&
                deferredPWAInstallPrompt != null
              "
              color="primary"
              @click="triggerPwaInstall()"
              ><b>Install</b><q-tooltip>Install Cashu</q-tooltip></q-btn
            >
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM LIGHTNING BUTTONS -->

    <!-- DIALOGS  -->

    <!-- INPUT PARSER  -->
    <PayInvoiceDialog v-model="payInvoiceData.show" />

    <!-- QR CODE SCANNER  -->
    <q-dialog v-model="camera.show" backdrop-filter="blur(2px) brightness(60%)">
      <QrcodeReader @decode="decodeQR" />
    </q-dialog>

    <!-- WELCOME DIALOG  -->
    <WelcomeDialog
      :welcome-dialog="welcomeDialog"
      :trigger-pwa-install="triggerPwaInstall"
      :set-tab="setTab"
      :get-pwa-display-mode="getPwaDisplayMode"
      :set-welcome-dialog-seen="setWelcomeDialogSeen"
    />

    <!-- INVOICE DETAILS  -->
    <InvoiceDetailDialog
      v-model="showInvoiceDetails"
      :invoice-check-worker="invoiceCheckWorker"
    />

    <!-- SEND TOKENS DIALOG  -->
    <SendTokenDialog v-model="showSendTokens" />

    <!-- RECEIVE TOKENS DIALOG  -->
    <ReceiveTokenDialog v-model="showReceiveTokens" />
  </div>
</template>
<style>
* {
  touch-action: manipulation;
}

.keypad {
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.keypad .btn {
  height: 100%;
}

.keypad .btn-confirm {
  grid-area: 1 / 4 / 5 / 4;
}
</style>
<script>
import { date } from "quasar";
import * as _ from "underscore";
import { shortenString } from "src/js/string-utils";
import token from "src/js/token";

// Vue components
import BalanceView from "components/BalanceView.vue";
import MintSettings from "components/MintSettings.vue";
import InvoicesTable from "components/InvoicesTable.vue";
import HistoryTable from "components/HistoryTable.vue";
import NoMintWarnBanner from "components/NoMintWarnBanner.vue";
import WelcomeDialog from "components/WelcomeDialog.vue";
import SendTokenDialog from "components/SendTokenDialog.vue";
import PayInvoiceDialog from "components/PayInvoiceDialog.vue";
import InvoiceDetailDialog from "components/InvoiceDetailDialog.vue";
import SendDialog from "components/SendDialog.vue";
import ReceiveDialog from "components/ReceiveDialog.vue";
import QrcodeReader from "components/QrcodeReader.vue";
import P2PKDialog from "components/P2PKDialog.vue";
import NWCDialog from "components/NWCDialog.vue";

// pinia stores
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "src/stores/mints";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWorkersStore } from "src/stores/workers";
import { useTokensStore } from "src/stores/tokens";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useProofsStore } from "src/stores/proofs";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { useNWCStore } from "src/stores/nwc";

import ReceiveTokenDialog from "src/components/ReceiveTokenDialog.vue";

export default {
  mixins: [windowMixin],
  components: {
    BalanceView,
    MintSettings,
    InvoicesTable,
    HistoryTable,
    NoMintWarnBanner,
    WelcomeDialog,
    SendTokenDialog,
    ReceiveTokenDialog,
    PayInvoiceDialog,
    InvoiceDetailDialog,
    QrcodeReader,
    SendDialog,
    ReceiveDialog,
  },
  data: function () {
    return {
      name: "",
      mintId: "",
      mintName: "",
      deferredPWAInstallPrompt: null,
      action: "main",
      parse: {
        show: false,
        invoice: null,
        lnurlpay: null,
        lnurlauth: null,
        data: {
          request: "",
          amount: 0,
          comment: "",
        },
        paymentChecker: null,
        camera: {
          show: false,
          camera: "auto",
        },
      },
      payments: [],
      paymentsChart: {
        show: false,
      },
      welcomeDialog: {
        show: false,
      },
      addMintDialog: {
        show: false,
        mintToAdd: "".replace(/\s+/g, ""),
      },
      baseHost: location.protocol + "//" + location.host,
      baseURL: location.protocol + "//" + location.host + location.pathname,
      credit: 0,
      newName: "",
    };
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "showInvoiceDetails",
      "tab",
      "showSendDialog",
      "showReceiveDialog",
    ]),
    ...mapState(useUiStore, ["tickerShort"]),
    ...mapWritableState(useUiStore, ["expandHistory"]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useSendTokensStore, ["showSendTokens", "sendData"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "keys",
      "mints",
      "proofs",
      "activeMint",
    ]),
    ...mapWritableState(useWalletStore, [
      "invoiceHistory",
      "invoiceData",
      "payInvoiceData",
    ]),
    ...mapWritableState(useMintsStore, ["showAddMintDialog"]),
    ...mapWritableState(useWorkersStore, [
      "invoiceCheckListener",
      "tokensCheckSpendableListener",
    ]),
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapWritableState(useCameraStore, ["camera", "hasCamera"]),
    ...mapWritableState(useP2PKStore, ["showP2PKDialog"]),
    ...mapWritableState(useNWCStore, ["showNWCDialog", "nwcEnabled"]),
    pendingPaymentsExist: function () {
      return this.payments.findIndex((payment) => payment.pending) !== -1;
    },

    balance: function () {
      return this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
  },
  filters: {},
  methods: {
    ...mapActions(useProofsStore, [
      "serializeProofs",
      "getProofsMint",
      "serializeProofsV2",
      "sumProofs",
      "deleteProofs",
    ]),
    ...mapActions(useMintsStore, [
      "activateMintUrl",
      "addMint",
      "assertMintError",
      "getBalance",
      "setActiveProofs",
      "setProofs",
      "setShowAddMintDialog",
      "getKeysForKeyset",
    ]),
    ...mapActions(useWorkersStore, [
      "clearAllWorkers",
      "invoiceCheckWorker",
      "checkTokenSpendableWorker",
    ]),
    ...mapActions(useTokensStore, ["setTokenPaid"]),
    ...mapActions(useWalletStore, [
      "requestMint",
      "setInvoicePaid",
      "mint",
      "melt",
      "checkProofsSpendable",
      "checkTokenSpendable",
      "checkInvoice",
      "checkPendingInvoices",
      "checkPendingTokens",
      "decodeRequest",
      "generateNewMnemonic",
    ]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    ...mapActions(useNWCStore, ["listenToNWCCommands"]),
    // TOKEN METHODS
    decodeToken: function (encoded_token) {
      try {
        return token.decode(encoded_token);
      } catch (e) {
        return null;
      }
    },
    getProofs: function (decoded_token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token) {
      return token.getMint(decoded_token);
    },
    //
    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },
    getTokenList: function () {
      const amounts = this.activeProofs.map((t) => t.amount);
      const counts = {};

      for (const num of amounts) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      }
      return Object.keys(counts).map((k) => ({
        value: parseInt(k),
        count: parseInt(counts[k]),
        sum: k * counts[k],
      }));
    },

    paymentTableRowKey: function (row) {
      return row.payment_hash + row.amount;
    },
    showChart: function () {
      this.paymentsChart.show = true;
      this.$nextTick(() => {
        generateChart(this.$refs.canvas, this.payments);
      });
    },
    focusInput(el) {
      // TODO: fix this
      // this.$nextTick(() => this.$refs[el].focus());
    },
    showParseDialog: function () {
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.input.request = "";
      this.payInvoiceData.input.comment = "";
      this.payInvoiceData.input.paymentChecker = null;
      this.camera.show = false;
      this.focusInput("parseDialogInput");
    },
    showWelcomeDialog: function () {
      if (localStorage.getItem("cashu.welcomeDialogSeen") != "seen") {
        this.welcomeDialog.show = true;
      }
    },
    setWelcomeDialogSeen: function () {
      localStorage.setItem("cashu.welcomeDialogSeen", "seen");
      this.welcomeDialog.show = false;
      // switch to settings tab
      this.setTab("mints");

      // if a wallet has been restored the "cashu.activeMintUrl" is not null
      if (!!localStorage.getItem("cashu.activeMintUrl")) {
        window.location.reload();
      }
    },
    setTab: function (to) {
      this.tab = to;
    },
    decodeQR: function (res) {
      this.camera.data = res;
      this.camera.show = false;
      this.decodeRequest(res);
    },
    /////////////////////////////////// WALLET ///////////////////////////////////
    showInvoiceCreateDialog: async function () {
      console.log("##### showInvoiceCreateDialog");
      this.invoiceData.amount = "";
      this.invoiceData.bolt11 = "";
      this.invoiceData.hash = "";
      this.invoiceData.memo = "";
      this.showInvoiceDetails = true;
    },

    showInvoicInfoDialog: function (data) {
      console.log("##### showInvoicInfoDialog");
      this.invoiceData = _.clone(data);
      this.showInvoiceDetails = true;
      // kick off invoice check worker
      this.invoiceCheckWorker();
    },

    showTokenDialog: function (tokensBase64) {
      console.log("##### showTokenDialog");
      this.sendData.tokens = this.getProofs(this.decodeToken(tokensBase64));
      this.sendData.tokensBase64 = _.clone(tokensBase64);
      this.showSendTokens = true;
      // kick off token check worker
      // this.checkTokenSpendableWorker(tokensBase64);
    },
    showSendTokensDialog: function () {
      console.log("##### showSendTokensDialog");
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.amount = "";
      this.sendData.memo = "";
      this.showSendTokens = true;
    },
    hideSendTokensDialog: function () {
      this.showSendTokens = false;
    },
    showReceiveTokensDialog: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
    },

    //////////////////////// MINT //////////////////////////////////////////

    // ////////////// UI HELPERS //////////////

    ////////////// WORKERS //////////////

    ////////////// UI HELPERS /////////////
    registerPWAEventHook: function () {
      // register event listener for PWA install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent the mini-infobar from appearing on mobile
        // e.preventDefault()
        // Stash the event so it can be triggered later.
        this.deferredPWAInstallPrompt = e;
        console.log(
          `'beforeinstallprompt' event was fired.`,
          this.getPwaDisplayMode()
        );
      });
    },
    getPwaDisplayMode: function () {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      if (document.referrer.startsWith("android-app://")) {
        return "twa";
      } else if (navigator.standalone || isStandalone) {
        return "standalone";
      }
      return "browser";
    },
    triggerPwaInstall: function () {
      // Show the install prompt
      this.deferredPWAInstallPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          this.setWelcomeDialogSeen();
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    },
    registerBroadcastChannel: function () {
      // register broadcast channel to communicate between tabs
      const channel = new BroadcastChannel("app_channel");
      channel.postMessage("new_tab_opened");
      channel.onmessage = (event) => {
        console.log("Message from another tab:", event.data);
        if (event.data == "new_tab_opened") {
          // if another tab is opened, respond with "already_running"
          channel.postMessage("already_running");
        }
        if (event.data == "already_running") {
          // if another tab is already running, navigate to /already-running
          window.location.href = "/already-running";
        }
      };
    },
    // registerLocalStorageSyncHook: function () {
    //   // receives events if other tabs change local storage
    //   window.addEventListener("storage", (e) => {
    //     // console.log(`Key Changed: ${e.key}`);
    //     // console.log(`New Value: ${e.newValue}`);
    //     // if these were the proofs, reload them
    //     // if (e.key == "cashu.proofs") {
    //     //   console.log("updating proofs");
    //     //   this.setProofs(JSON.parse(e.newValue));
    //     // }
    //     // // if these were the activeMintUrl, reload
    //     // if (e.key == "cashu.activeMintUrl") {
    //     //   this.activateMintUrl(e.newValue);
    //     // }
    //   });
    // },
  },
  watch: {},

  mounted: function () {},

  created: async function () {
    let params = new URL(document.location).searchParams;

    // mint url
    if (params.get("mint")) {
      let activeMintUrl = params.get("mint");
      await this.setTab("mints");
      this.addMintDialog.mintToAdd = activeMintUrl;
      this.showAddMintDialog = true;
    }
    if (!localStorage.getItem("cashu.activeMintUrl")) {
      this.setTab("mints");
    }

    console.log("Mint URL " + this.activeMintUrl);
    console.log("Wallet URL " + this.baseURL);

    // get token to receive tokens from a link
    if (params.get("token")) {
      let tokenBase64 = params.get("token");
      // make sure to react only to tokens not in the users history
      let seen = false;
      for (var i = 0; i < this.historyTokens.length; i++) {
        var thisToken = this.historyTokens[i].token;
        if (thisToken == tokenBase64 && this.historyTokens[i].amount > 0) {
          seen = true;
        }
      }
      if (!seen) {
        // show receive token dialog
        this.receiveData.tokensBase64 = params.get("token");
        this.showReceiveTokens = true;
      }
    }

    // get lightning invoice from a link
    if (params.get("lightning")) {
      this.showParseDialog();
      this.payInvoiceData.input.request = params.get("lightning");
    }

    // Clear all parameters from URL without refreshing the page
    window.history.pushState(
      {},
      document.title,
      window.location.href.split("?")[0]
    );

    // startup tasks

    // check if another tab is open
    this.registerBroadcastChannel();

    // // Local storage sync hook
    // this.registerLocalStorageSyncHook();

    // PWA install hook
    this.registerPWAEventHook();

    // generate new mnemonic
    this.generateNewMnemonic();

    // show welcome dialog
    this.showWelcomeDialog();

    // listen to NWC commands if enabled
    if (this.nwcEnabled) {
      this.listenToNWCCommands();
    }
  },
};
</script>
