<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">Relays</div>
    <q-input v-model="relayInput" label="Add Relay" @keyup.enter="addRelay" dense />
    <q-list bordered class="q-mt-sm">
      <q-item v-for="(r, index) in relays" :key="index">
        <q-item-section>{{ r }}</q-item-section>
        <q-item-section side>
          <q-btn flat dense icon="delete" @click="removeRelay(index)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

const messenger = useMessengerStore();
const relayInput = ref('');
const relays = messenger.relays;

const addRelay = () => {
  if (relayInput.value.trim()) {
    relays.push(relayInput.value.trim());
    relayInput.value = '';
  }
};

const removeRelay = (index: number) => {
  relays.splice(index, 1);
};
</script>
