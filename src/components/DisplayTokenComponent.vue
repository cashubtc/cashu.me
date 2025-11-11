<template>
  <div
    :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
    class="display-token-fullscreen"
  >
    <!-- Header -->
    <div class="row items-center q-pa-md" style="position: relative">
      <q-btn
        v-close-popup
        flat
        round
        icon="close"
        color="grey"
        class="floating-close-btn"
        @click="closeCardScanner"
      />
      <div class="col text-center fixed-title-height">
        <div v-show="!showExpandedButtons">
          <q-item-label
            overline
            class="q-mt-sm text-white"
            style="font-size: 1rem"
          >
            {{
              sendData.historyToken.amount && sendData.historyToken.amount < 0
                ? sendData.historyToken.status === "paid"
                  ? "Sent"
                  : "Pending"
                : "Received"
            }}
            Ecash</q-item-label
          >
        </div>
      </div>
      <!-- Floating actions (expandable) -->
      <div class="floating-actions">
        <div class="row no-wrap items-center">
          <div
            v-if="showExpandedButtons"
            class="row no-wrap items-center q-gutter-xs justify-end q-mr-sm"
          >
            <q-btn
              class="q-mx-xs q-pb-sm"
              size="md"
              flat
              dense
              @click="copyUsingMixin(encodeToPeanut(sendData.tokensBase64))"
            >
              <NutIcon :size="16" />

              <q-tooltip>{{
                $t("SendTokenDialog.actions.copy_emoji.tooltip_text")
              }}</q-tooltip>
            </q-btn>

            <q-btn
              v-if="webShareSupported"
              class="q-mx-xs q-pb-sm"
              size="md"
              dense
              flat
              @click="shareToken"
            >
              <ShareIcon :size="16" />
              <q-tooltip>{{
                $t("SendTokenDialog.actions.share.tooltip_text")
              }}</q-tooltip>
            </q-btn>

            <q-btn
              class="q-mx-none"
              size="md"
              dense
              icon="link"
              flat
              @click="
                copyUsingMixin(baseURL + '#token=' + sendData.tokensBase64)
              "
              ><q-tooltip>{{
                $t("SendTokenDialog.actions.copy_link.tooltip_text")
              }}</q-tooltip></q-btn
            >
            <q-btn
              unelevated
              dense
              size="md"
              class="q-mx-xs"
              v-if="
                hasCamera &&
                !sendData.paymentRequest &&
                sendData.historyAmount < 0
              "
              @click="showCamera"
            >
              <ScanIcon :size="16" />
            </q-btn>
            <q-btn
              unelevated
              dense
              v-if="
                ndefSupported &&
                !sendData.paymentRequest &&
                sendData.historyAmount < 0
              "
              :disabled="scanningCard"
              :loading="scanningCard"
              class="q-mx-xs"
              size="md"
              @click="writeTokensToCard"
              flat
            >
              <NfcIcon :size="16" />
              <q-tooltip>{{
                ndefSupported
                  ? $t(
                      "SendTokenDialog.actions.write_tokens_to_card.tooltips.ndef_supported_text"
                    )
                  : $t(
                      "SendTokenDialog.actions.write_tokens_to_card.tooltips.ndef_unsupported_text"
                    )
              }}</q-tooltip>
              <template v-slot:loading>
                <q-spinner @click="closeCardScanner" />
              </template>
            </q-btn>
            <q-btn
              class="q-mx-none"
              dense
              color="negative"
              icon="delete"
              size="sm"
              @click="
                showDeleteDialog = true;
                closeCardScanner();
              "
              flat
            >
              <q-tooltip>{{
                $t("SendTokenDialog.actions.delete.tooltip_text")
              }}</q-tooltip>
            </q-btn>
          </div>
          <q-btn
            class="q-mx-none"
            size="md"
            flat
            dense
            @click="toggleExpandButtons"
          >
            <q-icon
              name="more_horiz"
              :color="showExpandedButtons ? 'primary' : 'grey'"
            />
          </q-btn>
        </div>
      </div>
    </div>
    <!-- Content area -->
    <div class="content-area">
      <q-card-section class="q-pa-none">
        <div v-if="qrCodeFragment" class="row justify-center q-mb-md">
          <div class="col-12 col-sm-11 col-md-8 q-px-md">
            <q-responsive :ratio="1" class="q-mx-none">
              <vue-qrcode
                :value="qrCodeFragment"
                :options="{ width: 600, height: 600 }"
                class="rounded-borders"
                style="width: 100%; height: 100%"
                @click="copyTokens"
              >
              </vue-qrcode>
            </q-responsive>
            <div style="height: 2px">
              <q-linear-progress
                v-if="runnerActive"
                indeterminate
                color="primary"
              />
            </div>
          </div>
        </div>
        <div class="row justify-center q-pb-xs q-ba-none">
          <div
            class="col-12 col-sm-11 col-md-8 q-px-md"
            style="max-width: 600px; position: relative"
          >
            <div class="row justify-center items-center no-wrap">
              <div class="q-gutter-sm">
                <q-btn
                  v-if="showAnimatedQR"
                  flat
                  style="font-size: 10px"
                  color="grey"
                  class="q-ma-none"
                  @click="changeSpeed"
                >
                  <q-icon name="speed" style="margin-right: 8px"></q-icon>
                  Speed: {{ fragmentSpeedLabel }}
                </q-btn>
                <q-btn
                  v-if="showAnimatedQR"
                  flat
                  style="font-size: 10px"
                  class="q-ma-none"
                  color="grey"
                  @click="changeSize"
                >
                  <q-icon name="zoom_in" style="margin-right: 8px"></q-icon>
                  Size: {{ fragmentLengthLabel }}
                </q-btn>
              </div>
            </div>
          </div>
        </div>
        <q-card-section class="q-pa-sm">
          <div class="row justify-center q-pt-lg">
            <TokenInformation
              :encodedToken="sendData.tokensBase64"
              :payment-request-id="sendData.historyToken?.paymentRequestId"
            />
          </div>
          <div
            v-if="sendData.paymentRequest"
            class="row justify-center q-pt-md"
          >
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <PaymentRequestInfo :request="sendData.paymentRequest" />
            </div>
          </div>
          <div
            v-if="sendData.historyToken?.meltQuote"
            class="row justify-center q-pt-md"
          >
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
              <MeltQuoteInformation
                :melt-quote="sendData.historyToken.meltQuote"
                :invoice="sendData.historyToken"
                :mint-url="sendData.historyToken.mint"
                :history-paid-at="sendData.historyToken.paidDate"
                :show-amount="false"
              />
            </div>
          </div>
          <div
            v-if="
              sendData.paymentRequest &&
              sendData.historyToken &&
              sendData.historyToken.amount < 0 &&
              sendData.historyToken.status === 'pending'
            "
            class="row justify-center q-pt-sm"
          >
            <SendPaymentRequest />
          </div>
        </q-card-section>
      </q-card-section>
    </div>
    <!-- Fixed bottom panel with copy button -->
    <div class="bottom-panel">
      <div class="row justify-center q-pb-md q-pt-sm">
        <div class="col-12 col-sm-11 col-md-8 q-px-md" style="max-width: 600px">
          <q-btn
            class="full-width"
            unelevated
            size="lg"
            color="primary"
            rounded
            @click="copyTokens"
          >
            {{ copyButtonLabel }}
          </q-btn>
        </div>
      </div>
    </div>
  </div>
  <!-- popup dialog to confirm deletion -->
  <q-dialog v-model="showDeleteDialog">
    <q-card class="q-pa-lg q-pt-md qcard">
      <q-card-section class="q-pa-none">
        <div class="row items-center no-wrap q-mb-sm">
          <div class="col-12">
            <span class="text-h6">Delete Ecash</span>
          </div>
        </div>
        <div class="row items-center no-wrap q-my-sm q-py-none">
          <div class="col-12">
            <q-item-label>
              Are you sure you want to delete this transaction from your
              history?
            </q-item-label>
            <q-item-label class="q-pt-md text-weight-bold">
              Warning: This action cannot be undone and there is no way to
              recover the token.
            </q-item-label>
          </div>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            @click="deleteThisToken"
            color="negative"
            rounded
            class="q-mr-sm"
            >Delete</q-btn
          >
          <q-btn v-close-popup rounded flat color="grey" class="q-ml-auto"
            >Cancel</q-btn
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Buffer } from "buffer";
import { UR, UREncoder } from "@gandlaf21/bc-ur";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useWorkersStore } from "src/stores/workers";
import { useUiStore } from "src/stores/ui";
import { useCameraStore } from "src/stores/camera";
import { useSettingsStore } from "src/stores/settings";
import { useTokensStore } from "src/stores/tokens";
import TokenInformation from "components/TokenInformation.vue";
import MeltQuoteInformation from "components/MeltQuoteInformation.vue";
import SendPaymentRequest from "./SendPaymentRequest.vue";
import PaymentRequestInfo from "./PaymentRequestInfo.vue";
import {
  getDecodedToken,
  getEncodedTokenBinary,
  getEncodedToken,
  getEncodedTokenV4,
} from "@cashu/cashu-ts";
import token from "src/js/token";
import { notifyError, notifySuccess } from "src/js/notify";
import { copyToClipboard } from "quasar";
import {
  Scan as ScanIcon,
  Nfc as NfcIcon,
  Share as ShareIcon,
  Nut as NutIcon,
} from "lucide-vue-next";

