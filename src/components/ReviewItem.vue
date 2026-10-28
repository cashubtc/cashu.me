<!-- One mint review, after the app-store pattern: a small avatar, the name (tap to copy the
     npub) with trust and "your review" marks and the date at the end, the stars under it,
     then the comment. `skeleton` draws the same boxes with placeholders while reviews load. -->
<template>
  <div class="review-item" :aria-hidden="skeleton || undefined">
    <!-- Avatar: the reviewer's picture, else the tinted disc and line glyph of history rows. -->
    <q-skeleton v-if="skeleton" type="QAvatar" size="36px" />
    <IconCircle
      v-else
      size="xs"
      class="review-avatar"
      :src="picture"
      :icon="UserIcon"
    />

    <div class="col review-body">
      <div class="row items-center no-wrap review-head">
        <q-skeleton v-if="skeleton" type="rect" width="40%" height="14px" />
        <button
          v-else
          type="button"
          class="review-author ellipsis"
          :aria-label="`${$t('common.copy_npub')}: ${author}`"
          @click="$emit('copy-npub')"
        >
          <bdi>{{ author }}</bdi>
          <q-tooltip>{{ $t("common.copy_npub") }}</q-tooltip>
        </button>
        <template v-if="!skeleton">
          <span
            v-if="hop"
            class="review-verified"
            :class="hopColor ? `text-${hopColor}` : ''"
          >
            <BadgeCheckIcon :size="14" />
            <q-tooltip>{{
              $t("MintRatings.web_of_trust_hop", { hop })
            }}</q-tooltip>
          </span>
          <AppBadge v-if="own" class="own-review-chip">{{
            $t("MintRatings.your_review")
          }}</AppBadge>
        </template>
        <span class="review-date">
          <q-skeleton v-if="skeleton" type="rect" width="64px" height="12px" />
          <template v-else>{{ date }}</template>
        </span>
      </div>

      <div v-if="skeleton" class="review-stars-wrap">
        <q-skeleton
          type="rect"
          width="72px"
          height="14px"
          class="review-stars"
        />
      </div>
      <div
        v-else-if="rating !== null"
        role="img"
        class="review-stars-wrap"
        :aria-label="$t('MintRatings.stars_label', { rating })"
      >
        <AppRating
          aria-hidden="true"
          :model-value="rating"
          readonly
          :size="14"
          class="review-stars"
        />
      </div>
      <div v-else class="review-no-rating">
        {{ $t("MintRatings.no_rating") }}
      </div>

      <!-- Two comment lines, as most loaded reviews have, so rows don't grow when text lands. -->
      <div v-if="skeleton" class="review-comment column" style="gap: 6px">
        <q-skeleton
          type="rect"
          :width="skeletonLines > 1 ? '92%' : '72%'"
          height="14px"
        />
        <q-skeleton
          v-if="skeletonLines > 1"
          type="rect"
          width="64%"
          height="14px"
        />
      </div>
      <div v-else-if="comment" class="review-comment" dir="auto">
        {{ comment }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import IconCircle from "src/components/ui/IconCircle.vue";
import { defineComponent, type PropType } from "vue";
import {
  BadgeCheck as BadgeCheckIcon,
  User as UserIcon,
} from "lucide-vue-next";
import AppBadge from "src/components/ui/AppBadge.vue";
import AppRating from "src/components/ui/AppRating.vue";

export default defineComponent({
  name: "ReviewItem",
  components: { AppBadge, AppRating, BadgeCheckIcon, IconCircle },
  setup() {
    return { UserIcon };
  },
  props: {
    /** The reviewer's name, or a short npub. */
    author: { type: String, default: "" },
    picture: { type: String, default: "" },
    date: { type: String, default: "" },
    rating: { type: Number as PropType<number | null>, default: null },
    comment: { type: String, default: "" },
    /** Web-of-trust distance (1 or 2 marks the reviewer as trusted), or null. */
    hop: { type: Number as PropType<number | null>, default: null },
    /** The trust mark's colour ("positive", "warning"). */
    hopColor: { type: String, default: "" },
    /** The user's own review: tinted and pinned. */
    own: { type: Boolean, default: false },
    skeleton: { type: Boolean, default: false },
    /** Comment lines the skeleton draws (1 or 2), so a list of them varies like reviews. */
    skeletonLines: { type: Number, default: 2 },
  },
  emits: ["copy-npub"],
});
</script>

<style scoped>
/* Air between reviews instead of rules. */
.review-item {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  padding: 12px 0;
}
.review-item + .review-item {
  margin-top: 8px;
}
.review-item:first-child {
  padding-top: 4px;
}
/* The user's own review is marked by its "Your review" badge and pinned first; it keeps the
   same row and edges as every other review (a tinted block around it read as a misaligned
   highlight). */
.review-avatar {
  color: var(--app-text-muted);
}
.review-body {
  min-width: 0;
}
.review-head {
  gap: 6px;
  min-height: 20px;
}
/* The name is a 44px tap target (copy npub) without moving the text. */
.review-author {
  background: none;
  border: 0;
  border-radius: 4px;
  color: var(--app-text);
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  margin-block: -12px;
  min-width: 44px;
  padding-block: 12px;
  padding-inline: 0;
  text-align: start;
}
.review-author:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.review-author:focus-visible {
  outline: 2px solid var(--app-text);
  outline-offset: 2px;
}
.review-verified {
  display: inline-flex;
  flex: none;
}
.own-review-chip {
  flex: none;
}
.review-date {
  color: var(--app-text-muted);
  flex: none;
  font-size: 13px;
  line-height: 20px;
  margin-inline-start: auto;
  padding-inline-start: 8px;
  white-space: nowrap;
}
.review-stars {
  display: flex;
  gap: 1px;
  margin-top: 4px;
}
.review-no-rating {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 18px;
  margin-top: 2px;
}
.review-comment {
  color: var(--app-text);
  font-size: 15px;
  line-height: 1.5;
  margin-top: 8px;
  text-align: start;
  white-space: pre-wrap;
}
</style>
