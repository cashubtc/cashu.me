<template>
  <div class="row q-col-gutter-y-md justify-center q-pt-sm q-pb-md">
    <div class="col-12 col-sm-11 col-md-8 text-center q-gutter-y-md">
      <NoMintWarnBanner v-if="mints.length == 0" />
      <BalanceView
        v-else
        :ticker-short="tickerShort"
        :ticker-dollar="tickerDollar"
        :pending-balance="pendingBalance"
        :check-pending-tokens="checkPendingTokens"
        :set-tab="setTab"
      />

      <!-- ECASH BUTTONS  -->
      <q-card class="q-mt-xs">
        <q-card-section class="q-pt-sm">
          <div class="row items-center no-wrap q-mb-sm">
            <div class="col-6 col-sm-5 col-md-4 q-pr-xs">
              <q-btn
                size="1.0rem"
                rectangle
                unelevated
                dense
                color="primary"
                align="between"
                icon="file_download"
                icon-right="toll"
                class="full-width"
                @click="showReceiveTokensDialog"
                >Receive Ecash</q-btn
              >
            </div>
            <div class="col-0 col-sm-2 col-md-4"></div>
            <div class="col-6 col-sm-5 col-md-4 q-pl-xs">
              <q-btn
                size="1.0rem"
                rectangle
                unelevated
                dense
                align="between"
                color="primary"
                icon="file_upload"
                icon-right="toll"
                class="full-width"
                @click="showSendTokensDialog"
              >
                Send Ecash</q-btn
              >
            </div>
          </div>
          <div class="row items-center no-wrap q-mb-none">
            <div class="col-6 col-sm-5 col-md-4 q-pr-xs">
              <q-btn
                size="1.0rem"
                rectangle
                unelevated
                dense
                align="between"
                color="secondary"
                icon="file_download"
                icon-right="bolt"
                class="full-width"
                @click="showInvoiceCreateDialog"
              >
                <strong class="gt-lg"> Create Lightning Invoice </strong>
                <strong class="gt-xs lt-xl"> Create Invoice </strong>
                <strong class="lt-sm"> LN Invoice </strong>
              </q-btn>
            </div>
            <div class="col-0 col-sm-2 col-md-4"></div>
            <div class="col-6 col-sm-5 col-md-4 q-pl-xs">
              <q-btn
                size="1.0rem"
                rectangle
                unelevated
                dense
                align="between"
                color="secondary"
                icon="file_upload"
                icon-right="bolt"
                class="full-width"
                @click="showParseDialog"
              >
                <strong class="gt-lg"> Pay Lightning Invoice </strong>
                <strong class="gt-xs lt-xl"> Pay Invoice </strong>
                <strong class="lt-sm"> Pay LN </strong>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <!-- ///////////////////////////////////////////
                ////////////////// TABLES /////////////////
                /////////////////////////////////////////// -->
          <q-tabs v-model="tab" no-caps class="bg-dark text-white">
            <q-tab name="history" label="History"></q-tab>
            <q-tab name="invoices" label="Invoices"></q-tab>
            <!-- <q-tab name="tokens" label="Tokens"></q-tab> -->
            <q-tab name="settings" label="Settings"></q-tab>
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <!-- ////////////////// HISTORY LIST ///////////////// -->

            <q-tab-panel name="history">
              <HistoryTable
                :history-tokens="historyTokens"
                :show-token-dialog="showTokenDialog"
                :check-token-spendable="checkTokenSpendable"
              />
            </q-tab-panel>

            <!-- ////////////////// INVOICE LIST ///////////////// -->

            <q-tab-panel name="invoices">
              <InvoicesTable
                :invoice-history="invoiceHistory"
                :show-invoice-info-dialog="showInvoicInfoDialog"
                :check-invoice="checkInvoice"
              />
            </q-tab-panel>

            <!-- ////////////////////// SETTINGS ////////////////// -->

            <q-tab-panel name="settings" class="q-px-sm">
              <SettingsView
                :ticker-short="tickerShort"
                :request-mint="requestMint"
                :decode-request="decodeRequest"
                :melt="melt"
                :invoice-check-worker="invoiceCheckWorker"
                :pay-invoice-data="payInvoiceData"
                :show-mint-dialog="this.addMintDialog.show"
                :mint-to-add-wallet-page="this.addMintDialog.mintToAdd"
              />
            </q-tab-panel>
            <!-- ////////////////// TOKEN LIST ///////////////// -->

            <!-- <q-tab-panel name="tokens">
              <q-table
                dense
                flat
                :rows="getTokenList()"
                :columns="tokensTable.columns"
                no-data-label="There are no tokens here yet"
                :filter="tokensTable.filter"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td
                      key="value"
                      :props="props"
                      :class="
                        props.row.value > 0
                          ? 'text-green-13 text-weight-bold'
                          : ''
                      "
                    >
                      <div>{{ props.row.value }}</div>
                    </q-td>
                    <q-td key="count" :props="props">
                      <div>{{ props.row.count }}</div>
                    </q-td>
                    <q-td key="sum" :props="props">
                      <div>{{ props.row.sum }}</div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-tab-panel> -->
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <!-- LIGHTNING BUTTONS  -->

      <div style="margin-bottom: 7rem">
        <div class="row q-pt-sm">
          <div class="col-4 q-pt-none">
            <!-- <q-btn
              class="full-width gt-sm"
              size="1.0rem"
              icon-right="bolt"
              icon="file_download"
              align="between"
              rectangle
              color="orange"
              @click="showInvoiceCreateDialog"
              ><strong>Create Invoice</strong>
            </q-btn> -->
          </div>
          <!-- <div class="col-4"></div> -->
          <div class="col-4 q-pt-xs">
            <div align="center">
              <q-btn
                class="q-mx-xs q-px-sm q-my-sm"
                size="0.6rem"
                rectangle
                color="warning"
                icon="warning"
                outline
                @click="showDisclaimerDialog"
                ><q-tooltip>Warning</q-tooltip></q-btn
              >
              <q-btn
                class="q-mx-xs q-px-sm q-my-sm"
                size="0.6rem"
                outline
                rectangle
                color="warning"
                icon="download_for_offline"
                @click="getLocalstorageToFile"
                ><q-tooltip>Download wallet backup</q-tooltip></q-btn
              >
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

          <div class="col-4 q-pt-none">
            <!-- <q-btn
              class="full-width gt-sm"
              @click="showParseDialog"
              size="1.0rem"
              icon-right="bolt"
              icon="file_upload"
              align="between"
              rectangle
              color="orange"
              ><strong>Pay Invoice</strong>
            </q-btn> -->
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM LIGHTNING BUTTONS -->

    <!-- disable bottom bar if dialogs are shown -->
    <div
      class="q-col-gutter"
      v-if="
        !welcomeDialog.show &&
        !showSendTokens &&
        !showInvoiceDetails &&
        !showReceiveTokens &&
        !payInvoiceData.show &&
        !disclaimerDialog.show &&
        !camera.show
      "
    >
      <q-tabs
        class="lt-md fixed-bottom q-px-none q-py-md left-0 right-0 bg-primary text-white shadow-2 z-top q-px-0"
        indicator-color="transparent"
        align="justify"
      >
        <q-tab
          class="col-5"
          label="Create Invoice"
          icon="file_download"
          @click="showInvoiceCreateDialog"
        >
        </q-tab>
        <q-tab
          class="col-2 q-pb-md"
          icon="photo_camera"
          v-if="hasCamera"
          @click="showCamera"
        >
        </q-tab>
        <q-tab
          class="col-5"
          icon="file_upload"
          @click="showParseDialog"
          label="Pay Invoice"
        >
        </q-tab>
      </q-tabs>
    </div>

    <!-- DIALOGS  -->

    <!-- INPUT PARSER  -->
    <PayInvoiceDialog v-model="payInvoiceData.show" />

    <!-- QR CODE SCANNER  -->

    <q-dialog v-model="camera.show">
      <q-card>
        <div class="text-center">
          <QrcodeReader @decode="decodeQR" />
        </div>
        <div class="row q-mt-lg">
          <q-btn @click="closeCamera" flat color="grey" class="q-ml-auto"
            >Cancel</q-btn
          >
        </div>
      </q-card>
    </q-dialog>

    <!-- WELCOME DIALOG  -->
    <WelcomeDialog
      :welcome-dialog="welcomeDialog"
      :trigger-pwa-install="triggerPwaInstall"
      :set-tab="setTab"
      :get-pwa-display-mode="getPwaDisplayMode"
      :set-welcome-dialog-seen="setWelcomeDialogSeen"
    />

    <!-- WARNING DIAGLOG  -->

    <q-dialog v-model="disclaimerDialog.show">
      <q-card class="q-pa-lg">
        <h6 class="q-my-md text-primary">Warning</h6>
        <p>
          <strong>Bookmark this page and backup your tokens!</strong>
          Ecash is a bearer asset. Losing access to this wallet will mean you
          will lose your funds. This wallet stores ecash tokens locally on your
          device. If you lose the link or delete your your data without backing
          up, you will lose your tokens. Press the Backup button to download a
          copy of your tokens.
        </p>
        <p>
          <strong>Where is my old wallet</strong>
          This wallet was previously running on
          https://legend.lnbits.com/cashu/wallet but has since moved to
          https://wallet.cashu.me. Send all tokens from the old wallet to this
          one.
        </p>
        <p>
          <strong>Add to home screen.</strong>
          You can add Cashu to your home screen as a progressive web app (PWA).
          On Android Chrome, click the hamburger menu at the upper right. On iOS
          Safari, click the share button. Now press the Add to Home screen
          button.
        </p>
        <p>
          <strong>This software is in BETA!</strong> We hold no responsibility
          for people losing access to funds. Use at your own risk!
        </p>
        <div class="row q-mt-lg">
          <q-btn
            outline
            color="grey"
            @click="copyText(disclaimerDialog.location.href)"
            >Copy wallet URL</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto"
            >I understand</q-btn
          >
        </div>
      </q-card>
    </q-dialog>

    <!-- INVOICE DETAILS  -->
    <InvoiceDetailDialog
      v-model="showInvoiceDetails"
      :invoice-check-worker="invoiceCheckWorker"
    />

    <!-- SEND TOKENS DIALOG  -->
    <SendTokenDialog
      v-model="showSendTokens"
      :check-token-spendable-worker="checkTokenSpendableWorker"
    />

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
import SettingsView from "components/SettingsView.vue";
import InvoicesTable from "components/InvoicesTable.vue";
import HistoryTable from "components/HistoryTable.vue";
import NoMintWarnBanner from "components/NoMintWarnBanner.vue";
import WelcomeDialog from "components/WelcomeDialog.vue";
import SendTokenDialog from "components/SendTokenDialog.vue";
import PayInvoiceDialog from "components/PayInvoiceDialog.vue";
import InvoiceDetailDialog from "components/InvoiceDetailDialog.vue";

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
import { currentDateStr } from "src/js/utils";

