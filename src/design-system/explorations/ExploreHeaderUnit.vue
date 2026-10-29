<!-- Dev-only: the header unit switch as it was before round 92 (a bare header action: the
     unit's symbol and a chevron), kept so the explorations still show the "Current" variant
     the council judged. The app ships UnitToggle, the chip under the amount (variant 3). -->
<template>
  <q-btn
    flat
    rounded
    color="primary"
    class="xh-unit"
    :aria-label="`${$t('TokenInformation.unit')}: ${label}`"
  >
    <span>{{ label }}</span>
    <ChevronDownIcon :size="14" class="xh-unit__chevron" aria-hidden="true" />
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ChevronDown as ChevronDownIcon } from "lucide-vue-next";

export default defineComponent({
  name: "ExploreHeaderUnit",
  components: { ChevronDownIcon },
  props: {
    label: { type: String, required: true },
  },
});
</script>

<style scoped>
.xh-unit {
  font-size: 16px !important;
  font-weight: 600;
  min-height: 44px;
  min-width: 44px;
  padding: 0 8px;
}
.xh-unit :deep(.q-btn__content) {
  flex-wrap: nowrap;
  gap: 2px;
}
.xh-unit__chevron {
  opacity: 0.72;
}
</style>
