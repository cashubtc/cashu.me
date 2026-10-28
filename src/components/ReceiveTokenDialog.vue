<template>
  <FlowDialog v-model="showReceiveTokens">
    <!-- full-screen receive flow -->
    <div
      class="column fit overflow-hidden receive-fullscreen"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
    >
      <!-- Header -->
      <FullscreenDialogHeader
        :title="$t('ReceiveTokenDialog.title')"
        balanced
      />

      <!-- Content area -->
      <div
        class="col column items-center justify-start q-px-lg scroll-container"
      >
        <div class="row justify-center full-width">
          <div
            class="col-12 q-px-sm q-mb-sm"
            style="max-width: var(--app-column)"
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
                    class="q-ml-xs text-subtitle2 text-app-muted"
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
                      @notLockedToUs="handleNotLockedToUs"
                    />
                  </div>
                </div>
                <div
                  class="row q-pt-sm"
                  v-if="!knowThisMint && !isNotLockedToUs"
                >
                  <div class="col-12">
                    <AppCallout
                      variant="info"
                      :text="$t('ReceiveTokenDialog.unknown_mint_info_text')"
                    />
                  </div>
                </div>
                <transition name="fade">
                  <div v-if="isReceiving" class="receiving-state q-mb-md">
                    <div class="row items-center no-wrap">
                      <div class="col-auto text-h5 text-weight-bold">
                        {{
                          $t("ReceiveTokenDialog.receiving_amount", {
                            amount: formatCurrency(
                              Math.max(tokenAmount - receiveFee, 0),
                              tokenUnit,
                              true
                            ),
                          })
                        }}
                      </div>
                      <div class="col-auto">
                        <PendingDots class="q-ml-sm" />
                      </div>
                    </div>
                  </div>
                </transition>
                <transition name="fade">
                  <AppCallout
                    v-if="receiveError && !isReceiving"
                    variant="danger"
                    class="q-mb-md q-mt-xl"
                    :text="receiveError"
                  />
                </transition>

                <!-- swap mint selection -->
                <SwapIncomingTokenToKnownMint
                  v-if="swapSelected"
                  v-model:target-mint="selectedSwapMintUrl"
                  :swap-processing="swapProcessing"
                  :swap-error="swapError"
                  :swap-blocking="swapBlocking"
                  :source-mint-info="sourceMintInfo"
                  :source-mint="tokenMint"
                  @close="handleSwapClose"
                />
              </div>
              <ParseInputComponent
                v-else
                key="token-empty"
                v-model="receiveData.tokensBase64"
                test-id="receive-token-input"
                :placeholder="$t('ParseInputComponent.placeholder.receive')"
                :has-camera="hasCamera"
                :ndef-supported="ndefSupported"
                :scanning-card="scanningCard"
                :nfc-label="$t('ReceiveTokenDialog.actions.nfc.label')"
                :nfc-tooltip="
                  $t(
                    'ReceiveTokenDialog.actions.nfc.tooltips.ndef_supported_text'
                  )
                "
                @enter="handleReceive"
                @paste="pasteToParseDialog(true)"
                @scan="showCamera"
                @nfc="toggleScanner"
              />
            </transition>
          </div>
        </div>
      </div>

      <!-- Bottom fixed receive action -->
      <transition appear enter-active-class="animated fadeIn">
        <FlowFooter v-if="tokenDecodesCorrectly">
          <template v-if="isNotLockedToUs">
            <AppCallout
              variant="danger"
              :text="$t('ReceiveTokenDialog.errors.p2pk_lock_mismatch.label')"
            />
          </template>
          <template v-else-if="swapSelected">
            <q-btn
              class="full-width"
              unelevated
              size="lg"
              @click="handleSwapToTrustedMint"
              color="primary"
              rounded
              :loading="swapProcessing || swapBlocking"
              :disabled="!canConfirmSwap"
            >
              {{
                $t("ReceiveTokenDialog.actions.receive_to_selected_mint.label")
              }}
              <template #loading
                ><BusyLabel>{{
                  $t(
                    "ReceiveTokenDialog.actions.receive_to_selected_mint.label"
                  )
                }}</BusyLabel></template
              >
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
              flat
              class="full-width q-mb-md"
            >
              {{ $t("ReceiveTokenDialog.actions.later.label") }}
              <q-tooltip>{{
                $t("ReceiveTokenDialog.actions.later.tooltip_text")
              }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="
                enableReceiveSwaps &&
                activeMintUrl &&
                mints.length > 0 &&
                !(
                  mints.length === 1 &&
                  tokenMint &&
                  mints[0]?.url === tokenMint
                )
              "
              @click="openSwap"
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
              data-testid="receive-ecash"
              @click="handleReceive"
              color="primary"
              rounded
              :disabled="addMintBlocking || isReceiving"
              :loading="swapBlocking || isReceiving"
            >
              {{
                knowThisMint
                  ? addMintBlocking
                    ? $t("ReceiveTokenDialog.actions.receive.label_adding_mint")
                    : $t("ReceiveTokenDialog.actions.receive.label_known_mint")
                  : $t("ReceiveTokenDialog.actions.receive.label")
              }}
              <template #loading
                ><BusyLabel>{{
                  knowThisMint
                    ? addMintBlocking
                      ? $t(
                          "ReceiveTokenDialog.actions.receive.label_adding_mint"
                        )
                      : $t(
                          "ReceiveTokenDialog.actions.receive.label_known_mint"
                        )
                    : $t("ReceiveTokenDialog.actions.receive.label")
                }}</BusyLabel></template
              >
            </q-btn>
          </template>
        </FlowFooter>
      </transition>
    </div>
  </FlowDialog>
</template>

<script lang="ts">
import FlowDialog from "src/components/ui/FlowDialog.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import { defineComponent } from "vue";
import AppCallout from "src/components/AppCallout.vue";
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
import { Mint, GetInfoResponse } from "@cashu/cashu-ts";
import { Token } from "@cashu/cashu-ts";
import type { StoredMint } from "src/stores/mints";

import TokenInformation from "components/TokenInformation.vue";
import TokenStringRender from "components/TokenStringRender.vue";
import SwapIncomingTokenToKnownMint from "src/components/SwapIncomingTokenToKnownMint.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import ParseInputComponent from "components/ParseInputComponent.vue";

import { mapActions, mapState, mapWritableState } from "pinia";

declare const windowMixin: any;

export default defineComponent({
  name: "ReceiveTokenDialog",
  mixins: [windowMixin],
  components: {
    FlowDialog,
    BusyLabel,
    FlowFooter,
    PendingDots,
    AppCallout,
    TokenInformation,
    TokenStringRender,
    SwapIncomingTokenToKnownMint,
    FullscreenDialogHeader,
    ParseInputComponent,
  },
  data: function () {
    return {
      showP2PKDialog: false,
      swapSelected: false,
      untrustedMintInfo: null as GetInfoResponse | null,
      swapProcessing: false,
      swapError: false,
      isReceiving: false as boolean,
      receiveError: "" as string,
      selectedSwapMintUrl: "",
      isNotLockedToUs: false as boolean,
      fullToken: null as Token | null,
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
        this.syncSwapTargetWithDefaults();
      },
      immediate: true,
    },
    showReceiveTokens(val: boolean) {
      if (!val) {
        this.isReceiving = false;
        this.receiveError = "";
        this.swapSelected = false;
        this.swapProcessing = false;
        this.swapError = false;
        this.selectedSwapMintUrl = "";
        this.isNotLockedToUs = false;
      }
    },
    async "receiveData.tokensBase64"(newVal: string) {
      if (newVal !== undefined) {
        this.receiveError = "";
        this.isNotLockedToUs = false;
      }
      if (!newVal) {
        this.fullToken = null;
        return;
      }
      try {
        const decoded = (await token.decodeFull(newVal)) ?? null;
        if (this.receiveData.tokensBase64 !== newVal) return;
        this.fullToken = decoded;
      } catch {
        if (this.receiveData.tokensBase64 !== newVal) return;
        this.fullToken = null;
      }
    },
    swapSelected(newVal: boolean) {
      if (newVal) {
        this.syncSwapTargetWithDefaults();
      }
    },
    mints: {
      handler() {
        this.syncSwapTargetWithDefaults();
      },
      deep: true,
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
      return this.decodeToken(this.receiveData.tokensBase64)?.amount ?? 0;
    },
    receiveFee: function () {
      const ft = this.fullToken as Token | null;
      if (!ft) return 0;
      try {
        const proofs = this.getProofs(ft);
        if (!proofs?.length) return 0;
        return this.getFeesForProofs(
          proofs,
          this.getMint(ft),
          token.getUnit(ft)
        );
      } catch {
        return 0;
      }
    },
    tokenUnit: function () {
      if (!this.tokenDecodesCorrectly) {
        return "";
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return decodedToken ? token.getUnit(decodedToken) : "";
    },
    tokenMint: function () {
      if (!this.tokenDecodesCorrectly) {
        return "";
      }
      const decodedToken = this.decodeToken(this.receiveData.tokensBase64);
      return decodedToken ? this.getMint(decodedToken) : "";
    },
    maxLengthForTokenString: function () {
      return Math.floor(this.$q.screen.height / 3.5);
    },
    sourceMintInfo: function () {
      if (!this.tokenMint) {
        return null;
      }
      const mint = (this.mints as StoredMint[]).find(
        (m) => m.url === this.tokenMint
      );
      if (!mint) {
        // Use untrusted mint info if available
        return {
          nickname: this.untrustedMintInfo?.name || null,
          shorturl: this.getShortUrl(this.tokenMint),
          iconUrl: this.untrustedMintInfo?.icon_url || null,
        };
      }
      // If mint exists but doesn't have complete info yet, fall back to untrustedMintInfo
      const mintNickname = mint.nickname || mint.info?.name;
      const mintIconUrl = mint.info?.icon_url;
      return {
        nickname: mintNickname || this.untrustedMintInfo?.name || null,
        shorturl: this.getShortUrl(mint.url),
        iconUrl: mintIconUrl || this.untrustedMintInfo?.icon_url || null,
      };
    },
    swapTargetMint: function () {
      if (!this.selectedSwapMintUrl) {
        return null;
      }
      return (
        (this.mints as StoredMint[]).find(
          (m) => m.url === this.selectedSwapMintUrl
        ) || null
      );
    },
    canConfirmSwap: function (): boolean {
      return (
        !!this.swapTargetMint &&
        this.selectedSwapMintUrl !== this.tokenMint &&
        !this.swapProcessing &&
        !this.swapBlocking
      );
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
      "decodeToken",
      "knowThisMintOfTokenJson",
      "toggleScanner",
      "pasteToParseDialog",
      "receiveToken",
    ]),
    handleReceive: async function () {
      if (this.isReceiving) {
        return;
      }
      this.receiveError = "";
      if (!this.tokenDecodesCorrectly) {
        this.receiveError = this.$t(
          "ReceiveTokenDialog.errors.invalid_token.label"
        ) as string;
        return;
      }
      this.isReceiving = true;
      try {
        await this.receiveToken(this.receiveData.tokensBase64);
      } catch (error: any) {
        console.error("Receive token error:", error);
        const rawMessage =
          error && typeof error === "object" && "message" in error
            ? (error as Error).message
            : String(error ?? "");
        if (
          rawMessage.toLowerCase &&
          rawMessage.toLowerCase().includes("no tokens provided")
        ) {
          this.receiveError = this.$t(
            "ReceiveTokenDialog.errors.invalid_token.label"
          ) as string;
        } else {
          this.receiveError =
            rawMessage ||
            (this.$t(
              "ReceiveTokenDialog.errors.invalid_token.label"
            ) as string);
        }
      } finally {
        this.isReceiving = false;
      }
    },
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
          const byte = fromVariationSelector(char);
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
    getMint: function (decoded_token: { mint: string; proofs: unknown[] }) {
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
      if (!decodedToken) return;

      tokensStore.addPendingToken({
        amount: decodedToken.amount,
        token: tokenStr,
        mint: token.getMint(decodedToken),
        unit: token.getUnit(decodedToken),
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
        if (!this.canConfirmSwap) {
          return;
        }
        this.swapProcessing = true;
        this.swapError = false;
        const targetMint = this.swapTargetMint;
        if (!targetMint) {
          throw new Error("No target mint selected");
        }
        await useReceiveTokensStore().meltTokenToMint(
          this.receiveData.tokensBase64,
          targetMint
        );
        this.swapSelected = false;
        this.swapProcessing = false;
      } catch (error) {
        console.error("Swap failed:", error);
        this.swapProcessing = false;
        this.swapError = true;
      }
    },
    openSwap() {
      if (!this.getAvailableSwapMints().length) {
        return;
      }
      this.syncSwapTargetWithDefaults();
      this.swapSelected = true;
      this.swapError = false;
    },
    handleSwapClose() {
      this.swapSelected = false;
    },
    getAvailableSwapMints(): StoredMint[] {
      const availableMints = Array.isArray(this.mints)
        ? (this.mints as StoredMint[])
        : [];
      return availableMints.filter(
        (mint) => mint.url && mint.url !== this.tokenMint
      );
    },
    syncSwapTargetWithDefaults() {
      const eligible = this.getAvailableSwapMints();
      if (!eligible.length) {
        if (this.selectedSwapMintUrl) {
          this.selectedSwapMintUrl = "";
        }
        return;
      }
      if (
        this.selectedSwapMintUrl &&
        eligible.some((mint: any) => mint.url === this.selectedSwapMintUrl)
      ) {
        return;
      }
      const mintsStore = useMintsStore();
      const activeCandidateRaw = mintsStore.activeMintUrl as unknown;
      let activeCandidate = "";
      if (typeof activeCandidateRaw === "string") {
        activeCandidate = activeCandidateRaw;
      } else if (
        activeCandidateRaw &&
        typeof activeCandidateRaw === "object" &&
        "value" in activeCandidateRaw
      ) {
        const candidateValue = (activeCandidateRaw as { value?: string }).value;
        if (typeof candidateValue === "string") {
          activeCandidate = candidateValue;
        }
      }
      if (
        activeCandidate &&
        activeCandidate !== this.tokenMint &&
        eligible.some((mint: any) => mint.url === activeCandidate)
      ) {
        this.selectedSwapMintUrl = activeCandidate;
        return;
      }
      this.selectedSwapMintUrl = eligible[0].url;
    },
    fetchUntrustedMintInfo: async function (mintUrl: string) {
      try {
        const mint = new Mint(mintUrl);
        const info = await mint.getInfo();
        this.untrustedMintInfo = info;
      } catch (error) {
        console.log("Could not fetch untrusted mint info:", error);
        this.untrustedMintInfo = null;
      }
    },
    handleNotLockedToUs: function (value: boolean) {
      this.isNotLockedToUs = value;
    },
  },
});
</script>

<style lang="scss" scoped>
.scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
}

.receiving-state {
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
