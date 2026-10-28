<!-- A mint card's review link: star, average score and review count when a score is known,
     otherwise a fallback label. Styled by the global .mint-review rules in app.scss. -->
<template>
  <div class="mint-review">
    <button type="button" class="mint-review-link" @click.stop="$emit('open')">
      <template v-if="average !== null">
        <q-icon name="star" size="14px" class="rating-star" />
        <span class="mint-review__score">{{ average.toFixed(1) }}</span>
        <span aria-hidden="true">·</span>
        {{ count }}
        {{ $t("MintSettings.reviews_text", count) }}
      </template>
      <template v-else>{{ fallbackLabel }}</template>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "MintReviewSummary",
  props: {
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
      required: true,
    },
  },
  emits: ["open"],
});
</script>
