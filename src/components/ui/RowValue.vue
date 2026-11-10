<!-- The end side of a settings row that opens something: the current value, muted, then one
     chevron (or an external-link glyph), on one line and centred on the row. Quasar's side
     section is a column, so the value used to sit above the chevron. -->
<template>
  <q-item-section side class="row-value">
    <div class="row-value__inner">
      <span v-if="value" class="row-value__text" dir="auto">{{ value }}</span>
      <ArrowUpRightIcon
        v-if="external"
        :size="18"
        class="settings-menu-chevron"
        aria-hidden="true"
      />
      <ChevronRightIcon
        v-else
        :size="18"
        class="settings-menu-chevron"
        aria-hidden="true"
      />
    </div>
  </q-item-section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  ChevronRight as ChevronRightIcon,
  ArrowUpRight as ArrowUpRightIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "RowValue",
  components: { ChevronRightIcon, ArrowUpRightIcon },
  props: {
    /** The setting's current value, shown muted before the chevron. */
    value: { type: String, default: "" },
    /** Opens outside the app: an external-link glyph instead of the chevron. */
    external: { type: Boolean, default: false },
  },
});
</script>
