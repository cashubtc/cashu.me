<!-- One payment in a list: a 40px disc
     with the direction arrow (tinted for money in; a cross once an invoice expired), the
     outcome as the title ("Received", "Sending", "Invoice expired") with a Pending pill while
     it isn't final, the method and date as the caption, and the signed amount on the end edge:
     green when received, secondary while pending, struck through when nothing arrived.
     Styles: src/css/elements.scss (.activity-row). -->
<template>
  <q-item
    :clickable="!skeleton"
    v-ripple="!skeleton"
    class="q-py-sm activity-row"
    :aria-hidden="skeleton || undefined"
    @click="emitClick"
  >
    <q-item-section avatar class="q-pr-md" style="min-width: 40px">
      <q-skeleton v-if="skeleton" type="QAvatar" size="40px" />
      <q-avatar
        v-else
        size="40px"
        class="activity-row__avatar"
        :class="{
          'activity-row__avatar--in': isIn && !pending && !expired,
        }"
        aria-hidden="true"
      >
        <XIcon v-if="expired" :size="20" />
        <!-- Direction glyphs follow the reading direction (council R78). -->
        <ArrowDownLeftIcon v-else-if="isIn" :size="20" class="rtl-flip" />
        <ArrowUpRightIcon v-else :size="20" class="rtl-flip" />
      </q-avatar>
    </q-item-section>

    <q-item-section :data-testid="detailsTestid" @click="emitDetailsClick">
      <q-item-label class="row items-center justify-between no-wrap">
        <div class="col text-left activity-row__title">
          <span class="activity-row__label"
            ><q-skeleton v-if="skeleton" type="text" width="88px" /><template
              v-else
              >{{ label }}</template
            ></span
          >
          <AppBadge v-if="pending" tone="warning" class="activity-row__pill">{{
            $t("common.pending")
          }}</AppBadge>
        </div>
        <div
          class="activity-row__amount"
          dir="ltr"
          :class="{
            'activity-row__amount--in': isIn && !pending && !expired,
            'activity-row__amount--pending': pending,
            'activity-row__amount--expired': expired,
          }"
        >
          <q-skeleton v-if="skeleton" type="text" width="56px" />
          <template v-else>{{ amount }}</template>
        </div>
      </q-item-label>

      <q-item-label caption class="q-mt-none row items-center justify-between">
        <div :class="captionClass">
          <q-skeleton v-if="skeleton" type="text" width="140px" />
          <template v-else>{{ caption }}</template>
        </div>
        <slot name="caption-end" />
      </q-item-label>
    </q-item-section>
    <slot />
  </q-item>
</template>

<script lang="ts">
import AppBadge from "src/components/ui/AppBadge.vue";
import { defineComponent, PropType } from "vue";
import {
  ArrowDownLeft as ArrowDownLeftIcon,
  ArrowUpRight as ArrowUpRightIcon,
  X as XIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "ActivityRow",
  components: { AppBadge, ArrowDownLeftIcon, ArrowUpRightIcon, XIcon },
  props: {
    /** The same row with placeholders in its boxes, while the list loads. */
    skeleton: { type: Boolean, default: false },
    direction: {
      type: String as PropType<"in" | "out">,
      default: "in",
      validator: (value: string) => value === "in" || value === "out",
    },
    /** The outcome in words ("Received", "Sending") or the payment's own label. */
    label: {
      type: String,
      default: "",
    },
    /** Pre-formatted, signed amount. */
    amount: {
      type: String,
      default: "",
    },
    /** Not settled yet: a Pending pill, and the amount drops to secondary text. */
    pending: {
      type: Boolean,
      default: false,
    },
    /** Nothing arrived (an expired invoice): a cross, and the amount struck through. */
    expired: {
      type: Boolean,
      default: false,
    },
    /** The second line: the method and the date. */
    caption: {
      type: String,
      default: "",
    },
    /** Extra classes for the date text. */
    captionClass: {
      type: String,
      default: "",
    },
    /** data-testid for the main (label, amount, date) section. */
    detailsTestid: {
      type: String,
      default: undefined,
    },
  },
  // click: the whole row; details-click: the main section only (not the icon).
  emits: ["click", "details-click"],
  computed: {
    isIn(): boolean {
      return this.direction === "in";
    },
  },
  methods: {
    emitClick(event: Event) {
      this.$emit("click", event);
    },
    emitDetailsClick(event: Event) {
      this.$emit("details-click", event);
    },
  },
});
</script>
