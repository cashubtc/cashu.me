<!-- A section label in small capitals. Centred between two hairlines on every page, settings
     sub-pages included (the original design; owner 2026-10-29: keep it), or on the start edge
     without hairlines where it labels a single field (the review rating). The section's
     one-line description sits under it when given (styled by the global .section-divider rules
     in app.scss). It owns its gap to the content below, so every section starts the same way. -->
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
    /** "start": a field's label on the text edge, without hairlines (the review rating). */
    align: {
      type: String as PropType<"center" | "start">,
      default: "center",
    },
  },
});
</script>
