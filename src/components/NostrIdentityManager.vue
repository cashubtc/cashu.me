<template>
  <div>
    <q-btn label="Identity / Relays" color="primary" @click="showDialog = true" />
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Identity &amp; Relays</q-card-section>
        <q-card-section>
          <q-input v-model="privKey" label="Private Key" type="text" />
          <q-input v-model="pubKey" label="Public Key" readonly class="q-mt-md" />
          <div class="q-mt-md">
            <q-input v-model="relayInput" label="Add Relay" @keyup.enter="addRelay" />
            <q-list bordered class="q-mt-sm">
              <q-item v-for="(r, index) in relays" :key="index">
                <q-item-section>{{ r }}</q-item-section>
                <q-item-section side>
                  <q-btn flat dense icon="delete" @click="removeRelay(index)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat v-close-popup label="Close" />
          <q-btn flat label="Save" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMessengerStore } from 'src/stores/messenger';

const messenger = useMessengerStore();

const showDialog = ref(false);
const privKey = ref(messenger.privKey);
const pubKey = ref(messenger.pubKey);
const relayInput = ref('');
const relays = ref<string[]>([...messenger.relays]);

const addRelay = () => {
  if (relayInput.value.trim()) {
    relays.value.push(relayInput.value.trim());
    relayInput.value = '';
  }
};

const removeRelay = (index: number) => {
  relays.value.splice(index, 1);
};

const save = () => {
  messenger.privKey = privKey.value;
  messenger.pubKey = pubKey.value;
  messenger.relays = relays.value as any;
  messenger.start();
  showDialog.value = false;
};
</script>
