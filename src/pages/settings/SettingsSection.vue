<template>
  <div class="settings-section">
    <!-- The section heading sits on the text edge, as in the original settings. A warning
         caption is a callout under it. -->
    <SectionDivider
      v-if="title || caption"
      align="start"
      :label="title"
      :caption="warning ? '' : caption"
    >
      <template v-if="$slots.badge" #badge><slot name="badge" /></template>
    </SectionDivider>
    <AppCallout
      v-if="caption && warning"
      variant="warning"
      class="q-mb-md"
      :text="caption"
    />
    <!-- flat: a lone field sits on the page under its header, without a card around it. -->
    <div v-if="flat" class="settings-section-flat">
      <slot />
    </div>
    <!-- radiogroup: the card is one single-choice group (its rows are SettingsRadioRow),
         named by the section title or by the string passed in. -->
    <q-list
      v-else
      class="settings-card"
      :role="radiogroup ? 'radiogroup' : undefined"
      :aria-label="radiogroup ? groupLabel : undefined"
    >
      <slot />
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppCallout from "src/components/AppCallout.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";

export default defineComponent({
  name: "SettingsSection",
  components: { AppCallout, SectionDivider },
  props: {
    flat: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    warning: {
      type: Boolean,
      default: false,
    },
    /** The card holds one single-choice group. True names the group by the section title;
     *  a string names a group whose section has no title. */
    radiogroup: {
      type: [Boolean, String],
      default: false,
    },
  },
  computed: {
    groupLabel(): string {
      return typeof this.radiogroup === "string" ? this.radiogroup : this.title;
    },
  },
});
</script>
