<!-- The unit switch in an amount sheet's header (src/css/app.scss .sheet-unit-toggle): a 44px
     button showing the active unit (₿ or $) in a 36px tinted disc, named "Unit: ₿" for
     assistive tech. Emits `toggle`. -->
<template>
  <q-btn
    flat
    round
    color="primary"
    class="sheet-unit-toggle"
    :label="label"
    :aria-label="`${$t('TokenInformation.unit')}: ${label}`"
    @click="$emit('toggle')"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnitToggle",
  props: {
    /** The active unit's symbol. */
    label: { type: String, required: true },
  },
  emits: ["toggle"],
});
</script>
