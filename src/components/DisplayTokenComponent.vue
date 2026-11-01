<template>
  <div class="display-token-fullscreen">
    <!-- Header -->
    <FullscreenDialogHeader @close="closeCardScanner">
      <template #title>
        <q-item-label class="sheet-title">
          {{
            $t(
              sendData.historyToken.amount && sendData.historyToken.amount < 0
                ? sendData.historyToken.status === "paid"
                  ? "DisplayTokenComponent.title.sent"
                  : "DisplayTokenComponent.title.send"
                : "DisplayTokenComponent.title.received"
            )
          }}</q-item-label
        >
      </template>
      <template #actions>
        <AppMenu
          testid="token-more"
          :label="$t('global.actions.more_options.label')"
          :items="menuItems"
          @select="onMenuSelect"
        />
      </template>
    </FullscreenDialogHeader>
    <!-- Content area -->
    <div class="content-area">
      <q-card-section class="q-pa-none">
        <div v-if="qrCodeFragment" class="row justify-center q-mb-md">
          <div class="col-12 q-px-md">
            <QrBlock :value="qrCodeFragment" :width="600" @click="copyTokens" />
            <QrProgress :active="runnerActive" />
            <!-- The animated QR's own settings sit with the QR they change (owner 2026-10-29,
                 item 36), not between the details and the footer. -->
            <div v-if="showAnimatedQR" class="qr-settings row justify-center">
              <TonalChip @click="changeSpeed">
                <template #icon><GaugeIcon :size="18" /></template>
                {{
                  $t("DisplayTokenComponent.qr_speed", {
                    value: $t(
                      `DisplayTokenComponent.speed.${
                        { F: "fast", M: "medium", S: "slow" }[
                          fragmentSpeedLabel
                        ]
                      }`
                    ),
                  })
                }}
              </TonalChip>
              <!-- Density: how much of the token each animated frame carries, not the QR's
                   size on screen. -->
              <TonalChip @click="changeSize">
                <template #icon><Grid3x3Icon :size="18" /></template>
                {{
                  $t("DisplayTokenComponent.qr_density", {
                    value: $t(
                      `DisplayTokenComponent.density.${
                        { L: "high", M: "medium", S: "low" }[
                          fragmentLengthLabel
                        ]
                      }`
                    ),
                  })
                }}
              </TonalChip>
            </div>
          </div>
        </div>
        <q-card-section class="q-pa-none">
          <div class="row justify-center q-pt-none">
            <TokenInformation
              show-token
              :encodedToken="sendData.tokensBase64"
              :payment-request-id="sendData.historyToken?.paymentRequestId"
            />
          </div>
          <FlowColumn v-if="sendData.paymentRequest" class="q-px-md q-pt-md">
            <PaymentRequestInfo :request="sendData.paymentRequest" />
          </FlowColumn>
          <FlowColumn
            v-if="sendData.historyToken?.meltQuote"
            class="q-px-md q-pt-md"
          >
            <MeltQuoteInformation
              :melt-quote="sendData.historyToken.meltQuote"
              :invoice="sendData.historyToken"
              :mint-url="sendData.historyToken.mint"
              :history-paid-at="sendData.historyToken.paidDate"
              :show-amount="false"
            />
          </FlowColumn>
          <div
            v-if="
              sendData.paymentRequest &&
              sendData.historyToken &&
              sendData.historyToken.amount < 0 &&
              sendData.historyToken.status === 'pending'
            "
            class="row justify-center q-pt-sm"
          >
            <FlowColumn class="q-px-md"><SendPaymentRequest /></FlowColumn>
          </div>
        </q-card-section>
      </q-card-section>
    </div>
    <!-- Fixed bottom panel with copy button -->
    <FlowFooter>
      <q-btn
        class="full-width"
        unelevated
        color="primary"
        rounded
        data-testid="copy-ecash-token"
        @click="copyTokens"
      >
        {{ copyButtonLabel }}
      </q-btn>
    </FlowFooter>
  </div>
  <ConfirmDialog
    v-model="showDeleteDialog"
    danger
    :title="$t('DisplayTokenComponent.delete_dialog.title')"
    :note="
      $t('DisplayTokenComponent.delete_dialog.text') +
      ' ' +
      $t('DisplayTokenComponent.delete_dialog.warning')
    "
    :confirm-label="$t('common.delete')"
    @confirm="deleteThisToken"
  />
