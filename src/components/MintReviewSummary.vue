<!-- A mint card's review link: star, average score and review count when a score is known,
     otherwise a fallback label. Styled by the global .mint-review rules in app.scss. -->
<template>
  <div class="mint-review">
    <q-skeleton v-if="skeleton" type="text" width="112px" />
    <button
      v-else
      type="button"
      class="mint-review-link"
      @click.stop="$emit('open')"
    >
      <template v-if="average !== null">
        <StarIcon :size="14" fill="currentColor" class="rating-star" />
        <span class="mint-review__score">{{ average.toFixed(1) }}</span>
        <span aria-hidden="true">·</span>
        {{ count }}
        {{ $t("MintSettings.reviews_text", count) }}
      </template>
      <template v-else>{{ fallbackLabel }}</template>
      <ChevronRightIcon
        :size="16"
        class="mint-review__chevron"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "MintReviewSummary",
  components: { ChevronRightIcon, StarIcon },
  props: {
    /** A placeholder on the same line, while reviews load. */
    skeleton: { type: Boolean, default: false },
    // The average rating, or null when no score is known (the fallback label shows).
    average: {
      type: Number as PropType<number | null>,
      default: null,
    },
    count: {
      type: Number,
      default: 0,
    },
    fallbackLabel: {
      type: String,
      default: "",
    },
  },
  emits: ["open"],
});
</script>

<style scoped>
.mint-review__chevron {
  color: var(--app-text-muted);
  flex-shrink: 0;
  /* The 16px chevron's ink sits 6px inside its box: pull it onto the card's 16px guideline,
     under the menu dots. (It mirrors in rtl through the global chevron rule.) */
  margin-inline-end: -6px;
}
</style>
