<!-- A round icon button that copies a value with the app's copyText helper, showing a
     check for a moment afterwards. Labelled for screen readers; tooltip optional. -->
<template>
  <IconButton
    :label="label || tooltip || $t('global.actions.copy.label')"
    @click="copy"
  >
    <CheckIcon v-if="copied" :size="iconSize" />
    <CopyIcon v-else :size="iconSize" />
    <q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip>
  </IconButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Check as CheckIcon, Copy as CopyIcon } from "lucide-vue-next";

import IconButton from "src/components/ui/IconButton.vue";
import { copyText } from "src/js/copy";

const COPIED_MS = 1500;

export default defineComponent({
  name: "CopyButton",
  components: { CheckIcon, CopyIcon, IconButton },
  props: {
    value: {
      type: String,
      default: "",
    },
    // Accessible name; falls back to the tooltip, then to "Copy".
    label: {
      type: String,
      default: "",
    },
    tooltip: {
      type: String,
      default: "",
    },
    iconSize: {
      type: Number,
      default: 20,
    },
  },
  data: function () {
    return {
      copied: false,
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },
  beforeUnmount: function () {
    clearTimeout(this.timer);
  },
  methods: {
    copy: async function () {
      if (!(await copyText(this.value))) return;
      this.copied = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.copied = false;
      }, COPIED_MS);
    },
  },
});
</script>