</template>
<script lang="ts">
import FlowColumn from "src/components/ui/FlowColumn.vue";
import TonalChip from "src/components/ui/TonalChip.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import AppMenu, { type AppMenuItem } from "src/components/ui/AppMenu.vue";
import ConfirmDialog from "src/components/ui/ConfirmDialog.vue";
import { defineComponent } from "vue";
import { Buffer } from "buffer";
import { UR, UREncoder } from "@gandlaf21/bc-ur";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { useUiStore } from "src/stores/ui";
import { useCameraStore } from "src/stores/camera";
import { useSettingsStore } from "src/stores/settings";
import { useTokensStore } from "src/stores/tokens";
import { useMintsStore } from "src/stores/mints";
import TokenInformation from "components/TokenInformation.vue";
import QrBlock from "src/components/QrBlock.vue";
import QrProgress from "src/components/QrProgress.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import MeltQuoteInformation from "components/MeltQuoteInformation.vue";
import SendPaymentRequest from "./SendPaymentRequest.vue";
import PaymentRequestInfo from "./PaymentRequestInfo.vue";
import { getDecodedToken, getEncodedTokenBinary } from "@cashu/cashu-ts";
import { sumProofAmounts } from "src/js/proofs";
import token from "src/js/token";
import { notifyCopied, notifyError, notifySuccess } from "src/js/notify";
import { copyToClipboard } from "quasar";
import {
  Gauge as GaugeIcon,
  Link as LinkIcon,
  Nfc as NfcIcon,
  Nut as NutIcon,
  ScanLine as ScanIcon,
  Share as ShareIcon,
  Trash2 as Trash2Icon,
  Grid3x3 as Grid3x3Icon,
} from "lucide-vue-next";

declare const windowMixin: any;

// Emoji a token can be copied inside. Each is a single code point with emoji presentation
// on its own: one that carries its own variation selector (❤️) would add a byte to the token.
const TOKEN_EMOJIS = [
  "🥜",
  "🌰",
  "🥥",
  "🍫",
  "🍪",
  "🍩",
  "🍿",
  "🍕",
  "🌮",
  "🍺",
  "🎁",
  "🎉",
  "💸",
  "💰",
  "🪙",
  "🧡",
  "🔥",
  "🚀",
  "⚡",
  "🍀",
  "🌈",
  "🦄",
  "🐸",
  "👻",
];

