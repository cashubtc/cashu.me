<template>
  <q-dialog
    v-model="showMultinutPaymentDialog"
    position="top"
    :maximized="$q.screen.lt.sm"
    backdrop-filter="blur(2px) brightness(60%)"
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    full-height
  >
    <q-card class="q-pa-lg q-pt-xl qcard">
      <div class="row items-center no-wrap q-mb-lg">
        <div class="col-10">
          <h5 class="q-my-none">Multinut Payment</h5>
          <p class="q-my-xs text-grey-6">
            Pay
            {{
              formatCurrency(
                payInvoiceData.meltQuote.response.amount,
                activeUnit
              )
            }}
            using multiple mints
          </p>
        </div>
        <div class="col-2 text-right">
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close"
            color="grey"
            @click="closeMultinutDialog"
          />
        </div>
      </div>

      <!-- Minimalist Mint Selection List -->
      <div class="q-mb-lg">
        <q-list padding>
          <q-item>
            <q-item-section>
              <q-item-label overline class="text-weight-bold">
                Select Mints
              </q-item-label>
              <q-item-label caption>
                Choose one or multiple mints to execute the payment.
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list padding style="max-height: 400px; overflow-y: auto">
          <div
            v-for="mint in multiMints"
            :key="mint.url"
            v-show="!isPaymentInProgress || isSelected(mint)"
          >
            <q-item
              clickable
              class="q-pb-xs"
              @click="!isPaymentInProgress && toggleMint(mint)"
              :class="{ 'cursor-not-allowed': isPaymentInProgress }"
            >
              <q-item-section avatar>
                <!-- Show state indicator during payment, checkbox otherwise -->
                <div
                  v-if="isPaymentInProgress && isSelected(mint)"
                  class="state-indicator"
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
                <q-checkbox
                  v-else
                  :model-value="isSelected(mint)"
                  @update:model-value="toggleMint(mint)"
                  :color="isSelected(mint) ? 'primary' : 'grey'"
                  class="cursor-pointer"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  lines="1"
                  class="cursor-pointer"
                  style="word-break: break-word"
                  :class="{ 'cursor-not-allowed': isPaymentInProgress }"
                >
                  {{ mint.nickname || getShortUrl(mint.url) }}
                  <!-- State text during payment -->
                  <span
                    v-if="
                      isPaymentInProgress &&
                      isSelected(mint) &&
                      mintStates[mint.url]
                    "
                    class="text-caption text-grey-6 q-ml-sm"
                  >
                    ({{ getStateText(mintStates[mint.url]) }})
                  </span>
                </q-item-label>
                <q-item-label>
                  <q-badge
                    v-for="unit in mintClass(mint).units"
                    :key="unit"
                    :color="isSelected(mint) ? 'primary' : 'grey'"
                    :label="
                      formatCurrency(mintClass(mint).unitBalance(unit), unit)
                    "
                    class="q-mx-xs q-mb-xs"
                  />
                </q-item-label>
              </q-item-section>
            </q-item>

            <!-- Payment Distribution Slider for Selected Mints -->
            <div
              v-if="isSelected(mint) && !isPaymentInProgress"
              class="q-px-md"
            >
              <div class="row items-center q-gutter-md">
                <div class="col-2 text-caption text-grey-6">
                  {{ formatCurrency(getPartialAmount(mint), activeUnit) }}
                </div>
                <div class="col">
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
                    label
                    :label-value="`${getMintProportion(mint).toFixed(1)}%`"
                    label-always
                    class="mint-slider"
                  />
                </div>
              </div>
            </div>

            <q-separator spaced />
          </div>
          <!-- Total Selected Balance -->
          <q-item>
            <q-item-section>
              <q-item-label overline class="text-weight-bold">
                Total Selected Balance
              </q-item-label>
              <q-item-label caption>
                {{ formatCurrency(totalSelectedBalance, activeUnit) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Total Distribution Amount -->
          <q-item v-if="selectedMints.length > 0">
            <q-item-section>
              <q-item-label overline class="text-weight-bold">
                Total Distribution
              </q-item-label>
              <q-item-label caption>
                {{ formatCurrency(totalDistributedAmount, activeUnit) }}
                <span
                  v-if="
                    totalDistributedAmount ===
                    payInvoiceData.meltQuote.response.amount
                  "
                  class="text-positive q-ml-sm"
                >
                  ✓ Exact match
                </span>
                <span v-else class="text-negative q-ml-sm">
                  ⚠ Mismatch ({{
                    formatCurrency(
                      payInvoiceData.meltQuote.response.amount -
                        totalDistributedAmount,
                      activeUnit
                    )
                  }})
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Action Buttons - aligned like PayInvoiceDialog -->
      <div class="row q-mt-lg">
        <q-btn
          unelevated
          rounded
          color="primary"
          :disabled="!canExecutePayment"
          @click="executeMultinutPayment"
          :loading="multiMeltButtonLoading"
          label="Pay Multi"
          class="q-px-lg"
        >
          <template v-slot:loading>
            <q-spinner-hourglass />
          </template>
        </q-btn>
        <q-btn flat color="grey" class="q-ml-auto" @click="closeMultinutDialog">
          Cancel
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import { getShortUrl } from "src/js/wallet-helpers";

export default defineComponent({
  name: "MultinutPaymentDialog",
  mixins: [windowMixin],
  components: {},
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
            const remainingDifference =
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
          return "Requesting...";
        case "paying":
          return "Paying...";
        case "success":
          return "Success";
        case "error":
          return "Failed";
        default:
          return "";
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
      let mintsToAmounts = [];
      let remainder = 0.0;
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
            `Amount calculation error: ${totalCalculated} vs ${totalQuoteAmount}`
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
            const mintWallet = useWalletStore().mintWallet(
              mint.url,
              useMintsStore().activeUnit
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
              const mintWallet = useWalletStore().mintWallet(
                mint.url,
                activeUnit
              );
              const mintClass = new MintClass(mint);
              const proofs = mintClass.unitProofs(activeUnit);
              const result = await this.melt(proofs, quote, mintWallet, true);

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
        notifyError(`Multi-nut payment failed: ${error}`);
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
        ) -
        data.reduce(
          (acc, d) => acc + d.change.reduce((acc1, p) => acc1 + p.amount, 0),
          0
        );

      notifySuccess(
        "Paid " +
          uiStore.formatCurrency(amountPaid, activeUnit) +
          " via Lightning"
      );

      // Close the dialog after successful payment
      setTimeout(() => {
        this.showMultinutPaymentDialog = false;
        this.payInvoiceData.show = false;
        this.clearMintStates();
      }, 2000); // Show success states for 2 seconds before closing
    },
  },
});
</script>

<style lang="scss" scoped>
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
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

.mint-slider {
  margin: 8px 0;
}
</style>
