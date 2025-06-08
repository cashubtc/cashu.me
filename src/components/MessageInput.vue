<template>
  <q-bar class="bg-white text-primary q-pa-sm">
    <q-btn dense flat round icon="fas fa-plus-circle" class="q-mr-sm">
      <q-menu anchor="top left" self="bottom left">
        <q-list dense style="min-width: 150px">
          <q-item clickable v-close-popup @click="triggerSendCashu">
            <q-item-section avatar>
              <q-icon color="primary" name="fas fa-money-bill-wave" />
            </q-item-section>
            <q-item-section>Send Cashu</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="attachImage">
            <q-item-section avatar>
              <q-icon color="primary" name="fas fa-camera" />
            </q-item-section>
            <q-item-section>Attach Image</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-input
      outlined
      dense
      rounded
      v-model="text"
      placeholder="Type a message"
      class="col"
      @keydown.enter.prevent="sendTextMessage"
    />

    <q-btn
      dense
      unelevated
      round
      color="primary"
      icon="fas fa-paper-plane"
      class="q-ml-sm"
      :disable="!text.trim()"
      @click="sendTextMessage"
    />
  </q-bar>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits(['send', 'sendCashu', 'attachImage']);
const text = ref('');

const sendTextMessage = () => {
  const m = text.value.trim();
  if (m) {
    emit('send', m);
    text.value = '';
  }
};

const triggerSendCashu = () => {
  emit('sendCashu');
};

const attachImage = () => {
  emit('attachImage');
};
</script>
