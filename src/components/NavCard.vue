<template>
  <q-card
    class="nav-card q-pa-sm"
    :to="to"
    :href="href"
    :target="href ? '_blank' : void 0"
    clickable
    bordered
  >
    <q-card-section class="row items-center no-wrap">
      <slot name="icon">
        <q-icon :name="icon" size="md" class="q-mr-sm" />
      </slot>
      <div class="text-h6">{{ label }}</div>
    </q-card-section>
    <q-card-section>
      <slot>
        {{ viewMode === 'fan' ? fan : creator }}
      </slot>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  label: string;
  fan: string;
  creator: string;
  to?: string;
  href?: string;
  viewMode: 'fan' | 'creator';
}

const props = defineProps<Props>();
</script>

<style scoped>
.nav-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