export default defineComponent({
  name: "DisplayTokenComponent",
  mixins: [windowMixin],
  components: {
    FlowColumn,
    TonalChip,
    FlowFooter,
    AppMenu,
    ConfirmDialog,
    GaugeIcon,
    Grid3x3Icon,
    TokenInformation,
    QrBlock,
    QrProgress,
    FullscreenDialogHeader,
    MeltQuoteInformation,
    SendPaymentRequest,
    PaymentRequestInfo,
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
      scanningCard: false,
      showDeleteDialog: false,
      copyButtonCopied: false,
      copyButtonTimeout: null as any,
    };
  },
  computed: {
    ...mapWritableState(useSendTokensStore, ["showSendTokens", "sendData"]),
    ...mapWritableState(useCameraStore, ["hasCamera"]),
    ...mapState(useUiStore, ["ndefSupported", "webShareSupported"]),
    ...mapState(useTransactionWorkerStore, ["outgoingPayments"]),
    ...mapState(useSettingsStore, ["nfcEncoding"]),
    menuItems(): AppMenuItem[] {
      const outgoing =
        !this.sendData.paymentRequest && this.sendData.historyAmount < 0;
      const items: (AppMenuItem | false)[] = [
        {
          key: "emoji",
          icon: NutIcon,
          label: this.$t("SendTokenDialog.actions.copy_emoji.tooltip_text"),
          testid: "copy-emoji",
          // The screen reader speaks each emoji's own name in the reader's language.
          grid: TOKEN_EMOJIS.map((glyph) => ({
            key: glyph,
            glyph,
            label: glyph,
          })),
        },
        this.webShareSupported && {
          key: "share",
          icon: ShareIcon,
          label: this.$t("SendTokenDialog.actions.share.tooltip_text"),
        },
        {
          key: "link",
          icon: LinkIcon,
          label: this.$t("SendTokenDialog.actions.copy_link.tooltip_text"),
        },
        this.hasCamera &&
          outgoing && {
            key: "scan",
            icon: ScanIcon,
            label: this.$t("global.actions.scan.label"),
          },
        this.ndefSupported &&
          outgoing && {
            key: "nfc",
            icon: NfcIcon,
            label: this.$t(
              "SendTokenDialog.actions.write_tokens_to_card.tooltips.ndef_supported_text"
            ),
          },
        {
          key: "delete",
          icon: Trash2Icon,
          danger: true,
          testid: "delete-token",
          label: this.$t("SendTokenDialog.actions.delete.tooltip_text"),
        },
      ];
      return items.filter((item): item is AppMenuItem => Boolean(item));
    },
    // display helpers
    sumProofs: function () {
      return token.decodeMeta(this.sendData.tokensBase64)?.amount ?? 0;
    },
    displayUnit: function () {
      const display = this.formatCurrency(this.sumProofs, this.tokenUnit);
      return display;
    },
    tokenUnit: function () {
      const decoded = token.decodeMeta(this.sendData.tokensBase64);
      return decoded ? token.getUnit(decoded) : "";
    },
    paidFees: function () {
      return this.sumProofs - Math.abs(this.sendData.historyAmount ?? 0);
    },
    runnerActive: function () {
      return this.outgoingPayments.some(
        (entry) =>
          entry.type === "token" && entry.id === this.sendData.tokensBase64
      );
    },
    copyButtonLabel: function () {
      if (this.copyButtonCopied) {
        return this.$t("common.copied");
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
      const tokenObj = token.decodeMeta(val);
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
    },
  },
  methods: {
    ...mapActions(useTransactionWorkerStore, [
      "removeOutgoingTokenFromChecker",
    ]),
    ...mapActions(useTokensStore, ["deleteToken"]),
    ...mapActions(useCameraStore, ["showCamera"]),
    copyUsingMixin(text: string) {
      (this as any).copyText(text);
    },
    onMenuSelect(key: string) {
      if (key.startsWith("emoji:")) {
        this.copyUsingMixin(
          this.encodeToEmoji(this.sendData.tokensBase64, key.slice(6))
        );
        return;
      }
      switch (key) {
        case "share":
          this.shareToken();
          break;
        case "link":
          this.copyUsingMixin(
            this.baseURL + "#token=" + this.sendData.tokensBase64
          );
          break;
        case "scan":
          this.showCamera();
          break;
        case "nfc":
          if (this.scanningCard) this.closeCardScanner();
          else this.writeTokensToCard();
          break;
        case "delete":
          this.closeCardScanner();
          this.showDeleteDialog = true;
          break;
      }
    },
    initQr: function () {
      const val = this.sendData?.tokensBase64;
      this.showAnimatedQR = false;
      if (!val?.length) {
        this.qrCodeFragment = "";
        return;
      }
      const tokenObj = token.decodeMeta(val);
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
      this.qrCodeFragment = this.encoder.nextPart();
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
    // The token rides on the emoji as variation selectors (any emoji works, the receiver
    // reads only the selectors), one per byte.
    encodeToEmoji: function (tokenStr: string, emoji = "🥜") {
      return (
        emoji +
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
                notifyError(
                  `${error?.message || error}`,
                  this.$t("DisplayTokenComponent.nfc.read_failed")
                );
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
                    case "binary": {
                      const decoded = getDecodedToken(
                        this.sendData.tokensBase64,
                        useMintsStore().allMintKeysets.map((k) => k.id)
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
                    }
                    default:
                      throw new Error(
                        `Unknown NFC encoding: ${this.nfcEncoding}`
                      );
                  }
                  notifySuccess(this.$t("DisplayTokenComponent.nfc.writing"));
                  this.ndef
                    .write({ records: records }, { overwrite: true })
                    .then(() => {
                      notifySuccess(
                        this.$t("DisplayTokenComponent.nfc.success")
                      );
                    })
                    .catch((err: any) => {
                      console.error(
                        `NFC write failed: The card may not have enough capacity (needed ${records[0].data.length} bytes).`
                      );
                      notifyError(
                        this.$t("DisplayTokenComponent.nfc.capacity", {
                          bytes: records[0].data.length,
                        }),
                        this.$t("DisplayTokenComponent.nfc.write_failed")
                      );
                    });
                } catch (err: any) {
                  console.error(`NFC error: ${err?.message}`);
                  notifyError(
                    `${err?.message}`,
                    this.$t("DisplayTokenComponent.nfc.error")
                  );
                }
              };
              this.scanningCard = true;
            })
            .catch((error: any) => {
              console.error(`NFC error: ${error?.message}`);
              notifyError(
                `${error?.message}`,
                this.$t("DisplayTokenComponent.nfc.error")
              );
              this.scanningCard = false;
            });
        } catch (error: any) {
          console.error(`NFC error: ${error?.message}`);
          notifyError(
            `${error?.message}`,
            this.$t("DisplayTokenComponent.nfc.error")
          );
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
      const tokenToDelete = this.sendData.tokensBase64;
      this.removeOutgoingTokenFromChecker(tokenToDelete);
      this.deleteToken(tokenToDelete);
      this.showSendTokens = false;
      this.showDeleteDialog = false;
    },
    copyTokens: async function () {
      try {
        await copyToClipboard(this.sendData.tokensBase64);
        notifyCopied();
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
/* Wraps to two centred rows in long locales. */
.qr-settings {
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.content-area {
  max-width: var(--app-column);
  width: 100%;
  margin: 0 auto;
}
</style>
