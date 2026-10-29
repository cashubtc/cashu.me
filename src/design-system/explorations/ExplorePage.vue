<!-- Dev-only: one design exploration full-screen, as a phone screen, for captures and the
     design council. /design-system/explore/:name?v=0-7&dark=1&theme=monochrome. dark and
     theme apply to this visit only (nothing is stored); the language comes from settings,
     as everywhere. Round 92 shipped variant 3 of both (deposit limits as helper text under the mint
     picker, since made the info callout, variant 2's component, by the owner, 2026-10-29b
     item 7; a unit chip under the amount, since moved back to the header, item 11); the
     variants stay here for reference. -->
<template>
  <component
    :is="entry.component"
    v-if="entry"
    :key="`${name}-${variant}`"
    :variant="variant"
    :screen="entry.screen"
    :data-explore="name"
    :data-variant="variant"
  />
  <div v-else class="q-pa-lg text-app-muted">
    <div v-for="(e, key) in explorations" :key="key">
      <router-link :to="`/design-system/explore/${key}`">{{ key }}</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Component } from "vue";
import DepositLimitsExplorations from "src/design-system/explorations/DepositLimitsExplorations.vue";
import UnitToggleExplorations from "src/design-system/explorations/UnitToggleExplorations.vue";

declare const windowMixin: any;

const explorations: Record<string, { component: Component; screen: string }> = {
  "deposit-limits": {
    component: markRaw(DepositLimitsExplorations),
    screen: "amount",
  },
  "deposit-limits-address": {
    component: markRaw(DepositLimitsExplorations),
    screen: "address",
  },
  "unit-toggle": {
    component: markRaw(UnitToggleExplorations),
    screen: "receive",
  },
  "unit-toggle-send": {
    component: markRaw(UnitToggleExplorations),
    screen: "send",
  },
};

export default defineComponent({
  name: "ExplorePage",
  mixins: [windowMixin],
  data() {
    return { explorations };
  },
  computed: {
    name(): string {
      return String(this.$route.params.name || "");
    },
    entry() {
      return explorations[this.name] ?? null;
    },
    variant(): number {
      const v = Number(this.$route.query.v ?? 0);
      return Number.isInteger(v) && v >= 0 && v <= 7 ? v : 0;
    },
  },
  // After windowMixin's created(), which applies the stored mode and theme.
  created() {
    this.applyDisplay();
  },
  watch: {
    "$route.query"() {
      this.applyDisplay();
    },
  },
  methods: {
    applyDisplay() {
      const { dark, theme } = this.$route.query;
      if (dark != null) this.$q.dark.set(dark !== "0");
      if (typeof theme === "string")
        document.body.setAttribute("data-theme", theme);
    },
  },
});
</script>
