<!-- One transaction or payment in a list: a 40px icon circle with a direction disc, a label and
     amount line, and a date line. Styles: src/css/elements.scss (.activity-row). -->
<template>
  <q-item clickable v-ripple class="q-py-sm activity-row" @click="emitClick">
    <q-item-section avatar class="q-pr-md" style="min-width: 40px">
      <q-avatar size="40px" class="activity-row__avatar">
        <component :is="icon" class="activity-row__icon" />
        <span
          class="activity-row__direction"
          :class="isIn ? 'activity-row__direction--in' : ''"
          aria-hidden="true"
        >
          <ArrowDownLeftIcon v-if="isIn" :size="13" :stroke-width="2.75" />
          <ArrowUpRightIcon v-else :size="13" :stroke-width="2.75" />
        </span>
      </q-avatar>
    </q-item-section>

    <q-item-section :data-testid="detailsTestid" @click="emitDetailsClick">
      <q-item-label class="row items-center justify-between">
        <div class="col text-left">
          <span class="activity-row__label">
            {{ label }}
          </span>
        </div>
        <div class="text-right">
          <div
            class="activity-row__amount"
            dir="ltr"
            :class="{
              'activity-row__amount--in': isIn && !pending,
              'activity-row__amount--pending': pending,
            }"
          >
            {{ amount }}
          </div>
        </div>
      </q-item-label>

      <q-item-label caption class="q-mt-none row items-center justify-between">
        <div :class="captionClass">
          {{ caption }}
        </div>
        <slot name="caption-end" />
      </q-item-label>
    </q-item-section>
    <slot />
  </q-item>
</template>

<script lang="ts">
import { defineComponent, PropType, Component } from "vue";
import {
  ArrowDownLeft as ArrowDownLeftIcon,
  ArrowUpRight as ArrowUpRightIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "ActivityRow",
  components: { ArrowDownLeftIcon, ArrowUpRightIcon },
  props: {
    /** The kind of activity (ecash, lightning, on-chain), as a lucide icon component. */
    icon: {
      type: [Object, Function] as PropType<Component>,
      required: true,
    },
    direction: {
      type: String as PropType<"in" | "out">,
      required: true,
      validator: (value: string) => value === "in" || value === "out",
    },
    label: {
      type: String,
      default: "",
    },
    /** Pre-formatted, signed amount. */
    amount: {
      type: String,
      default: "",
    },
    /** Not settled yet: the amount drops to secondary text. */
    pending: {
      type: Boolean,
      default: false,
    },
    /** The date line. */
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
