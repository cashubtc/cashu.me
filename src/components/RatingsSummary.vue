<!-- A mint's rating summary, after the app-store pattern: the average score large on the
     start side with "out of 5" under it, then one bar per star level. The review count is
     the list header's (MintRatingsComponent), so it isn't repeated here. `skeleton` draws the same boxes with placeholders while the reviews load. -->
<template>
  <div
    class="row items-start ratings-summary"
    :aria-busy="skeleton || undefined"
  >
    <div class="column items-center ratings-summary__score-col">
      <div class="text-h2 ratings-summary__score">
        <q-skeleton
          v-if="skeleton"
          type="rect"
          width="72px"
          height="56px"
          class="ratings-summary__score-skeleton"
        />
        <template v-else>{{ averageDisplay }}</template>
      </div>
      <div class="text-caption text-app-muted ratings-summary__out-of">
        <q-skeleton
          v-if="skeleton"
          type="rect"
          width="48px"
          height="14px"
          class="q-my-xs"
        />
        <template v-else>{{ $t("MintRatings.out_of") }} 5</template>
      </div>
    </div>

    <div class="col column ratings-summary__bars">
      <div
        v-for="star in [5, 4, 3, 2, 1]"
        :key="star"
        class="row items-center no-wrap ratings-summary__bar-row"
      >
        <!-- Only as many stars as the level, end-aligned so all five bars start together. -->
        <div
          class="row items-center justify-end no-wrap ratings-summary__stars"
        >
          <!-- Loading: the star labels are placeholders too, so the empty tracks don't
               read as a finished chart with no ratings (council R75). -->
          <q-skeleton
            v-if="skeleton"
            type="rect"
            :width="`${star * 13}px`"
            height="12px"
          />
          <StarIcon
            v-else
            v-for="i in star"
            :key="i"
            :size="12"
            fill="currentColor"
            class="text-app-muted"
          />
        </div>
        <div class="col ratings-summary__track">
          <q-skeleton
            v-if="skeleton"
            type="rect"
            height="100%"
            class="ratings-summary__track-skeleton"
          />
          <div
            v-else
            class="ratings-summary__fill"
            :style="{ width: percentage(star) + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Star as StarIcon } from "lucide-vue-next";

export default defineComponent({
  name: "RatingsSummary",
  components: { StarIcon },
  props: {
    /** The average rating, or null when no review carries one. */
    average: { type: Number as PropType<number | null>, default: null },
    /** How many ratings fall on each star level, 1 to 5. */
    distribution: {
      type: Object as PropType<Record<number, number>>,
      default: () => ({}),
    },
    skeleton: { type: Boolean, default: false },
  },
  computed: {
    averageDisplay(): string {
      return this.average !== null ? this.average.toFixed(1) : "n/a";
    },
    rated(): number {
      return Object.values(this.distribution).reduce((a, b) => a + b, 0);
    },
  },
  methods: {
    percentage(star: number): number {
      if (!this.rated) return 0;
      return ((this.distribution[star] || 0) / this.rated) * 100;
    },
  },
});
</script>

<style scoped>
.ratings-summary {
  gap: 24px;
}
.ratings-summary__score-col {
  min-width: 100px;
}
.ratings-summary__score {
  align-items: center;
  display: flex;
  font-weight: 600;
  justify-content: center;
  line-height: 1;
  min-height: 60px;
}
/* One caption line tall in both states, so nothing below moves when the score lands. */
.ratings-summary__out-of {
  font-weight: 400;
  line-height: 20px;
  margin-top: 4px;
  min-height: 20px;
}
.ratings-summary__bars {
  gap: 6px;
}
.ratings-summary__bar-row {
  gap: 8px;
}
.ratings-summary__stars {
  flex: none;
  gap: 1px;
  width: 64px;
}
.ratings-summary__track {
  background: color-mix(in srgb, var(--app-text) 12%, transparent);
  border-radius: 2px;
  height: 4px;
  overflow: hidden;
}
.ratings-summary__fill {
  background: var(--q-primary);
  height: 100%;
  transition: width 0.3s ease;
}
.ratings-summary__track-skeleton {
  border-radius: 2px;
}
.ratings-summary__track:has(.ratings-summary__track-skeleton) {
  height: 8px;
  border-radius: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .ratings-summary__fill {
    transition: none;
  }
}
</style>
