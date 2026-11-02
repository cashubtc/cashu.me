<template>
  <AppCallout
    v-if="hasWarnings"
    variant="warning"
    class="q-mb-md"
    :title="$t('MintAuditInfo.warnings_title')"
  >
    <ul class="audit-warning-list">
      <li v-for="(message, index) in warningMessages" :key="index">
        {{ message }}
      </li>
    </ul>
  </AppCallout>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import AppCallout from "src/components/AppCallout.vue";
import { i18n } from "src/boot/i18n";
import type { MintRead, SwapEventRead } from "src/js/mint-audit";

const t = i18n.global.t;

export default defineComponent({
  name: "MintAuditWarningBox",
  components: { AppCallout },
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
        const baseMessage = t("MintAuditInfo.warnings.last_swap_failed");

        if (recentSwaps.length > 0) {
          const successMessage = t("MintAuditInfo.warnings.recent_success", {
            successful: successfulRecentSwaps.length,
            total: recentSwaps.length,
            days: props.recentDaysThreshold,
          });

          // Add "However, " prefix if success rate is above threshold
          if (recentSuccessRate >= props.successRateThreshold) {
            messages.push(
              t("MintAuditInfo.warnings.reliable", {
                base: baseMessage,
                success: successMessage,
              })
            );
          } else {
            messages.push(
              t("MintAuditInfo.warnings.unreliable", {
                base: baseMessage,
                success: successMessage,
              })
            );
          }
        } else {
          messages.push(baseMessage);
        }
      } else if (props.mint.state === "UNKNOWN") {
        messages.push(t("MintAuditInfo.warnings.unknown"));
      } else if (props.mint.state === "OK") {
        // Add warnings for OK state mints with not enough successful swaps or low success rate
        const warningsNeeded = [];

        // Check for not enough successful swaps
        if (successfulRecentSwaps.length < props.requiredSuccessfulSwaps) {
          warningsNeeded.push(
            t(
              "MintAuditInfo.warnings.not_enough_data",
              {
                count: successfulRecentSwaps.length,
                days: props.recentDaysThreshold,
              },
              successfulRecentSwaps.length
            )
          );
        }

        // Check for low success rate
        if (
          recentSwaps.length > 0 &&
          recentSuccessRate < props.successRateThreshold
        ) {
          warningsNeeded.push(
            t("MintAuditInfo.warnings.low_success", {
              days: props.recentDaysThreshold,
              rate: Math.round(recentSuccessRate),
              threshold: props.successRateThreshold,
            })
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

          messages.push(t("MintAuditInfo.warnings.inactive", { days }, days));
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
              t("MintAuditInfo.warnings.slow", { seconds: averageTimeSeconds })
            );
          }
        }
      } else if (props.swaps.length > 0) {
        // If there are swaps but none are successful
        messages.push(t("MintAuditInfo.warnings.no_successful"));
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
.audit-warning-list {
  margin: 2px 0 0;
  padding-inline-start: 18px;
}
</style>
