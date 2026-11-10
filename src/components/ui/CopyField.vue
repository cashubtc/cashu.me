<!-- A read-only value the user copies (an address, a key, a connection string): the standard
     outlined field in its read-only look, with the copy button where the lock would be. -->
<template>
  <q-input
    outlined
    readonly
    class="copy-field"
    :model-value="value"
    :label="label || undefined"
    input-class="copy-field__value"
  >
    <template #append>
      <PendingDots v-if="loading" />
      <CopyButton
        v-else
        :value="value"
        :label="copyLabel || undefined"
        :tooltip="copyLabel || undefined"
      />
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export default defineComponent({
  name: "CopyField",
  components: { CopyButton, PendingDots },
  props: {
    value: { type: String, default: "" },
    label: { type: String, default: "" },
    /** The copy button's name and tooltip ("Copy address"). */
    copyLabel: { type: String, default: "" },
    loading: { type: Boolean, default: false },
  },
});
</script>

<style scoped>
/* Machine text keeps its left-to-right order in every locale. */
.copy-field :deep(.copy-field__value) {
  direction: ltr;
  text-overflow: ellipsis;
}
</style>
