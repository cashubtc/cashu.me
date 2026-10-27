<template>
  <q-dialog
    v-model="showMultinutPaymentDialog"
    position="top"
    :maximized="true"
    transition-show="fade"
    transition-hide="fade"
    full-width
    full-height
    seamless
    no-backdrop-dismiss
    @keyup.esc="closeMultinutDialog"
  >
    <div class="fullscreen bg-dark">
      <div class="multinut-content-container q-pa-md">
        <!-- Top Icons -->
        <div class="top-icons q-pt-md q-mb-lg">
          <q-btn
            flat
            round
            class="floating-close-btn"
            :aria-label="$t('global.actions.close.label')"
            @click="closeMultinutDialog"
          >
            <XIcon :size="22" />
          </q-btn>
        </div>

        <!-- Header Section -->
        <div class="multinut-header-container q-mb-lg">
          <div class="multinut-header q-pa-md q-py-lg">
            <div class="multinut-title q-mb-xs">
              {{ $t("MultinutPicker.dialog_title") }}
            </div>
            <div class="amount-headline">
              {{
                formatCurrency(
                  payInvoiceData.meltQuote.response.amount,
                  activeUnit
                )
              }}
            </div>
            <div
              v-if="!isPaymentInProgress"
              class="multinut-description q-mt-sm"
            >
              {{ $t("MultinutPicker.pay_using_multiple") }}
            </div>
          </div>

          <!-- Experimental Warning -->
          <transition
            appear
            enter-active-class="animated pulse"
            name="smooth-slide"
          >
            <div
              v-if="
                !multinutExperimentalWarningDismissed && !isPaymentInProgress
              "
              class="experimental-warning q-mt-lg"
            >
              <div class="app-callout app-callout--warning">
                <q-icon
                  name="warning_amber"
                  size="20px"
                  class="app-callout__icon"
                />
                <div class="app-callout__body">
                  <div class="app-callout__title">
                    {{ $t("MultinutPicker.experimental_title") }}
                  </div>
                  <div class="app-callout__text">
                    {{ $t("MultinutPicker.experimental_text") }}
                  </div>
                  <q-btn
                    flat
                    dense
                    no-caps
                    class="q-mt-sm warning-dismiss-btn"
                    @click="dismissExperimentalWarning"
                  >
                    {{ $t("MultinutPicker.understand") }}
                  </q-btn>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Mint Selection Section -->
        <div class="mint-selection-section q-mb-lg">
          <div
            class="mint-selection-description q-mb-md"
            v-if="multinutExperimentalWarningDismissed && !isPaymentInProgress"
          >
            {{ $t("MultinutPicker.select_funds") }}
          </div>

          <div class="mints-container">
            <div
              v-for="mint in multiMints"
              :key="mint.url"
              v-show="!isPaymentInProgress || isSelected(mint)"
              class="mint-item q-mb-md"
            >
              <div
                class="mint-card cursor-pointer"
                @click="
                  !isPaymentInProgress && !isSelected(mint) && toggleMint(mint)
                "
                :class="{
                  'mint-card-selected': isSelected(mint),
                  'cursor-not-allowed': isPaymentInProgress,
                  'mint-card-success':
                    isPaymentInProgress &&
                    isSelected(mint) &&
                    mintStates[mint.url] === 'success',
                  'mint-card-error':
                    isPaymentInProgress &&
                    isSelected(mint) &&
                    mintStates[mint.url] === 'error',
                }"
              >
                <div class="mint-card-content q-pa-md">
                  <div class="row items-center">
                    <div class="col-auto q-mr-md">
                      <q-checkbox
                        v-if="!isPaymentInProgress"
                        :model-value="isSelected(mint)"
                        @update:model-value="toggleMint(mint)"
                        :color="isSelected(mint) ? 'primary' : 'grey'"
                        class="cursor-pointer"
                      />
                    </div>

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
                            style="
                              height: 34px;
                              max-width: 34px;
                              font-size: 12px;
                            "
                          />
                        </q-avatar>

                        <div class="mint-info-container">
                          <div
                            v-if="mint.nickname || mint.info?.name"
                            class="mint-name"
                          >
                            {{ mint.nickname || mint.info?.name }}
                          </div>
                          <div class="text-grey-6 mint-url">
                            {{ getShortUrl(mint.url) }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Show state indicator during payment, checkbox otherwise -->
                    <div
                      v-if="isPaymentInProgress && isSelected(mint)"
                      class="col-auto state-indicator"
                    >
                      <q-spinner
                        v-if="
                          mintStates[mint.url] === 'requesting' ||
                          mintStates[mint.url] === 'paying'
                        "
                        color="primary"
                        size="24px"
                      />
                      <q-icon
                        v-else-if="mintStates[mint.url] === 'success'"
                        name="check_circle"
                        color="positive"
                        size="24px"
                      />
                      <q-icon
                        v-else-if="mintStates[mint.url] === 'error'"
                        name="error"
                        color="negative"
                        size="24px"
                      />
                    </div>
                  </div>

                  <!-- Payment State Progress Bar - Full Width -->
                  <div
                    v-if="
                      isPaymentInProgress &&
                      isSelected(mint) &&
                      mintStates[mint.url]
                    "
                    class="payment-progress-section q-mt-md q-px-md"
                  >
                    <q-linear-progress
                      :value="getStateProgress(mintStates[mint.url])"
                      :color="getStateColor(mintStates[mint.url])"
                      size="4px"
                      rounded
                      class="payment-progress"
                    />
                    <div class="payment-state-text q-mt-xs">
                      {{ getStateText(mintStates[mint.url]) }}
                    </div>
                  </div>

                  <!-- Balance Display for Unselected Mints -->
                  <div
                    v-if="!isSelected(mint)"
                    class="mint-balance-section q-mt-md"
                  >
                    <div class="app-badge app-badge--solid q-mr-xs q-mb-xs">
                      <span class="currency-unit-text">
                        {{
                          formatCurrency(
                            mintClass(mint).unitBalance(this.activeUnit),
                            this.activeUnit
                          )
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- Payment Distribution Slider for Selected Mints -->
                  <div
                    v-if="isSelected(mint) && !isPaymentInProgress"
                    class="mint-slider-section q-mt-md"
                  >
                    <div class="row items-center q-gutter-sm no-wrap">
                      <!-- Allocation Badge -->
                      <div class="col-auto">
                        <div
                          class="app-badge app-badge--primary allocation-badge"
                        >
                          {{
                            formatCurrency(getPartialAmount(mint), activeUnit)
                          }}
                        </div>
                      </div>

                      <!-- Slider -->
                      <div class="col slider-container">
                        <q-slider
                          :model-value="getMintProportion(mint)"
                          @update:model-value="
                            (value) => updateMintProportion(mint, value)
                          "
                          :min="0"
                          :max="getMaxPercentageForMint(mint)"
                          :step="1"
                          color="primary"
                          :disable="selectedMints.length <= 1"
                          class="mint-slider q-px-md"
                        />
                      </div>

                      <!-- Total Balance Badge -->
                      <div class="col-auto">
                        <div class="app-badge app-badge--solid">
                          {{
                            formatCurrency(
                              mintClass(mint).unitBalance(this.activeUnit),
                              activeUnit
                            )
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons Section -->
        <div class="action-buttons-section">
          <q-btn
            unelevated
            rounded
            color="primary"
            :disabled="!canExecutePayment"
            @click="executeMultinutPayment"
            :loading="multiMeltButtonLoading"
            class="pay-button-fixed"
            size="lg"
          >
            {{ $t("MultinutPicker.pay_invoice") }}
          </q-btn>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import { sumProofAmounts } from "src/js/proofs";
import { getShortUrl } from "src/js/wallet-helpers";
import { X as XIcon } from "lucide-vue-next";

export default defineComponent({
  name: "MultinutPaymentDialog",
  mixins: [windowMixin],
  components: { XIcon },
  data() {
    return {
      multiMeltButtonLoading: false,
      selectedMints: [],
      showMultinutPaymentDialog: false,
      // State tracking for each mint during payment
      mintStates: {}, // { mintUrl: 'requesting' | 'paying' | 'success' | 'error' }
      isPaymentInProgress: false,
      // Custom proportions for each mint (percentage 0-100)
      mintProportions: {}, // { mintUrl: percentage }
    };
  },
  computed: {
    ...mapWritableState(useWalletStore, ["payInvoiceData"]),
    ...mapWritableState(useUiStore, ["multinutExperimentalWarningDismissed"]),
    ...mapState(useMintsStore, ["mints", "activeUnit", "multiMints"]),
    totalSelectedBalance() {
      return this.selectedMints.reduce((total, mint) => {
        const mintInstance = this.mintClass(mint);
        return total + mintInstance.unitBalance(this.activeUnit);
      }, 0);
    },
    canExecutePayment() {
      return (
        this.selectedMints.length > 0 &&
        this.totalSelectedBalance >=
          this.payInvoiceData.meltQuote.response.amount &&
        this.totalDistributedAmount ===
          this.payInvoiceData.meltQuote.response.amount &&
        !this.multiMeltButtonLoading
      );
    },
    totalDistributedAmount() {
      if (this.selectedMints.length === 0) return 0;
      const partialAmounts = this.getPartialAmounts();
      return Object.values(partialAmounts).reduce(
        (sum, amount) => sum + amount,
        0
      );
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["meltQuote", "melt"]),
    ...mapActions(useMintsStore, [
      "activateMintUrl",
      "updateMintMultinutSelection",
    ]),
    mintClass(mint) {
      return new MintClass(mint);
    },
    getShortUrl(url) {
      return getShortUrl(url);
    },
    isSelected(mint) {
      return this.selectedMints.some((selected) => selected.url === mint.url);
    },
    toggleMint(mint) {
      const index = this.selectedMints.findIndex(
        (selected) => selected.url === mint.url
      );
      if (index >= 0) {
        this.selectedMints.splice(index, 1);
        this.updateMintMultinutSelection(mint.url, false);
        // Remove from proportions
        delete this.mintProportions[mint.url];
      } else {
        this.selectedMints.push(mint);
        this.updateMintMultinutSelection(mint.url, true);
      }
      // Recalculate proportions when selection changes
      this.initializeMintProportions();
    },
    initializeMintProportions() {
      if (this.selectedMints.length === 0) {
        this.mintProportions = {};
        return;
      }

      const totalAmount = this.payInvoiceData.meltQuote.response.amount;

      // Calculate default proportions based on balance weights, but respect capacity constraints
      const { weights } = this.multiMintBalance(
        this.selectedMints,
        this.activeUnit
      );
      const newProportions = {};

      // First pass: calculate ideal proportions
      this.selectedMints.forEach((mint, index) => {
        const idealPercentage = weights[index] * 100;
        const maxPercentage = this.getMaxPercentageForMint(mint);
        newProportions[mint.url] = Math.min(idealPercentage, maxPercentage);
      });

      // Check if we need to redistribute due to capacity constraints
      const totalAllocated = Object.values(newProportions).reduce(
        (sum, percentage) => sum + percentage,
        0
      );

      if (totalAllocated < 100) {
        // We have remaining capacity to distribute
        const remaining = 100 - totalAllocated;
        const mintsWithCapacity = this.selectedMints.filter((mint) => {
          const maxPercentage = this.getMaxPercentageForMint(mint);
          return newProportions[mint.url] < maxPercentage;
        });

        if (mintsWithCapacity.length > 0) {
          // Distribute remaining proportionally among mints with available capacity
          const totalAvailableCapacity = mintsWithCapacity.reduce(
            (sum, mint) => {
              const maxPercentage = this.getMaxPercentageForMint(mint);
              return sum + (maxPercentage - newProportions[mint.url]);
            },
            0
          );

          if (totalAvailableCapacity > 0) {
            mintsWithCapacity.forEach((mint) => {
              const maxPercentage = this.getMaxPercentageForMint(mint);
              const availableCapacity =
                maxPercentage - newProportions[mint.url];
              const proportion = availableCapacity / totalAvailableCapacity;
              const additional = Math.min(
                availableCapacity,
                remaining * proportion
              );
              newProportions[mint.url] += additional;
            });
          }
        }
      }

      this.mintProportions = { ...newProportions };
    },
    getMintProportion(mint) {
      return this.mintProportions[mint.url] || 0;
    },
    getMaxPercentageForMint(mint) {
      const totalAmount = this.payInvoiceData.meltQuote.response.amount;
      const mintBalance = this.mintClass(mint).unitBalance(this.activeUnit);
      return Math.min(100, (mintBalance / totalAmount) * 100);
    },
    getMintIconUrl(mint) {
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
    updateMintProportion(mint, newPercentage) {
      if (this.selectedMints.length <= 1) return;

      const totalAmount = this.payInvoiceData.meltQuote.response.amount;
      const mintBalance = this.mintClass(mint).unitBalance(this.activeUnit);

      // Calculate the maximum percentage this mint can handle based on its balance
      const maxPercentageForMint = Math.min(
        100,
        (mintBalance / totalAmount) * 100
      );

      // Constrain the new percentage to not exceed the mint's capacity
      const constrainedPercentage = Math.min(
        newPercentage,
        maxPercentageForMint
      );

      const oldPercentage = this.mintProportions[mint.url] || 0;
      const difference = constrainedPercentage - oldPercentage;

      // Update the changed mint
      this.mintProportions = {
        ...this.mintProportions,
        [mint.url]: constrainedPercentage,
      };

      // Redistribute the difference among other selected mints
      const otherMints = this.selectedMints.filter((m) => m.url !== mint.url);
      const totalOtherPercentage = otherMints.reduce(
        (sum, m) => sum + (this.mintProportions[m.url] || 0),
        0
      );

      if (totalOtherPercentage > 0 && otherMints.length > 0) {
        // Proportionally adjust other mints, respecting their balance constraints
        let remainingDifference = difference;

        // Sort other mints by their available capacity (descending)
        const mintsWithCapacity = otherMints
          .map((otherMint) => {
            const balance = this.mintClass(otherMint).unitBalance(
              this.activeUnit
            );
            const maxPercentage = Math.min(100, (balance / totalAmount) * 100);
            const currentPercentage = this.mintProportions[otherMint.url] || 0;
            const availableCapacity = maxPercentage - currentPercentage;
            return {
              mint: otherMint,
              currentPercentage,
              maxPercentage,
              availableCapacity,
              balance,
            };
          })
          .sort((a, b) => b.availableCapacity - a.availableCapacity);

        // Distribute the difference, respecting capacity constraints
        for (const mintInfo of mintsWithCapacity) {
          if (Math.abs(remainingDifference) < 0.01) break; // Stop if difference is negligible

          const weight = mintInfo.currentPercentage / totalOtherPercentage;
          let adjustment = difference * weight;

          // If reducing (difference is positive), we need to reduce others
          if (difference > 0) {
            // Can't reduce below 0
            adjustment = Math.min(adjustment, mintInfo.currentPercentage);
          } else {
            // If increasing others (difference is negative), respect capacity
            adjustment = Math.max(adjustment, -mintInfo.availableCapacity);
          }

          const newValue = Math.max(
            0,
            Math.min(
              mintInfo.maxPercentage,
              mintInfo.currentPercentage - adjustment
            )
          );

          this.mintProportions = {
            ...this.mintProportions,
            [mintInfo.mint.url]: newValue,
          };

          remainingDifference -= mintInfo.currentPercentage - newValue;
        }
      } else if (otherMints.length > 0) {
        // If other mints have 0%, distribute evenly respecting capacity
        const remainingPercentage = 100 - constrainedPercentage;
        const mintsWithCapacity = otherMints.map((otherMint) => {
          const balance = this.mintClass(otherMint).unitBalance(
            this.activeUnit
          );
          const maxPercentage = Math.min(100, (balance / totalAmount) * 100);
          return { mint: otherMint, maxPercentage, balance };
        });

        const totalMaxCapacity = mintsWithCapacity.reduce(
          (sum, m) => sum + m.maxPercentage,
          0
        );

        if (totalMaxCapacity > 0) {
          mintsWithCapacity.forEach((mintInfo) => {
            const proportion = mintInfo.maxPercentage / totalMaxCapacity;
            const allocatedPercentage = Math.min(
              mintInfo.maxPercentage,
              remainingPercentage * proportion
            );

            this.mintProportions = {
              ...this.mintProportions,
              [mintInfo.mint.url]: allocatedPercentage,
            };
          });
        }
      }

      // Ensure total is exactly 100% (with capacity constraints)
      this.normalizeMintProportions();
    },
    normalizeMintProportions() {
      const totalAmount = this.payInvoiceData.meltQuote.response.amount;
      const total = this.selectedMints.reduce(
        (sum, mint) => sum + (this.mintProportions[mint.url] || 0),
        0
      );

      if (total > 0 && Math.abs(total - 100) > 0.01) {
        // Check if we can scale proportionally while respecting constraints
        const factor = 100 / total;
        const normalizedProportions = {};
        let canScale = true;

        // First check if scaling would violate any constraints
        for (const mint of this.selectedMints) {
          const currentPercentage = this.mintProportions[mint.url] || 0;
          const scaledPercentage = currentPercentage * factor;
          const mintBalance = this.mintClass(mint).unitBalance(this.activeUnit);
          const maxPercentageForMint = Math.min(
            100,
            (mintBalance / totalAmount) * 100
          );

          if (scaledPercentage > maxPercentageForMint) {
            canScale = false;
            break;
          }
        }

        if (canScale) {
          // Safe to scale proportionally
          this.selectedMints.forEach((mint) => {
            normalizedProportions[mint.url] =
              (this.mintProportions[mint.url] || 0) * factor;
          });
          this.mintProportions = { ...normalizedProportions };
        } else {
          // Need to redistribute respecting constraints
          this.redistributeWithConstraints();
        }
      }
    },
    redistributeWithConstraints() {
      const totalAmount = this.payInvoiceData.meltQuote.response.amount;
      const newProportions = {};

      // Calculate available capacity for each mint
      const mintsWithCapacity = this.selectedMints.map((mint) => {
        const balance = this.mintClass(mint).unitBalance(this.activeUnit);
        const maxPercentage = Math.min(100, (balance / totalAmount) * 100);
        const currentPercentage = this.mintProportions[mint.url] || 0;
        return {
          mint,
          balance,
          maxPercentage,
          currentPercentage,
        };
      });

      // Start with current proportions, then adjust
      let totalAllocated = 0;
      const finalProportions = {};

      // First pass: allocate up to max capacity or current percentage, whichever is lower
      mintsWithCapacity.forEach((mintInfo) => {
        const allocated = Math.min(
          mintInfo.maxPercentage,
          mintInfo.currentPercentage
        );
        finalProportions[mintInfo.mint.url] = allocated;
        totalAllocated += allocated;
      });

      // Second pass: distribute remaining percentage to mints with available capacity
      let remaining = 100 - totalAllocated;
      while (remaining > 0.01) {
        const availableMints = mintsWithCapacity.filter(
          (mintInfo) =>
            finalProportions[mintInfo.mint.url] < mintInfo.maxPercentage
        );

        if (availableMints.length === 0) break;

        const totalAvailableCapacity = availableMints.reduce(
          (sum, mintInfo) =>
            sum +
            (mintInfo.maxPercentage - finalProportions[mintInfo.mint.url]),
          0
        );

        if (totalAvailableCapacity <= 0) break;

        availableMints.forEach((mintInfo) => {
          const availableCapacity =
            mintInfo.maxPercentage - finalProportions[mintInfo.mint.url];
          const proportion = availableCapacity / totalAvailableCapacity;
          const toAllocate = Math.min(
            availableCapacity,
            remaining * proportion
          );
          finalProportions[mintInfo.mint.url] += toAllocate;
          remaining -= toAllocate;
        });
      }

      this.mintProportions = { ...finalProportions };
    },
    getPartialAmount(mint) {
      const partialAmounts = this.getPartialAmounts();
      return partialAmounts[mint.url] || 0;
    },
    getPartialAmounts() {
      const totalAmount = this.payInvoiceData.meltQuote.response.amount;
      const partialAmounts = {};
      let calculatedTotal = 0;

      // First pass: calculate amounts based on percentages
      this.selectedMints.forEach((mint) => {
        const percentage = this.mintProportions[mint.url] || 0;
        const amount = Math.round(totalAmount * (percentage / 100));
        partialAmounts[mint.url] = amount;
        calculatedTotal += amount;
      });

      // Fix rounding errors by adjusting the largest allocation
      const difference = totalAmount - calculatedTotal;
      if (difference !== 0 && this.selectedMints.length > 0) {
        // Find the mint with the largest allocation to adjust
        let largestMint = null;
        let largestAmount = 0;

        this.selectedMints.forEach((mint) => {
          if (partialAmounts[mint.url] > largestAmount) {
            largestAmount = partialAmounts[mint.url];
            largestMint = mint;
          }
        });

        if (largestMint) {
          partialAmounts[largestMint.url] += difference;

          // Ensure we don't exceed the mint's balance
          const mintBalance = this.mintClass(largestMint).unitBalance(
            this.activeUnit
          );
          if (partialAmounts[largestMint.url] > mintBalance) {
            // If the largest mint can't handle the adjustment, distribute the difference
            partialAmounts[largestMint.url] = mintBalance;
            let remainingDifference =
              difference - (mintBalance - largestAmount);

            // Find other mints that can handle the remaining difference
            const otherMints = this.selectedMints.filter(
              (m) => m.url !== largestMint.url
            );
            for (const mint of otherMints) {
              const mintBalance = this.mintClass(mint).unitBalance(
                this.activeUnit
              );
              const currentAmount = partialAmounts[mint.url];
              const canTake = Math.min(
                remainingDifference,
                mintBalance - currentAmount
              );

              if (canTake > 0) {
                partialAmounts[mint.url] += canTake;
                remainingDifference -= canTake;
                if (remainingDifference === 0) break;
              }
            }
          }
        }
      }

      return partialAmounts;
    },
    getStateText(state) {
      switch (state) {
        case "requesting":
          return this.$t("MultinutPicker.states.requesting");
        case "paying":
          return this.$t("MultinutPicker.states.paying");
        case "success":
          return this.$t("MultinutPicker.states.success");
        case "error":
          return this.$t("MultinutPicker.states.failed");
        default:
          return "";
      }
    },
    getStateColor(state) {
      switch (state) {
        case "requesting":
          return "warning";
        case "paying":
          return "primary";
        case "success":
          return "positive";
        case "error":
          return "negative";
        default:
          return "grey";
      }
    },
    getStateProgress(state) {
      switch (state) {
        case "requesting":
          return 0.3; // Low progress - just started
        case "paying":
          return 0.7; // Middle progress - actively paying
        case "success":
          return 1.0; // Full progress - completed
        case "error":
          return 0.1; // Minimal progress - failed
        default:
          return 0;
      }
    },
    setMintState(mintUrl, state) {
      // Use Vue 3 compatible reactivity
      this.mintStates = { ...this.mintStates, [mintUrl]: state };
    },
    clearMintStates() {
      this.mintStates = {};
      this.isPaymentInProgress = false;
    },
    openMultinutDialog() {
      const mintsStore = useMintsStore();
      const previouslySelectedMints = mintsStore.multiMints.filter(
        (mint) => mint.multinutSelected === true
      );

      // If no mints were previously selected, default to selecting all available mints
      this.selectedMints =
        previouslySelectedMints.length > 0
          ? [...previouslySelectedMints]
          : [...mintsStore.multiMints];

      this.showMultinutPaymentDialog = true;
      this.clearMintStates(); // Clear any previous states
      this.initializeMintProportions(); // Initialize proportions based on balance
    },
    closeMultinutDialog() {
      this.showMultinutPaymentDialog = false;
      this.clearMintStates(); // Clear states when dialog closes
      // Re-open the PayInvoiceDialog
      this.$emit("return-to-pay-dialog");
    },
    multiMintBalance: function (selectedMints, unit) {
      const multiMints = selectedMints;
      const mintBalances = [];
      const overallBalance = multiMints.reduce((sum, m) => {
        const mint = new MintClass(m);
        const mintBalance = mint.unitBalance(unit);
        mintBalances.push(mintBalance);
        return sum + mintBalance;
      }, 0);
      const weights = mintBalances.map((b) => b / overallBalance);
      return { overallBalance: overallBalance, weights: weights };
    },
    executeMultinutPayment: async function () {
      const uiStore = useUiStore();
      //
      const totalQuoteAmount = this.payInvoiceData.meltQuote.response.amount;
      const activeUnit = useMintsStore().activeUnit;
      // update selected mints
      this.selectedMints.forEach((mint) => {
        this.updateMintMultinutSelection(mint.url, true);
      });

      // Clear previous states
      this.clearMintStates();

      // Start payment process
      this.isPaymentInProgress = true;
      this.multiMeltButtonLoading = true;

      let mintsToQuotes = [];
      const mintsToAmounts = [];
      let data;

      try {
        // Phase 1: Calculate amount for each Mint using custom proportions
        for (const mint of this.selectedMints) {
          const partialAmount = this.getPartialAmount(mint);
          console.log(`partialAmount for mint ${mint.url}: ${partialAmount}`);

          if (partialAmount > 0) {
            mintsToAmounts.push([mint, partialAmount]);
          } else {
            // remove from selectedMints so we don't show progress in the UI
            this.selectedMints = this.selectedMints.filter(
              (m) => m.url !== mint.url
            );
          }
        }

        // Verify total amounts match exactly
        const totalCalculated = mintsToAmounts.reduce(
          (sum, [mint, amount]) => sum + amount,
          0
        );
        console.log(
          `Total calculated: ${totalCalculated}, Expected: ${totalQuoteAmount}`
        );

        if (totalCalculated !== totalQuoteAmount) {
          console.error(
            `Amount mismatch: calculated ${totalCalculated}, expected ${totalQuoteAmount}`
          );
          notifyError(
            this.$t("MultinutPicker.amount_mismatch", {
              calculated: totalCalculated,
              expected: totalQuoteAmount,
            })
          );
          return;
        }

        // Phase 2: Request quotes from all selected mints
        mintsToQuotes = await Promise.all(
          mintsToAmounts.map(async ([mint, partialAmount], i) => {
            if (partialAmount <= 0) {
              return null;
            }
            console.log(`Quoting mint: ${mint.url}`);
            const mintWallet = await useWalletStore().mintWallet(
              mint.url,
              useMintsStore().activeUnit,
              true
            );
            try {
              this.setMintState(mint.url, "requesting");
              const quote = await this.meltQuote(
                mintWallet,
                this.payInvoiceData.input.request,
                partialAmount
              );
              console.log(quote);
              return [mint, quote];
            } catch (error) {
              console.error(`Quote failed for mint ${mint.url}:`, error);
              this.setMintState(mint.url, "error");
              throw error;
            }
          })
        );

        // Filter out null values (for mints with partialAmount <= 0)
        mintsToQuotes = mintsToQuotes.filter((item) => item !== null);

        // Phase 3: Execute payments
        data = await Promise.all(
          mintsToQuotes.map(async ([mint, quote]) => {
            try {
              // Move to paying state
              this.setMintState(mint.url, "paying");
              const mintWallet = await useWalletStore().mintWallet(
                mint.url,
                activeUnit,
                true
              );
              const mintClass = new MintClass(mint);
              const proofs = mintClass.unitProofs(activeUnit);
              const result = await this.melt(
                proofs,
                quote,
                mintWallet,
                true,
                true // ! RELEASE THE MUTEX !
              );

              // Mark as success
              this.setMintState(mint.url, "success");
              return result;
            } catch (error) {
              console.error(`Payment failed for mint ${mint.url}:`, error);
              this.setMintState(mint.url, "error");
              throw error;
            }
          })
        );
      } catch (error) {
        // notifyError(`Multi-nut payment failed: ${error}`);
        console.error(`${error}`);

        // Reset states on error so user can try again
        setTimeout(() => {
          this.clearMintStates();
        }, 3000); // Show error states for 3 seconds before clearing

        throw error;
      } finally {
        this.multiMeltButtonLoading = false;
      }

      uiStore.vibrate();
      const amountPaid =
        mintsToQuotes.reduce(
          (acc, q) => acc + q[1].amount + q[1].fee_reserve,
          0
        ) - data.reduce((acc, d) => acc + sumProofAmounts(d.change), 0);

      notifySuccess(
        this.$t("MultinutPicker.paid", {
          amount: uiStore.formatCurrency(amountPaid, activeUnit),
        })
      );

      // Close the dialog after successful payment
      setTimeout(() => {
        this.showMultinutPaymentDialog = false;
        this.payInvoiceData.show = false;
        this.clearMintStates();
      }, 2000); // Show success states for 2 seconds before closing
    },
    dismissExperimentalWarning() {
      this.multinutExperimentalWarningDismissed = true;
    },
  },
});
</script>

<style lang="scss" scoped>
@import "src/css/mintlist.css";

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6000;
}

.multinut-content-container {
  max-width: 600px;
  margin: 0 auto;
  color: var(--app-text);
  height: 100%;
  overflow-y: auto;
  position: relative;
  padding-bottom: 100px;
}

/* Top Icons */
.top-icons {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

/* Header Section */
.multinut-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.multinut-header {
  width: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--app-tint);
}

.multinut-title {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: var(--app-text);
}

.multinut-description {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: var(--app-text-muted);
}

/* Mint Selection Section */
.mint-selection-section {
  width: 100%;
}

.mint-selection-description {
  font-size: 14px;
  line-height: 20px;
  color: var(--app-text-muted);
  font-weight: 500;
  text-align: start;
}

.mints-container {
  width: 100%;
}

.mint-item {
  width: 100%;
}

/* MultinutPaymentDialog specific mint card styles */
.mint-card {
  width: 100%;
  border-radius: 12px;
  background-color: var(--app-tint);
  transition: all 0.2s ease;
}

.mint-card:hover:not(.cursor-not-allowed) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mint-card-selected {
  border-color: var(--q-primary) !important;
  background-color: rgba(25, 118, 210, 0.1) !important;
}

.mint-card-success {
  border-color: var(--q-positive) !important;
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.mint-card-error {
  border-color: var(--q-negative) !important;
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.mint-card-content {
  width: 100%;
}

.state-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.cursor-not-allowed {
  cursor: not-allowed !important;
  opacity: 0.7;
}

/* Balance and Slider Sections */
.mint-balance-section {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.mint-slider-section {
  width: 100%;
}

.allocation-badge {
  justify-content: center;
  min-width: 50px;
}

.slider-container {
  min-width: 0;
  overflow: hidden;
  flex: 1;
}

.mint-slider {
  margin: 8px 0;
}

/* Payment Progress */
.payment-progress-section {
  width: 100%;
}

.payment-progress {
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
}

.payment-progress .q-linear-progress__track {
  background-color: var(--app-tint-strong);
}

.payment-state-text {
  font-size: 10px;
  color: var(--app-text-muted);
  font-weight: 500;
  text-align: start;
}

/* Action Buttons Section */
.action-buttons-section {
  position: fixed;
  margin: 0 auto;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--app-surface);
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 1000;
}

.pay-button-fixed {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: block;
  min-height: 52px;
  font-size: 16px;
  font-weight: 600;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 600px) {
  .mint-slider {
    margin: 4px 0;
  }

  .multinut-content-container {
    padding: 12px;
    padding-bottom: 100px;
  }

  .mint-card-content {
    padding: 12px;
  }
}

/* Ensure no horizontal overflow */
.no-wrap {
  flex-wrap: nowrap !important;
}

.slider-container {
  flex-shrink: 1;
  min-width: 0 !important;
}

/* Remove old styles that are no longer needed */
.qcard {
  display: none;
}

/* Experimental Warning */
.experimental-warning {
  width: 100%;
}

.warning-dismiss-btn {
  color: var(--app-warning);
  font-weight: 600;
  margin-inline-start: -8px;
}

/* Smooth slide animation for warning */
.smooth-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 200px;
  margin-bottom: 16px;
  opacity: 1;
  pointer-events: auto;
}

.smooth-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
  margin-bottom: 16px;
  opacity: 1;
}

.smooth-slide-enter-from,
.smooth-slide-leave-to {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}
</style>
