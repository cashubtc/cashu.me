<!-- A full-screen flow (pay, receive, send, invoice, lock key, payment request): a maximized
     dialog that fades in, closes on Escape but not on a backdrop tap, and holds one card. On
     desktop app.scss draws it as the centred 560px dialog over the dimmed wallet. Other
     q-dialog attributes and listeners (@hide) pass through. -->
<template>
  <q-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    maximized
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
    @update:model-value="$emit('update:modelValue', $event)"
    @keydown.esc="$emit('update:modelValue', false)"
  >
    <q-card class="q-pa-none q-pt-none qcard">
      <slot />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FlowDialog",
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
});
</script>
