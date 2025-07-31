<template>
  <q-page-sticky position="bottom" expand class="bg-grey-9">
    <div class="q-pa-sm text-center">
      <q-btn
        color="primary"
        outline
        :loading="publishing"
        :disable="publishing"
        @click="emit('publish')"
      >
        {{ $t('creatorHub.publish') }}
      </q-btn>
    </div>
  </q-page-sticky>
</template>

<script setup lang="ts">
const { publishing } = defineProps<{ publishing: boolean }>();
const emit = defineEmits(['publish']);
</script>
