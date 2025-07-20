<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md" style="min-width: 300px">
      <q-card-section class="text-h6">
        {{ title }}
      </q-card-section>
      <q-card-section>
        {{ message }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="grey" v-close-popup @click="onCancel">
          {{ cancelLabel }}
        </q-btn>
        <q-btn flat color="primary" @click="onConfirm">
          {{ confirmLabel }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: "OK" },
  cancelLabel: { type: String, default: "Cancel" },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const model = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

function onConfirm() {
  emit("confirm");
  emit("update:modelValue", false);
}

function onCancel() {
  emit("cancel");
  emit("update:modelValue", false);
}
</script>
