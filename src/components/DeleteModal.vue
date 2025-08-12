<template>
  <q-dialog v-model="showLocal">
    <q-card class="q-pa-md" style="max-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="warning" color="red" size="2rem" />
        <span class="q-ml-sm">Are you sure you want to delete this tier?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="grey" v-close-popup>Cancel</q-btn>
        <q-btn color="negative" @click="emit('confirm')">Delete</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "confirm"]);

const showLocal = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});
</script>
