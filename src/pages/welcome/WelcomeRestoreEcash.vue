<template>
  <div class="q-pa-md">
    <div class="text-center q-mb-md">
      <q-icon name="restore" size="4em" color="primary" />
      <h2 class="q-mt-xl">Restore your ecash</h2>
      <p class="q-mt-sm">Scan for unspent proofs on your configured mints and add them to your wallet.</p>
    </div>
    <RestoreView />
    <div class="q-mt-xl text-center">
      <q-btn color="primary" rounded @click="markDone">Continue</q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import RestoreView from 'src/components/RestoreView.vue';
import { useWelcomeStore } from 'src/stores/welcome';

export default {
  name: 'WelcomeRestoreEcash',
  components: { RestoreView },
  setup() {
    const welcome = useWelcomeStore();
    const markDone = () => { welcome.ecashRestoreCompleted = true; };
    return { welcome, markDone };
  }
}
</script>

<style scoped>
h2 { font-weight: bold; }
p { font-size: large; }
</style>

