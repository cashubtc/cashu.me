<script setup lang="ts">
import { ref } from 'vue'

const viewMode = ref<'fan' | 'creator'>('fan')

defineExpose({ viewMode })
</script>

<template>
  <div />
</template>
