<!-- The unit switch in an amount sheet's header (src/css/app.scss .sheet-unit-toggle): a bare
     44px header action showing the active unit (₿ or $) and a small swap glyph, named
     "Unit: ₿" for assistive tech. Emits `toggle`. -->
<template>
  <q-btn
    flat
    rounded
    color="primary"
    class="sheet-unit-toggle"
    :aria-label="`${$t('TokenInformation.unit')}: ${label}`"
    @click="$emit('toggle')"
  >
    <span>{{ label }}</span>
    <ArrowLeftRightIcon
      :size="14"
      class="sheet-unit-toggle__swap"
      aria-hidden="true"
    />
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ArrowLeftRight as ArrowLeftRightIcon } from "lucide-vue-next";

export default defineComponent({
  name: "UnitToggle",
  components: { ArrowLeftRightIcon },
  props: {
    /** The active unit's symbol. */
    label: { type: String, required: true },
  },
  emits: ["toggle"],
});
</script>
