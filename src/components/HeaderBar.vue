<template>
  <q-header class="wallet-header bg-primary text-white">
    <div class="balance-wrapper column items-center q-pt-sm q-pb-sm">
      <h1 class="balance">{{ formatCurrency(totalBalance, activeUnit) }}</h1>
      <q-tabs
        v-model="tab"
        dense
        no-caps
        align="center"
        indicator-color="accent"
        class="wallet-tabs"
      >
        <q-tab name="history" label="History" />
        <q-tab name="invoices" label="Invoices" />
        <q-tab name="mints" label="Mints" />
        <q-tab name="buckets" label="Buckets" />
      </q-tabs>
    </div>
    <div
      class="utilities row items-center q-gutter-sm absolute-top-right q-pr-md"
    >
      <q-btn round dense flat icon="refresh" aria-label="Refresh">
        <q-tooltip>Refresh</q-tooltip>
      </q-btn>
      <q-btn
        round
        dense
        flat
        icon="brightness_auto"
        aria-label="Toggle theme"
        @click="toggleDark"
      >
        <q-tooltip>Toggle theme</q-tooltip>
      </q-btn>
      <q-btn round dense flat icon="help_outline" aria-label="Help">
        <q-tooltip>Help</q-tooltip>
      </q-btn>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";

const $q = useQuasar();
const mints = useMintsStore();
const ui = useUiStore();
const { activeUnit, totalUnitBalance } = storeToRefs(mints);
const { tab } = storeToRefs(ui);

const totalBalance = computed(() => totalUnitBalance.value);

function formatCurrency(val: number, unit: string) {
  return ui.formatCurrency(val, unit);
}

function toggleDark() {
  $q.dark.toggle();
}
</script>

<style scoped lang="scss">
.wallet-header {
  position: sticky;
  top: 0;
  z-index: 100;
  font-family: var(--font-family-base);
}
.balance {
  font-size: $h1-size;
  font-weight: 600;
}
.wallet-tabs {
  width: 100%;
}
</style>
