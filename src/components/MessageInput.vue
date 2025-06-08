<template>
  <div class="row no-wrap items-center q-pa-sm">
    <q-input v-model="text" class="col" dense outlined @keyup.enter="send" />
    <q-btn flat round icon="send" color="primary" class="q-ml-sm" :disable="!text.trim()" @click="send" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits(['send']);
const text = ref('');

const send = () => {
  const m = text.value.trim();
  if (m) {
    emit('send', m);
    text.value = '';
  }
};
</script>
