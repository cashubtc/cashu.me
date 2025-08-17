<template>
  <q-drawer
    side="right"
    overlay
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-list>
      <q-item>
        <q-item-section>Messenger</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessengerDrawer",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
});
</script>
