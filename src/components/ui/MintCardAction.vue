<!-- A mint card's labelled action on the name's line (src/css/app.scss .mint-card-add): a
     44px tonal button with a leading glyph, e.g. Discover's "Add" and Restore's
     "Restore". Labelled, so it never reads as a second way into the card.
     `loading` shows the pending dots in place. Emits `click` without opening the card. -->
<template>
  <q-btn
    flat
    rounded
    no-caps
    color="primary"
    class="mint-card-add"
    :disable="disable"
    :loading="loading"
    @click.stop="$emit('click')"
  >
    <span class="mint-card-add__icon" aria-hidden="true"
      ><slot name="icon"
    /></span>
    {{ label }}
    <template #loading><PendingDots /></template>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export default defineComponent({
  name: "MintCardAction",
  components: { PendingDots },
  props: {
    label: { type: String, required: true },
    disable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ["click"],
});
</script>
