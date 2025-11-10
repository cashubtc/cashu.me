<template>
  <q-dialog
    v-model="showReceiveTokens"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    @keydown.esc="showReceiveTokens = false"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <!-- full-screen receive flow -->
      <div
        class="column fit receive-fullscreen"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
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
          />
          <div class="col text-center fixed-title-height">
            <q-item-label
              overline
              class="q-mt-sm"
              :class="$q.dark.isActive ? 'text-white' : 'text-black'"
              style="font-size: 1rem"
            >
              {{ $t("ReceiveTokenDialog.title") }}
            </q-item-label>
          </div>
        </div>

        <!-- Content area -->
        <div
          class="col column items-center justify-start q-px-lg scroll-container"
        >
          <div class="row justify-center full-width">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-sm q-mb-sm"
              style="max-width: 600px"
            >
              <!-- <div class="row items-center no-wrap q-pb-sm">
                <div class="col-12">
                  <span class="text-h6">{{
                    $t("ReceiveTokenDialog.title", {
                      value:
                        tokenAmount && tokenUnit
                          ? formatCurrency(tokenAmount - receiveFee, tokenUnit)
                          : $t("ReceiveTokenDialog.title_ecash_text"),
                    })
                  }}</span>
                  <span
                    v-if="
                      tokenAmount &&
                      tokenUnit &&
                      tokenUnit == 'sat' &&
                      bitcoinPrice
                    "
                    class="q-ml-xs text-subtitle2 text-grey-6"
                  >
                    ({{
                      formatCurrency(
                        (currentCurrencyPrice / 100000000) * tokenAmount,
                        bitcoinPriceCurrency,
                        true
                      )
                    }})
                  </span>
                </div>
              </div> -->

              <transition appear enter-active-class="animated fadeIn">
                <div v-if="tokenDecodesCorrectly" key="token-valid">
                  <!-- VALID TOKEN content -->
                  <!-- print token in fixed width font -->
                  <div class="row q-pt-md">
                    <div class="col-12">
                      <TokenStringRender
                        :token-string="receiveData.tokensBase64"
                        :max-length="maxLengthForTokenString"
                      />
                    </div>
                  </div>

                  <div class="row q-pt-md">
                    <div class="col-12">
                      <TokenInformation
                        :encodedToken="receiveData.tokensBase64"
                        :hide-amount="true"
                        :hide-unit="true"
                      />
                    </div>
                  </div>

                  <!-- swap mint selection -->
                  <SwapIncomingTokenToKnownMint
                    v-if="swapSelected"
                    :swap-processing="swapProcessing"
                    :swap-error="swapError"
                    :swap-blocking="swapBlocking"
                    :source-mint-info="sourceMintInfo"
                    @close="swapSelected = false"
                  />
                </div>
                <div v-else key="token-empty" class="column">
                  <!-- Token input (when not yet decodable) -->
                  <div class="relative-container">
                    <q-input
                      round
                      spellcheck="false"
                      v-model="receiveData.tokensBase64"
                      :label="
                        $t('ReceiveTokenDialog.inputs.tokens_base64.label')
                      "
                      type="textarea"
                      autofocus
                      class="q-mb-lg q-mt-md q-mx-xs cashub-nowrap token-input"
                      @keyup.enter="receiveIfDecodes"
                    >
                      <q-icon
                        v-if="receiveData.tokensBase64"
                        color="dark"
                        name="close"
                        class="floating-button cursor-pointer"
                        @click="receiveData.tokensBase64 = ''"
                      />
                    </q-input>
                  </div>

                  <!-- Display error for invalid token -->
                  <q-btn
                    v-if="
                      receiveData.tokensBase64.length && !tokenDecodesCorrectly
                    "
                    disabled
                    color="yellow"
                    text-color="black"
                    rounded
                    unelevated
                    class="q-ml-xs q-mr-sm"
                    :label="$t('ReceiveTokenDialog.errors.invalid_token.label')"
                  ></q-btn>

                  <!-- EMPTY INPUT helper actions -->
                  <div
                    v-if="!receiveData.tokensBase64.length"
                    class="column q-mt-sm"
                  >
                    <div class="row q-gutter-sm">
                      <div class="col">
                        <q-btn
                          v-if="canPasteFromClipboard"
                          outline
                          rounded
                          size="lg"
                          class="full-width"
                          @click="pasteToParseDialog(true)"
                        >
                          <q-icon
                            name="content_paste"
                            size="1.2em"
                            class="q-pr-sm"
                          />
                          {{ $t("ReceiveTokenDialog.actions.paste.label") }}
                        </q-btn>
                      </div>
                      <div class="col">
                        <q-btn
                          v-if="hasCamera"
                          rounded
                          outline
                          size="lg"
                          class="full-width"
                          @click="showCamera"
                        >
                          <ScanIcon size="1.2em" />
                          <span class="q-pl-sm">{{
                            $t("ReceiveTokenDialog.actions.scan.label")
                          }}</span>
                        </q-btn>
                      </div>
                    </div>
                    <q-btn
                      unelevated
                      dense
                      class="q-mx-sm"
                      v-if="ndefSupported"
                      :loading="scanningCard"
                      :disabled="scanningCard"
                      @click="toggleScanner"
                    >
                      <NfcIcon class="q-pr-xs" />
                      <q-tooltip>{{
                        ndefSupported
                          ? $t(
                              "ReceiveTokenDialog.actions.nfc.tooltips.ndef_supported_text"
                            )
                          : $t(
                              "ReceiveTokenDialog.actions.nfc.tooltips.ndef_unsupported_text"
                            )
                      }}</q-tooltip>
                      <template v-slot:loading>
                        <q-spinner @click="toggleScanner"> </q-spinner>
                      </template>
                      {{ $t("ReceiveTokenDialog.actions.nfc.label") }}
                    </q-btn>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Bottom fixed receive action -->
        <transition appear enter-active-class="animated fadeIn">
          <div class="bottom-panel" v-if="tokenDecodesCorrectly">
            <div class="row justify-center q-pb-lg q-pt-sm">
              <div
                class="col-12 col-sm-11 col-md-8 q-px-md"
                style="max-width: 600px"
              >
                <template v-if="swapSelected">
                  <q-btn
                    class="full-width"
                    unelevated
                    size="lg"
                    @click="handleSwapToTrustedMint"
                    color="primary"
                    rounded
                    :loading="swapBlocking"
                    :disabled="activeMintUrl == tokenMint"
                  >
                    {{
                      $t(
                        "ReceiveTokenDialog.actions.receive_to_selected_mint.label"
                      )
                    }}
                    <template v-slot:loading>
                      <q-spinner-hourglass size="xs" />
                      {{
                        $t(
                          "ReceiveTokenDialog.actions.confirm_swap.in_progress"
                        )
                      }}
                    </template>
                    <q-tooltip>{{
                      $t("ReceiveTokenDialog.actions.confirm_swap.tooltip_text")
                    }}</q-tooltip>
                  </q-btn>
                </template>
                <template v-else>
                  <q-btn
                    @click="addPendingTokenToHistory(receiveData.tokensBase64)"
                    color="primary"
                    rounded
                    outline
                    class="full-width q-mb-md"
                  >
                    {{ $t("ReceiveTokenDialog.actions.later.label") }}
                    <q-tooltip>{{
                      $t("ReceiveTokenDialog.actions.later.tooltip_text")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="enableReceiveSwaps && activeMintUrl && mints.length"
                    @click="swapSelected = true"
                    color="primary"
                    rounded
                    outline
                    class="full-width q-mb-md"
                  >
                    {{ $t("ReceiveTokenDialog.actions.swap.label") }}
                    <q-tooltip>{{
                      $t("ReceiveTokenDialog.actions.swap.tooltip_text")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    class="full-width"
                    unelevated
                    size="lg"
                    @click="receiveIfDecodes"
                    color="primary"
                    rounded
                    :disabled="addMintBlocking"
                    :loading="swapBlocking"
                  >
                    {{
                      knowThisMint
                        ? addMintBlocking
                          ? $t(
                              "ReceiveTokenDialog.actions.receive.label_adding_mint"
                            )
                          : $t(
                              "ReceiveTokenDialog.actions.receive.label_known_mint"
                            )
                        : $t("ReceiveTokenDialog.actions.receive.label")
                    }}
                    <template v-slot:loading>
                      <q-spinner-hourglass />
                    </template>
                  </q-btn>
                </template>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { useMintsStore } from "src/stores/mints";
import { useTokensStore } from "src/stores/tokens";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import { usePriceStore } from "src/stores/price";
import { useSwapStore } from "src/stores/swap";
import { useSettingsStore } from "src/stores/settings";
import token from "src/js/token";
import { CashuMint } from "@cashu/cashu-ts";
import { Token } from "@cashu/cashu-ts";

import TokenInformation from "components/TokenInformation.vue";
import TokenStringRender from "components/TokenStringRender.vue";
import SwapIncomingTokenToKnownMint from "src/components/SwapIncomingTokenToKnownMint.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
import {
  ChevronLeft as ChevronLeftIcon,
  Clipboard as ClipboardIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Scan as ScanIcon,
  Nfc as NfcIcon,
} from "lucide-vue-next";

import { map } from "underscore";
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";
import MintSettings from "./MintSettings.vue";

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    TokenInformation,
    NfcIcon,
    ScanIcon,
    TokenStringRender,
    SwapIncomingTokenToKnownMint,
  },
  data: function () {
    return {
      showP2PKDialog: false,
      swapSelected: false,
      untrustedMintInfo: null,
      swapProcessing: false,
      swapError: false,
    };
  },
  watch: {
    watchClipboardPaste(val) {
      if (val) {
        this.$nextTick(() => {
          this.pasteToParseDialog();
          this.watchClipboardPaste = false;
        });
      }
    },
    tokenMint: {
      async handler(newMintUrl) {
        if (newMintUrl && !this.mints.find((m: any) => m.url === newMintUrl)) {
          // This is an untrusted mint, try to fetch its info
          await this.fetchUntrustedMintInfo(newMintUrl);
        }
      },
      immediate: true,
    },
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "watchClipboardPaste",
      "receiveData",
      "scanningCard",
    ]),
    ...mapState(useUiStore, ["tickerShort", "ndefSupported"]),
    ...mapState(usePriceStore, [
      "bitcoinPrice",
      "bitcoinPrices",
      "currentCurrencyPrice",
    ]),
    ...mapState(useSettingsStore, ["bitcoinPriceCurrency"]),
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "activeUnit",
      "addMintBlocking",
      "mints",
    ]),
    ...mapState(useSettingsStore, ["enableReceiveSwaps"]),
    ...mapWritableState(useMintsStore, ["addMintData", "showAddMintDialog"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    ...mapState(useCameraStore, ["hasCamera"]),
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    ...mapState(usePRStore, ["enablePaymentRequest"]),
    ...mapState(useSwapStore, ["swapBlocking"]),
    ...mapWritableState(useUiStore, ["showReceiveDialog"]),
    ...mapState(useCameraStore, ["lastScannedResult"]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    tokenDecodesCorrectly: function () {
      // Try decoding token directly
      if (this.decodeToken(this.receiveData.tokensBase64) !== undefined) {
        return true;
      }

      // Fall back to peanut check
      return this.decodePeanut(this.receiveData.tokensBase64) !== undefined;
    },
    knowThisMint: function () {
      const tokenJson = this.decodeToken(this.receiveData.tokensBase64);
      if (tokenJson == undefined) {
        return false;
      }
      return this.knowThisMintOfTokenJson(tokenJson);
    },
    tokenAmount: function () {
      if (!this.tokenDecodesCorrectly) {
        return 0;
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return this.getProofs(decodedToken).reduce(
        (sum, el) => (sum += el.amount),
        0
      );
    },
    receiveFee: function () {
      return this.getFeesForProofs(
        this.getProofs(this.decodeToken(this.receiveData.tokensBase64))
      );
    },
    tokenUnit: function () {
      if (!this.tokenDecodesCorrectly) {
        return "";
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return token.getUnit(decodedToken);
    },
    tokenMint: function () {
      if (!this.tokenDecodesCorrectly) {
        return "";
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return this.getMint(decodedToken);
    },
    swapToMintAmount: function () {
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return this.tokenAmount - useSwapStore().meltToMintFees(decodedToken);
    },
    maxLengthForTokenString: function () {
      return Math.floor(this.$q.screen.height / 3.5);
    },
    sourceMintInfo: function () {
      if (!this.tokenMint) {
        return null;
      }
      const mint = this.mints.find((m: any) => m.url === this.tokenMint);
      if (!mint) {
        // Use untrusted mint info if available
        return {
          nickname: this.untrustedMintInfo?.name || null,
          shorturl: this.getShortUrl(this.tokenMint),
          iconUrl: this.untrustedMintInfo?.icon_url || null,
        };
      }
      return {
        nickname: mint.nickname || mint.info?.name,
        shorturl: this.getShortUrl(mint.url),
        iconUrl: mint.info?.icon_url,
      };
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["redeem", "getFeesForProofs"]),
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    ...mapActions(useTokensStore, ["addPendingToken"]),
    ...mapActions(useP2PKStore, [
      "getPrivateKeyForP2PKEncodedToken",
      "generateKeypair",
      "showLastKey",
    ]),
    ...mapActions(useMintsStore, ["addMint"]),
    ...mapActions(useReceiveTokensStore, [
      "receiveIfDecodes",
      "decodeToken",
      "knowThisMintOfTokenJson",
      "toggleScanner",
      "pasteToParseDialog",
    ]),
    getShortUrl: function (url: string) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname;
      } catch {
        return url;
      }
    },
    // TOKEN METHODS
    decodePeanut: function (peanut) {
      try {
        let decoded = [];
        const chars = Array.from(peanut);
        if (!chars.length) return undefined;
        const fromVariationSelector = function (char) {
          const codePoint = char.codePointAt(0);

          // Handle Variation Selectors (VS1-VS16): U+FE00 to U+FE0F
          if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
            // Maps FE00->0, FE01->1, ..., FE0F->15
            const byteValue = codePoint - 0xfe00;
            return String.fromCharCode(byteValue);
          }

          // Handle Variation Selectors Supplement (VS17-VS256): U+E0100 to U+E01EF
          if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
            // Maps E0100->16, E0101->17, ..., E01EF->255
            const byteValue = codePoint - 0xe0100 + 16;
            return String.fromCharCode(byteValue);
          }

          // No Variation Selector
          return null;
        };
        // Check all input chars for peanut data
        for (const char of chars) {
          let byte = fromVariationSelector(char);
          if (byte === null && decoded.length > 0) {
            break;
          } else if (byte === null) {
            continue;
          }
          decoded.push(byte); // got some
        }
        // Switch out token if we found peanut data
        decoded = decoded.join("");
        if (decoded) {
          this.receiveData.tokensBase64 = decoded;
        }
        return this.decodeToken(decoded);
      } catch (error) {
        return undefined;
      }
    },
    getProofs: function (decoded_token: Token) {
      return token.getProofs(decoded_token);
    },
    getMint: function (decoded_token: Token) {
      return token.getMint(decoded_token);
    },
    tokenAlreadyInHistory: function (tokenStr: string) {
      const tokensStore = useTokensStore();
      return (
        tokensStore.historyTokens.find((t) => t.token === tokenStr) !==
        undefined
      );
    },
    addPendingTokenToHistory: function (tokenStr: string) {
      if (this.tokenAlreadyInHistory(tokenStr)) {
        this.notifySuccess(
          this.$i18n.t(
            "ReceiveTokenDialog.actions.later.already_in_history_success_text"
          )
        );
        this.showReceiveTokens = false;
        return;
      }
      const tokensStore = useTokensStore();
      const decodedToken = this.decodeToken(tokenStr);
      const mintInToken = this.getMint(decodedToken);
      const unitInToken = token.getUnit(decodedToken);
      // get amount from decodedToken.token.proofs[..].amount
      const amount = this.getProofs(decodedToken).reduce(
        (sum, el) => (sum += el.amount),
        0
      );

      tokensStore.addPendingToken({
        amount: amount,
        token: tokenStr,
        mintInToken: mintInToken,
        unitInToken: unitInToken,
      });
      this.showReceiveTokens = false;
      // show success notification
      this.notifySuccess(
        this.$i18n.t(
          "ReceiveTokenDialog.actions.later.added_to_history_success_text"
        )
      );
    },
    handleSwapToTrustedMint: async function () {
      try {
        this.swapProcessing = true;
        this.swapError = false;
        const mint = useMintsStore().activeMint().mint;
        await useReceiveTokensStore().meltTokenToMint(
          this.receiveData.tokensBase64,
          mint
        );
        this.swapSelected = false;
        this.swapProcessing = false;
      } catch (error) {
        console.error("Swap failed:", error);
        this.swapProcessing = false;
        this.swapError = true;
      }
    },
    fetchUntrustedMintInfo: async function (mintUrl: string) {
      try {
        const mint = new CashuMint(mintUrl);
        const info = await mint.getInfo();
        this.untrustedMintInfo = info;
      } catch (error) {
        console.log("Could not fetch untrusted mint info:", error);
        this.untrustedMintInfo = null;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.custom-btn {
  background: $grey-9;
  color: white;
  border-radius: 8px;
  height: 60px;
  box-shadow: none;
  font-size: 14px;
}

.full-width-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.q-dialog__inner > div {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.icon-background {
  background-color: $grey-10;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lucide {
  width: 24px;
  height: 24px;
}

.close-btn-position {
  position: absolute;
  right: 16px;
  bottom: 22px;
  z-index: 100;
}

.q-card-top {
  border-top-left-radius: 0px !important;
  border-top-right-radius: 0px !important;
}

.cashub-nowrap {
  word-break: break-all;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  hyphens: none;
  font-size: 0.9em;
  font-family: monospace;
}

.relative-container {
  position: relative;
}

.floating-button {
  position: absolute;
  top: 10px;
  right: 0px;
  z-index: 100;
  padding: 1px;
  background-color: var(--q-primary);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.receive-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
}
.floating-close-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
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
}

.token-input {
  // rounded input border
  height: 180px;
  border-radius: 10px;
  border: 1px solid $grey-2;
  padding: 10px 20px;
  font-size: 14px;
  font-family: monospace;
  background-color: var(--q-background);
  color: var(--q-text);
  text-decoration: none !important;
  &:focus {
    border-color: $primary;
  }
  // hide inner border from q-input
  &::before {
    display: none;
  }
  &::after {
    display: none;
  }
  &:disabled {
    background-color: var(--q-background-disabled);
    color: var(--q-text-disabled);
  }
  &:hover {
    background-color: var(--q-background-hover);
    color: var(--q-text-hover);
  }
}

/* Swap Section Styles */
.swap-section {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.swap-mint-info {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.swap-mint-name {
  font-size: 16px;
  font-weight: 500;
  color: white;
  line-height: 1.3;
}

.swap-mint-url {
  font-size: 14px;
  line-height: 1.3;
  margin-top: 2px;
}

.swap-arrow-icon {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.5);
}

.swap-destination-section {
  margin-top: 8px;
}

.swap-section-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.swap-info-tip {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.swap-info-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}
</style>
