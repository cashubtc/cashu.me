<template>
  <div class="bar-chart-container" ref="chartContainer">
    <div class="chart-wrapper">
      <div class="bars-container">
        <div
          v-for="(bucket, index) in displayBuckets"
          :key="`bucket-${index}`"
          class="bar"
          :class="{
            placeholder: bucket.count === 0,
          }"
          :style="{
            width: `${barWidth}px`,
            left: `${index * (barWidth + spacing)}px`,
            backgroundColor:
              bucket.count > 0
                ? getSuccessColor(bucket.successRate)
                : 'transparent',
          }"
          @mouseover="showBucketTooltip($event, bucket)"
          @mouseleave="hideTooltip"
        ></div>
      </div>
      <div class="time-axis">
        <div
          v-for="(date, index) in timeTicks"
          :key="index"
          class="time-tick"
          :style="{
            left: `${(index / (timeTicks.length - 1)) * 100}%`,
            display: index === timeTicks.length - 1 ? 'none' : 'block',
          }"
        >
          {{ formatTime(date) }}
        </div>
      </div>
    </div>
    <div
      v-if="tooltip.show"
      class="tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div v-html="tooltip.content"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";

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

interface SwapBucket {
  swaps: SwapEventRead[];
  count: number;
  successCount: number;
  successRate: number;
  startTime: Date;
  endTime: Date;
}

