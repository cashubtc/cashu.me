<template>
  <q-footer class="w-full bg-grey-3 dark:bg-grey-9 text-dark dark:text-white">
    <q-toolbar class="justify-center">
      <q-btn
        color="primary"
        outline
        :loading="publishing"
        :disable="publishing"
        @click="emit('publish')"
      >
        {{ $t("creatorHub.publish") }}
      </q-btn>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
const { publishing } = defineProps<{ publishing: boolean }>();
const emit = defineEmits(["publish"]);
</script>
