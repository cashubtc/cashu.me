<template>
  <div class="row no-wrap items-center q-pa-sm">
    <q-input v-model="text" class="col" dense outlined @keyup.enter="send">
      <template v-slot:append>
        <q-btn flat round icon="emoji-emotions-outline" @click="toggleEmojiPicker" />
        <q-btn flat round icon="attach-file" @click="onAttachFile" />
        <q-btn flat round icon="account-balance-wallet" @click="sendToken" />
        <q-btn
          flat
          round
          icon="send"
          color="primary"
          class="q-ml-sm"
          :disable="!text.trim()"
          @click="send"
        />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits(['send', 'sendToken']);
const text = ref('');

const send = () => {
  const m = text.value.trim();
  if (m) {
    emit('send', m);
    text.value = '';
  }
};

const sendToken = () => {
  emit('sendToken');
};

const toggleEmojiPicker = () => {};
const onAttachFile = () => {};
</script>