export default defineComponent({
  name: "MintAuditSwapsBarChart",
  props: {
    swaps: {
      type: Array as () => SwapEventRead[],
      required: true,
    },
    minBars: {
      type: Number,
      default: 16,
    },
    maxPossibleBars: {
      type: Number,
      default: 200,
    },
    barSpacing: {
      type: Number,
      default: 2,
    },
    minBarWidth: {
      type: Number,
      default: 2,
    },
  },
  setup(props) {
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      content: "",
    });

    const chartContainer = ref<HTMLElement | null>(null);
    const containerWidth = ref(0);
    const spacing = computed(() => props.barSpacing);
    const minBarWidth = computed(() => props.minBarWidth);
    const sortedSwaps = computed(() =>
      [...props.swaps].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    );

    // Calculate responsive maxBars based on container width
    const maxBars = computed(() => {
      if (containerWidth.value <= 0) return props.minBars;

      // Scale maxBars based on container width
      // For small screens (e.g., width < 600px), use minBars
      // For large screens, scale up to maxPossibleBars
      const minWidth = 200; // Width for minimum bars
      const maxWidth = 2600; // Width for maximum bars

      if (containerWidth.value <= minWidth) {
        return props.minBars;
      } else if (containerWidth.value >= maxWidth) {
        return props.maxPossibleBars;
      } else {
        // Linear interpolation between minBars and maxPossibleBars
        const widthRatio =
          (containerWidth.value - minWidth) / (maxWidth - minWidth);
        return Math.floor(
          props.minBars + widthRatio * (props.maxPossibleBars - props.minBars)
        );
      }
    });

    const barsCount = computed(() => {
      if (containerWidth.value <= 0) return maxBars.value;

      // Calculate how many bars can fit with the given spacing
      // Formula: (containerWidth + barSpacing) / (minBarWidth + barSpacing)
      const maxPossibleBars = Math.floor(
        (containerWidth.value + spacing.value) /
          (minBarWidth.value + spacing.value)
      );

      // Limit to maxBars computed value
      return Math.min(maxPossibleBars, maxBars.value);
    });

    const barWidth = computed(() => {
      if (containerWidth.value <= 0 || barsCount.value <= 0)
        return minBarWidth.value;

      // Calculate the width that would fill the container with the given number of bars and spacing
      // Formula: (containerWidth - (barSpacing * (barsCount - 1))) / barsCount
      return Math.max(
        minBarWidth.value,
        (containerWidth.value - spacing.value * (barsCount.value - 1)) /
          barsCount.value
      );
    });

    const updateContainerWidth = () => {
      if (chartContainer.value) {
        const barsContainer =
          chartContainer.value.querySelector(".bars-container");
        if (barsContainer) {
          containerWidth.value = barsContainer.clientWidth;
        }
      }
    };

    onMounted(() => {
      updateContainerWidth();

      const resizeObserver = new ResizeObserver(() => {
        updateContainerWidth();
      });

      if (chartContainer.value) {
        resizeObserver.observe(chartContainer.value);
      }

      window.addEventListener("resize", updateContainerWidth);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", updateContainerWidth);
      };
    });

    const timeTicks = computed(() => {
      if (sortedSwaps.value.length === 0) return [];

      // Use the same time range logic as in displayBuckets
      const startTime = new Date(sortedSwaps.value[0].created_at).getTime(); // Oldest swap
      const endTime = new Date(
        sortedSwaps.value[sortedSwaps.value.length - 1].created_at
      ).getTime(); // Latest swap

      const interval = (startTime - endTime) / 3; // 4 ticks (now, 2 middle, end)

      // Generate time ticks from oldest to newest to match bar positions
      return Array.from(
        { length: 4 },
        (_, i) => new Date(endTime + interval * i)
      );
    });

    const displayBuckets = computed(() => {
      if (sortedSwaps.value.length === 0) {
        return Array(barsCount.value).fill({
          swaps: [],
          count: 0,
          successCount: 0,
          successRate: 0,
          startTime: new Date(),
          endTime: new Date(),
        });
      }

      // Create buckets based on time
      const endTime = new Date(
        sortedSwaps.value[sortedSwaps.value.length - 1].created_at
      ).getTime(); // Latest swap
      const startTime = new Date(sortedSwaps.value[0].created_at).getTime(); // Oldest swap
      const timeRange = endTime - startTime;

      const buckets: SwapBucket[] = Array(barsCount.value)
        .fill(null)
        .map(() => ({
          swaps: [],
          count: 0,
          successCount: 0,
          successRate: 0,
          startTime: new Date(),
          endTime: new Date(),
        }));

      if (timeRange === 0) {
        // If all swaps happened at the same time, place them in the first bucket
        buckets[0].swaps = [...sortedSwaps.value];
        buckets[0].count = sortedSwaps.value.length;
        buckets[0].successCount = sortedSwaps.value.filter(
          (swap) => swap.state === "OK"
        ).length;
        buckets[0].successRate =
          buckets[0].count > 0 ? buckets[0].successCount / buckets[0].count : 0;
        buckets[0].startTime = new Date(startTime);
        buckets[0].endTime = new Date(endTime);
        return buckets;
      }

      // Calculate bucket time ranges
      const bucketTimeSpan = timeRange / barsCount.value;

      for (let i = 0; i < barsCount.value; i++) {
        // Reverse the order: newest (latest) on the left, oldest on the right
        const reversedIndex = barsCount.value - 1 - i;
        const bucketStartTime = startTime + reversedIndex * bucketTimeSpan;
        const bucketEndTime = startTime + (reversedIndex + 1) * bucketTimeSpan;

        buckets[i].startTime = new Date(bucketStartTime);
        buckets[i].endTime = new Date(bucketEndTime);
      }

      // Assign swaps to buckets
      sortedSwaps.value.forEach((swap) => {
        const swapTime = new Date(swap.created_at).getTime();

        // Find which bucket this swap belongs to (reversing order so newest is on left)
        const normalizedPosition = (swapTime - startTime) / timeRange; // 0 = oldest, 1 = newest
        const reversedPosition = 1 - normalizedPosition; // 0 = newest, 1 = oldest
        const bucketIndex = Math.min(
          Math.floor(reversedPosition * barsCount.value),
          barsCount.value - 1
        );

        if (bucketIndex >= 0) {
          buckets[bucketIndex].swaps.push(swap);
          buckets[bucketIndex].count++;
          if (swap.state === "OK") {
            buckets[bucketIndex].successCount++;
          }
        }
      });

      // Calculate success rates for each bucket
      buckets.forEach((bucket) => {
        bucket.successRate =
          bucket.count > 0 ? bucket.successCount / bucket.count : 0;
      });

      return buckets;
    });

    const getSuccessColor = (successRate: number) => {
      // Convert success rate to a color from red (0%) to orange (50%) to green (100%)
      if (successRate === 1) return "#4CAF50"; // Pure green for 100%
      if (successRate === 0) return "#f44336"; // Pure red for 0%

      if (successRate < 0.5) {
        // Red to orange gradient (0% to 50%)
        const r = 244;
        const g = Math.floor(67 + successRate * 2 * (165 - 67));
        const b = 54;
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Orange to green gradient (50% to 100%)
        const r = Math.floor(244 - (successRate - 0.5) * 2 * (244 - 76));
        const g = Math.floor(165 + (successRate - 0.5) * 2 * (175 - 165));
        const b = Math.floor(54 - (successRate - 0.5) * 2 * (54 - 50));
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    const formatTime = (date: Date) => {
      // Special case for the most recent time (leftmost tick)
      if (sortedSwaps.value.length > 0) {
        const latestSwapTime = new Date(
          sortedSwaps.value[sortedSwaps.value.length - 1].created_at
        ).getTime();
        if (Math.abs(date.getTime() - latestSwapTime) < 1000) {
          // Within 1 second
          return "Now";
        }
      }

      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday =
        new Date(today.setDate(today.getDate() - 1)).toDateString() ===
        date.toDateString();

      let dateStr = "";
      if (isToday) {
        dateStr = "Today";
      } else if (isYesterday) {
        dateStr = "Yesterday";
      } else {
        dateStr = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }

      return `${dateStr} ${date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    };

    const formatDate = (dateStr: string) => {
      const hasTimezone = /([Zz]|[+\-]\d{2}:\d{2})$/.test(dateStr);
      let utcDateStr = dateStr;

      if (!hasTimezone) {
        utcDateStr += "Z";
      }

      const dateObj = new Date(utcDateStr);
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }

      const today = new Date();
      const isToday = dateObj.toDateString() === today.toDateString();
      const isYesterday =
        new Date(today.setDate(today.getDate() - 1)).toDateString() ===
        dateObj.toDateString();

      let formattedDate = "";
      if (isToday) {
        formattedDate = "Today";
      } else if (isYesterday) {
        formattedDate = "Yesterday";
      } else {
        formattedDate = dateObj.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }

      return `${formattedDate} ${dateObj.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    };

    const showBucketTooltip = (event: MouseEvent, bucket: SwapBucket) => {
      if (bucket.count === 0) {
        hideTooltip();
        return;
      }

      const successRate = Math.round(bucket.successRate * 100);
      let timeRange = "";

      if (bucket.startTime && bucket.endTime) {
        timeRange = `${formatDate(
          bucket.startTime.toISOString()
        )} - ${formatDate(bucket.endTime.toISOString())}`;
      }

      tooltip.value = {
        show: true,
        x: event.clientX + 10,
        y: event.clientY + 10,
        content: `
          <div><b>Swaps:</b> ${bucket.count}</div>
          <div><b>Success rate:</b> ${successRate}% (${bucket.successCount}/${bucket.count})</div>
          <div><b>Time range:</b> ${timeRange}</div>
        `,
      };
    };

    const hideTooltip = () => {
      tooltip.value.show = false;
    };

    return {
      tooltip,
      timeTicks,
      displayBuckets,
      chartContainer,
      barsCount,
      barWidth,
      spacing,
      maxBars,
      formatTime,
      formatDate,
      showBucketTooltip,
      hideTooltip,
      getSuccessColor,
    };
  },
});
</script>

<style scoped>
.bar-chart-container {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding-bottom: 6px;
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  width: 100%;
}

.chart-title {
  color: white;
  text-align: center;
}

.chart-wrapper {
  position: relative;
  height: 65px;
  width: 100%;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  height: 40px;
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 4px;
  position: relative;
  width: 100%;
}

.bar {
  height: 100%;
  transition: height 0.3s ease;
  border-radius: 2px;
  position: absolute;
  top: 0;
}

.bar:hover {
  filter: brightness(1.2);
}

.time-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}

.time-tick {
  position: absolute;
  transform: translateX(-50%);
  color: #888;
  font-size: 10px;
  white-space: nowrap;
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}

.bar.placeholder {
  background-color: transparent;
  border: 1px solid #444;
}

.bar.placeholder:hover {
  filter: none;
}
</style>