declare const windowMixin: any;

export default defineComponent({
  name: "DisplayTokenComponent",
  mixins: [windowMixin],
  components: {
    TokenInformation,
    MeltQuoteInformation,
    SendPaymentRequest,
    PaymentRequestInfo,
    ScanIcon,
    NfcIcon,
    ShareIcon,
    NutIcon,
  },
  data: function () {
    return {
      baseURL: location.protocol + "//" + location.host + location.pathname,
      showAnimatedQR: false,
      qrCodeFragment: "",
      qrInterval: null as any,
      encoder: null as any,
      // animated QR params
      currentFragmentLength: 150,
      fragmentLengthMedium: 100,
      fragmentLengthShort: 50,
      fragmentLengthLong: 150,
      fragmentLengthLabel: "L",
      currentFragmentInterval: 150,
      fragmentIntervalMedium: 250,
      fragmentIntervalFast: 150,
      framentInervalSlow: 500,
      fragmentSpeedLabel: "F",
      isV4Token: false,
      scanningCard: false,
      showExpandedButtons: false,
      showDeleteDialog: false,
      copyButtonCopied: false,
      copyButtonTimeout: null as any,
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, ["showSendTokens", "sendData"]),
    ...mapWritableState(useCameraStore, ["hasCamera"]),
    ...mapState(useUiStore, ["ndefSupported", "webShareSupported"]),
    ...mapState(useWorkersStore, ["tokenWorkerRunning"]),
    ...mapState(useSettingsStore, ["nfcEncoding"]),
    // display helpers
    sumProofs: function () {
      let proofs = token.getProofs(token.decode(this.sendData.tokensBase64));
      return proofs.flat().reduce((sum, el) => (sum += el.amount), 0);
    },
    displayUnit: function () {
      let display = this.formatCurrency(this.sumProofs, this.tokenUnit);
      return display;
    },
    tokenUnit: function () {
      let unit = token.getUnit(token.decode(this.sendData.tokensBase64));
      return unit;
    },
    paidFees: function () {
      return this.sumProofs - Math.abs(this.sendData.historyAmount);
    },
    runnerActive: function () {
      return this.tokenWorkerRunning;
    },
    copyButtonLabel: function () {
      if (this.copyButtonCopied) {
        return "Copied";
      }
      return this.$t("SendTokenDialog.actions.copy_tokens.label");
    },
  },
  watch: {
    "sendData.tokensBase64": function (val: string) {
      this.showAnimatedQR = false;
      if (!val?.length) {
        return;
      }
      const tokenObj = token.decode(val);
      const proofs = tokenObj.proofs || [];
      if (!proofs.length) {
        return;
      } else if (proofs.length <= 2) {
        this.qrCodeFragment = val;
      } else {
        this.showAnimatedQR = true;
        this.qrCodeFragment = "";
        this.startQrCodeLoop();
      }
      this.isV4Token = val.startsWith("cashuB");
    },
  },
  methods: {
    ...mapActions(useWorkersStore, ["clearAllWorkers"]),
    ...mapActions(useTokensStore, ["deleteToken"]),
    ...mapActions(useCameraStore, ["showCamera"]),
    copyUsingMixin(text: string) {
      (this as any).copyText(text);
    },
    toggleExpandButtons() {
      this.showExpandedButtons = !this.showExpandedButtons;
    },
    initQr: function () {
      const val = this.sendData?.tokensBase64;
      this.showAnimatedQR = false;
      if (!val?.length) {
        this.qrCodeFragment = "";
        return;
      }
      const tokenObj = token.decode(val);
      const proofs = tokenObj.proofs || [];
      if (!proofs.length) {
        this.qrCodeFragment = "";
        return;
      } else if (proofs.length <= 2) {
        this.qrCodeFragment = val;
      } else {
        this.showAnimatedQR = true;
        this.qrCodeFragment = "";
        this.startQrCodeLoop();
      }
      this.isV4Token = val.startsWith("cashuB");
    },
    startQrCodeLoop: async function () {
      if (this.sendData.tokensBase64.length == 0) {
        return;
      }
      const messageBuffer = Buffer.from(this.sendData.tokensBase64);
      const ur = UR.fromBuffer(messageBuffer);
      const firstSeqNum = 0;
      this.encoder = new UREncoder(ur, this.currentFragmentLength, firstSeqNum);
      clearInterval(this.qrInterval);
      this.qrInterval = setInterval(() => {
        this.qrCodeFragment = this.encoder.nextPart();
      }, this.currentFragmentInterval);
    },
    updateQrCode: function () {
      this.qrCodeFragment = this.encoder.nextPart();
    },
    changeSpeed: function () {
      if (this.currentFragmentInterval == this.fragmentIntervalMedium) {
        this.currentFragmentInterval = this.framentInervalSlow;
        this.fragmentSpeedLabel = "S";
      } else if (this.currentFragmentInterval == this.framentInervalSlow) {
        this.currentFragmentInterval = this.fragmentIntervalFast;
        this.fragmentSpeedLabel = "F";
      } else {
        this.currentFragmentInterval = this.fragmentIntervalMedium;
        this.fragmentSpeedLabel = "M";
      }
      this.startQrCodeLoop();
    },
    changeSize: function () {
      if (this.currentFragmentLength == this.fragmentLengthMedium) {
        this.currentFragmentLength = this.fragmentLengthShort;
        this.fragmentLengthLabel = "S";
      } else if (this.currentFragmentLength == this.fragmentLengthShort) {
        this.currentFragmentLength = this.fragmentLengthLong;
        this.fragmentLengthLabel = "L";
      } else {
        this.currentFragmentLength = this.fragmentLengthMedium;
        this.fragmentLengthLabel = "M";
      }
      this.startQrCodeLoop();
    },
    toggleTokenEncoding: function () {
      const decodedToken = getDecodedToken(this.sendData.tokensBase64);
      if (this.sendData.tokensBase64.startsWith("cashuA")) {
        try {
          this.sendData.tokensBase64 = getEncodedTokenV4(decodedToken);
        } catch {
          this.sendData.tokensBase64 = getEncodedToken(decodedToken, {
            version: 3,
          });
        }
      } else {
        this.sendData.tokensBase64 = getEncodedToken(decodedToken, {
          version: 3,
        });
      }
    },
    encodeToPeanut: function (tokenStr: string) {
      return (
        "🥜" +
        Array.from(tokenStr)
          .map((char) => {
            const byteValue = char.charCodeAt(0);
            if (byteValue >= 0 && byteValue <= 15) {
              return String.fromCodePoint(0xfe00 + byteValue);
            }
            if (byteValue >= 16 && byteValue <= 255) {
              return String.fromCodePoint(0xe0100 + (byteValue - 16));
            }
            return "";
          })
          .join("")
      );
    },
    shareToken: async function () {
      if (!this.webShareSupported) {
        return;
      }
      const shareData = {
        text: `cashu:${this.sendData.tokensBase64}`,
      };
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Error sharing token:", error);
        }
      }
    },
    writeTokensToCard: function () {
      if (!this.scanningCard) {
        try {
          // @ts-ignore
          this.ndef = new NDEFReader();
          // @ts-ignore
          this.controller = new AbortController();
          const signal = this.controller.signal;
          this.ndef
            .scan({ signal })
            .then(() => {
              this.ndef.onreadingerror = (error: any) => {
                console.error(`NFC read failed: ${error}`);
                notifyError(`${error?.message || error}`, "NFC read failed");
                this.controller.abort();
                this.scanningCard = false;
              };

              this.ndef.onreading = ({ message, serialNumber }: any) => {
                this.controller.abort();
                this.scanningCard = false;
                try {
                  let records: any[] = [];
                  switch (this.nfcEncoding) {
                    case "text":
                      records = [
                        {
                          recordType: "text",
                          data: `${this.sendData.tokensBase64}`,
                          lang: "en",
                        },
                      ];
                      break;
                    case "weburl":
                      records = [
                        {
                          recordType: "url",
                          data: `${window.location}#token=${this.sendData.tokensBase64}`,
                        },
                      ];
                      break;
                    case "binary":
                      const decoded = getDecodedToken(
                        this.sendData.tokensBase64
                      );
                      const data = getEncodedTokenBinary(decoded);
                      records = [
                        {
                          recordType: "mime",
                          mediaType: "application/octet-stream",
                          data: data,
                        },
                      ];
                      break;
                    default:
                      throw new Error(
                        `Unknown NFC encoding: ${this.nfcEncoding}`
                      );
                  }
                  notifySuccess("Writing to NFC card...");
                  this.ndef
                    .write({ records: records }, { overwrite: true })
                    .then(() => {
                      notifySuccess("Successfully flashed token to card!");
                    })
                    .catch((err: any) => {
                      console.error(
                        `NFC write failed: The card may not have enough capacity (needed ${records[0].data.length} bytes).`
                      );
                      notifyError(
                        `The card may not have enough capacity (needed ${records[0].data.length} bytes).`,
                        "NFC write failed"
                      );
                    });
                } catch (err: any) {
                  console.error(`NFC error: ${err?.message}`);
                  notifyError(`${err?.message}`, "NFC error");
                }
              };
              this.scanningCard = true;
            })
            .catch((error: any) => {
              console.error(`NFC error: ${error?.message}`);
              notifyError(`${error?.message}`, "NFC error");
              this.scanningCard = false;
            });
        } catch (error: any) {
          console.error(`NFC error: ${error?.message}`);
          notifyError(`${error?.message}`, "NFC error");
          this.scanningCard = false;
        }
      }
    },
    closeCardScanner: function () {
      // @ts-ignore
      this.controller?.abort?.();
      this.scanningCard = false;
    },
    deleteThisToken: function () {
      this.deleteToken(this.sendData.tokensBase64);
      this.showSendTokens = false;
      this.showDeleteDialog = false;
      this.clearAllWorkers();
    },
    copyTokens: async function () {
      try {
        await copyToClipboard(this.sendData.tokensBase64);
        this.copyButtonCopied = true;
        // Clear any existing timeout
        if (this.copyButtonTimeout) {
          clearTimeout(this.copyButtonTimeout);
        }
        // Reset button label after 3 seconds
        this.copyButtonTimeout = setTimeout(() => {
          this.copyButtonCopied = false;
        }, 3000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    },
  },
  mounted() {
    this.initQr();
  },
  beforeUnmount() {
    clearInterval(this.qrInterval);
    if (this.copyButtonTimeout) {
      clearTimeout(this.copyButtonTimeout);
    }
  },
});
</script>
<style scoped>
.display-token-fullscreen {
  height: 100vh; /* fallback */
  height: 100dvh; /* account for mobile browser UI */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content-area {
  flex: 1;
  overflow-y: auto;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}
.floating-close-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
.floating-actions {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}
.fixed-title-height {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  position: sticky;
  bottom: 0;
  z-index: 2;
}
</style>
