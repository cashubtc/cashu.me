<!-- A section label in small capitals. Centred between two hairlines where the sections
     are open lists under a centred header (mint details, the mints tab), or on the start edge
     without hairlines (align="start") where the page reads down the text edge: settings
     pages, sheets, a single field's label. The section's one-line description sits under it
     when given (styled by the global .section-divider rules in app.scss). It owns its gap to
     the content below, so every section starts the same way. -->
<template>
  <div
    class="section-divider-block"
    :class="{ 'section-divider-block--start': align === 'start' }"
  >
    <div
      v-if="label"
      class="section-divider"
      :class="{ 'section-divider--start': align === 'start' }"
    >
      <div v-if="align !== 'start'" class="divider-line"></div>
      <div class="divider-text">{{ label }}<slot name="badge" /></div>
      <div v-if="align !== 'start'" class="divider-line"></div>
    </div>
    <CjkText
      v-if="caption"
      tag="p"
      class="section-divider__caption"
      :text="caption"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CjkText from "src/components/ui/CjkText.vue";

export default defineComponent({
  name: "SectionDivider",
  components: { CjkText },
  props: {
    /** Empty: the caption alone, where the page already titles the section. */
    label: {
      type: String,
      default: "",
    },
    /** One line under the label saying what the section does. */
    caption: {
      type: String,
      default: "",
    },
    /** "start": on the text edge, without hairlines (settings, sheets, a field's label). */
    align: {
      type: String as PropType<"center" | "start">,
      default: "center",
    },
  },
});
</script>
