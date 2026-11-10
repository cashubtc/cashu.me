<!-- A star rating in the app's own line icons: filled ink stars for the score, outlined muted
     stars for the rest. Read-only shows a score; otherwise each star is a radio button. -->
<template>
  <div
    class="star-rating"
    :class="{
      'star-rating--readonly': readonly,
      'star-rating--disabled': disable,
    }"
    :style="
      readonly
        ? undefined
        : { '--star-inset': `${Math.max(0, (44 - size) / 2)}px` }
    "
    :role="readonly ? undefined : 'radiogroup'"
    :aria-label="readonly ? undefined : label"
  >
    <component
      :is="readonly ? 'span' : 'button'"
      v-for="n in max"
      :key="n"
      class="star-rating__star"
      :class="{ 'star-rating__star--on': n <= shown }"
      :type="readonly ? undefined : 'button'"
      :role="readonly ? undefined : 'radio'"
      :aria-checked="readonly ? undefined : n === modelValue"
      :aria-label="readonly ? undefined : String(n)"
      :disabled="readonly ? undefined : disable"
      @click="pick(n)"
      @mouseenter="hover = readonly || disable ? 0 : n"
      @mouseleave="hover = 0"
    >
      <StarIcon
        :size="size"
        :stroke-width="1.5"
        :fill="n <= shown ? 'currentColor' : 'none'"
        aria-hidden="true"
      />
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Star as StarIcon } from "lucide-vue-next";

export default defineComponent({
  name: "AppRating",
  components: { StarIcon },
  props: {
    modelValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    /** Star size in px. */
    size: { type: Number, default: 20 },
    readonly: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    /** Accessible name of the input (not used when read-only). */
    label: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  data() {
    return { hover: 0 };
  },
  computed: {
    shown(): number {
      return this.hover || Math.round(this.modelValue || 0);
    },
  },
  methods: {
    pick(n: number) {
      if (this.readonly || this.disable) return;
      this.$emit("update:modelValue", n);
    },
  },
});
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 4px;
}
.star-rating--readonly {
  gap: 2px;
}
.star-rating__star {
  align-items: center;
  background: none;
  border: 0;
  border-radius: var(--app-radius-sm);
  color: var(--app-text-subtle);
  display: inline-flex;
  justify-content: center;
  padding: 0;
}
button.star-rating__star {
  /* Empty input stars at the muted ink, so the control reads as ready, not disabled. */
  color: var(--app-text-muted);
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
}
/* The first star's glyph sits on the text edge, not inset by its 44px target. */
button.star-rating__star:first-child {
  margin-inline-start: calc(var(--star-inset, 0px) * -1);
}
.star-rating__star--on {
  color: color-mix(in srgb, var(--app-text) 87%, transparent);
}
button.star-rating__star--on {
  color: var(--app-text);
}
.star-rating--disabled {
  opacity: 0.5;
}
</style>
