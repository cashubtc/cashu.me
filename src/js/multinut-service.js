import { useWalletStore } from "src/stores/wallet";
import { useMintsStore, MintClass } from "src/stores/mints";
import { notifyError, notifySuccess } from "src/js/notify";

export class MultinutService {
  /**
   * Execute a multinut payment with the given parameters
   * @param {Object} payInvoiceData - The payment invoice data
   * @param {Array} selectedMints - Array of mints to use for payment
   * @param {Object} mintProportions - Proportions for each mint (percentage 0-100)
   * @param {string} activeUnit - The active currency unit
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<Object>} - Payment result with success/failure details
   */
  static async executePayment(
    payInvoiceData,
    selectedMints,
    mintProportions,
    activeUnit,
    onProgress = null
  ) {
    const walletStore = useWalletStore();
    const mintsStore = useMintsStore();

    const totalQuoteAmount = payInvoiceData.meltQuote.response.amount;
    let mintsToQuotes = [];
    let mintsToAmounts = [];
    let data;

    try {
      // Phase 1: Calculate amount for each Mint using custom proportions
      for (const mint of selectedMints) {
        const partialAmount = this.getPartialAmount(
          mint,
          mintProportions,
          totalQuoteAmount
        );
        console.log(`partialAmount for mint ${mint.url}: ${partialAmount}`);

        if (partialAmount > 0) {
          mintsToAmounts.push([mint, partialAmount]);
        } else {
          // remove from selectedMints so we don't show progress in the UI
          selectedMints = selectedMints.filter((m) => m.url !== mint.url);
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
        throw new Error(
          `Amount calculation error: ${totalCalculated} vs ${totalQuoteAmount}`
        );
      }

      // Phase 2: Request quotes from all selected mints
      if (onProgress) onProgress("requesting", selectedMints.length);

      mintsToQuotes = await Promise.all(
        mintsToAmounts.map(async ([mint, partialAmount], i) => {
          if (partialAmount <= 0) {
            return null;
          }
          console.log(`Quoting mint: ${mint.url}`);
          const mintWallet = walletStore.mintWallet(mint.url, activeUnit);
          try {
            const quote = await walletStore.meltQuote(
              mintWallet,
              payInvoiceData.input.request,
              partialAmount
            );
            console.log(quote);
            return [mint, quote];
          } catch (error) {
            console.error(`Quote failed for mint ${mint.url}:`, error);
            throw error;
          }
        })
      );

      // Filter out null values (for mints with partialAmount <= 0)
      mintsToQuotes = mintsToQuotes.filter((item) => item !== null);

      // Phase 3: Execute payments
      if (onProgress) onProgress("paying", selectedMints.length);

      data = await Promise.all(
        mintsToQuotes.map(async ([mint, quote]) => {
          try {
            const mintWallet = walletStore.mintWallet(mint.url, activeUnit);
            const mintClass = new MintClass(mint);
            const proofs = mintClass.unitProofs(activeUnit);
            const result = await walletStore.melt(
              proofs,
              quote,
              mintWallet,
              true
            );
            return { mint, result, success: true };
          } catch (error) {
            console.error(`Payment failed for mint ${mint.url}:`, error);
            return { mint, error, success: false };
          }
        })
      );

      // Calculate total amount paid
      const amountPaid =
        mintsToQuotes.reduce(
          (acc, q) => acc + q[1].amount + q[1].fee_reserve,
          0
        ) -
        data.reduce(
          (acc, d) =>
            acc +
            (d.success
              ? d.result.change.reduce((acc1, p) => acc1 + p.amount, 0)
              : 0),
          0
        );

      // Check for any failed payments
      const failedPayments = data.filter((d) => !d.success);
      const successfulPayments = data.filter((d) => d.success);

      return {
        success: failedPayments.length === 0,
        amountPaid,
        successfulPayments,
        failedPayments,
        mintBreakdown: this.getMintBreakdown(mintsToQuotes, mintProportions),
      };
    } catch (error) {
      console.error("Multinut payment failed:", error);
      throw error;
    }
  }

  /**
   * Calculate the partial amount for a specific mint based on proportions
   */
  static getPartialAmount(mint, mintProportions, totalAmount) {
    const percentage = mintProportions[mint.url] || 0;
    return Math.round(totalAmount * (percentage / 100));
  }

  /**
   * Initialize mint proportions based on balance weights
   */
  static initializeMintProportions(selectedMints, totalAmount, activeUnit) {
    if (selectedMints.length === 0) {
      return {};
    }

    // Calculate default proportions based on balance weights, but respect capacity constraints
    const { weights } = this.multiMintBalance(selectedMints, activeUnit);
    const newProportions = {};

    // First pass: calculate ideal proportions
    selectedMints.forEach((mint, index) => {
      const idealPercentage = weights[index] * 100;
      const maxPercentage = this.getMaxPercentageForMint(
        mint,
        totalAmount,
        activeUnit
      );
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
      const mintsWithCapacity = selectedMints.filter((mint) => {
        const maxPercentage = this.getMaxPercentageForMint(
          mint,
          totalAmount,
          activeUnit
        );
        return newProportions[mint.url] < maxPercentage;
      });

      if (mintsWithCapacity.length > 0) {
        // Distribute remaining proportionally among mints with available capacity
        const totalAvailableCapacity = mintsWithCapacity.reduce((sum, mint) => {
          const maxPercentage = this.getMaxPercentageForMint(
            mint,
            totalAmount,
            activeUnit
          );
          return sum + (maxPercentage - newProportions[mint.url]);
        }, 0);

        if (totalAvailableCapacity > 0) {
          mintsWithCapacity.forEach((mint) => {
            const maxPercentage = this.getMaxPercentageForMint(
              mint,
              totalAmount,
              activeUnit
            );
            const availableCapacity = maxPercentage - newProportions[mint.url];
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

    return newProportions;
  }

  /**
   * Calculate the maximum percentage a mint can handle based on its balance
   */
  static getMaxPercentageForMint(mint, totalAmount, activeUnit) {
    const mintBalance = new MintClass(mint).unitBalance(activeUnit);
    return Math.min(100, (mintBalance / totalAmount) * 100);
  }

  /**
   * Calculate balance weights for multiple mints
   */
  static multiMintBalance(selectedMints, unit) {
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
  }

  /**
   * Generate a human-readable breakdown of mint usage
   */
  static getMintBreakdown(mintsToQuotes, mintProportions) {
    return mintsToQuotes
      .map(([mint, quote]) => {
        const percentage = Math.round(mintProportions[mint.url] || 0);
        const shortUrl = this.getShortUrl(mint.url);
        return `${shortUrl}(${percentage}%)`;
      })
      .join(" ");
  }

  /**
   * Get a shortened version of the mint URL for display
   */
  static getShortUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || url.substring(0, 20) + "...";
    } catch {
      return url.substring(0, 20) + "...";
    }
  }
}
