<template>
  <div class="filter-chips row q-gutter-xs">
    <q-chip
      v-for="(f, idx) in filters"
      :key="idx"
      dense
      removable
      @remove="$emit('remove', f)"
    >
      {{ f }}
    </q-chip>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ filters: any[] }>();
</script>