import ReceiveTokenDialog from "src/components/ReceiveTokenDialog.vue";

export default {
  mixins: [windowMixin],
  components: {
    BalanceView,
    SettingsView,
    InvoicesTable,
    HistoryTable,
    NoMintWarnBanner,
    WelcomeDialog,
    SendTokenDialog,
    ReceiveTokenDialog,
    PayInvoiceDialog,
    InvoiceDetailDialog,
  },
  data: function () {
    return {
      name: "",
      mintId: "",
      mintName: "",
      deferredPWAInstallPrompt: null,
      tab: "history",
      receive: {
        show: false,
        status: "pending",
        paymentReq: null,
        paymentHash: null,
        minMax: [0, 2100000000000000],
        lnurl: null,
        units: ["sat"],
        unit: "sat",
        data: {
          amount: null,
          memo: "",
        },
      },
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
      disclaimerDialog: {
        show: false,
        location: window.location,
        base_url: location.protocol + "//" + location.host + location.pathname,
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
    ...mapWritableState(useUiStore, ["showInvoiceDetails"]),
    ...mapState(useUiStore, ["tickerShort"]),
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
    ...mapWritableState(useCameraStore, ["camera"]),
    pendingPaymentsExist: function () {
      return this.payments.findIndex((payment) => payment.pending) !== -1;
    },

    balance: function () {
      return this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    pendingBalance: function () {
      return -this.historyTokens
        .filter((t) => t.status == "pending")
        .reduce((sum, el) => (sum += el.amount), 0);
    },
  },
  filters: {
    msatoshiFormat: function (value) {
      return LNbits.utils.formatSat(value / 1000);
    },
  },
  methods: {
    ...mapActions(useProofsStore, [
      "serializeProofs",
      "getProofsMint",
      "serializeProofsV2",
      "sumProofs",
      "deleteProofs",
    ]),
    ...mapActions(useMintsStore, [
      "activateMint",
      "addMint",
      "assertMintError",
      "getBalance",
      "setActiveProofs",
      "setMintToAdd",
      "setProofs",
      "setShowAddMintDialog",
      "getKeysForKeyset",
    ]),
    ...mapActions(useWorkersStore, [
      "clearAllWorkers",
      "invoiceCheckWorker",
      "checkTokenSpendableWorker",
    ]),
    ...mapActions(useTokensStore, [
      "addPaidToken",
      "addPendingToken",
      "setTokenPaid",
    ]),
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
    ]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera", "hasCamera"]),
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
    showReceiveDialog: function () {
      this.receive.show = true;
      this.receive.status = "pending";
      this.receive.paymentReq = null;
      this.receive.paymentHash = null;
      this.receive.data.amount = null;
      this.receive.data.memo = null;
      this.receive.unit = "sat";
      this.receive.paymentChecker = null;
      this.receive.minMax = [0, 2100000000000000];
      this.receive.lnurl = null;
      this.focusInput("setAmount");
    },
    showParseDialog: function () {
      this.payInvoiceData.show = true;
      this.payInvoiceData.invoice = null;
      this.payInvoiceData.lnurlpay = null;
      this.payInvoiceData.domain = "";
      this.payInvoiceData.lnurlauth = null;
      this.payInvoiceData.data.request = "";
      this.payInvoiceData.data.comment = "";
      this.payInvoiceData.data.paymentChecker = null;
      this.camera.show = false;
      this.focusInput("pasteInput");
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
      this.setTab("settings");

      // if a wallet has been restored the "cashu.activeMintUrl" is not null
      if (!!localStorage.getItem("cashu.activeMintUrl")) {
        window.location.reload();
      }
    },
    setTab: function (to) {
      this.tab = to;
    },
    showDisclaimerDialog: function () {
      this.disclaimerDialog.show = true;
    },

    closeReceiveDialog: function () {
      setTimeout(() => {
        clearInterval(this.receive.paymentChecker);
      }, 10000);
    },
    decodeQR: function (res) {
      this.camera.data = res;
      // this.payInvoiceData.data.request = res
      this.decodeRequest();
      this.camera.show = false;
    },
    payInvoice: function () {
      let dismissPaymentMsg = this.$q.notify({
        timeout: 0,
        message: "Processing payment...",
        position: "top",
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
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
      this.checkTokenSpendableWorker();
    },
    showSendTokensDialog: function () {
      console.log("##### showSendTokensDialog");
      this.sendData.tokens = "";
      this.sendData.tokensBase64 = "";
      this.sendData.amount = "";
      this.sendData.memo = "";
      this.showSendTokens = true;
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
    registerLocalStorageSyncHook: function () {
      // makes sure that local storage stays up to date
      // in multiple tabs of the same window
      window.addEventListener("storage", (e) => {
        // console.log(`Key Changed: ${e.key}`)
        // console.log(`New Value: ${e.newValue}`)
        // if these were the proofs, reload them
        if (e.key == "cashu.proofs") {
          console.log("updating proofs");
          this.setProofs(JSON.parse(e.newValue));
        }
        // if these were the activeMintUrl, reload
        if (e.key == "cashu.activeMintUrl") {
          this.activateMint(e.newValue);
        }
      });
    },

    ////////////// STORAGE /////////////

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

    migrationLocalstorage: async function () {
      // migration from old db to multimint
      for (var key in localStorage) {
        let match = key.match("cashu.(.+).proofs");
        if (match != null) {
          console.log("Migrating mint", match[1]);
          let mint_id = match[1];
          const old_proofs = JSON.parse(
            localStorage.getItem(`cashu.${mint_id}.proofs`)
          );
          if (old_proofs) {
            this.setProofs(this.proofs.concat(old_proofs));
            // this.storeProofs();
            let mint_url = this.baseHost + `/cashu/api/v1/${mint_id}`;
            console.log("Adding mint", mint_url);
            await this.addMint(mint_url);
            localStorage.removeItem(`cashu.${mint_id}.proofs`);
          }
        }
      }
    },
  },
  watch: {},

  mounted: function () {},

  created: async function () {
    let params = new URL(document.location).searchParams;

    // mint url
    if (params.get("mint")) {
      let activeMintUrl = params.get("mint");
      // await this.addMint(activeMintUrl);
      await this.setTab("settings");
      this.addMintDialog.mintToAdd = activeMintUrl;
      this.showAddMintDialog = true;
      // this.addMintDialog.show = true;
    }

    if (params.get("mint_id")) {
      this.mintId = params.get("mint_id");
      // works with only lnbits mints
      let activeMintUrl =
        location.protocol +
        "//" +
        location.host +
        `/cashu/api/v1/${this.mintId}`;
      this.walletURL = this.baseURL + "?mint_id=" + this.mintId;
      await this.addMint(activeMintUrl);
    }
    if (localStorage.getItem("cashu.activeMintUrl")) {
      if (!this.activeMintUrl) {
        this.walletURL = this.baseURL;
      }
      let activeMintUrl = localStorage.getItem("cashu.activeMintUrl");
      // we'll force the activation of the mint for the migration
      // from without a pinia store
      await this.activateMint(activeMintUrl, false, true);
    } else {
      this.setTab("settings");
    }

    // todo: remove:
    if (!this.mintId.length) {
      this.mintId = "dummy";
    }

    console.log("Mint URL " + this.activeMintUrl);
    console.log("Wallet URL " + this.walletURL);

    const startupMintUrl = this.activeMintUrl;

    // get name
    if (params.get("mint_name")) {
      this.mintName = params.get("mint_name");
    }

    // run migrations
    await this.migrationLocalstorage();

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
      this.payInvoiceData.data.request = params.get("lightning");
    }

    // Clear all parameters from URL without refreshing the page
    window.history.pushState(
      {},
      document.title,
      window.location.href.split("?")[0]
    );

    // startup tasks
    // await this.checkProofsSpendable(this.activeProofs, true).catch((err) => {
    //   return;
    // });
    await this.checkPendingInvoices().catch((err) => {
      return;
    });
    // await this.checkPendingTokens().catch((err) => {
    //   return;
    // });

    // reset to the mint from settings after workers have run
    if (startupMintUrl.length > 0) {
      await this.activateMint(startupMintUrl);
    }

    // Local storage sync hook
    this.registerLocalStorageSyncHook();

    // PWA install hook
    this.registerPWAEventHook();

    // show welcome dialog
    this.showWelcomeDialog();
  },
  // })
};
</script>
