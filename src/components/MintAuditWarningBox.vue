<template>
  <div class="warning-container" v-if="hasWarnings">
    <div class="warning-content">
      <q-icon name="warning" size="24px" class="warning-icon" />
      <div class="warning-text-container">
        <div class="warning-header">
          <div class="warning-title">Auditor Warnings</div>
        </div>
        <div class="warning-messages">
          <ul class="warning-list">
            <li
              v-for="(message, index) in warningMessages"
              :key="index"
              class="warning-message"
            >
              {{ message }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

interface MintRead {
  id: number;
  url: string;
  info?: string;
  name?: string;
  balance: number;
  sum_donations?: number;
  updated_at: string;
  next_update?: string;
  state: string;
  n_errors: number;
  n_mints: number;
  n_melts: number;
}

interface SwapEventRead {
  id: number;
  from_id: number;
  to_id: number;
  from_url: string;
  to_url: string;
  amount: number;
  fee: number;
  created_at: string;
  time_taken: number;
  state: string;
  error: string;
}

export default defineComponent({
  name: "MintAuditWarningBox",
  props: {
    mint: {
      type: Object as () => MintRead,
      required: true,
    },
    swaps: {
      type: Array as () => SwapEventRead[],
      required: true,
    },
    inactiveThresholdDays: {
      type: Number,
      default: 2,
    },
    recentDaysThreshold: {
      type: Number,
      default: 7,
    },
    successRateThreshold: {
      type: Number,
      default: 85,
    },
    slowMintThresholdMs: {
      type: Number,
      default: 5000, // 5 seconds in milliseconds
    },
    requiredSuccessfulSwaps: {
      type: Number,
      default: 7,
    },
  },
  setup(props) {
    const warningMessages = computed(() => {
      const messages: string[] = [];

      // Get recent swaps for reuse in multiple conditions
      const now = new Date();
      const recentSwaps = props.swaps.filter((swap) => {
        const swapDate = new Date(swap.created_at);
        const daysDifference =
          (now.getTime() - swapDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDifference <= props.recentDaysThreshold;
      });

      const successfulRecentSwaps = recentSwaps.filter(
        (swap) => swap.state === "OK"
      );
      const recentSuccessRate =
        recentSwaps.length > 0
          ? (successfulRecentSwaps.length / recentSwaps.length) * 100
          : 0;

      // Check mint state
      if (props.mint.state === "WARN" || props.mint.state === "ERROR") {
        const baseMessage = "The last swap attempt has failed.";

        if (recentSwaps.length > 0) {
          let successMessage = `${successfulRecentSwaps.length} of ${recentSwaps.length} swaps in the last ${props.recentDaysThreshold} days succeeded.`;

          // Add "However, " prefix if success rate is above threshold
          if (recentSuccessRate >= props.successRateThreshold) {
            messages.push(
              `${baseMessage} However, ${successMessage} This mint seems reliable, failures might be due to the receiving mint.`
            );
          } else {
            messages.push(
              `${baseMessage} Only ${successMessage} This mint might be unreliable.`
            );
          }
        } else {
          messages.push(baseMessage);
        }
      } else if (props.mint.state === "UNKNOWN") {
        messages.push(
          "The auditor was not able to determine the quality of this mint yet."
        );
      } else if (props.mint.state === "OK") {
        // Add warnings for OK state mints with not enough successful swaps or low success rate
        const warningsNeeded = [];

        // Check for not enough successful swaps
        if (successfulRecentSwaps.length < props.requiredSuccessfulSwaps) {
          warningsNeeded.push(
            `The auditor does not have enough recent data on this mint. There were only ${
              successfulRecentSwaps.length
            } successful ${
              successfulRecentSwaps.length === 1 ? "swap" : "swaps"
            } in the last ${props.recentDaysThreshold} days.`
          );
        }

        // Check for low success rate
        if (
          recentSwaps.length > 0 &&
          recentSuccessRate < props.successRateThreshold
        ) {
          warningsNeeded.push(
            `In the last ${
              props.recentDaysThreshold
            } days, this mint had a success rate of ${Math.round(
              recentSuccessRate
            )}%, below the recommended ${props.successRateThreshold}%.`
          );
        }

        // Add combined message if both issues exist
        if (warningsNeeded.length > 0) {
          messages.push(...warningsNeeded);
        }
      }

      // Check last successful swap
      const successfulSwaps = props.swaps.filter((swap) => swap.state === "OK");
      if (successfulSwaps.length > 0) {
        const lastSuccessfulSwap = new Date(successfulSwaps[0].created_at);
        const now = new Date();
        const daysDifference =
          (now.getTime() - lastSuccessfulSwap.getTime()) /
          (1000 * 60 * 60 * 24);

        if (daysDifference > props.inactiveThresholdDays) {
          const days = Math.floor(daysDifference);

          const baseMessage = `This mint had no swaps for ${days} ${
            days === 1 ? "day" : "days"
          }. It might be unreachable.`;
          messages.push(baseMessage);
        }

        // Check if mint is slow
        const successfulSwapsWithTime = successfulSwaps.filter(
          (swap) => swap.time_taken
        );
        if (successfulSwapsWithTime.length > 0) {
          const totalTime = successfulSwapsWithTime.reduce(
            (sum, swap) => sum + (swap.time_taken || 0),
            0
          );
          const averageTimeMs = totalTime / successfulSwapsWithTime.length;

          if (averageTimeMs > props.slowMintThresholdMs) {
            const averageTimeSeconds = (averageTimeMs / 1000).toFixed(1);
            messages.push(
              `This mint is slow. Payments from this mint took ${averageTimeSeconds} seconds on average.`
            );
          }
        }
      } else if (props.swaps.length > 0) {
        // If there are swaps but none are successful
        messages.push(
          "No successful swaps recorded for this mint. It might be unreachable."
        );
      }

      return messages;
    });

    const hasWarnings = computed(() => warningMessages.value.length > 0);

    return {
      warningMessages,
      hasWarnings,
    };
  },
});
</script>

<style scoped>
.warning-container {
  width: 100%;
  position: relative;
  border-radius: 8px;
  border: 1px solid #f18408;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 16px;
  text-align: left;
  font-size: 14px;
  color: #f18408;
  margin-bottom: 16px;
  margin-top: 8px;
}

.warning-content {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
}

.warning-icon {
  flex-shrink: 0;
  color: #f18408;
}

.warning-text-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
}

.warning-header {
  align-self: stretch;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.warning-title {
  position: relative;
  line-height: 16px;
  font-weight: 500;
}

.warning-messages {
  align-self: stretch;
}

.warning-list {
  margin: 4px 0 0 0;
  padding-left: 20px;
}

.warning-message {
  align-self: stretch;
  position: relative;
  line-height: 16px;
  margin-bottom: 4px;
}

.warning-message:last-child {
  margin-bottom: 0;
}
</style>
